import { Tabs } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { HapticTab } from '@/src/components/haptic-tab';
import { Colors } from '@/src/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={26} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '팟캐스트 생성',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={26} name={focused ? 'add-circle' : 'add-circle-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          title: '재생기',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={26} name={focused ? 'play-circle' : 'play-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
