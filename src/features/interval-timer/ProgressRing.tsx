import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { contentGlow } from '@/components';
import { useTheme } from '@/context';
import type { ColorPalette } from '@/theme';
import type { TimerPhase } from '@/types/timer';

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  phase: TimerPhase;
  label: string;
  timeLabel: string;
  subtitle?: string;
}

export function phaseColor(phase: TimerPhase, colors: ColorPalette): string {
  switch (phase) {
    case 'work':
      return colors.accent;
    case 'rest':
      return colors.lilac;
    case 'preparation':
      return colors.mint;
    case 'completed':
      return colors.success;
    default:
      return colors.border;
  }
}

/** Phase ring: phase name → large countdown → round, all inside the ring. */
export function ProgressRing({
  size = 260,
  strokeWidth = 10,
  progress,
  phase,
  label,
  timeLabel,
  subtitle,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clamped);
  const accent = phaseColor(phase, colors);
  const timeFontSize = Math.round(size * 0.23);

  return (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`${label}. Pozostało ${timeLabel}. ${subtitle ?? ''}`}
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        ...(phase === 'idle' ? null : contentGlow(accent, 18, 0.55)),
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceElevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text
        style={{ color: accent, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 }}
        allowFontScaling={false}
      >
        {label.toUpperCase()}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          color: colors.textPrimary,
          fontSize: timeFontSize,
          lineHeight: timeFontSize * 1.15,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
        }}
      >
        {timeLabel}
      </Text>
      {subtitle ? (
        <Text
          style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '500' }}
          allowFontScaling={false}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
