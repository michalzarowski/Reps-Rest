import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/context';
import { radii } from '@/theme';

export type GlassIntensity = 'subtle' | 'regular' | 'strong';

interface GlassSurfaceProps {
  children?: ReactNode;
  radius?: number;
  intensity?: GlassIntensity;
  /** Accent-tinted rim + soft accent glow (focus, selection, hero cards). */
  glow?: boolean;
  /** Brightens the reflections — used as press feedback ("flash"). */
  pressed?: boolean;
  /** Outer wrapper: margins, width, flex. */
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Inner content: padding, alignment. */
  contentClassName?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Backdrop blur is reliable on iOS and web; Android uses an opaque fill. */
const BLUR_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'web';

const blurAmount: Record<GlassIntensity, number> = { subtle: 18, regular: 28, strong: 40 };

/**
 * The glass material used by every card-like element.
 *
 * Layers (bottom → top): drop shadow / glow → gradient rim (1 px bevel that
 * imitates a cut edge) → backdrop blur → vertical fill gradient → top sheen
 * (reflection) → diagonal specular streak → content. All decorative layers
 * are static and ignore touches.
 */
export function GlassSurface({
  children,
  radius = radii.lg,
  intensity = 'regular',
  glow = false,
  pressed = false,
  className,
  style,
  contentClassName,
  contentStyle,
}: GlassSurfaceProps) {
  const { glass } = useTheme();
  const solid = !BLUR_SUPPORTED;
  const edgeWidth = intensity === 'strong' ? 1.25 : 1;
  const innerRadius = Math.max(0, radius - edgeWidth);

  const rimColors = glow
    ? ([glass.edgeHighlight, glass.edgeAccent, glass.edgeMid, glass.edgeAccent] as const)
    : ([glass.edgeHighlight, glass.edgeMid, glass.edgeShadow, glass.edgeAccent] as const);

  return (
    <View
      className={className}
      style={[
        {
          borderRadius: radius,
          shadowColor: glow ? glass.glow : glass.shadow,
          shadowOpacity: glow ? 0.45 : glass.shadowOpacity,
          shadowRadius: glow ? 18 : intensity === 'subtle' ? 8 : 16,
          shadowOffset: { width: 0, height: glow ? 0 : intensity === 'subtle' ? 4 : 10 },
          elevation: intensity === 'subtle' ? 2 : 6,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={rimColors}
        locations={[0, 0.38, 0.72, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: radius, padding: edgeWidth }}
      >
        <View style={{ borderRadius: innerRadius, overflow: 'hidden' }}>
          {BLUR_SUPPORTED ? (
            <BlurView
              pointerEvents="none"
              intensity={blurAmount[intensity]}
              tint={glass.blurTint}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <LinearGradient
            pointerEvents="none"
            colors={
              solid
                ? [glass.fillTopSolid, glass.fillBottomSolid]
                : [glass.fillTop, glass.fillBottom]
            }
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Reflection of a light source above the pane. */}
          <LinearGradient
            pointerEvents="none"
            colors={[pressed ? glass.sheenPressed : glass.sheen, 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: intensity === 'subtle' ? 0.45 : 0.6 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Diagonal specular streak. */}
          {intensity !== 'subtle' ? (
            <LinearGradient
              pointerEvents="none"
              colors={['transparent', glass.streak, 'transparent']}
              locations={[0.28, 0.4, 0.52]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View className={contentClassName} style={contentStyle}>
            {children}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
