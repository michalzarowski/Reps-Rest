import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/useNavigationOptions';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RecordsLayout() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: 'Dziennik PR' }} />
      <Stack.Screen name="[exerciseKey]" options={{ title: 'Historia ćwiczenia' }} />
      <Stack.Screen name="form" options={{ title: 'Wynik' }} />
    </Stack>
  );
}
