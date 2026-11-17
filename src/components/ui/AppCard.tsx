import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { radii } from '@/theme';

import { GlassSurface, type GlassIntensity } from './GlassSurface';

type CardVariant = 'default' | 'elevated' | 'outline';
type CardPadding = 'none' | 'sm' | 'md';

interface AppCardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  /** Accent rim and glow — reserve for one hero element per screen. */
  glow?: boolean;
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Outer spacing (margins). */
  className?: string;
  /** Inner layout (alignment) — padding comes from `padding`. */
  contentClassName?: string;
}

const intensityFor: Record<CardVariant, GlassIntensity> = {
  default: 'regular',
  elevated: 'strong',
  outline: 'subtle',
};

const paddingClass: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
};

/** The one card surface in the app (glass material). Pressable when `onPress` is given. */
export function AppCard({
  children,
  variant = 'default',
  padding = 'md',
  glow = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  className,
  contentClassName,
}: AppCardProps) {
  const inner = `${paddingClass[padding]} ${contentClassName ?? ''}`;

  if (!onPress) {
    return (
      <GlassSurface
        radius={radii.lg}
        intensity={intensityFor[variant]}
        glow={glow}
        className={className}
        contentClassName={inner}
      >
        {children}
      </GlassSurface>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      className={className}
    >
      {({ pressed }) => (
        <GlassSurface
          radius={radii.lg}
          intensity={intensityFor[variant]}
          glow={glow}
          pressed={pressed}
          contentClassName={inner}
        >
          {children}
        </GlassSurface>
      )}
    </Pressable>
  );
}
