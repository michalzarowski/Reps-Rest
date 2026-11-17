import '../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AppProviders } from '@/context';
import { useStackScreenOptions } from '@/hooks/useNavigationOptions';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProviders>
      <RootStack />
    </AppProviders>
  );
}

/** Root stack: tabs + full-screen detail routes (no tab bar, native back). */
function RootStack() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Rep&Rest' }} />
      <Stack.Screen name="profile" options={{ title: 'Profil i ustawienia' }} />
      <Stack.Screen name="plans/[id]" options={{ title: 'Program' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Nie znaleziono' }} />
    </Stack>
  );
}
