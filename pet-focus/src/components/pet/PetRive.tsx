import React, { useRef, useEffect } from 'react'
import { View, Text, NativeModules } from 'react-native'
import { PetMood } from '@/types/pet'

// Rive requires native module compiled into the app (dev build, not Expo Go)
// Check native module registry at runtime to avoid crash
const isRiveAvailable = !!NativeModules.RiveReactNative

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
  // Path to local .riv file or URL
  riveSource?: string
  // Rive state machine name
  stateMachineName?: string
  // Rive input name that maps to happiness value (0–100)
  happinessInput?: string
  happiness?: number
}

const MOOD_EMOJI: Record<PetMood, string> = {
  happy: '🐱',
  neutral: '😐',
  sad: '😿',
}

// Community Rive cat animation (free from rive.app)
// Replace with your own .riv file path: require('../../assets/rive/pet.riv')
const DEFAULT_RIVE_URL =
  'https://public.rive.app/community/runtime-files/2244-4463-animated-login-screen.riv'

export function PetRive({
  mood,
  size = 200,
  riveSource = DEFAULT_RIVE_URL,
  stateMachineName = 'State Machine 1',
  happinessInput = 'happiness',
  happiness = 80,
}: PetRiveProps) {
  const riveRef = useRef<any>(null)

  useEffect(() => {
    if (!Rive || !riveRef.current) return
    try {
      riveRef.current.setInputState(stateMachineName, happinessInput, happiness)
    } catch {
      // input may not exist in the .riv file
    }
  }, [happiness, stateMachineName, happinessInput])

  useEffect(() => {
    if (!Rive || !riveRef.current) return
    try {
      // Trigger mood-based trigger inputs if they exist in the .riv
      riveRef.current.fireState(stateMachineName, mood)
    } catch {
      // trigger may not exist
    }
  }, [mood, stateMachineName])

  if (!Rive || !isRiveAvailable) {
    return <EmojiFallback mood={mood} size={size} />
  }

  const isUrl = typeof riveSource === 'string' && riveSource.startsWith('http')

  return (
    <View style={{ width: size, height: size }}>
      <Rive
        ref={riveRef}
        {...(isUrl ? { url: riveSource } : { resourceName: riveSource })}
        stateMachineName={stateMachineName}
        style={{ width: size, height: size }}
        autoplay
      />
    </View>
  )
}

// ─── Emoji fallback (Expo Go) ─────────────────────────────────────────────────

function EmojiFallback({ mood, size }: { mood: PetMood; size: number }) {
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Text style={{ fontSize: size * 0.55 }}>{MOOD_EMOJI[mood]}</Text>
      <Text className="text-text-secondary text-[10px] mt-1 text-center">
        (ต้องการ Dev Build สำหรับ Rive 3D)
      </Text>
    </View>
  )
}
