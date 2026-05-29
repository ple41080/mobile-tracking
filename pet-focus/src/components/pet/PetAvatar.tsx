import React, { useEffect, useRef } from 'react'
import { View, Text, Animated } from 'react-native'
import { getPetMood, PET_MOOD_CONFIG, getLevelTitle } from '@/types/pet'

interface PetAvatarProps {
  name: string
  level: number
  happiness: number
}

export function PetAvatar({ name, level, happiness }: PetAvatarProps) {
  const mood = getPetMood(happiness)
  const { emoji, text } = PET_MOOD_CONFIG[mood]
  const bounceAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    )
    if (mood === 'happy') {
      bounce.start()
    } else {
      bounceAnim.setValue(0)
      bounce.stop()
    }
    return () => bounce.stop()
  }, [mood, bounceAnim])

  return (
    <View className="items-center py-6">
      <Animated.Text
        style={{ transform: [{ translateY: bounceAnim }], fontSize: 72 }}
      >
        {emoji}
      </Animated.Text>
      <Text className="text-text-secondary text-sm mt-2 text-center">{text}</Text>
      <Text className="text-white text-xl font-bold mt-1">
        {name}
        <Text className="text-text-secondary text-base font-normal">
          {' '}· {getLevelTitle(level)} Lv.{level}
        </Text>
      </Text>
    </View>
  )
}
