import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import {
  Button,
  ErrorState,
  FormField,
  ScreenContainer,
  showMessage,
} from '@/components';
import { useRecords } from '@/context';
import {
  parseAndValidateRecordForm,
  todayIsoDate,
} from '@/utils/records';

export function RecordFormScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    exerciseName?: string | string[];
    exerciseKey?: string | string[];
  }>();

  const recordId = firstParam(params.id);
  const prefillsName = firstParam(params.exerciseName);
  const isEdit = Boolean(recordId);

  const {
    getRecord,
    addRecord,
    updateRecord,
    isSaving,
    error,
    clearError,
    hasLoaded,
  } = useRecords();

  const existing = useMemo(
    () => (recordId ? getRecord(recordId) : undefined),
    [getRecord, recordId],
  );

  const [exerciseName, setExerciseName] = useState(
    existing?.exerciseName ?? prefillsName ?? '',
  );
  const [weightText, setWeightText] = useState(
    existing ? String(existing.weightKg) : '',
  );
  const [repsText, setRepsText] = useState(
    existing ? String(existing.reps) : '',
  );
  const [dateText, setDateText] = useState(
    existing?.date ?? todayIsoDate(),
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const submittingRef = useRef(false);
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const dateRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!existing) {
      return;
    }
    setExerciseName(existing.exerciseName);
    setWeightText(String(existing.weightKg));
    setRepsText(String(existing.reps));
    setDateText(existing.date);
    setNotes(existing.notes ?? '');
  }, [existing]);

  useEffect(() => {
    if (isEdit && hasLoaded && recordId && !existing) {
      showMessage('Brak wpisu', 'Nie znaleziono wyniku do edycji.', () => router.back());
    }
  }, [existing, hasLoaded, isEdit, recordId]);

  const onSubmit = async () => {
    if (submittingRef.current || isSaving) {
      return;
    }

    clearError();
    const parsed = parseAndValidateRecordForm({
      exerciseName,
      weightText,
      repsText,
      dateText,
      notes,
    });

    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      return;
    }

    setFieldErrors([]);
    submittingRef.current = true;

    try {
      if (isEdit && recordId) {
        const updated = await updateRecord(recordId, parsed.draft);
        router.replace({
          pathname: '/tools/records/[exerciseKey]',
          params: { exerciseKey: updated.exerciseKey },
        });
      } else {
        const created = await addRecord(parsed.draft);
        router.replace({
          pathname: '/tools/records/[exerciseKey]',
          params: { exerciseKey: created.exerciseKey },
        });
      }
    } catch {
      showMessage(
        'Zapis nieudany',
        'Wynik nie został trwale zapisany. Sprawdź pamięć urządzenia i spróbuj ponownie.',
      );
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: isEdit ? 'Edytuj wynik' : 'Nowy wynik' }} />

      {error ? (
        <View className="mb-4">
          <ErrorState message={error} />
        </View>
      ) : null}

      {fieldErrors.length > 0 ? (
        <View className="mb-4">
          <ErrorState
            message="Popraw dane formularza"
            details={fieldErrors}
          />
        </View>
      ) : null}

      <View className="gap-4">
        <FormField
          label="Ćwiczenie"
          value={exerciseName}
          onChangeText={setExerciseName}
          placeholder="np. Wyciskanie leżąc"
          autoCapitalize="sentences"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => weightRef.current?.focus()}
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField
              ref={weightRef}
              label="Ciężar"
              value={weightText}
              onChangeText={setWeightText}
              placeholder="np. 82,5"
              keyboardType="decimal-pad"
              inputMode="decimal"
              selectTextOnFocus
              returnKeyType="next"
              onSubmitEditing={() => repsRef.current?.focus()}
              trailing={<Text className="text-body text-text-secondary">kg</Text>}
            />
          </View>
          <View className="flex-1">
            <FormField
              ref={repsRef}
              label="Powtórzenia"
              value={repsText}
              onChangeText={setRepsText}
              placeholder="np. 5"
              keyboardType="number-pad"
              inputMode="numeric"
              selectTextOnFocus
              returnKeyType="next"
              onSubmitEditing={() => dateRef.current?.focus()}
            />
          </View>
        </View>
        <FormField
          ref={dateRef}
          label="Data"
          hint="Format RRRR-MM-DD"
          value={dateText}
          onChangeText={setDateText}
          placeholder={todayIsoDate()}
          autoCapitalize="none"
          autoCorrect={false}
          trailing={
            <Button
              label="Dziś"
              variant="ghost"
              size="sm"
              fullWidth={false}
              onPress={() => setDateText(todayIsoDate())}
            />
          }
        />
        <FormField
          label="Notatka (opcjonalnie)"
          value={notes}
          onChangeText={setNotes}
          placeholder="np. łatwy zapas, pasek"
          multiline
        />
      </View>

      <View className="mt-6 gap-2">
        <Button
          label={isEdit ? 'Zapisz zmiany' : 'Zapisz wynik'}
          loading={isSaving}
          onPress={() => void onSubmit()}
        />
        <Button
          label="Anuluj"
          variant="ghost"
          onPress={() => router.back()}
          disabled={isSaving}
        />
      </View>
    </ScreenContainer>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
