import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { ShopItem } from '@/types/shop'

interface ItemCardProps {
  item: ShopItem
  isOwned: boolean
  isEquipped: boolean
  onPress: () => void
}

export function ItemCard({ item, isOwned, isEquipped, onPress }: ItemCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`bg-surface rounded-2xl p-3 border ${
        isEquipped ? 'border-yellow' : 'border-white/10'
      }`}
    >
      {item.image ? (
        <Image
          source={item.image}
          style={{ width: 48, height: 48, alignSelf: 'center', marginVertical: 8 }}
          resizeMode="contain"
        />
      ) : (
        <Text className="text-4xl text-center my-2">{item.emoji}</Text>
      )}
      <Text className="text-white text-xs font-semibold text-center" numberOfLines={1}>
        {item.name}
      </Text>

      <View className="mt-2 items-center">
        {isOwned ? (
          <View className={`px-3 py-1 rounded-full ${isEquipped ? 'bg-yellow/20' : 'bg-white/10'}`}>
            <Text className={`text-xs font-bold ${isEquipped ? 'text-yellow' : 'text-text-secondary'}`}>
              {isEquipped ? '✓ สวมอยู่' : 'มีแล้ว'}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1">
            <Text className="text-base">⭐</Text>
            <Text className="text-white text-xs font-bold">{item.price}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
