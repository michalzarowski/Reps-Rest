import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';

import { colors } from '@/theme';

interface LiquidBackgroundProps {
  children: ReactNode;
  /** Slow blob motion — iOS only by default for performance. */
  animated?: boolean;
}

export function LiquidBackground({
  children,
  animated = Platform.OS === 'ios',
}: LiquidBackgroundProps) {
  const drift = useSharedValue(0);

  useEffect(() => {
    if (!animated) {
      return;
    }
    drift.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [animated, drift]);

  const blobStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + drift.value * 0.2,
    transform: [{ translateY: drift.value * 18 }],
  }));

  return (
    <View className="flex-1 bg-deep-water">
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[colors.mintGlow, 'transparent']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 0.7 }}
          style={styles.mintWash}
        />
        <Animated.View style={[styles.aquaBlob, animated ? blobStyle : styles.aquaBlobStatic]}>
          <LinearGradient
            colors={[colors.aquaGlow, 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View className="flex-1">{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  mintWash: {
    position: 'absolute',
    top: -40,
    left: -20,
    right: -20,
    height: 280,
  },
  aquaBlob: {
    position: 'absolute',
    bottom: 120,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 220,
    overflow: 'hidden',
  },
  aquaBlobStatic: {
    opacity: 0.5,
  },
});
