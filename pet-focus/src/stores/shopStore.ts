import { create } from 'zustand'
import { ShopItem, SHOP_ITEMS, ItemCategory, GACHA_RATES, ItemRarity } from '@/types/shop'

interface ShopState {
  activeCategory: ItemCategory
  lastGachaResult: ShopItem | null
  isGachaAnimating: boolean
  // Actions
  setActiveCategory: (category: ItemCategory) => void
  pullGacha: () => ShopItem
  setGachaAnimating: (value: boolean) => void
  clearGachaResult: () => void
}

function getRandomByRarity(rarity: ItemRarity): ShopItem {
  const items = SHOP_ITEMS.filter((i) => i.rarity === rarity)
  return items[Math.floor(Math.random() * items.length)]
}

export const useShopStore = create<ShopState>((set) => ({
  activeCategory: 'outfit',
  lastGachaResult: null,
  isGachaAnimating: false,

  setActiveCategory: (category) => set({ activeCategory: category }),

  pullGacha: () => {
    const roll = Math.random()
    let result: ShopItem
    if (roll < GACHA_RATES.common) {
      result = getRandomByRarity('common')
    } else if (roll < GACHA_RATES.rare) {
      result = getRandomByRarity('rare')
    } else {
      result = getRandomByRarity('legendary')
    }
    set({ lastGachaResult: result })
    return result
  },

  setGachaAnimating: (value) => set({ isGachaAnimating: value }),
  clearGachaResult: () => set({ lastGachaResult: null }),
}))
