import { Text, View } from 'react-native';

import {
  GlassPanel,
  ImmersiveImageCard,
  MetricChip,
  Screen,
  SectionHeader,
} from '@/components';
import {
  demoBodyWeight,
  demoProgressSummary,
  demoRecords,
} from '@/mocks/demo';
import { colors, radii } from '@/theme';

const progressImage = require('../../../assets/images/immersive/progress-training.png');

const maxWeight = Math.max(...demoBodyWeight.map((e) => e.weightKg));
const minWeight = Math.min(...demoBodyWeight.map((e) => e.weightKg));
const range = Math.max(maxWeight - minWeight, 0.1);

export function ProgressScreen() {
  const { currentWeightKg, heightCm, bmiLabel, bmiRange, goal } =
    demoProgressSummary;

  return (
    <Screen title="Postępy" subtitle="Dane demonstracyjne — jeszcze bez zapisu.">
      <ImmersiveImageCard source={progressImage} height={170}>
        <Text className="text-caption font-semibold text-aqua">Masa ciała</Text>
        <Text className="mt-1 text-hero text-text-primary">
          {currentWeightKg.toFixed(1)} kg
        </Text>
        <Text className="mt-1 text-caption text-text-secondary">
          Cel: {goal} · wzrost {heightCm} cm
        </Text>
      </ImmersiveImageCard>

      <View className="-mt-3 mb-5 flex-row flex-wrap gap-2">
        <MetricChip label={`BMI ${bmiLabel}`} tone="mint" />
        <MetricChip label={bmiRange} tone="aqua" />
        <MetricChip label={goal} tone="lilac" />
      </View>

      <SectionHeader title="Trend masy ciała" subtitle="Ostatnie 7 wpisów demonstracyjnych." />
      <GlassPanel variant="soft">
        <View className="h-32 flex-row items-end justify-between gap-2">
          {demoBodyWeight.map((entry) => {
            const normalized = (entry.weightKg - minWeight) / range;
            const barHeight = 28 + normalized * 84;
            return (
              <View key={entry.date} className="flex-1 items-center">
                <View
                  style={{
                    height: barHeight,
                    width: '72%',
                    borderRadius: radii.sm,
                    backgroundColor: colors.aqua,
                    opacity: 0.35 + normalized * 0.65,
                  }}
                />
                <Text className="mt-2 text-[10px] text-text-secondary">
                  {entry.date.slice(0, 5)}
                </Text>
              </View>
            );
          })}
        </View>
        <Text className="mt-4 text-caption text-text-secondary">
          BMI to wskaźnik orientacyjny — nie mierzy tkanki tłuszczowej.
        </Text>
      </GlassPanel>

      <View className="mt-6">
        <SectionHeader title="Ostatnie PR" />
        <View className="gap-3">
          {demoRecords.map((record) => (
            <GlassPanel key={`${record.exercise}-${record.date}`} variant="solid">
              <Text className="text-body font-semibold text-text-primary">
                {record.exercise}
              </Text>
              <Text className="mt-1 text-caption text-text-secondary">
                {record.weightKg} kg × {record.reps} · {record.date}
              </Text>
            </GlassPanel>
          ))}
        </View>
      </View>
    </Screen>
  );
}
