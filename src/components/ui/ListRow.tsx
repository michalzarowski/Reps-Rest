import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/context';

import { Icon, type IconName } from './Icon';

interface ListRowProps {
  title: string;
  description?: string;
  icon?: IconName;
  /** Rendered before the chevron (badge, value…). */
  trailing?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  accessibilityHint?: string;
}

/** Navigation / settings row inside a card or list. */
export function ListRow({
  title,
  description,
  icon,
  trailing,
  onPress,
  showChevron = Boolean(onPress),
  accessibilityHint,
}: ListRowProps) {
  const { colors } = useTheme();
  const content = (
    <>
      {icon ? (
        <View className="h-10 w-10 items-center justify-center rounded-sm bg-accent/10">
          <Icon name={icon} color={colors.accent} />
        </View>
      ) : null}
      <View className="flex-1">
        <Text className="text-card-title text-text-primary">{title}</Text>
        {description ? (
          <Text className="mt-0.5 text-label text-text-secondary">{description}</Text>
        ) : null}
      </View>
      {trailing}
      {showChevron ? <Icon name="chevronRight" size="sm" color={colors.textMuted} /> : null}
    </>
  );

  const rowClass = 'min-h-[56px] flex-row items-center gap-3 px-4 py-3';

  if (!onPress) {
    return <View className={rowClass}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={description ? `${title}. ${description}` : title}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      className={`${rowClass} active:bg-surface-elevated`}
    >
      {content}
    </Pressable>
  );
}

/** Hairline separator between ListRows inside one card. */
export function ListDivider() {
  return <View className="ml-4 h-px bg-border" />;
}
