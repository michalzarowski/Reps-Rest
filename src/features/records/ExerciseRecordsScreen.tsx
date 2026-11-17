import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

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
  annotateRecords,
  formatDisplayDate,
  formatWeightReps,
} from '@/utils/records';

export function ExerciseRecordsScreen() {
  const params = useLocalSearchParams<{ exerciseKey: string | string[] }>();
  const exerciseKey = Array.isArray(params.exerciseKey)
    ? params.exerciseKey[0]
    : params.exerciseKey;

  const {
    getExerciseRecords,
    deleteRecord,
    isSaving,
    error,
    clearError,
  } = useRecords();

  const entries = useMemo(
    () => (exerciseKey ? getExerciseRecords(exerciseKey) : []),
    [exerciseKey, getExerciseRecords],
  );

  const annotated = useMemo(() => annotateRecords(entries), [entries]);
  const title = annotated[0]?.exerciseName ?? 'Ćwiczenie';

  const confirmDelete = (id: string, summary: string) => {
    Alert.alert('Usuń wynik', `Usunąć wpis ${summary}?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteRecord(id);
              if (entries.length <= 1) {
                router.replace('/tools/records');
              }
            } catch {
              Alert.alert('Błąd', 'Nie udało się usunąć wpisu.');
            }
          })();
        },
      },
    ]);
  };

  return (
    <Screen tabBarInset={false}>
      <SectionHeader
        title={title}
        subtitle="Historia od najnowszych — PR według powtórzeń"
      />

      {error ? (
        <View className="mb-3">
          <ErrorBanner message={error} />
          <View className="mt-2">
            <GlassButton
              label="Ukryj"
              variant="ghost"
              size="sm"
              onPress={clearError}
            />
          </View>
        </View>
      ) : null}

      <View className="mb-4">
        <GlassButton
          label="Dodaj wynik"
          onPress={() =>
            router.push({
              pathname: '/tools/records/form',
              params: {
                exerciseName: title,
                exerciseKey: exerciseKey ?? '',
              },
            })
          }
          disabled={isSaving}
        />
      </View>

      {annotated.length === 0 ? (
        <EmptyState
          title="Brak wpisów"
          description="To ćwiczenie nie ma jeszcze zapisanych wyników."
        />
      ) : (
        <View className="gap-3">
          {annotated.map((entry) => (
            <GlassPanel key={entry.id} variant="elevated">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text className="text-body font-semibold text-text-primary">
                    {formatWeightReps(entry.weightKg, entry.reps)}
                  </Text>
                  <Text className="mt-1 text-caption text-text-secondary">
                    {formatDisplayDate(entry.date)}
                  </Text>
                  {entry.notes ? (
                    <Text className="mt-2 text-caption text-text-secondary">
                      {entry.notes}
                    </Text>
                  ) : null}
                  {entry.oneRmKg != null && entry.oneRmKind ? (
                    <Text className="mt-2 text-caption text-lilac">
                      {entry.oneRmKind === 'actual'
                        ? `Faktyczny 1RM: ${formatOneRm(entry.oneRmKg)} kg`
                        : `Szac. 1RM (Epley): ${formatOneRm(entry.oneRmKg)} kg`}
                    </Text>
                  ) : null}
                </View>
                <View className="items-end gap-2">
                  {entry.isCurrentPr ? (
                    <MetricChip
                      label={entry.isPrTie ? 'Remis PR' : 'PR'}
                      tone="aqua"
                    />
                  ) : null}
                  {entry.isHistoricalPr && !entry.isCurrentPr ? (
                    <MetricChip label="Był PR" tone="lilac" />
                  ) : null}
                  {entry.isHistoricalPr && entry.isCurrentPr ? (
                    <View className="flex-row items-center gap-1">
                      <Icon name="award" size="sm" color={colors.aqua} />
                    </View>
                  ) : null}
                </View>
              </View>

              <View className="mt-3 flex-row gap-2">
                <View className="flex-1">
                  <GlassButton
                    label="Edytuj"
                    variant="secondary"
                    size="sm"
                    disabled={isSaving}
                    onPress={() =>
                      router.push({
                        pathname: '/tools/records/form',
                        params: { id: entry.id },
                      })
                    }
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Usuń wpis"
                  disabled={isSaving}
                  onPress={() =>
                    confirmDelete(
                      entry.id,
                      formatWeightReps(entry.weightKg, entry.reps),
                    )
                  }
                  style={{
                    width: 48,
                    height: 40,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: `${colors.danger}66`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isSaving ? 0.45 : 1,
                  }}
                >
                  <Icon name="trash" size="sm" color={colors.danger} />
                </Pressable>
              </View>
            </GlassPanel>
          ))}
        </View>
      )}
    </Screen>
  );
}

function formatOneRm(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}
