import { Fragment } from 'react';
import { Text, View } from 'react-native';

import { AppCard, ListDivider } from '@/components';
import type { IntensityRow } from '@/types';
import { formatKg } from '@/utils';

interface IntensityTableProps {
  rows: IntensityRow[];
}

/**
 * Working weights per %1RM. Each row carries its own proportional bar,
 * so the chart and the table are one responsive element (no fixed widths).
 */
export function IntensityTable({ rows }: IntensityTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <AppCard padding="none" className="overflow-hidden">
      <View className="flex-row px-4 pb-2 pt-3">
        <Text className="w-14 text-label text-text-muted">% 1RM</Text>
        <Text className="flex-1 text-label text-text-muted">Obciążenie</Text>
        <Text className="text-label text-text-muted">Powt.</Text>
      </View>
      {rows.map((row, index) => (
        <Fragment key={row.pct}>
          {index > 0 ? <ListDivider /> : null}
          <View
            className="min-h-[52px] flex-row items-center px-4 py-2.5"
            accessible
            accessibilityLabel={`${row.pct} procent: ${formatKg(row.weightKg)} kilogramów, ${row.repsHint} powtórzeń`}
          >
            <Text className="w-14 text-body font-semibold text-accent">{row.pct}%</Text>
            <View className="flex-1 pr-3">
              <Text
                className="text-card-title text-text-primary"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatKg(row.weightKg)} kg
              </Text>
              <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                <View
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.min(100, Math.max(0, row.pct))}%`, opacity: 0.4 + row.pct / 170 }}
                />
              </View>
            </View>
            <Text className="min-w-[44px] text-right text-label text-text-secondary">
              {row.repsHint}
            </Text>
          </View>
        </Fragment>
      ))}
    </AppCard>
  );
}
