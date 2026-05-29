import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FOCUS_REWARDS } from '@/types/focus'

interface TimeSelectorProps {
  selectedMinutes: number
  onSelect: (minutes: number) => void
  disabled?: boolean
}

const DURATIONS = [30, 60, 120, 180]

export function TimeSelector({ selectedMinutes, onSelect, disabled }: TimeSelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-3 justify-center px-4">
      {DURATIONS.map((mins) => {
        const reward = FOCUS_REWARDS[mins]
        const isSelected = selectedMinutes === mins
        return (
          <TouchableOpacity
            key={mins}
            onPress={() => !disabled && onSelect(mins)}
            activeOpacity={0.7}
            className={`flex-1 min-w-[40%] rounded-2xl py-3 px-4 items-center border ${
              isSelected
                ? 'bg-primary border-primary-light'
                : 'bg-surface border-white/10'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            <Text className={`text-base font-bold ${isSelected ? 'text-white' : 'text-white/80'}`}>
              {reward.label}
            </Text>
            <Text className={`text-xs mt-0.5 ${isSelected ? 'text-yellow' : 'text-gold'}`}>
              +{reward.coins} ⭐
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
