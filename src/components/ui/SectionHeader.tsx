import { Pressable, Text, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-end justify-between gap-3">
      <View className="flex-1">
        <Text accessibilityRole="header" className="text-title text-text-primary">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-label text-text-secondary">{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          hitSlop={12}
          className="min-h-[32px] justify-center active:opacity-60"
        >
          <Text className="text-label font-semibold text-accent">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
