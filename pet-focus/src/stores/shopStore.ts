import { create } from 'zustand'
import { ItemCategory } from '@/types/shop'

interface ShopState {
  activeCategory: ItemCategory
  setActiveCategory: (category: ItemCategory) => void
}

export const useShopStore = create<ShopState>((set) => ({
  activeCategory: 'outfit',
  setActiveCategory: (category) => set({ activeCategory: category }),
}))
