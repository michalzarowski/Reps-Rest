import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.aqua,
        headerStyle: { backgroundColor: colors.deepWater },
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.deepWater },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Narzędzia', headerShown: false }} />
      <Stack.Screen name="one-rm" options={{ title: '1RM' }} />
      <Stack.Screen name="timer" options={{ title: 'Stoper' }} />
      <Stack.Screen name="plates" options={{ title: 'Talerze' }} />
      <Stack.Screen name="records" options={{ headerShown: false }} />
    </Stack>
  );
}
