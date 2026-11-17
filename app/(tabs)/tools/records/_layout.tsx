import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function RecordsLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Rekordy' }} />
      <Stack.Screen name="[exerciseKey]" options={{ title: 'Historia' }} />
      <Stack.Screen name="form" options={{ title: 'Wynik' }} />
    </Stack>
  );
}
