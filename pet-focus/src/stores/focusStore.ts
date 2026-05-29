import { create } from 'zustand'
import { FocusSessionStatus, FOCUS_REWARDS } from '@/types/focus'

interface FocusState {
  status: FocusSessionStatus
  selectedMinutes: number
  remainingSeconds: number
  sessionStartTime: Date | null
  currentStreak: number
  lastFocusDate: string | null
  longestStreak: number
  totalFocusMinutes: number
  // Actions
  selectDuration: (minutes: number) => void
  startSession: () => void
  tickSecond: () => void
  completeSession: () => void
  failSession: () => void
  resetSession: () => void
  updateStreak: (streak: number, lastDate: string, longest: number) => void
}

export const useFocusStore = create<FocusState>((set, get) => ({
  status: 'idle',
  selectedMinutes: 30,
  remainingSeconds: 30 * 60,
  sessionStartTime: null,
  currentStreak: 0,
  lastFocusDate: null,
  longestStreak: 0,
  totalFocusMinutes: 0,

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
}))

export function getCoinsForDuration(minutes: number): number {
  return FOCUS_REWARDS[minutes]?.coins ?? 10
}
