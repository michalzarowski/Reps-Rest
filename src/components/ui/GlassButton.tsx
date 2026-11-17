import { Pressable, Text, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radii, shadows } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'md' | 'sm';

interface GlassButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<
  ButtonVariant,
  { backgroundColor: string; color: string; borderColor: string; glow?: boolean }
> = {
  primary: {
    backgroundColor: colors.aqua,
    color: colors.deepWater,
    borderColor: colors.aqua,
    glow: true,
  },
  secondary: {
    backgroundColor: colors.glassFill,
    color: colors.aqua,
    borderColor: colors.glassBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    borderColor: 'transparent',
  },
};

export function GlassButton({
  label,
  variant = 'primary',
  size = 'md',
  disabled,
  onPress,
  ...rest
}: GlassButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.45 : 1,
  }));
  const palette = variantStyles[variant];
  const minHeight = size === 'sm' ? 40 : 48;
  const padH = size === 'sm' ? 16 : 20;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        if (!disabled) {
          scale.value = withTiming(motion.pressScale, { duration: 90 });
        }
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      {...rest}
    >
      <Animated.View
        style={[
          animatedStyle,
          palette.glow && !disabled ? shadows.softGlow : null,
          {
            minHeight,
            borderRadius: radii.pill,
            borderWidth: variant === 'ghost' ? 0 : 1,
            borderColor: palette.borderColor,
            backgroundColor: palette.backgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: padH,
          },
        ]}
      >
        <Text
          className="text-body font-semibold"
          style={{ color: palette.color, fontSize: size === 'sm' ? 14 : 16 }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
