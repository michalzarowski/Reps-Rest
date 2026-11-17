import { Text, View } from 'react-native';

import { colors, radii } from '@/theme';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <View
      style={{
        borderRadius: radii.sm,
        backgroundColor: `${colors.danger}22`,
        borderWidth: 1,
        borderColor: `${colors.danger}66`,
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Text style={{ color: colors.danger, fontSize: 14, fontWeight: '600' }}>
        {message}
      </Text>
    </View>
  );
}
