import { Stack } from 'expo-router';

import { useStackScreenOptions } from '@/hooks/useNavigationOptions';

/** Keeps the tools hub under deep links (e.g. dashboard → /tools/timer) so back works. */
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ToolsLayout() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: 'Narzędzia', headerShown: false }} />
      <Stack.Screen name="one-rm" options={{ title: 'Kalkulator 1RM' }} />
      <Stack.Screen name="timer" options={{ title: 'Timer interwałowy' }} />
      <Stack.Screen name="plates" options={{ title: 'Konwerter talerzy' }} />
      <Stack.Screen name="records" options={{ headerShown: false, title: 'Rekordy' }} />
    </Stack>
  );
}
