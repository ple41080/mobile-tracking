import { create } from 'zustand'
import { EXP_PER_LEVEL } from '@/types/pet'

interface PetState {
  name: string
  species: 'cat' | 'dog' | 'rabbit' | 'hamster'
  level: number
  exp: number
  hp: number
  happiness: number
  coins: number
  equippedItems: string[]
  // Actions
  addExp: (amount: number) => void
  updateHappiness: (delta: number) => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  equipItem: (itemId: string) => void
  setPetName: (name: string) => void
  setFromFirestore: (data: Partial<PetState>) => void
}

export const usePetStore = create<PetState>((set, get) => ({
  name: 'โปโป้',
  species: 'cat',
  level: 1,
  exp: 0,
  hp: 100,
  happiness: 80,
  coins: 10000,
  equippedItems: [],

  addExp: (amount) =>
    set((state) => {
      let newExp = state.exp + amount
      let newLevel = state.level
      while (newExp >= EXP_PER_LEVEL && newLevel < 20) {
        newExp -= EXP_PER_LEVEL
        newLevel += 1
      }
      return { exp: newExp, level: newLevel }
    }),

  updateHappiness: (delta) =>
    set((state) => ({
      happiness: Math.max(5, Math.min(100, state.happiness + delta)),
    })),

  addCoins: (amount) =>
    set((state) => ({ coins: state.coins + amount })),

  spendCoins: (amount) => {
    const { coins } = get()
    if (coins < amount) return false
    set((state) => ({ coins: state.coins - amount }))
    return true
  },

  equipItem: (itemId) =>
    set((state) => ({
      equippedItems: state.equippedItems.includes(itemId)
        ? state.equippedItems.filter((i) => i !== itemId)
        : [...state.equippedItems, itemId],
    })),

  setPetName: (name) => set({ name }),

  setFromFirestore: (data) => set(data as PetState),
}))
