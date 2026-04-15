import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

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
        name="alerts/index"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="report/index"
        options={{
          title: "Report",
          tabBarLabel: "",
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <View className="items-center justify-center -top-6">
              <TouchableOpacity
                onPress={props.onPress ?? undefined}
                onLongPress={props.onLongPress ?? undefined}
                accessibilityState={props.accessibilityState}
                className="w-[70px] h-[70px] rounded-full bg-blue-500 items-center justify-center shadow-lg"
                style={{ elevation: 8 }}
              >
                <Ionicons name="add" size={32} color="white" />
              </TouchableOpacity>
          
              <Text className="text-xs mt-1 text-gray-600">Report</Text>
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="history/index"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="note" color={color} />
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="brain.head.profile.fill" color={color} />
        }}
      />
    </Tabs>
  );
}
