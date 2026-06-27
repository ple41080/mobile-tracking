import React from 'react'
import { View, Text } from 'react-native'
import { getPetMood, PET_MOOD_CONFIG, getLevelTitle } from '@/types/pet'
import { usePetStore } from '@/stores/petStore'
import { PetRive } from './PetRive'

interface PetAvatarProps {
  name: string
  level: number
  happiness: number
}

export function PetAvatar({ name, level, happiness }: PetAvatarProps) {
  const activePetId = usePetStore((s) => s.activePetId)
  const equippedItems = usePetStore((s) => s.equippedItems)
  const mood = getPetMood(happiness)
  const { text: moodText } = PET_MOOD_CONFIG[mood]

  return (
    <View className="items-center py-4">
      <PetRive activePetId={activePetId} size={180} equippedItems={equippedItems} />
      <Text className="text-text-secondary text-sm mt-1 text-center">{moodText}</Text>
      <Text className="text-white text-xl font-bold mt-1">
        {name}
        <Text className="text-text-secondary text-base font-normal">
          {' '}· {getLevelTitle(level)} Lv.{level}
        </Text>
      </Text>
    </View>
  )
}
