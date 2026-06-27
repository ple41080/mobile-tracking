import React from 'react'
import { View, Text, Dimensions, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { PetRive } from '@/components/pet/PetRive'
import { OutfitPicker } from '@/components/pet/OutfitPicker'
import { PetNameEditor } from '@/components/pet/PetNameEditor'
import { PetSwitcherSidebar } from '@/components/pet/PetSwitcherSidebar'
import { usePetStatus } from '@/hooks/usePetStatus'
import { usePetStore } from '@/stores/petStore'
import { useRoomStore } from '@/stores/roomStore'
import { SHOP_ITEMS } from '@/types/shop'
import { getPetMood } from '@/types/pet'

const { height } = Dimensions.get('window')

export default function HomeScreen() {
  const { name, level, happiness, hp, coins } = usePetStatus()
  const setPetName = usePetStore((s) => s.setPetName)
  const activePetId = usePetStore((s) => s.activePetId)
  const equippedItems = usePetStore((s) => s.equippedItems)
  const { selectedBgColor, selectedBgGradient, placedDecorations } = useRoomStore()
  const mood = getPetMood(happiness)

  const isLight = isLightColor(selectedBgColor)
  const textColor = isLight ? '#1A237E' : '#FFFFFF'
  const textSecondary = isLight ? '#5C6BC0' : '#BBDEFB'
  const surfaceColor = isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)'

  const decorationItems = SHOP_ITEMS.filter(
    (item) => item.category === 'room' && placedDecorations.includes(item.id)
  )

  const background = selectedBgGradient ? (
    <LinearGradient
      colors={selectedBgGradient}
      style={StyleSheet.absoluteFillObject}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  ) : (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: selectedBgColor }]} />
  )

  return (
    <View className="flex-1">
      {background}
      <SafeAreaView className="flex-1">

        {/* Top HUD */}
        <View className="flex-row items-center justify-between px-5 pt-1">
          <View style={{ backgroundColor: surfaceColor }} className="px-3 py-1.5 rounded-full">
            <Text style={{ color: textColor }} className="text-xs font-bold">Lv.{level}</Text>
          </View>
          <View style={{ backgroundColor: surfaceColor }} className="flex-row items-center gap-1 px-3 py-1.5 rounded-full">
            <Text className="text-sm">⭐</Text>
            <Text style={{ color: '#FFD600' }} className="font-bold text-xs">{coins}</Text>
          </View>
        </View>

        {/* Decorations in room */}
        {decorationItems.length > 0 && (
          <View className="flex-row flex-wrap px-4 pt-2 gap-2">
            {decorationItems.map((item) => (
              <View key={item.id} style={{ backgroundColor: surfaceColor }} className="px-2 py-1 rounded-xl flex-row items-center gap-1">
                <Text className="text-xl">{item.emoji}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pet */}
        <View className="flex-1 items-center justify-center" pointerEvents="box-none">
          <OutfitPicker surfaceColor={surfaceColor} textColor={textColor} />
          <PetSwitcherSidebar surfaceColor={surfaceColor} textColor={textColor} />
          <PetRive activePetId={activePetId} size={height * 0.42} equippedItems={equippedItems} />
          <PetNameEditor name={name} textColor={textColor} onRename={setPetName} />
          <Text style={{ color: textSecondary }} className="text-xs mt-0.5">
            {mood === 'happy' ? 'มีความสุข 😊' : mood === 'neutral' ? 'ปกติ 😐' : 'เศร้า 😿'}
          </Text>
        </View>

        {/* Stat bars */}
        <View className="mx-6 mb-4 gap-2">
          <StatRow emoji="😊" value={happiness} color="#4CAF50" trackColor={isLight ? '#E0E0E0' : 'rgba(255,255,255,0.15)'} textColor={textColor} />
          <StatRow emoji="❤️" value={hp} color="#F44336" trackColor={isLight ? '#E0E0E0' : 'rgba(255,255,255,0.15)'} textColor={textColor} />
        </View>


      </SafeAreaView>
    </View>
  )
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

function StatRow({ emoji, value, color, trackColor, textColor }: {
  emoji: string; value: number; color: string; trackColor: string; textColor: string
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-sm w-5">{emoji}</Text>
      <View style={{ backgroundColor: trackColor }} className="flex-1 h-2 rounded-full overflow-hidden">
        <View style={{ width: `${value}%`, backgroundColor: color }} className="h-full rounded-full" />
      </View>
      <Text style={{ color: textColor }} className="text-xs w-8 text-right">{value}</Text>
    </View>
  )
}

