import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './config'
import { DayStats } from '@/types/focus'

const functions = getFunctions(app, 'asia-southeast1')

export async function generateAITip(
  todayStats: DayStats,
  yesterdayStats: DayStats
): Promise<string> {
  try {
    const fn = httpsCallable<
      { todayStats: DayStats; yesterdayStats: DayStats },
      { tip: string }
    >(functions, 'generateAITip')
    const result = await fn({ todayStats, yesterdayStats })
    return result.data.tip
  } catch {
    return generateLocalTip(todayStats, yesterdayStats)
  }
}

function generateLocalTip(today: DayStats, yesterday: DayStats): string {
  if (today.totalScreenTime > yesterday.totalScreenTime + 30) {
    const diff = today.totalScreenTime - yesterday.totalScreenTime
    return `วันนี้ใช้โทรศัพท์มากกว่าเมื่อวาน ${diff} นาที ลองตั้งเป้าลดลงพรุ่งนี้ไหม? โปโป้จะยิ้มแน่เลย! 🐱`
  }
  if (today.focusSessionsCompleted > 0) {
    return `เก่งมากเลย! วันนี้โฟกัสไปแล้ว ${today.focusSessionsCompleted} session 🎯 โปโป้ภูมิใจในตัวนายมากเลย`
  }
  if (today.totalScreenTime > 120) {
    return `วันนี้ใช้โทรศัพท์ไปนานแล้ว ลองพักสักครู่แล้วมาโฟกัสด้วยกันไหม? โปโป้รอนายอยู่! 💪`
  }
  return `วันนี้เป็นวันที่ดี ลองทำ Focus session สั้นๆ สัก 30 นาทีไหม? โปโป้จะมีความสุขมากเลย! 🌟`
}

export async function callUpdateStreak(userId: string) {
  try {
    const fn = httpsCallable(functions, 'updateStreak')
    await fn({ userId })
  } catch {
    // handled locally
  }
}
