import React from 'react'
import { View, Text } from 'react-native'
import { getPetMood, PET_MOOD_CONFIG, getLevelTitle } from '@/types/pet'
import { PetRive } from './PetRive'

interface PetAvatarProps {
  name: string
  level: number
  happiness: number
  // Optional: path to custom .riv file, defaults to community URL
  riveSource?: string
}

export function PetAvatar({ name, level, happiness, riveSource }: PetAvatarProps) {
  const mood = getPetMood(happiness)
  const { text: moodText } = PET_MOOD_CONFIG[mood]

  return (
    <View className="items-center py-4">
      <PetRive
        mood={mood}
        happiness={happiness}
        size={180}
        riveSource={riveSource}
        stateMachineName="State Machine 1"
        happinessInput="happiness"
      />
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
