import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { useTheme } from '@/context';
import { radii } from '@/theme';

import { GlassSurface } from './GlassSurface';
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

const labelClass: Record<ButtonVariant, string> = {
  primary: 'text-on-accent',
  secondary: 'text-text-primary',
  ghost: 'text-accent',
  danger: 'text-danger',
};

/**
 * Shared button. `primary` = glowing accent gradient (one main action per
 * screen), `secondary` = glass pane, `ghost` = text link, `danger` = destructive.
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
  const { colors, glass } = useTheme();
  const isDisabled = disabled || loading;
  const minHeight = size === 'md' ? 48 : 44;
  const iconColor =
    variant === 'primary'
      ? colors.onAccent
      : variant === 'danger'
        ? colors.danger
        : variant === 'ghost'
          ? colors.accent
          : colors.textPrimary;

  const content = (
    <View
      className="flex-row items-center justify-center gap-2 px-4"
      style={{ minHeight }}
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
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`${fullWidth ? 'self-stretch' : 'self-start'} ${isDisabled ? 'opacity-40' : ''}`}
      {...rest}
    >
      {({ pressed }) => {
        if (variant === 'primary') {
          return (
            <View
              style={{
                borderRadius: radii.md,
                shadowColor: glass.glow,
                shadowOpacity: isDisabled ? 0 : pressed ? 0.75 : 0.45,
                shadowRadius: pressed ? 22 : 14,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={[colors.accentHighlight, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: radii.md, overflow: 'hidden' }}
              >
                {/* Glossy top half + bright rim = "lit" glass button. */}
                <LinearGradient
                  pointerEvents="none"
                  colors={[pressed ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.38)', 'rgba(255,255,255,0)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.55 }}
                  style={StyleSheet.absoluteFill}
                />
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: radii.md,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.35)',
                    },
                  ]}
                />
                {content}
              </LinearGradient>
            </View>
          );
        }
        if (variant === 'secondary') {
          return (
            <GlassSurface radius={radii.md} intensity="subtle" pressed={pressed}>
              {content}
            </GlassSurface>
          );
        }
        return (
          <View
            className={variant === 'danger' ? 'border border-danger/40' : ''}
            style={{ borderRadius: radii.md, opacity: pressed ? 0.6 : 1 }}
          >
            {content}
          </View>
        );
      }}
    </Pressable>
  );
}
