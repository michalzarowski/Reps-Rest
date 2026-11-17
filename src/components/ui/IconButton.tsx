import { Pressable, type PressableProps } from 'react-native';

import { useTheme } from '@/context';

import { Icon, type IconName } from './Icon';

type IconButtonVariant = 'surface' | 'accent' | 'plain' | 'danger';

interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconName;
  /** Required: icon-only controls must be announced by screen readers. */
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  size?: 44 | 48 | 64 | 72;
}

const variantClass: Record<IconButtonVariant, string> = {
  surface: 'bg-surface-elevated border border-border',
  accent: 'bg-accent',
  plain: 'bg-transparent',
  danger: 'border border-danger/40',
};

export function IconButton({
  icon,
  accessibilityLabel,
  variant = 'surface',
  size = 44,
  disabled,
  ...rest
}: IconButtonProps) {
  const { colors } = useTheme();
  const color =
    variant === 'accent'
      ? colors.onAccent
      : variant === 'danger'
        ? colors.danger
        : variant === 'plain'
          ? colors.textSecondary
          : colors.accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={size < 48 ? 4 : 0}
      className={`items-center justify-center rounded-full active:opacity-70 ${variantClass[variant]} ${
        disabled ? 'opacity-40' : ''
      }`}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon name={icon} size={size >= 64 ? 'lg' : 'md'} color={color} />
    </Pressable>
  );
}
