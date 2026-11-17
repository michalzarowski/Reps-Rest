import { Text, View } from 'react-native';

import { colors, radii } from '@/theme';

type ChipTone = 'aqua' | 'lilac' | 'mint';

interface MetricChipProps {
  label: string;
  tone?: ChipTone;
}

const toneColor: Record<ChipTone, string> = {
  aqua: colors.aqua,
  lilac: colors.lilac,
  mint: colors.liquidMint,
};

export function MetricChip({ label, tone = 'aqua' }: MetricChipProps) {
  const accent = toneColor[tone];

  return (
    <View
      style={{
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: accent,
        backgroundColor: `${accent}22`,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: accent, fontSize: 13, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}
