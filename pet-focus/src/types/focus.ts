export type FocusSessionStatus = 'idle' | 'in_progress' | 'completed' | 'failed'

export interface FocusReward {
  coins: number
  label: string
}

export const FOCUS_REWARDS: Record<number, FocusReward> = {
  30: { coins: 10, label: '30 นาที' },
  60: { coins: 25, label: '1 ชั่วโมง' },
  120: { coins: 60, label: '2 ชั่วโมง' },
  180: { coins: 100, label: '3 ชั่วโมง' },
  240: { coins: 150, label: '4 ชั่วโมง' },
}

export interface FocusSession {
  id?: string
  startTime: Date
  endTime?: Date
  durationMinutes: number
  status: FocusSessionStatus
  coinsEarned: number
}

export interface DayStats {
  totalScreenTime: number
  unlockCount: number
  focusSessionsCompleted: number
  focusSessionsFailed: number
  coinsEarned: number
  topApps: AppUsage[]
}

export interface AppUsage {
  name: string
  packageName: string
  minutes: number
}

export type DailyQuestType = 'focus' | 'screentime_limit' | 'no_phone_before_sleep'

export interface DailyQuest {
  id: string
  title: string
  target: number
  type: DailyQuestType
  reward: { coins: number }
  completedAt?: Date
}

export const DAILY_QUESTS: DailyQuest[] = [
  { id: 'focus_60', title: 'โฟกัส 1 ชั่วโมง', target: 60, type: 'focus', reward: { coins: 20 } },
  { id: 'no_phone_30', title: 'ไม่เล่นก่อนนอน 30 นาที', target: 30, type: 'no_phone_before_sleep', reward: { coins: 15 } },
  { id: 'screentime_120', title: 'Screen time ไม่เกิน 2 ชั่วโมง', target: 120, type: 'screentime_limit', reward: { coins: 20 } },
]

export const DEFAULT_BLOCKED_APPS = [
  { packageName: 'com.zhiliaoapp.musically', name: 'TikTok', emoji: '🎵' },
  { packageName: 'com.instagram.android', name: 'Instagram', emoji: '📸' },
  { packageName: 'com.facebook.katana', name: 'Facebook', emoji: '👤' },
]

export const STREAK_BONUSES: Record<number, number> = {
  1: 10,
  3: 30,
  7: 100,
  14: 200,
  30: 500,
}

export const THAI_DAYS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
