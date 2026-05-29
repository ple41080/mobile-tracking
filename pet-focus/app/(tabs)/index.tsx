import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { PetAvatar } from '@/components/pet/PetAvatar'
import { StatBar } from '@/components/pet/StatBar'
import { StreakDots } from '@/components/pet/StreakDots'
import { usePetStatus } from '@/hooks/usePetStatus'
import { useFocusStore } from '@/stores/focusStore'
import { EXP_PER_LEVEL } from '@/types/pet'

export default function HomeScreen() {
  const { name, level, exp, hp, happiness, coins, gems, moodEmoji, moodText, levelTitle } =
    usePetStatus()
  const { currentStreak, lastFocusDate } = useFocusStore()

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
          <Text className="text-white text-lg font-bold">สวัสดี, นาย 👋</Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1 bg-surface px-3 py-1.5 rounded-full">
              <Text className="text-base">⭐</Text>
              <Text className="text-yellow font-bold text-sm">{coins}</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-surface px-3 py-1.5 rounded-full">
              <Text className="text-base">💎</Text>
              <Text className="text-gem font-bold text-sm">{gems}</Text>
            </View>
          </View>
        </View>

        {/* Pet Card */}
        <View className="mx-4 mt-2 bg-surface rounded-3xl px-5 pb-5">
          <PetAvatar name={name} level={level} happiness={happiness} />

          <StatBar
            label="ความสุข 😊"
            value={happiness}
            max={100}
            color="#5DB347"
          />
          <StatBar
            label="HP ❤️"
            value={hp}
            max={100}
            color="#06B6D4"
          />
          <StatBar
            label="EXP ✨"
            value={exp}
            max={EXP_PER_LEVEL}
            color="#F5C518"
            showValue
          />
        </View>

        {/* Streak */}
        <View className="mx-4 mt-3 bg-surface rounded-3xl px-4 py-2">
          <Text className="text-white/60 text-xs text-center mb-1">
            🔥 Streak {currentStreak} วัน
          </Text>
          <StreakDots streak={currentStreak} lastFocusDate={lastFocusDate} />
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3 mx-4 mt-3">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/focus')}
            activeOpacity={0.75}
            className="flex-1 bg-primary rounded-2xl p-4 items-center"
          >
            <Text className="text-3xl mb-1">⏱</Text>
            <Text className="text-white font-bold text-sm">Focus Mode</Text>
            <Text className="text-primary-light text-xs mt-0.5">วางโทรศัพท์ แล้วรับรางวัล</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/stats')}
            activeOpacity={0.75}
            className="flex-1 bg-surface border border-white/10 rounded-2xl p-4 items-center"
          >
            <Text className="text-3xl mb-1">📊</Text>
            <Text className="text-white font-bold text-sm">สถิติ</Text>
            <Text className="text-text-secondary text-xs mt-0.5">ดูรายงานการใช้งาน</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Quests Banner */}
        <View className="mx-4 mt-3 bg-orange/10 border border-orange/30 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-lg">🎯</Text>
            <Text className="text-orange font-semibold text-sm">ภารกิจวันนี้</Text>
          </View>
          <Text className="text-white/70 text-xs">โฟกัส 1 ชั่วโมง • ไม่เล่นก่อนนอน 30 นาที</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
