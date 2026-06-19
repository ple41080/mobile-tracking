import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface IdentityState {
  faceEnrolled: boolean
  _hasHydrated: boolean
  setFaceEnrolled: (value: boolean) => void
  setHasHydrated: (value: boolean) => void
  syncEnrollmentStatus: () => Promise<void>
  resetEnrollment: () => Promise<void>
}

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set) => ({
      faceEnrolled: false,
      _hasHydrated: false,

      setFaceEnrolled: (value) => set({ faceEnrolled: value }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      syncEnrollmentStatus: async () => {
        try {
          const { loadEmbedding } = await import('@/services/faceVerifier')
          const embedding = await loadEmbedding()
          set({ faceEnrolled: embedding != null && embedding.length > 0 })
        } catch {
          set({ faceEnrolled: false })
        }
      },

      resetEnrollment: async () => {
        try {
          const { clearEnrollment } = await import('@/services/faceVerifier')
          await clearEnrollment()
        } catch {
          // ignore
        }
        set({ faceEnrolled: false })
      },
    }),
    {
      name: 'identity-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ faceEnrolled: state.faceEnrolled }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('identity-store rehydrate failed', error)
        }
        state?.setHasHydrated(true)
        void state?.syncEnrollmentStatus()
      },
    }
  )
)
