import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import {
  AppCard,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  ScreenContainer,
  SectionHeader,
  confirmAction,
  showMessage,
} from '@/components';
import { useRecords } from '@/context';
import { annotateRecords, formatDisplayDate, formatWeightReps } from '@/utils/records';

export function ExerciseRecordsScreen() {
  const params = useLocalSearchParams<{ exerciseKey: string | string[] }>();
  const exerciseKey = Array.isArray(params.exerciseKey)
    ? params.exerciseKey[0]
    : params.exerciseKey;

  const { getExerciseRecords, deleteRecord, isSaving, error, clearError } = useRecords();

  const entries = useMemo(
    () => (exerciseKey ? getExerciseRecords(exerciseKey) : []),
    [exerciseKey, getExerciseRecords],
  );

  const annotated = useMemo(() => annotateRecords(entries), [entries]);
  const title = annotated[0]?.exerciseName ?? 'Ćwiczenie';

  const confirmDelete = async (id: string, summary: string) => {
    const confirmed = await confirmAction({
      title: 'Usuń wynik',
      message: `Usunąć wpis ${summary}? Tej operacji nie można cofnąć.`,
      confirmLabel: 'Usuń',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await deleteRecord(id);
      if (entries.length <= 1) {
        router.replace('/tools/records');
      }
    } catch {
      showMessage('Błąd', 'Nie udało się usunąć wpisu.');
    }
  };

  return (
    <ScreenContainer>
      <View className="mb-6 gap-3">
        <View>
          <Text accessibilityRole="header" className="text-display text-text-primary">
            {title}
          </Text>
          <Text className="mt-1 text-body text-text-secondary">
            Od najnowszych. PR liczony osobno dla każdej liczby powtórzeń.
          </Text>
        </View>
        {error ? (
          <ErrorState message={error} actionLabel="Ukryj" onActionPress={clearError} />
        ) : null}
        <Button
          label="Dodaj wynik"
          icon="plus"
          disabled={isSaving}
          onPress={() =>
            router.push({
              pathname: '/tools/records/form',
              params: { exerciseName: title, exerciseKey: exerciseKey ?? '' },
            })
          }
        />
      </View>

      {annotated.length === 0 ? (
        <EmptyState
          icon="history"
          title="Brak wpisów"
          description="To ćwiczenie nie ma jeszcze zapisanych wyników."
        />
      ) : (
        <View>
          <SectionHeader title="Historia" />
          <View className="gap-3">
            {annotated.map((entry) => {
              const summary = formatWeightReps(entry.weightKg, entry.reps);
              return (
                <AppCard key={entry.id}>
                  <View className="flex-row items-start gap-3">
                    <View className="flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text
                          className="text-card-title text-text-primary"
                          style={{ fontVariant: ['tabular-nums'] }}
                        >
                          {summary}
                        </Text>
                        {entry.isCurrentPr ? (
                          <Badge label={entry.isPrTie ? 'Remis PR' : 'PR'} tone="accent" />
                        ) : entry.isHistoricalPr ? (
                          <Badge label="Był PR" tone="lilac" />
                        ) : null}
                      </View>
                      <Text className="mt-1 text-label text-text-secondary">
                        {formatDisplayDate(entry.date)}
                        {entry.oneRmKg != null && entry.oneRmKind
                          ? ` · ${entry.oneRmKind === 'actual' ? '1RM' : 'Szac. 1RM'} ${formatOneRm(entry.oneRmKg)} kg`
                          : ''}
                      </Text>
                      {entry.notes ? (
                        <Text className="mt-2 text-body text-text-secondary">{entry.notes}</Text>
                      ) : null}
                    </View>
                    <View className="flex-row">
                      <IconButton
                        icon="pencil"
                        variant="plain"
                        accessibilityLabel={`Edytuj wynik ${summary}`}
                        disabled={isSaving}
                        onPress={() =>
                          router.push({ pathname: '/tools/records/form', params: { id: entry.id } })
                        }
                      />
                      <IconButton
                        icon="trash"
                        variant="plain"
                        accessibilityLabel={`Usuń wynik ${summary}`}
                        disabled={isSaving}
                        onPress={() => void confirmDelete(entry.id, summary)}
                      />
                    </View>
                  </View>
                </AppCard>
              );
            })}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

function formatOneRm(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}
