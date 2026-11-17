import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { contentGlow, Icon, type IconName } from '@/components';
import { useTheme } from '@/context';
import { useTabScreenOptions } from '@/hooks/useNavigationOptions';

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  const { glass } = useTheme();
  return (
    <View
      style={focused ? contentGlow(glass.glow, 10, 0.9) : undefined}
    >
      <Icon name={name} color={color} size={22} />
    </View>
  );
}

function tabIcon(name: IconName) {
  return function TabBarIcon({ color, focused }: { color: string; focused: boolean }) {
    return <TabIcon name={name} color={color} focused={focused} />;
  };
}

/** Standard in-flow tab bar — the navigator reserves its height for every scene. */
export default function TabLayout() {
  const screenOptions = useTabScreenOptions();
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="index" options={{ title: 'Główna', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="tools" options={{ title: 'Narzędzia', tabBarIcon: tabIcon('wrench') }} />
      <Tabs.Screen name="plans" options={{ title: 'Plany', tabBarIcon: tabIcon('clipboardList') }} />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Postępy', tabBarIcon: tabIcon('trendingUp') }}
      />
    </Tabs>
  );
}
