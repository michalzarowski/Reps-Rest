import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { useTheme } from '@/context';

import { GlassSurface } from './GlassSurface';
import { Icon, type IconName } from './Icon';

type IconButtonVariant = 'surface' | 'accent' | 'plain' | 'danger';

interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconName;
  /** Required: icon-only controls must be announced by screen readers. */
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  size?: 44 | 48 | 64 | 72;
}

export function IconButton({
  icon,
  accessibilityLabel,
  variant = 'surface',
  size = 44,
  disabled,
  ...rest
}: IconButtonProps) {
  const { colors, glass } = useTheme();
  const color =
    variant === 'accent'
      ? colors.onAccent
      : variant === 'danger'
        ? colors.danger
        : variant === 'plain'
          ? colors.textSecondary
          : colors.accent;
  const iconNode = <Icon name={icon} size={size >= 64 ? 'lg' : 'md'} color={color} />;
  const radius = size / 2;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={size < 48 ? 4 : 0}
      className={disabled ? 'opacity-40' : ''}
      {...rest}
    >
      {({ pressed }) => {
        if (variant === 'accent') {
          return (
            <View
              style={{
                width: size,
                height: size,
                borderRadius: radius,
                shadowColor: glass.glow,
                shadowOpacity: pressed ? 0.8 : 0.55,
                shadowRadius: pressed ? 26 : 18,
                shadowOffset: { width: 0, height: 0 },
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={[colors.accentHighlight, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: size,
                  height: size,
                  borderRadius: radius,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.6 }}
                  style={StyleSheet.absoluteFill}
                />
                {iconNode}
              </LinearGradient>
            </View>
          );
        }
        if (variant === 'surface') {
          return (
            <GlassSurface
              radius={radius}
              intensity="subtle"
              pressed={pressed}
              contentStyle={{ width: size - 2, height: size - 2, alignItems: 'center', justifyContent: 'center' }}
            >
              {iconNode}
            </GlassSurface>
          );
        }
        return (
          <View
            className={variant === 'danger' ? 'border border-danger/40' : ''}
            style={{
              width: size,
              height: size,
              borderRadius: radius,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            }}
          >
            {iconNode}
          </View>
        );
      }}
    </Pressable>
  );
}
