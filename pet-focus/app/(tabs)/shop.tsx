import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ItemGrid } from '@/components/shop/ItemGrid'
import { useShopStore } from '@/stores/shopStore'
import { usePetStore } from '@/stores/petStore'
import { useUserStore } from '@/stores/userStore'
import { SHOP_ITEMS, ShopItem, ItemCategory } from '@/types/shop'
import { RARITY_COLORS } from '@/types/shop'

const CATEGORY_TABS: { key: ItemCategory; label: string; emoji: string }[] = [
  { key: 'outfit', label: 'แต่งตัว', emoji: '👗' },
  { key: 'room', label: 'ห้อง', emoji: '🏠' },
  { key: 'pet', label: 'สัตว์', emoji: '🐾' },
]

export default function ShopScreen() {
  const { activeCategory, setActiveCategory, pullGacha } = useShopStore()
  const { coins, gems, spendCoins, spendGems, equipItem, equippedItems } = usePetStore()
  const { ownedItems, addOwnedItem } = useUserStore()
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [gachaResult, setGachaResult] = useState<ShopItem | null>(null)

  const filteredItems = SHOP_ITEMS.filter((i) => i.category === activeCategory)

  function handleItemPress(item: ShopItem) {
    if (ownedItems.includes(item.id)) {
      equipItem(item.id)
      return
    }
    setSelectedItem(item)
  }

  function handleBuy() {
    if (!selectedItem) return
    const { currency, price, id } = selectedItem
    const success = currency === 'coin' ? spendCoins(price) : spendGems(price)
    if (!success) {
      Alert.alert(
        currency === 'coin' ? '⭐ เหรียญไม่พอ' : '💎 เพชรไม่พอ',
        'ทำ Focus session เพื่อหาเหรียญเพิ่มนะ!'
      )
      setSelectedItem(null)
      return
    }
    addOwnedItem(id)
    setSelectedItem(null)
  }

  function handleGacha() {
    if (!spendGems(10)) {
      Alert.alert('💎 เพชรไม่พอ', 'ต้องการ 10 เพชร เพื่อ Gacha 1 ครั้ง')
      return
    }
    const result = pullGacha()
    addOwnedItem(result.id)
    setGachaResult(result)
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-2 pb-3">
          <Text className="text-white text-2xl font-bold">ร้านค้า 🛍️</Text>
          <View className="flex-row gap-2">
            <View className="flex-row items-center gap-1 bg-surface px-3 py-1.5 rounded-full">
              <Text>⭐</Text>
              <Text className="text-yellow font-bold text-sm">{coins}</Text>
            </View>
            <View className="flex-row items-center gap-1 bg-surface px-3 py-1.5 rounded-full">
              <Text>💎</Text>
              <Text className="text-gem font-bold text-sm">{gems}</Text>
            </View>
          </View>
        </View>

        {/* Gacha Banner */}
        <TouchableOpacity
          onPress={handleGacha}
          activeOpacity={0.8}
          className="bg-gradient-to-r from-primary to-orange rounded-2xl p-4 mb-3 flex-row items-center justify-between"
          style={{ backgroundColor: '#1A3A1A', borderWidth: 1, borderColor: '#F5C51840' }}
        >
          <View>
            <Text className="text-yellow font-bold text-base">🎰 Gacha สุ่มไอเทม</Text>
            <Text className="text-white/60 text-xs mt-0.5">ใช้ 10 💎 ต่อครั้ง</Text>
          </View>
          <Text className="text-3xl">✨</Text>
        </TouchableOpacity>

        {/* Category tabs */}
        <View className="flex-row bg-surface rounded-2xl p-1 mb-3">
          {CATEGORY_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveCategory(tab.key)}
              className={`flex-1 py-2 rounded-xl items-center flex-row justify-center gap-1 ${
                activeCategory === tab.key ? 'bg-primary' : ''
              }`}
            >
              <Text className="text-sm">{tab.emoji}</Text>
              <Text
                className={`text-xs font-semibold ${
                  activeCategory === tab.key ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Item Grid */}
        <ItemGrid
          items={filteredItems}
          ownedItems={ownedItems}
          equippedItems={equippedItems}
          onItemPress={handleItemPress}
        />
      </View>

      {/* Purchase Modal */}
      <Modal visible={!!selectedItem} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <View className="bg-surface rounded-t-3xl p-6">
            {selectedItem && (
              <>
                <View className="items-center mb-4">
                  <Text className="text-6xl mb-2">{selectedItem.emoji}</Text>
                  <Text className="text-white text-lg font-bold">{selectedItem.name}</Text>
                  <Text
                    className="text-xs mt-1 font-semibold"
                    style={{ color: RARITY_COLORS[selectedItem.rarity] }}
                  >
                    {selectedItem.rarity.toUpperCase()}
                  </Text>
                  <Text className="text-text-secondary text-sm mt-2 text-center">
                    {selectedItem.description}
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setSelectedItem(null)}
                    className="flex-1 py-3 rounded-xl border border-white/20 items-center"
                  >
                    <Text className="text-white/70 font-semibold">ยกเลิก</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleBuy}
                    className="flex-1 py-3 rounded-xl bg-primary-light items-center"
                  >
                    <Text className="text-white font-bold">
                      ซื้อ {selectedItem.price} {selectedItem.currency === 'coin' ? '⭐' : '💎'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Gacha Result Modal */}
      <Modal visible={!!gachaResult} transparent animationType="fade">
        <View className="flex-1 bg-black/80 items-center justify-center px-8">
          <View className="bg-surface rounded-3xl p-8 items-center w-full">
            {gachaResult && (
              <>
                <Text className="text-3xl mb-1">✨</Text>
                <Text className="text-white text-lg font-bold mb-3">ได้รับไอเทม!</Text>
                <Text className="text-7xl mb-3">{gachaResult.emoji}</Text>
                <Text className="text-white text-xl font-bold">{gachaResult.name}</Text>
                <Text
                  className="text-sm mt-1 font-semibold"
                  style={{ color: RARITY_COLORS[gachaResult.rarity] }}
                >
                  {gachaResult.rarity.toUpperCase()}
                </Text>
                <TouchableOpacity
                  onPress={() => setGachaResult(null)}
                  className="mt-6 bg-primary-light rounded-xl py-3 px-8"
                >
                  <Text className="text-white font-bold">เยี่ยม!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
