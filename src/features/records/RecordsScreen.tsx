import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import {
  EmptyState,
  ErrorBanner,
  GlassButton,
  GlassPanel,
  Icon,
  MetricChip,
  Screen,
  SectionHeader,
} from '@/components';
import { useRecords } from '@/context';
import { colors } from '@/theme';
import {
  formatDisplayDate,
  formatWeightReps,
} from '@/utils/records';

export function RecordsScreen() {
  const { isLoading, error, getGroups, clearError, reloadRecords } = useRecords();
  const [query, setQuery] = useState('');

  const groups = useMemo(() => getGroups(query), [getGroups, query]);

  return (
    <Screen tabBarInset={false}>
      <SectionHeader
        title="Dziennik PR"
        subtitle="Historia wyników i rekordy według liczby powtórzeń"
      />

      {error ? (
        <View className="mb-3 gap-2">
          <ErrorBanner message={error} />
          <GlassButton
            label="Spróbuj ponownie"
            variant="secondary"
            size="sm"
            onPress={() => {
              clearError();
              void reloadRecords();
            }}
          />
        </View>
      ) : null}

      <GlassPanel variant="solid" className="mb-4">
        <View className="flex-row items-center gap-2">
          <Icon name="search" size="sm" color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Szukaj ćwiczenia…"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontSize: 16,
              fontWeight: '600',
              paddingVertical: 4,
            }}
          />
        </View>
      </GlassPanel>

      <View className="mb-4">
        <GlassButton
          label="Dodaj wynik"
          onPress={() => router.push('/tools/records/form')}
        />
      </View>

      {isLoading ? (
        <View className="items-center py-10">
          <ActivityIndicator color={colors.aqua} />
          <Text className="mt-3 text-caption text-text-secondary">
            Wczytywanie dziennika…
          </Text>
        </View>
      ) : groups.length === 0 ? (
        <EmptyState
          title={query.trim() ? 'Brak wyników wyszukiwania' : 'Brak zapisanych wyników'}
          description={
            query.trim()
              ? 'Spróbuj innej nazwy ćwiczenia.'
              : 'Dodaj pierwszy wynik, aby śledzić rekordy osobiste na urządzeniu.'
          }
        />
      ) : (
        <View className="gap-3">
          {groups.map((group) => (
            <GlassPanel
              key={group.exerciseKey}
              variant="elevated"
              onPress={() =>
                router.push({
                  pathname: '/tools/records/[exerciseKey]',
                  params: { exerciseKey: group.exerciseKey },
                })
              }
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-body font-semibold text-text-primary">
                    {group.exerciseName}
                  </Text>
                  <Text className="mt-1 text-caption text-text-secondary">
                    Ostatnio: {formatDisplayDate(group.lastTrainedDate)}
                  </Text>
                  {group.highlight ? (
                    <Text className="mt-2 text-caption" style={{ color: colors.aqua }}>
                      Najcięższy:{' '}
                      {formatWeightReps(
                        group.highlight.weightKg,
                        group.highlight.reps,
                      )}
                    </Text>
                  ) : null}
                </View>
                <View className="items-end gap-2">
                  <MetricChip
                    label={`${group.entryCount} ${entryLabel(group.entryCount)}`}
                    tone="mint"
                  />
                  <Icon name="chevronRight" size="sm" color={colors.textMuted} />
                </View>
              </View>
            </GlassPanel>
          ))}
        </View>
      )}
    </Screen>
  );
}

function entryLabel(count: number): string {
  if (count === 1) {
    return 'wpis';
  }
  if (count >= 2 && count <= 4) {
    return 'wpisy';
  }
  return 'wpisów';
}
