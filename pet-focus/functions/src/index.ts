import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()
const db = admin.firestore()

// ─── Types ───────────────────────────────────────────────────────────────────

interface DayStats {
  totalScreenTime: number
  unlockCount: number
  focusSessionsCompleted: number
  focusSessionsFailed: number
  coinsEarned: number
  topApps: { packageName: string; minutes: number }[]
}

const STREAK_BONUSES: Record<number, number> = {
  1: 10, 3: 30, 7: 100, 14: 200, 30: 500,
}

// ─── 1. On focus session complete ────────────────────────────────────────────

export const onFocusComplete = functions.firestore
  .document('users/{userId}/focusSessions/{sessionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data()
    const after = change.after.data()
    if (before.status === after.status) return
    if (after.status !== 'completed') return

    const { userId } = context.params
    const coins: number = after.coinsEarned ?? 0
    const exp = coins * 2

    await db.runTransaction(async (tx) => {
      const petRef = db.doc(`users/${userId}/data/pet`)
      const walletRef = db.doc(`users/${userId}/data/wallet`)
      const petSnap = await tx.get(petRef)
      const walletSnap = await tx.get(walletRef)

      const petData = petSnap.data() ?? {}
      const walletData = walletSnap.data() ?? { coins: 0 }

      const happiness = Math.min(100, (petData.happiness ?? 80) + 10)
      let newExp = (petData.exp ?? 0) + exp
      let level = petData.level ?? 1
      while (newExp >= 1000 && level < 20) {
        newExp -= 1000
        level++
      }

      tx.set(petRef, { happiness, exp: newExp, level }, { merge: true })
      tx.set(walletRef, { coins: (walletData.coins ?? 0) + coins }, { merge: true })
    })

    await checkAchievements(userId)
  })

// ─── 2. Daily pet happiness decay ────────────────────────────────────────────

export const dailyPetUpdate = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Bangkok')
  .onRun(async () => {
    const today = new Date().toISOString().split('T')[0]
    const usersSnap = await db.collection('users').listDocuments()

    const batch = db.batch()
    for (const userRef of usersSnap) {
      const statsSnap = await db.doc(`${userRef.path}/dailyStats/${today}`).get()
      const hadFocusToday = statsSnap.exists && (statsSnap.data()?.focusStats?.completed ?? 0) > 0

      const petRef = db.doc(`${userRef.path}/data/pet`)
      const petSnap = await petRef.get()
      if (!petSnap.exists) continue

      const pet = petSnap.data()!
      let happiness: number = pet.happiness ?? 80
      let hp: number = pet.hp ?? 100

      if (!hadFocusToday) {
        happiness = Math.max(5, happiness - 10)
        if (happiness < 30) hp = Math.max(10, hp - 5)
      }

      batch.update(petRef, { happiness, hp })
    }
    await batch.commit()
  })

// ─── 3. Generate AI tip ──────────────────────────────────────────────────────

export const generateAITip = functions
  .region('asia-southeast1')
  .https.onCall((data: { todayStats: DayStats; yesterdayStats: DayStats }) => {
    const { todayStats, yesterdayStats } = data
    const diff = todayStats.totalScreenTime - yesterdayStats.totalScreenTime

    if (diff > 30) {
      return {
        tip: `วันนี้ใช้โทรศัพท์มากกว่าเมื่อวาน ${diff} นาที ลองตั้งเป้าลดลงอีก 20 นาทีพรุ่งนี้ไหม? โปโป้จะยิ้มแน่เลย! 🐱`,
      }
    }
    if (todayStats.focusSessionsCompleted > 0) {
      return {
        tip: `เก่งมากเลย! โฟกัสไปแล้ว ${todayStats.focusSessionsCompleted} session วันนี้ 🎯 โปโป้ภูมิใจในตัวนายมากเลย`,
      }
    }
    if (todayStats.totalScreenTime > 120) {
      return {
        tip: `ใช้โทรศัพท์ไปนานพอสมควรแล้ว ลองพักแล้วมาโฟกัสสัก 30 นาทีไหม? โปโป้รอนายอยู่! 💪`,
      }
    }
    return {
      tip: `วันนี้เป็นวันที่ดี ลองทำ Focus session สั้นๆ สัก 30 นาทีไหม? โปโป้จะมีความสุขมากเลย! 🌟`,
    }
  })

// ─── 4. Update streak ────────────────────────────────────────────────────────

export const updateStreak = functions
  .region('asia-southeast1')
  .https.onCall(async (_data: unknown, context) => {
    const userId = context.auth?.uid
    if (!userId) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated')

    const streakRef = db.doc(`users/${userId}/data/streak`)
    const snap = await streakRef.get()
    const data = snap.data() ?? { currentStreak: 0, lastFocusDate: null, longestStreak: 0 }

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    let { currentStreak, lastFocusDate, longestStreak } = data as {
      currentStreak: number
      lastFocusDate: string | null
      longestStreak: number
    }

    if (lastFocusDate === today) return { streak: currentStreak }

    if (lastFocusDate === yesterday) {
      currentStreak += 1
    } else {
      currentStreak = 1
    }
    longestStreak = Math.max(longestStreak, currentStreak)

    await streakRef.set({ currentStreak, lastFocusDate: today, longestStreak }, { merge: true })

    const bonus = STREAK_BONUSES[currentStreak] ?? 0
    if (bonus > 0) {
      const walletRef = db.doc(`users/${userId}/data/wallet`)
      await walletRef.set({ coins: admin.firestore.FieldValue.increment(bonus) }, { merge: true })
    }

    return { streak: currentStreak, bonus }
  })

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function checkAchievements(userId: string) {
  const [petSnap, walletSnap, streakSnap, achievSnap] = await Promise.all([
    db.doc(`users/${userId}/data/pet`).get(),
    db.doc(`users/${userId}/data/wallet`).get(),
    db.doc(`users/${userId}/data/streak`).get(),
    db.doc(`achievements/${userId}`).get(),
  ])

  const pet = petSnap.data() ?? {}
  const wallet = walletSnap.data() ?? {}
  const streak = streakSnap.data() ?? {}
  const earned: string[] = achievSnap.data()?.earned ?? []

  const toEarn: string[] = []

  if (!earned.includes('first_focus')) toEarn.push('first_focus')
  if ((streak.currentStreak ?? 0) >= 7 && !earned.includes('streak_7')) toEarn.push('streak_7')
  if ((streak.currentStreak ?? 0) >= 30 && !earned.includes('streak_30')) toEarn.push('streak_30')
  if ((pet.level ?? 1) >= 10 && !earned.includes('level_10')) toEarn.push('level_10')
  if ((wallet.coins ?? 0) >= 1000 && !earned.includes('coins_1000')) toEarn.push('coins_1000')

  if (toEarn.length > 0) {
    await db.doc(`achievements/${userId}`).set(
      { earned: admin.firestore.FieldValue.arrayUnion(...toEarn) },
      { merge: true }
    )
  }
}
