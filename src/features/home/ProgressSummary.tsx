import { router } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  AppCard,
  Button,
  ErrorState,
  Icon,
  ListDivider,
  LoadingState,
  SectionHeader,
} from '@/components';
import { useTheme } from '@/context';
import type { RecordsOverview } from '@/utils';
import { formatWeightReps } from '@/utils/records';

interface ProgressSummaryProps {
  overview: RecordsOverview;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Dashboard "Twoje postępy": body weight card + recent PRs card.
 * Only data that really exists on the device is shown; body-weight logging
 * is not implemented yet, so that card says so instead of showing a chart.
 */
export function ProgressSummary({ overview, isLoading, error, onRetry }: ProgressSummaryProps) {
  const { colors } = useTheme();
  const recent = overview.recentPrs;

  return (
    <View>
      <SectionHeader title="Twoje postępy" />

      <View className="gap-3">
        {error ? (
          <ErrorState message={error} actionLabel="Spróbuj ponownie" onActionPress={onRetry} />
        ) : null}

        <AppCard>
          <View className="flex-row items-start gap-3">
            <View className="flex-1">
              <Text className="text-body text-text-secondary">Masa ciała</Text>
              <Text className="mt-0.5 text-title text-text-muted">— kg</Text>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-elevated">
              <Icon name="scale" size="sm" color={colors.textMuted} />
            </View>
          </View>
          <Text className="mt-2 text-label text-text-secondary">
            Zapisywanie pomiarów i wykres trendu pojawią się w kolejnej wersji.
          </Text>
        </AppCard>

        <AppCard padding="none" className="overflow-hidden">
          <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
            <Text className="text-card-title text-text-primary">Ostatnie rekordy</Text>
            {recent.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/tools/records')}
                hitSlop={12}
                className="min-h-[32px] flex-row items-center gap-1 active:opacity-60"
              >
                <Text className="text-label font-semibold text-accent">Zobacz wszystkie</Text>
                <Icon name="chevronRight" size={16} color={colors.accent} />
              </Pressable>
            ) : null}
          </View>

          {isLoading ? (
            <LoadingState label="Wczytywanie dziennika…" />
          ) : recent.length === 0 ? (
            <View className="gap-3 px-4 pb-4">
              <Text className="text-body text-text-secondary">
                Zapisz wynik w dzienniku PR, a tutaj pojawią się Twoje rekordy.
              </Text>
              <Button
                label="Dodaj pierwszy wynik"
                variant="secondary"
                size="sm"
                icon="plus"
                fullWidth={false}
                onPress={() => router.push('/tools/records/form')}
              />
            </View>
          ) : (
            <View className="pb-1">
              {recent.map((entry, index) => {
                const summary = formatWeightReps(entry.weightKg, entry.reps);
                return (
                  <Fragment key={entry.id}>
                    {index > 0 ? <ListDivider /> : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${entry.exerciseName}, ${summary}`}
                      accessibilityHint="Otwiera historię ćwiczenia"
                      onPress={() =>
                        router.push({
                          pathname: '/tools/records/[exerciseKey]',
                          params: { exerciseKey: entry.exerciseKey },
                        })
                      }
                      className="min-h-[60px] flex-row items-center gap-3 px-4 py-2.5 active:bg-surface-elevated"
                    >
                      <View className="h-10 w-10 items-center justify-center rounded-sm bg-surface-elevated">
                        <Icon name="dumbbell" size="sm" color={colors.textSecondary} />
                      </View>
                      <Text
                        className="flex-1 text-body font-semibold text-text-primary"
                        numberOfLines={2}
                      >
                        {entry.exerciseName}
                      </Text>
                      <Text
                        className="text-body font-semibold text-text-primary"
                        style={{ fontVariant: ['tabular-nums'] }}
                      >
                        {summary}
                      </Text>
                    </Pressable>
                  </Fragment>
                );
              })}
            </View>
          )}
        </AppCard>
      </View>
    </View>
  );
}
