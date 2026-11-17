import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  right?: ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  right,
}: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-end justify-between gap-3">
      <View className="flex-1">
        <Text className="text-title text-text-primary">{title}</Text>
        {subtitle ? (
          <Text className="mt-1 text-caption text-text-secondary">{subtitle}</Text>
        ) : null}
      </View>
      {right}
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text style={{ color: colors.aqua, fontWeight: '600', fontSize: 14 }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
