import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  AppCard,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  FormField,
  Icon,
  LoadingState,
  ScreenContainer,
} from '@/components';
import { useRecords, useTheme } from '@/context';
import { formatDisplayDate, formatWeightReps } from '@/utils/records';

export function RecordsScreen() {
  const { colors } = useTheme();
  const { isLoading, error, getGroups, clearError, reloadRecords, records } = useRecords();
  const [query, setQuery] = useState('');

  const groups = useMemo(() => getGroups(query), [getGroups, query]);
  const hasAny = records.length > 0;

  return (
    <ScreenContainer>
      <View className="mb-6 gap-3">
        <Button
          label="Dodaj wynik"
          icon="plus"
          onPress={() => router.push('/tools/records/form')}
        />
        {hasAny ? (
          <FormField
            label="Szukaj ćwiczenia"
            value={query}
            onChangeText={setQuery}
            placeholder="np. przysiad"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            trailing={<Icon name="search" size="sm" color={colors.textMuted} />}
          />
        ) : null}
      </View>

      {error ? (
        <View className="mb-4">
          <ErrorState
            message={error}
            actionLabel="Spróbuj ponownie"
            onActionPress={() => {
              clearError();
              void reloadRecords();
            }}
          />
        </View>
      ) : null}

      {isLoading && !hasAny ? (
        <LoadingState label="Wczytywanie dziennika…" />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={query.trim() ? 'search' : 'trophy'}
          title={query.trim() ? 'Brak pasujących ćwiczeń' : 'Brak zapisanych wyników'}
          description={
            query.trim()
              ? 'Spróbuj innej nazwy ćwiczenia.'
              : 'Dodaj pierwszy wynik, aby śledzić rekordy osobiste na tym urządzeniu.'
          }
        />
      ) : (
        <View className="gap-3">
          {groups.map((group) => (
            <AppCard
              key={group.exerciseKey}
              onPress={() =>
                router.push({
                  pathname: '/tools/records/[exerciseKey]',
                  params: { exerciseKey: group.exerciseKey },
                })
              }
              accessibilityLabel={`${group.exerciseName}, ${group.entryCount} ${entryLabel(group.entryCount)}`}
              accessibilityHint="Otwiera historię ćwiczenia"
            >
              <View className="flex-row items-center gap-3">
                <View className="flex-1">
                  <Text className="text-card-title text-text-primary">{group.exerciseName}</Text>
                  {group.highlight ? (
                    <Text className="mt-1 text-body font-semibold text-accent">
                      Najcięższy: {formatWeightReps(group.highlight.weightKg, group.highlight.reps)}
                    </Text>
                  ) : null}
                  <View className="mt-2 flex-row flex-wrap items-center gap-2">
                    <Badge label={`${group.entryCount} ${entryLabel(group.entryCount)}`} />
                    <Text className="text-label text-text-secondary">
                      Ostatnio {formatDisplayDate(group.lastTrainedDate)}
                    </Text>
                  </View>
                </View>
                <Icon name="chevronRight" size="sm" color={colors.textMuted} />
              </View>
            </AppCard>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

function entryLabel(count: number): string {
  if (count === 1) {
    return 'wpis';
  }
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return 'wpisy';
  }
  return 'wpisów';
}
