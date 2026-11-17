import { router } from 'expo-router';
import { Fragment, useMemo } from 'react';
import { Text, View } from 'react-native';

import {
  AppCard,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  ListDivider,
  ListRow,
  LoadingState,
  ScreenContainer,
  SectionHeader,
  StatCard,
} from '@/components';
import { useRecords } from '@/context';
import { buildRecordsOverview } from '@/utils';
import { formatDisplayDate, formatWeightReps } from '@/utils/records';

import { BodyWeightSection } from './BodyWeightSection';

export function ProgressScreen() {
  const { records, isLoading, error, reloadRecords } = useRecords();
  const overview = useMemo(() => buildRecordsOverview(records, 8), [records]);
  const showLoading = isLoading && records.length === 0;

  return (
    <ScreenContainer title="Postępy" subtitle="Podsumowanie danych zapisanych na tym urządzeniu.">
      <View className="gap-8">
        <BodyWeightSection />

        {error ? (
          <ErrorState
            message={error}
            actionLabel="Spróbuj ponownie"
            onActionPress={() => void reloadRecords()}
          />
        ) : null}

        <View>
          <SectionHeader title="Rekordy osobiste" />
          {showLoading ? (
            <LoadingState label="Wczytywanie dziennika…" />
          ) : overview.entryCount === 0 ? (
            <EmptyState
              icon="trophy"
              title="Brak zapisanych wyników"
              description="Dodaj wynik w dzienniku PR, aby śledzić swoje rekordy."
              actionLabel="Dodaj wynik"
              onActionPress={() => router.push('/tools/records/form')}
            />
          ) : (
            <View className="gap-3">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <StatCard label="Ćwiczenia" value={String(overview.exerciseCount)} />
                </View>
                <View className="flex-1">
                  <StatCard label="Wpisy" value={String(overview.entryCount)} />
                </View>
              </View>

              <AppCard padding="none" className="overflow-hidden">
                <Text className="px-4 pb-1 pt-4 text-label text-text-secondary">
                  Ostatnie rekordy
                </Text>
                {overview.recentPrs.map((entry, index) => (
                  <Fragment key={entry.id}>
                    {index > 0 ? <ListDivider /> : null}
                    <ListRow
                      title={entry.exerciseName}
                      description={`${formatWeightReps(entry.weightKg, entry.reps)} · ${formatDisplayDate(entry.date)}`}
                      trailing={entry.isCurrentPr ? <Badge label="PR" tone="accent" /> : null}
                      onPress={() =>
                        router.push({
                          pathname: '/tools/records/[exerciseKey]',
                          params: { exerciseKey: entry.exerciseKey },
                        })
                      }
                    />
                  </Fragment>
                ))}
              </AppCard>

              <Button
                label="Otwórz dziennik PR"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => router.push('/tools/records')}
              />
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
