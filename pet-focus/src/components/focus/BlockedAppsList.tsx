import React from 'react'
import { View, Text } from 'react-native'
import { DEFAULT_BLOCKED_APPS } from '@/types/focus'

export function BlockedAppsList() {
  return (
    <View className="px-6 mt-4">
      <Text className="text-text-secondary text-xs mb-2">บล็อกระหว่าง session:</Text>
      <View className="flex-row gap-2 flex-wrap">
        {DEFAULT_BLOCKED_APPS.map((app) => (
          <View
            key={app.packageName}
            className="flex-row items-center gap-1 bg-danger/15 border border-danger/30 rounded-full px-3 py-1"
          >
            <Text className="text-sm">{app.emoji}</Text>
            <Text className="text-white/80 text-xs">{app.name}</Text>
            <Text className="text-danger text-xs">❌</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
