import React from 'react'
import { View, FlatList } from 'react-native'
import { ShopItem, ItemCategory } from '@/types/shop'
import { ItemCard } from './ItemCard'

interface ItemGridProps {
  items: ShopItem[]
  ownedItems: string[]
  equippedItems: string[]
  onItemPress: (item: ShopItem) => void
}

export function ItemGrid({ items, ownedItems, equippedItems, onItemPress }: ItemGridProps) {
  return (
    <FlatList
      data={items}
      numColumns={3}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ gap: 10 }}
      contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <ItemCard
            item={item}
            isOwned={ownedItems.includes(item.id)}
            isEquipped={equippedItems.includes(item.id)}
            onPress={() => onItemPress(item)}
          />
        </View>
      )}
    />
  )
}
