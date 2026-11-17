import { Tabs } from 'expo-router';

import { Icon, type IconName } from '@/components';
import { useTabScreenOptions } from '@/hooks/useNavigationOptions';

function tabIcon(name: IconName) {
  return function TabIcon({ color }: { color: string }) {
    return <Icon name={name} color={color} size={22} />;
  };
}

/** Standard in-flow tab bar — the navigator reserves its height for every scene. */
export default function TabLayout() {
  const screenOptions = useTabScreenOptions();
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Główna', tabBarIcon: tabIcon('home') }}
      />
      <Tabs.Screen
        name="tools"
        options={{ title: 'Narzędzia', tabBarIcon: tabIcon('wrench') }}
      />
      <Tabs.Screen
        name="plans"
        options={{ title: 'Plany', tabBarIcon: tabIcon('clipboardList') }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Postępy', tabBarIcon: tabIcon('trendingUp') }}
      />
    </Tabs>
  );
}
