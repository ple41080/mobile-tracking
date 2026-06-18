import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native'
import { ThemedScreen } from '@/components/ThemedScreen'
import { useAppTheme } from '@/hooks/useAppTheme'
import { ItemGrid } from '@/components/shop/ItemGrid'
import { useShopStore } from '@/stores/shopStore'
import { usePetStore } from '@/stores/petStore'
import { useUserStore } from '@/stores/userStore'
import { useRoomStore } from '@/stores/roomStore'
import { SHOP_ITEMS, ShopItem, ItemCategory } from '@/types/shop'

const CATEGORY_TABS: { key: ItemCategory; label: string; emoji: string }[] = [
  { key: 'outfit', label: 'แต่งตัว', emoji: '👗' },
  { key: 'background', label: 'พื้นหลัง', emoji: '🎨' },
  { key: 'room', label: 'ของตกแต่ง', emoji: '🏠' },
  { key: 'pet', label: 'สัตว์', emoji: '🐾' },
]

export default function ShopScreen() {
  const { activeCategory, setActiveCategory } = useShopStore()
  const { coins, spendCoins, equipItem, equippedItems } = usePetStore()
  const { ownedItems, addOwnedItem } = useUserStore()
  const { setBackground, toggleDecoration, selectedBgId, placedDecorations } = useRoomStore()
  const { surface } = useAppTheme()
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)

  const filteredItems = SHOP_ITEMS.filter((i) => i.category === activeCategory)

  function handleItemPress(item: ShopItem) {
    if (!ownedItems.includes(item.id)) {
      setSelectedItem(item)
      return
    }
    // Already owned — apply/toggle
    if (item.category === 'background') {
      setBackground(selectedBgId === item.id ? null : item)
    } else if (item.category === 'room') {
      toggleDecoration(item.id)
    } else {
      equipItem(item.id)
    }
  }

  function handleBuy() {
    if (!selectedItem) return
    const { currency, price, id } = selectedItem
    const success = spendCoins(price)
    if (!success) {
      Alert.alert('⭐ เหรียญไม่พอ', 'ทำ Focus session เพื่อหาเหรียญเพิ่มนะ!')
      setSelectedItem(null)
      return
    }
    addOwnedItem(id)
    // Apply immediately after buying
    if (selectedItem.category === 'background') {
      setBackground(selectedItem)
    } else if (selectedItem.category === 'room') {
      toggleDecoration(id)
    }
    setSelectedItem(null)
  }

  return (
    <ThemedScreen>
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-2 pb-3">
          <Text className="text-white text-2xl font-bold">ร้านค้า 🛍️</Text>
          <View style={{ backgroundColor: surface }} className="flex-row items-center gap-1 px-3 py-1.5 rounded-full">
            <Text>⭐</Text>
            <Text className="text-yellow font-bold text-sm">{coins}</Text>
          </View>
        </View>

        {/* Category tabs */}
        <View style={{ backgroundColor: surface }} className="flex-row rounded-2xl p-1 mb-3">
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
          <View style={{ backgroundColor: surface }} className="rounded-t-3xl p-6">
            {selectedItem && (
              <>
                <View className="items-center mb-4">
                  {selectedItem.bgColor ? (
                    <View style={{ backgroundColor: selectedItem.bgColor, width: 80, height: 80, borderRadius: 16, marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
                      <Text className="text-4xl">{selectedItem.emoji}</Text>
                    </View>
                  ) : (
                    <Text className="text-6xl mb-2">{selectedItem.emoji}</Text>
                  )}
                  <Text className="text-white text-lg font-bold">{selectedItem.name}</Text>
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
                      ซื้อ {selectedItem.price} ⭐
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </ThemedScreen>
  )
}
