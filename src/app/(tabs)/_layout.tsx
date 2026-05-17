import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/src/shared/ui/icon-symbol';
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
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="audio-demo"
        options={{
          title: 'Audio',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="play" color={color} />,
        }}
      />
    </Tabs>
  );
}
