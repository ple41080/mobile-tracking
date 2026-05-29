import { create } from 'zustand'

interface UserProfile {
  uid: string
  name: string
  age: number
  school: string
  createdAt: Date | null
}

interface UserState {
  profile: UserProfile | null
  isLoggedIn: boolean
  isLoading: boolean
  ownedItems: string[]
  earnedAchievements: string[]
  // Actions
  setProfile: (profile: UserProfile) => void
  setLoggedIn: (value: boolean) => void
  setLoading: (value: boolean) => void
  addOwnedItem: (itemId: string) => void
  earnAchievement: (achievementId: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoggedIn: false,
  isLoading: false,
  ownedItems: [],
  earnedAchievements: [],

  setProfile: (profile) => set({ profile }),
  setLoggedIn: (value) => set({ isLoggedIn: value }),
  setLoading: (value) => set({ isLoading: value }),

  addOwnedItem: (itemId) =>
    set((state) => ({
      ownedItems: state.ownedItems.includes(itemId)
        ? state.ownedItems
        : [...state.ownedItems, itemId],
    })),

  earnAchievement: (achievementId) =>
    set((state) => ({
      earnedAchievements: state.earnedAchievements.includes(achievementId)
        ? state.earnedAchievements
        : [...state.earnedAchievements, achievementId],
    })),

  logout: () =>
    set({
      profile: null,
      isLoggedIn: false,
      ownedItems: [],
      earnedAchievements: [],
    }),
}))
