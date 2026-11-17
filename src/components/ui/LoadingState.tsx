import { ActivityIndicator, Text, View } from 'react-native';

import { useTheme } from '@/context';

export function LoadingState({ label = 'Wczytywanie…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      className="items-center justify-center py-10"
    >
      <ActivityIndicator color={colors.accent} />
      <Text className="mt-3 text-label text-text-secondary">{label}</Text>
    </View>
  );
}
