import { router } from 'expo-router';
import { Text, View } from 'react-native';

import {
  AppCard,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  SectionHeader,
} from '@/components';
import { useTheme } from '@/context';
import type { RecordsOverview } from '@/utils';
import { formatDisplayDate, formatWeightReps } from '@/utils/records';

interface ProgressSummaryProps {
  overview: RecordsOverview;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Dashboard "Twoje postępy": only data that really exists on the device.
 * Body-weight logging is not implemented yet, so it is labelled as such.
 */
export function ProgressSummary({ overview, isLoading, error, onRetry }: ProgressSummaryProps) {
  const { colors } = useTheme();
  const latest = overview.recentPrs[0];

  return (
    <View>
      <SectionHeader
        title="Twoje postępy"
        actionLabel="Szczegóły"
        onActionPress={() => router.push('/progress')}
      />

      <View className="gap-3">
        {error ? (
          <ErrorState message={error} actionLabel="Spróbuj ponownie" onActionPress={onRetry} />
        ) : null}

        {isLoading ? (
          <AppCard>
            <LoadingState label="Wczytywanie dziennika…" />
          </AppCard>
        ) : latest ? (
          <AppCard
            onPress={() =>
              router.push({
                pathname: '/tools/records/[exerciseKey]',
                params: { exerciseKey: latest.exerciseKey },
              })
            }
            accessibilityLabel={`Ostatni rekord: ${latest.exerciseName}, ${formatWeightReps(
              latest.weightKg,
              latest.reps,
            )}`}
            accessibilityHint="Otwiera historię ćwiczenia"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-accent/15">
                <Icon name="trophy" color={colors.accent} />
              </View>
              <View className="flex-1">
                <Text className="text-label text-text-secondary">Ostatni rekord</Text>
                <Text className="text-card-title text-text-primary" numberOfLines={2}>
                  {latest.exerciseName}
                </Text>
                <Text className="mt-0.5 text-label text-text-secondary">
                  {formatWeightReps(latest.weightKg, latest.reps)} ·{' '}
                  {formatDisplayDate(latest.date)}
                </Text>
              </View>
              <Icon name="chevronRight" size="sm" color={colors.textMuted} />
            </View>
            <View className="mt-3 flex-row gap-4 border-t border-border pt-3">
              <Text className="text-label text-text-secondary">
                Ćwiczenia: <Text className="font-semibold text-text-primary">{overview.exerciseCount}</Text>
              </Text>
              <Text className="text-label text-text-secondary">
                Wpisy: <Text className="font-semibold text-text-primary">{overview.entryCount}</Text>
              </Text>
            </View>
          </AppCard>
        ) : (
          <EmptyState
            icon="trophy"
            title="Brak zapisanych rekordów"
            description="Zapisz wynik w dzienniku PR, a tutaj pojawi się Twój ostatni rekord."
            actionLabel="Dodaj pierwszy wynik"
            onActionPress={() => router.push('/tools/records/form')}
          />
        )}

        <AppCard variant="outline">
          <View className="flex-row items-center gap-3">
            <Icon name="scale" color={colors.textMuted} />
            <View className="flex-1">
              <Text className="text-body font-medium text-text-primary">Masa ciała</Text>
              <Text className="text-label text-text-secondary">
                Zapisywanie pomiarów pojawi się w kolejnej wersji.
              </Text>
            </View>
          </View>
        </AppCard>
      </View>
    </View>
  );
}
