import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, shadows } from '@/theme';
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

function phaseColor(phase: TimerPhase): string {
  switch (phase) {
    case 'work':
      return colors.aqua;
    case 'rest':
      return colors.lilac;
    case 'preparation':
      return colors.liquidMint;
    case 'completed':
      return colors.acidLime;
    default:
      return colors.glassBorder;
  }
}

export function ProgressRing({
  size = 240,
  strokeWidth = 10,
  progress,
  phase,
  label,
  timeLabel,
  subtitle,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clamped);
  const accent = phaseColor(phase);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        phase === 'work' ? shadows.softGlow : null,
      ]}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.glassBorder}
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
      <Text style={{ color: accent, fontSize: 13, fontWeight: '700' }}>
        {label}
      </Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 44,
          fontWeight: '700',
          marginTop: 4,
          fontVariant: ['tabular-nums'],
        }}
      >
        {timeLabel}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            marginTop: 4,
            textAlign: 'center',
            paddingHorizontal: 16,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
