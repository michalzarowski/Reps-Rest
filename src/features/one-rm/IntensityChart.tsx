import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { GlassPanel } from '@/components';
import { colors } from '@/theme';
import type { IntensityRow } from '@/types';

interface IntensityChartProps {
  rows: IntensityRow[];
}

/**
 * Lightweight bar chart of working weight vs %1RM (no extra chart library).
 */
export function IntensityChart({ rows }: IntensityChartProps) {
  if (rows.length === 0) {
    return null;
  }

  const maxWeight = Math.max(...rows.map((row) => row.weightKg), 1);
  const chartHeight = 112;
  const gap = 8;
  const chartWidth = 300;
  const slotWidth = chartWidth / rows.length;
  const barWidth = Math.max(slotWidth - gap, 12);

  return (
    <GlassPanel variant="soft" className="mb-4">
      <Text className="mb-3 text-caption text-text-secondary">
        Obciążenie względem % 1RM
      </Text>
      <View style={{ alignItems: 'center' }}>
        <Svg width={chartWidth} height={chartHeight}>
          {rows.map((row, index) => {
            const height = (row.weightKg / maxWeight) * (chartHeight - 4);
            const x = index * slotWidth + (slotWidth - barWidth) / 2;
            const y = chartHeight - height;
            return (
              <Rect
                key={row.pct}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(height, 2)}
                rx={6}
                fill={colors.aqua}
                opacity={0.35 + (row.pct / 100) * 0.55}
              />
            );
          })}
        </Svg>
        <View
          style={{
            width: chartWidth,
            flexDirection: 'row',
            marginTop: 8,
          }}
        >
          {rows.map((row) => (
            <View
              key={`label-${row.pct}`}
              style={{ width: slotWidth, alignItems: 'center' }}
            >
              <Text className="text-caption text-aqua">{row.pct}%</Text>
              <Text className="text-caption text-text-secondary">
                {row.weightKg}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </GlassPanel>
  );
}
