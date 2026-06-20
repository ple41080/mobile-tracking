import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CameraSettingsState {
  mirrorPreview: boolean
  shutterSound: boolean
  setMirrorPreview: (value: boolean) => void
  setShutterSound: (value: boolean) => void
}

export const useCameraSettingsStore = create<CameraSettingsState>()(
  persist(
    (set) => ({
      mirrorPreview: false,
      shutterSound: false,
      setMirrorPreview: (value) => set({ mirrorPreview: value }),
      setShutterSound: (value) => set({ shutterSound: value }),
    }),
    {
      name: 'camera-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
