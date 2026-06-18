import React from 'react'
import { View, Text } from 'react-native'
import { AppUsage } from '@/types/focus'

interface AppUsageChartProps {
  apps: AppUsage[]
  maxMinutes?: number
}

const BAR_COLORS = ['#5DB347', '#F5C518', '#F57C00', '#FF8C00', '#A0A878']

export function AppUsageChart({ apps, maxMinutes }: AppUsageChartProps) {
  const top5 = apps.slice(0, 5)
  const maxVal = maxMinutes ?? Math.max(...top5.map((a) => a.minutes), 1)

  if (top5.length === 0) {
    return (
      <View className="py-6 items-center">
        <Text className="text-text-secondary text-sm">ยังไม่มีข้อมูลการใช้งาน</Text>
        <Text className="text-text-secondary text-xs mt-1">เปิดสิทธิ์ Usage Stats ในการตั้งค่าก่อนนะ</Text>
      </View>
    )
  }

  return (
    <View className="gap-3">
      {top5.map((app, idx) => {
        const pct = app.minutes / maxVal
        const h = Math.floor(app.minutes / 60)
        const m = app.minutes % 60
        const label = h > 0 ? `${h}ชม. ${m}น.` : `${m} น.`
        return (
          <View key={`${app.packageName}-${idx}`} className="gap-1">
            <View className="flex-row justify-between">
              <Text className="text-white/90 text-sm">{app.name}</Text>
              <Text className="text-text-secondary text-xs">{label}</Text>
            </View>
            <View className="h-2 rounded-full bg-white/10">
              <View
                className="h-full rounded-full"
                style={{ width: `${pct * 100}%`, backgroundColor: BAR_COLORS[idx] }}
              />
            </View>
          </View>
        )
      })}
    </View>
  )
}
