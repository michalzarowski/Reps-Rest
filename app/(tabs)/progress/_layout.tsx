import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/useNavigationOptions';

/** Keeps the progress overview under deep links (e.g. dashboard → form) so back works. */
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProgressLayout() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: 'Postępy', headerShown: false }} />
      <Stack.Screen name="weight-form" options={{ title: 'Pomiar masy ciała' }} />
      <Stack.Screen name="history" options={{ title: 'Historia pomiarów' }} />
      <Stack.Screen name="body-profile" options={{ title: 'Wzrost i cel' }} />
    </Stack>
  );
}
