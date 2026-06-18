import React from 'react'
import { View, Text, TouchableOpacity, NativeModules } from 'react-native'
import { PetMood } from '@/types/pet'

const isRiveAvailable = !!NativeModules.RiveReactNativeModule

let Rive: any = null
if (isRiveAvailable) {
  try {
    Rive = require('rive-react-native').default
  } catch {
    // ignore
  }
}

interface PetRiveProps {
  mood: PetMood
  size?: number
  riveSource?: number | string
  stateMachineName?: string
  onPat?: () => void
}

const MOOD_EMOJI: Record<PetMood, string> = {
  happy: '🐱',
  neutral: '😐',
  sad: '😿',
}

export function PetRive({
  mood,
  size = 200,
  riveSource,
  stateMachineName = 'State Machine 1',
  onPat,
}: PetRiveProps) {

  function handleStateChanged(stateMachine: string, stateName: string) {
    if (stateName === 'Pat' || stateName.toLowerCase().includes('pat')) {
      onPat?.()
    }
  }

  if (!Rive || !isRiveAvailable) {
    return (
      <TouchableOpacity onPress={() => onPat?.()} activeOpacity={0.8}>
        <EmojiFallback mood={mood} size={size} />
      </TouchableOpacity>
    )
  }

  const riveProps =
    typeof riveSource === 'number'
      ? { source: riveSource }
      : typeof riveSource === 'string' && riveSource.startsWith('http')
        ? { url: riveSource }
        : { resourceName: riveSource ?? 'pet_cat' }

  return (
    <View style={{ width: size, height: size }}>
      <Rive
        {...riveProps}
        stateMachineName={stateMachineName}
        style={{ width: size, height: size }}
        autoplay
        onStateChanged={handleStateChanged}
      />
    </View>
  )
}

function EmojiFallback({ mood, size }: { mood: PetMood; size: number }) {
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Text style={{ fontSize: size * 0.55 }}>{MOOD_EMOJI[mood]}</Text>
    </View>
  )
}
