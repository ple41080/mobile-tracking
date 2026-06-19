import React from 'react'
import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import { useRoomStore } from '@/stores/roomStore'

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ opacity: focused ? 1 : 0.5 }} className="items-center justify-center w-8 h-8">
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
    </View>
  )
}

export default function TabsLayout() {
  const { tabBarColor } = useRoomStore()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBarColor,
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#FFC94D',
        tabBarInactiveTintColor: '#FAE7CB',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าหลัก',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🐱" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'โฟกัส',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⏱" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: 'เควส',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'สถิติ',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'ร้านค้า',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛍️" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
