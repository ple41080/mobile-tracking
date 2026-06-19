import React from 'react'
import { View, Text, Image } from 'react-native'
import { AppUsage } from '@/types/focus'

interface AppUsageChartProps {
  apps: AppUsage[]
  maxMinutes?: number
}

const BAR_COLORS = ['#5DB347', '#F5C518', '#F57C00', '#FF8C00', '#A0A878']

function AppIcon({ app }: { app: AppUsage }) {
  if (app.iconBase64) {
    return (
      <Image
        source={{ uri: `data:image/png;base64,${app.iconBase64}` }}
        className="w-8 h-8 rounded-lg"
        resizeMode="cover"
      />
    )
  }

  const initial = app.name.charAt(0).toUpperCase() || '?'
  return (
    <View className="w-8 h-8 rounded-lg bg-white/15 items-center justify-center">
      <Text className="text-white/80 text-xs font-bold">{initial}</Text>
    </View>
  )
}

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
            <View className="flex-row items-center gap-2">
              <AppIcon app={app} />
              <View className="flex-1 flex-row justify-between items-center">
                <Text className="text-white/90 text-sm flex-1 mr-2" numberOfLines={1}>
                  {app.name}
                </Text>
                <Text className="text-text-secondary text-xs">{label}</Text>
              </View>
            </View>
            <View className="h-2 rounded-full bg-white/10 ml-10">
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
