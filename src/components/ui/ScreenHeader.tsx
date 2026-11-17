import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Small line above the title (e.g. a greeting). */
  eyebrow?: string;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, eyebrow, right }: ScreenHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center gap-3">
      <View className="flex-1">
        {eyebrow ? (
          <Text className="text-label text-text-secondary">{eyebrow}</Text>
        ) : null}
        <Text
          accessibilityRole="header"
          className="text-display text-text-primary"
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-body text-text-secondary">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
