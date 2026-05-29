import React from 'react'
import { View, Text } from 'react-native'

interface StatBarProps {
  label: string
  value: number
  max: number
  color: string
  showValue?: boolean
}

export function StatBar({ label, value, max, color, showValue = false }: StatBarProps) {
  const pct = Math.min(1, Math.max(0, value / max))

  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-text-secondary text-xs">{label}</Text>
        <Text className="text-text-secondary text-xs">
          {showValue ? `${value}/${max}` : `${Math.round(pct * 100)}%`}
        </Text>
      </View>
      <View className="h-2.5 rounded-full bg-white/10">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </View>
    </View>
  )
}
