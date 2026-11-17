import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/components';
import { colors } from '@/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.deepWater },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Główna' }} />
      <Tabs.Screen name="tools" options={{ title: 'Narzędzia' }} />
      <Tabs.Screen name="plans" options={{ title: 'Plany' }} />
      <Tabs.Screen name="progress" options={{ title: 'Postępy' }} />
    </Tabs>
  );
}
