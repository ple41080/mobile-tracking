import React from 'react'
import { View, FlatList } from 'react-native'
import { ShopItem } from '@/types/shop'
import { ItemCard } from './ItemCard'
import { isPetOwned, PetId } from '@/types/pet'

interface ItemGridProps {
  items: ShopItem[]
  ownedItems: string[]
  equippedItems: string[]
  activePetId?: PetId
  onItemPress: (item: ShopItem) => void
}

export function ItemGrid({
  items,
  ownedItems,
  equippedItems,
  activePetId,
  onItemPress,
}: ItemGridProps) {
  return (
    <FlatList
      data={items}
      numColumns={3}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ gap: 10 }}
      contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
      renderItem={({ item }) => {
        const isOwned =
          item.category === 'pet' && item.petId
            ? isPetOwned(item.petId, ownedItems)
            : ownedItems.includes(item.id)

        const isEquipped =
          item.category === 'pet' && item.petId
            ? activePetId === item.petId
            : equippedItems.includes(item.id)

        return (
          <View style={{ flex: 1 }}>
            <ItemCard
              item={item}
              isOwned={isOwned}
              isEquipped={isEquipped}
              onPress={() => onItemPress(item)}
            />
          </View>
        )
      }}
    />
  )
}
