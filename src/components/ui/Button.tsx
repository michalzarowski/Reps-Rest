import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';

import { useTheme } from '@/context';

import { Icon, type IconName } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  /** Stretch to the parent width (default true). */
  fullWidth?: boolean;
}

const containerClass: Record<ButtonVariant, string> = {
  primary: 'bg-accent',
  secondary: 'bg-surface-elevated border border-border',
  ghost: 'bg-transparent',
  danger: 'bg-transparent border border-danger/40',
};

const labelClass: Record<ButtonVariant, string> = {
  primary: 'text-on-accent',
  secondary: 'text-text-primary',
  ghost: 'text-accent',
  danger: 'text-danger',
};

/**
 * Shared button. `primary` is the single main action of a screen,
 * `secondary` for alternatives, `ghost` for low-emphasis links,
 * `danger` for destructive actions.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = true,
  disabled,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const iconColor =
    variant === 'primary'
      ? colors.onAccent
      : variant === 'danger'
        ? colors.danger
        : variant === 'ghost'
          ? colors.accent
          : colors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 rounded-md px-4 active:opacity-75 ${
        size === 'md' ? 'min-h-[48px]' : 'min-h-[44px]'
      } ${containerClass[variant]} ${fullWidth ? 'self-stretch' : 'self-start'} ${
        isDisabled ? 'opacity-40' : ''
      }`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : icon ? (
        <Icon name={icon} size="sm" color={iconColor} />
      ) : null}
      <View className="shrink">
        <Text
          numberOfLines={1}
          className={`font-semibold ${size === 'md' ? 'text-body' : 'text-label'} ${labelClass[variant]}`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
