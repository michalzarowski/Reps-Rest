import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { LiquidBackground } from '@/components';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nie znaleziono' }} />
      <LiquidBackground>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-title text-text-primary">
            Ten ekran nie istnieje.
          </Text>
          <Link href="/" className="mt-4">
            <Text className="text-body text-liquid-mint underline">
              Wróć do ekranu głównego
            </Text>
          </Link>
        </View>
      </LiquidBackground>
    </>
  );
}
