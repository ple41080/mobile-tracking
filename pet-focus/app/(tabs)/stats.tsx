import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { ThemedScreen } from '@/components/ThemedScreen'
import { useAppTheme } from '@/hooks/useAppTheme'
import { AppUsageChart } from '@/components/stats/AppUsageChart'
import { AITip } from '@/components/stats/AITip'
import { useScreenTime } from '@/hooks/useScreenTime'
import { useFocusStore, getWeeklySummary } from '@/stores/focusStore'
import { MOOD_OPTIONS } from '@/types/focus'
import { generateAITip } from '@/services/firebase/functions'
import { requestUsageStatsPermission } from '@/services/usageStats'
import { DayStats } from '@/types/focus'

type Tab = 'today' | 'week' | 'month'

export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [aiTip, setAiTip] = useState<string | null>(null)
  const [tipLoading, setTipLoading] = useState(false)
  const { surface, border } = useAppTheme()

  const { apps, totalMinutes, hasPermission, isLoading } = useScreenTime()
  const { currentStreak, totalFocusMinutes, moodLog } = useFocusStore()

  const weekly = getWeeklySummary(moodLog)
  const weeklyHours = Math.floor(weekly.focusMinutes / 60)
  const weeklyMins = weekly.focusMinutes % 60
  const moodEmoji =
    weekly.avgMood != null
      ? MOOD_OPTIONS[Math.min(4, Math.round(weekly.avgMood) - 1)].emoji
      : '—'

  const TABS: { key: Tab; label: string }[] = [
    { key: 'today', label: 'วันนี้' },
    { key: 'week', label: 'สัปดาห์' },
    { key: 'month', label: 'เดือน' },
  ]

  useEffect(() => {
    loadTip()
  }, [])

  async function loadTip() {
    setTipLoading(true)
    const todayStats: DayStats = {
      totalScreenTime: totalMinutes,
      unlockCount: 0,
      focusSessionsCompleted: 0,
      focusSessionsFailed: 0,
      coinsEarned: 0,
      topApps: apps,
    }
    const tip = await generateAITip(todayStats, todayStats)
    setAiTip(tip)
    setTipLoading(false)
  }

  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60

  return (
    <ThemedScreen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-2 pb-4">
          <Text className="text-white text-2xl font-bold">สถิติ 📊</Text>
        </View>

        {/* Tabs */}
        <View style={{ backgroundColor: surface }} className="flex-row rounded-2xl p-1 mb-4">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl items-center ${
                activeTab === tab.key ? 'bg-primary' : ''
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === tab.key ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary cards */}
        <View className="flex-row gap-3 mb-4">
          <View style={{ backgroundColor: surface }} className="flex-1 rounded-2xl p-4 items-center">
            <Text className="text-2xl font-bold text-white">
              {totalHours > 0 ? `${totalHours}ชม.` : `${totalMins}น.`}
            </Text>
            <Text className="text-text-secondary text-xs mt-1">Screen Time</Text>
          </View>
          <View style={{ backgroundColor: surface }} className="flex-1 rounded-2xl p-4 items-center">
            <Text className="text-2xl font-bold text-primary-light">{currentStreak}</Text>
            <Text className="text-text-secondary text-xs mt-1">วัน Streak</Text>
          </View>
          <View style={{ backgroundColor: surface }} className="flex-1 rounded-2xl p-4 items-center">
            <Text className="text-2xl font-bold text-yellow">{Math.floor(totalFocusMinutes / 60)}</Text>
            <Text className="text-text-secondary text-xs mt-1">ชม. โฟกัส</Text>
          </View>
        </View>

        {/* Usage permission warning */}
        {!hasPermission && (
          <TouchableOpacity
            onPress={requestUsageStatsPermission}
            className="bg-orange/10 border border-orange/30 rounded-2xl p-4 mb-4"
          >
            <Text className="text-orange text-sm font-semibold">⚠️ ต้องการสิทธิ์ Usage Access</Text>
            <Text className="text-white/60 text-xs mt-1">
              กดที่นี่ → เปิด "Usage access" ให้ pet-focus → กลับมาดูสถิติ
            </Text>
          </TouchableOpacity>
        )}

        {/* Weekly summary (research-lite) */}
        <View style={{ backgroundColor: surface }} className="rounded-2xl p-4 mb-4">
          <Text className="text-white font-semibold mb-3">สรุปสัปดาห์นี้ 📅</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-primary-light text-xl font-bold">{weekly.sessions}</Text>
              <Text className="text-text-secondary text-xs mt-1">โฟกัสสำเร็จ</Text>
            </View>
            <View className="items-center">
              <Text className="text-yellow text-xl font-bold">
                {weeklyHours > 0 ? `${weeklyHours}ชม. ${weeklyMins}น.` : `${weeklyMins} น.`}
              </Text>
              <Text className="text-text-secondary text-xs mt-1">เวลาโฟกัส</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl">{moodEmoji}</Text>
              <Text className="text-text-secondary text-xs mt-1">อารมณ์เฉลี่ย</Text>
            </View>
          </View>
          {weekly.sessions === 0 && (
            <Text className="text-text-secondary text-xs text-center mt-3">
              ทำ Focus session แล้วบันทึกอารมณ์ เพื่อดูแนวโน้มของสัปดาห์นี้
            </Text>
          )}
        </View>

        {/* AI Tip */}
        <AITip tip={aiTip} isLoading={tipLoading} />

        {/* App usage chart */}
        <View style={{ backgroundColor: surface }} className="mt-4 rounded-2xl p-4">
          <Text className="text-white font-semibold mb-3">แอปที่ใช้มากที่สุด</Text>
          <AppUsageChart apps={apps} />
        </View>

        {/* Focus stats */}
        <View style={{ backgroundColor: surface }} className="mt-3 rounded-2xl p-4">
          <Text className="text-white font-semibold mb-3">สถิติโฟกัส</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-primary-light text-xl font-bold">{totalFocusMinutes}</Text>
              <Text className="text-text-secondary text-xs">นาทีรวม</Text>
            </View>
            <View className="items-center">
              <Text className="text-yellow text-xl font-bold">{currentStreak}</Text>
              <Text className="text-text-secondary text-xs">วัน Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedScreen>
  )
}
