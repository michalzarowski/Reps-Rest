import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radii } from '@/theme';

type GlassVariant = 'soft' | 'elevated' | 'solid';

interface GlassPanelProps extends ViewProps {
  children: ReactNode;
  variant?: GlassVariant;
  onPress?: () => void;
  className?: string;
}

const variantRadius: Record<GlassVariant, number> = {
  soft: radii.md,
  elevated: radii.lg,
  solid: radii.md,
};

const variantPadding: Record<GlassVariant, number> = {
  soft: 16,
  elevated: 20,
  solid: 16,
};

export function GlassPanel({
  children,
  variant = 'soft',
  onPress,
  style,
  className,
  ...rest
}: GlassPanelProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const radius = variantRadius[variant];
  const padding = variantPadding[variant];
  const borderColor =
    variant === 'elevated' ? colors.glassHighlight : colors.glassBorder;

  const content = (
    <View
      className={className}
      style={[
        styles.base,
        {
          borderRadius: radius,
          padding,
          borderColor,
          backgroundColor:
            variant === 'solid' ? colors.seaDepth : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {variant !== 'solid' && Platform.OS === 'ios' ? (
        <BlurView
          intensity={42}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      ) : null}
      {variant !== 'solid' ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              backgroundColor:
                Platform.OS === 'ios'
                  ? colors.glassFill
                  : colors.androidGlassFill,
            },
          ]}
        />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(motion.pressScale, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
    >
      <Animated.View style={animatedStyle}>{content}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  content: {
    zIndex: 1,
  },
});
