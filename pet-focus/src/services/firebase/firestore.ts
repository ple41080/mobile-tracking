import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { app } from './config'

export const db = getFirestore(app)

export async function getUserPet(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId, 'data', 'pet'))
  return snap.exists() ? snap.data() : null
}

export async function saveUserPet(userId: string, petData: Record<string, unknown>) {
  await setDoc(doc(db, 'users', userId, 'data', 'pet'), petData, { merge: true })
}

export async function getUserWallet(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId, 'data', 'wallet'))
  return snap.exists() ? snap.data() : { coins: 0, gems: 0 }
}

export async function saveUserWallet(userId: string, coins: number, gems: number) {
  await setDoc(doc(db, 'users', userId, 'data', 'wallet'), { coins, gems }, { merge: true })
}

export async function saveFocusSession(
  userId: string,
  session: {
    startTime: Date
    endTime: Date
    durationMinutes: number
    status: string
    coinsEarned: number
  }
) {
  const ref = collection(db, 'users', userId, 'focusSessions')
  await addDoc(ref, {
    ...session,
    startTime: Timestamp.fromDate(session.startTime),
    endTime: Timestamp.fromDate(session.endTime),
  })
}

export async function saveDailyStats(
  userId: string,
  date: string,
  stats: Record<string, unknown>
) {
  await setDoc(doc(db, 'users', userId, 'dailyStats', date), stats, { merge: true })
}

export async function getUserStreak(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId, 'data', 'streak'))
  return snap.exists() ? snap.data() : { currentStreak: 0, lastFocusDate: null, longestStreak: 0 }
}

export async function saveUserStreak(
  userId: string,
  streak: { currentStreak: number; lastFocusDate: string; longestStreak: number }
) {
  await setDoc(doc(db, 'users', userId, 'data', 'streak'), streak, { merge: true })
}
