import React from 'react'
import { View, Text } from 'react-native'
import { THAI_DAYS } from '@/types/focus'

interface StreakDotsProps {
  streak: number
  lastFocusDate: string | null
}

export function StreakDots({ streak, lastFocusDate }: StreakDotsProps) {
  const todayIdx = (new Date().getDay() + 6) % 7 // Mon=0
  const activeDays = getActiveDays(streak, lastFocusDate, todayIdx)

  return (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {THAI_DAYS.map((day, idx) => {
        const isToday = idx === todayIdx
        const isActive = activeDays.includes(idx)
        return (
          <View key={day} className="items-center gap-1">
            <View
              className={`w-9 h-9 rounded-full items-center justify-center border ${
                isToday
                  ? 'border-yellow bg-yellow/20'
                  : isActive
                  ? 'border-primary-light bg-primary-light/20'
                  : 'border-white/10 bg-transparent'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isToday ? 'text-yellow' : isActive ? 'text-primary-light' : 'text-text-secondary'
                }`}
              >
                {day}
              </Text>
            </View>
            {isToday && (
              <View className="w-1 h-1 rounded-full bg-yellow" />
            )}
          </View>
        )
      })}
    </View>
  )
}

function getActiveDays(streak: number, lastFocusDate: string | null, todayIdx: number): number[] {
  if (!lastFocusDate || streak === 0) return []
  const today = new Date()
  const last = new Date(lastFocusDate)
  const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000)
  if (diffDays > 1) return []

  const active: number[] = []
  for (let i = 0; i < Math.min(streak, 7); i++) {
    const idx = ((todayIdx - i) + 7) % 7
    active.push(idx)
  }
  return active
}
