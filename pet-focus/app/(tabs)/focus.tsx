import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TimerRing } from '@/components/focus/TimerRing'
import { TimeSelector } from '@/components/focus/TimeSelector'
import { BlockedAppsList } from '@/components/focus/BlockedAppsList'
import { useFocusSession } from '@/hooks/useFocusSession'
import { usePetStatus } from '@/hooks/usePetStatus'
import { getCoinsForDuration } from '@/stores/focusStore'

export default function FocusScreen() {
  const { status, selectedMinutes, remainingSeconds, begin, cancel, reset, selectDuration } =
    useFocusSession()
  const { name, coins } = usePetStatus()

  const isActive = status === 'in_progress'
  const isDone = status === 'completed'
  const isFailed = status === 'failed'

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="pt-2 pb-4">
          <Text className="text-white text-2xl font-bold">Focus Mode ⏱</Text>
          <Text className="text-text-secondary text-sm mt-0.5">
            วางโทรศัพท์ → {name}มีความสุข 🐱
          </Text>
        </View>

        {/* Timer */}
        <View className="items-center my-4">
          <TimerRing
            remainingSeconds={remainingSeconds}
            totalSeconds={selectedMinutes * 60}
            size={220}
          />
        </View>

        {/* Duration selector */}
        <TimeSelector
          selectedMinutes={selectedMinutes}
          onSelect={selectDuration}
          disabled={isActive}
        />

        {/* Reward preview */}
        <View className="flex-row justify-center items-center gap-2 my-4">
          <Text className="text-text-secondary text-sm">รางวัลที่ได้รับ:</Text>
          <Text className="text-yellow font-bold">+{getCoinsForDuration(selectedMinutes)} ⭐</Text>
          <Text className="text-primary-light font-bold">+{getCoinsForDuration(selectedMinutes) * 2} EXP</Text>
        </View>

        {/* CTA Button */}
        {!isActive ? (
          <TouchableOpacity
            onPress={begin}
            activeOpacity={0.8}
            className="bg-primary-light rounded-2xl py-4 items-center mx-2"
          >
            <Text className="text-white text-lg font-bold">เริ่มโฟกัส 🚀</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={cancel}
            activeOpacity={0.8}
            className="bg-danger/20 border border-danger/50 rounded-2xl py-4 items-center mx-2"
          >
            <Text className="text-danger text-base font-semibold">ยกเลิก Session</Text>
          </TouchableOpacity>
        )}

        {/* Blocked apps list */}
        <BlockedAppsList />
      </View>

      {/* Success Modal */}
      <Modal visible={isDone} transparent animationType="fade">
        <View className="flex-1 bg-black/70 items-center justify-center px-8">
          <View className="bg-surface rounded-3xl p-8 items-center w-full">
            <Text className="text-5xl mb-3">🎉</Text>
            <Text className="text-white text-xl font-bold">โฟกัสสำเร็จ!</Text>
            <Text className="text-text-secondary text-sm mt-2 text-center">
              {name}มีความสุขมากขึ้นเลย
            </Text>
            <View className="flex-row gap-4 mt-4 mb-6">
              <View className="items-center">
                <Text className="text-yellow text-2xl font-bold">+{getCoinsForDuration(selectedMinutes)}</Text>
                <Text className="text-text-secondary text-xs">เหรียญ ⭐</Text>
              </View>
              <View className="items-center">
                <Text className="text-primary-light text-2xl font-bold">+10</Text>
                <Text className="text-text-secondary text-xs">ความสุข 😊</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={reset}
              className="bg-primary-light rounded-xl py-3 px-8"
            >
              <Text className="text-white font-bold">เยี่ยม! กลับหน้าหลัก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Failed Modal */}
      <Modal visible={isFailed} transparent animationType="fade">
        <View className="flex-1 bg-black/70 items-center justify-center px-8">
          <View className="bg-surface rounded-3xl p-8 items-center w-full">
            <Text className="text-5xl mb-3">😿</Text>
            <Text className="text-white text-xl font-bold">โอ้โห... ออกจากแอปแล้ว</Text>
            <Text className="text-text-secondary text-sm mt-2 text-center">
              {name}เสียใจนิดหน่อย ลองใหม่อีกครั้งนะ!
            </Text>
            <TouchableOpacity
              onPress={reset}
              className="bg-danger/30 border border-danger/50 rounded-xl py-3 px-8 mt-6"
            >
              <Text className="text-white font-bold">ลองใหม่</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
