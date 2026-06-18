import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FocusSessionStatus, FOCUS_REWARDS, MoodValue, MoodEntry } from '@/types/focus'

interface FocusState {
  status: FocusSessionStatus
  selectedMinutes: number
  remainingSeconds: number
  sessionStartTime: Date | null
  currentStreak: number
  lastFocusDate: string | null
  longestStreak: number
  totalFocusMinutes: number
  moodLog: MoodEntry[]
  // Actions
  selectDuration: (minutes: number) => void
  startSession: () => void
  tickSecond: () => void
  completeSession: () => void
  failSession: () => void
  resetSession: () => void
  updateStreak: (streak: number, lastDate: string, longest: number) => void
  logMood: (mood: MoodValue, minutes: number) => void
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      status: 'idle',
      selectedMinutes: 30,
      remainingSeconds: 30 * 60,
      sessionStartTime: null,
      currentStreak: 0,
      lastFocusDate: null,
      longestStreak: 0,
      totalFocusMinutes: 0,
      moodLog: [],

      selectDuration: (minutes) =>
        set({ selectedMinutes: minutes, remainingSeconds: minutes * 60 }),

      startSession: () =>
        set({
          status: 'in_progress',
          sessionStartTime: new Date(),
        }),

      tickSecond: () =>
        set((state) => {
          if (state.remainingSeconds <= 1) {
            return { remainingSeconds: 0, status: 'completed' }
          }
          return { remainingSeconds: state.remainingSeconds - 1 }
        }),

      completeSession: () =>
        set((state) => ({
          status: 'completed',
          totalFocusMinutes: state.totalFocusMinutes + state.selectedMinutes,
        })),

      failSession: () => set({ status: 'failed' }),

      resetSession: () =>
        set((state) => ({
          status: 'idle',
          remainingSeconds: state.selectedMinutes * 60,
          sessionStartTime: null,
        })),

      updateStreak: (streak, lastDate, longest) =>
        set({ currentStreak: streak, lastFocusDate: lastDate, longestStreak: longest }),

      logMood: (mood, minutes) =>
        set((state) => ({
          moodLog: [
            ...state.moodLog,
            { date: new Date().toISOString(), mood, minutes },
          ],
        })),
    }),
    {
      name: 'focus-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentStreak: state.currentStreak,
        lastFocusDate: state.lastFocusDate,
        longestStreak: state.longestStreak,
        totalFocusMinutes: state.totalFocusMinutes,
        moodLog: state.moodLog,
      }),
    }
  )
)

export function getCoinsForDuration(minutes: number): number {
  return FOCUS_REWARDS[minutes]?.coins ?? 10
}

export interface WeeklySummary {
  sessions: number
  focusMinutes: number
  avgMood: number | null
}

export function getWeeklySummary(moodLog: MoodEntry[]): WeeklySummary {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = moodLog.filter((e) => new Date(e.date).getTime() >= weekAgo)
  const sessions = recent.length
  const focusMinutes = recent.reduce((sum, e) => sum + e.minutes, 0)
  const avgMood =
    sessions > 0 ? recent.reduce((sum, e) => sum + e.mood, 0) / sessions : null
  return { sessions, focusMinutes, avgMood }
}
