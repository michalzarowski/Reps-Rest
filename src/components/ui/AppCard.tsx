import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

type CardVariant = 'default' | 'elevated' | 'outline';
type CardPadding = 'none' | 'sm' | 'md';

interface AppCardProps extends Omit<ViewProps, 'children'> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
}

const variantClass: Record<CardVariant, string> = {
  default: 'bg-surface border border-border',
  elevated: 'bg-surface-elevated border border-border',
  outline: 'border border-border',
};

const paddingClass: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
};

/** The one card surface in the app. Pressable when `onPress` is given. */
export function AppCard({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  accessibilityLabel,
  accessibilityHint,
  className,
  ...rest
}: AppCardProps) {
  const base = `rounded-lg ${variantClass[variant]} ${paddingClass[padding]} ${className ?? ''}`;

  if (!onPress) {
    return (
      <View className={base} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      className={`${base} active:opacity-80`}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
