import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useTheme } from '@/context';
import type { BodyWeightEntry } from '@/types';
import {
  buildWeightChartPoints,
  buildWeightChartScale,
  formatBodyWeight,
  formatNumberPl,
} from '@/utils/bodyWeight';
import { formatDisplayDate } from '@/utils/records';

const CHART_HEIGHT = 168;
const Y_LABEL_WIDTH = 34;
const SIDE_SPACING = 10;
/** Dates shown under the chart (first, middle, last). */
const X_LABELS = 3;
/** Above this many points the line alone reads better than dots. */
const MAX_POINTS_WITH_DOTS = 14;

interface WeightChartProps {
  entries: readonly BodyWeightEntry[];
  maxPoints?: number;
}

/**
 * Line chart of body weight (oldest → newest). Static — no entry animation,
 * matching the "no continuous animations" rule. Colors come from the theme.
 */
export function WeightChart({ entries, maxPoints = 30 }: WeightChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const points = useMemo(() => buildWeightChartPoints(entries, maxPoints), [entries, maxPoints]);
  const scale = useMemo(() => buildWeightChartScale(points.map((p) => p.value)), [points]);

  const data = useMemo(() => points.map((point) => ({ value: point.value })), [points]);

  // Own date row (first / middle / last): built-in x labels are clipped to
  // the point spacing, which is only a few pixels with many measurements.
  const axisLabels = useMemo(() => {
    if (points.length < 2) return [];
    const count = Math.min(points.length, X_LABELS);
    return Array.from({ length: count }, (_, i) =>
      points[Math.round((i * (points.length - 1)) / (count - 1))].label,
    );
  }, [points]);

  if (points.length < 2 || !scale) {
    return null;
  }

  const first = points[0];
  const last = points[points.length - 1];
  const plotWidth = Math.max(0, width - Y_LABEL_WIDTH - SIDE_SPACING * 2);
  const spacing = points.length > 1 ? plotWidth / (points.length - 1) : plotWidth;
  const summary = `Wykres masy ciała od ${formatDisplayDate(first.date)} (${formatBodyWeight(first.value)}) do ${formatDisplayDate(last.date)} (${formatBodyWeight(last.value)}), ${points.length} pomiarów.`;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ minHeight: CHART_HEIGHT + 48 }}
    >
      {width > 0 ? (
        <LineChart
          data={data}
          width={plotWidth + SIDE_SPACING * 2}
          height={CHART_HEIGHT}
          spacing={spacing}
          initialSpacing={SIDE_SPACING}
          endSpacing={SIDE_SPACING}
          disableScroll
          yAxisOffset={scale.min}
          maxValue={scale.max - scale.min}
          stepValue={scale.step}
          noOfSections={scale.sections}
          formatYLabel={(label) => formatNumberPl(Number(label), 1)}
          yAxisLabelWidth={Y_LABEL_WIDTH}
          yAxisColor="transparent"
          xAxisColor={colors.border}
          rulesColor={colors.border}
          rulesType="dashed"
          yAxisTextStyle={{ color: colors.textMuted, fontSize: 11 }}
          xAxisLabelsHeight={0}
          color={colors.accent}
          thickness={2}
          hideDataPoints={points.length > MAX_POINTS_WITH_DOTS}
          dataPointsColor={colors.accent}
          dataPointsRadius={3.5}
          areaChart
          startFillColor={colors.accent}
          endFillColor={colors.accent}
          startOpacity={0.22}
          endOpacity={0}
          isAnimated={false}
        />
      ) : null}
      <View
        className="flex-row justify-between"
        style={{ marginLeft: Y_LABEL_WIDTH, marginTop: 4 }}
      >
        {axisLabels.map((label, index) => (
          <Text key={`${label}-${index}`} className="text-label text-text-muted">
            {label}
          </Text>
        ))}
      </View>
      <Text className="mt-2 text-label text-text-muted">
        {points.length < entries.length
          ? `Ostatnie ${points.length} pomiarów`
          : `${points.length} pomiarów`}
      </Text>
    </View>
  );
}
