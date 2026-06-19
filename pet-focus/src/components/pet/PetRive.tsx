import React, { useCallback, useRef } from 'react'
import { View, NativeModules } from 'react-native'
import { PetSpecies } from '@/types/pet'
import { PET_CAT_RIV, PET_DOG_AND_CAT_RIV } from '@/assets/riveAssets'

const isRiveAvailable = !!NativeModules.RiveReactNativeModule

let Rive: any = null
if (isRiveAvailable) {
  try {
    Rive = require('rive-react-native').default
  } catch {
    // ignore
  }
}

const STATE_MACHINE = 'State Machine 1'
const DOG_CAT_INPUT = 'cat/dog'

interface PetRiveProps {
  species: PetSpecies
  size?: number
  stateMachineName?: string
}

function setDogMode(ref: React.RefObject<any>, stateMachineName: string) {
  try {
    ref.current?.setInputState(stateMachineName, DOG_CAT_INPUT, true)
  } catch {
    // Rive native may not be ready yet
  }
}

export function PetRive({
  species,
  size = 200,
  stateMachineName = STATE_MACHINE,
}: PetRiveProps) {
  const riveRef = useRef<any>(null)
  const isDog = species === 'dog'

  const applyDogInputs = useCallback(() => {
    setDogMode(riveRef, stateMachineName)
  }, [stateMachineName])

  if (!Rive || !isRiveAvailable) {
    return <View style={{ width: size, height: size }} />
  }

  const source = isDog ? PET_DOG_AND_CAT_RIV : PET_CAT_RIV

  return (
    <View style={{ width: size, height: size }}>
      <Rive
        key={species}
        ref={isDog ? riveRef : undefined}
        source={source}
        stateMachineName={stateMachineName}
        style={{ width: size, height: size }}
        autoplay
        onPlay={isDog ? applyDogInputs : undefined}
      />
    </View>
  )
}
