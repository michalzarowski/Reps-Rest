import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { AppCard } from './AppCard';

interface StatCardProps {
  label: string;
  value: string;
  /** Secondary line under the value (trend, date…). */
  hint?: string;
  hintTone?: 'neutral' | 'accent' | 'success' | 'danger';
  onPress?: () => void;
  accessibilityLabel?: string;
  children?: ReactNode;
}

const hintClass = {
  neutral: 'text-text-secondary',
  accent: 'text-accent',
  success: 'text-success',
  danger: 'text-danger',
} as const;

export function StatCard({
  label,
  value,
  hint,
  hintTone = 'neutral',
  onPress,
  accessibilityLabel,
  children,
}: StatCardProps) {
  return (
    <AppCard onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <Text className="text-label text-text-secondary">{label}</Text>
      <Text
        className="mt-1 text-title text-text-primary"
        style={{ fontVariant: ['tabular-nums'] }}
        numberOfLines={2}
      >
        {value}
      </Text>
      {hint ? (
        <Text className={`mt-1 text-label ${hintClass[hintTone]}`}>{hint}</Text>
      ) : null}
      {children ? <View className="mt-3">{children}</View> : null}
    </AppCard>
  );
}
