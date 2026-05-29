import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ShopItem, RARITY_COLORS, RARITY_LABELS } from '@/types/shop'

interface ItemCardProps {
  item: ShopItem
  isOwned: boolean
  isEquipped: boolean
  onPress: () => void
}

export function ItemCard({ item, isOwned, isEquipped, onPress }: ItemCardProps) {
  const rarityColor = RARITY_COLORS[item.rarity]

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`bg-surface rounded-2xl p-3 border ${
        isEquipped ? 'border-yellow' : 'border-white/10'
      }`}
    >
      {/* Rarity badge */}
      <View className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: rarityColor + '30' }}>
        <Text style={{ color: rarityColor }} className="text-[9px] font-bold">
          {RARITY_LABELS[item.rarity]}
        </Text>
      </View>

      <Text className="text-4xl text-center my-2">{item.emoji}</Text>
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
            <Text className="text-base">{item.currency === 'coin' ? '⭐' : '💎'}</Text>
            <Text className="text-white text-xs font-bold">{item.price}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
