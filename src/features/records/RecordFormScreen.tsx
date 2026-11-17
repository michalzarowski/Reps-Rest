import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import {
  ErrorBanner,
  GlassButton,
  GlassPanel,
  Screen,
  SectionHeader,
} from '@/components';
import { useRecords } from '@/context';
import { colors } from '@/theme';
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
      Alert.alert('Brak wpisu', 'Nie znaleziono wyniku do edycji.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
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
      Alert.alert(
        'Zapis nieudany',
        'Wynik nie został trwale zapisany. Sprawdź pamięć urządzenia i spróbuj ponownie.',
      );
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <Screen tabBarInset={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <SectionHeader
          title={isEdit ? 'Edytuj wynik' : 'Nowy wynik'}
          subtitle="Ciężar × powtórzenia z datą wykonania"
        />

        {error ? (
          <View className="mb-3">
            <ErrorBanner message={error} />
          </View>
        ) : null}

        {fieldErrors.length > 0 ? (
          <View className="mb-3">
            <ErrorBanner message={fieldErrors.join(' · ')} />
          </View>
        ) : null}

        <View className="gap-3">
          <TextField
            label="Ćwiczenie"
            value={exerciseName}
            onChangeText={setExerciseName}
            placeholder="np. Wyciskanie leżąc"
            autoCapitalize="sentences"
          />
          <TextField
            label="Ciężar (kg)"
            value={weightText}
            onChangeText={setWeightText}
            placeholder="np. 100 lub 82,5"
            keyboardType="decimal-pad"
            inputMode="decimal"
          />
          <TextField
            label="Powtórzenia"
            value={repsText}
            onChangeText={setRepsText}
            placeholder="np. 5"
            keyboardType="number-pad"
            inputMode="numeric"
          />
          <GlassPanel variant="solid">
            <Text className="mb-2 text-caption text-text-secondary">
              Data (RRRR-MM-DD)
            </Text>
            <TextInput
              value={dateText}
              onChangeText={setDateText}
              placeholder={todayIsoDate()}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={fieldInputStyle}
            />
            <View className="mt-3">
              <GlassButton
                label="Ustaw dzisiejszą datę"
                variant="secondary"
                size="sm"
                onPress={() => setDateText(todayIsoDate())}
              />
            </View>
          </GlassPanel>
          <GlassPanel variant="solid">
            <Text className="mb-2 text-caption text-text-secondary">
              Notatka (opcjonalnie)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="np. łatwy zapas, pasek"
              placeholderTextColor={colors.textMuted}
              multiline
              style={[fieldInputStyle, { minHeight: 72, textAlignVertical: 'top' }]}
            />
          </GlassPanel>
        </View>

        <View className="mt-5 gap-3">
          <GlassButton
            label={isSaving ? 'Zapisywanie…' : isEdit ? 'Zapisz zmiany' : 'Zapisz wynik'}
            onPress={() => void onSubmit()}
            disabled={isSaving}
          />
          <GlassButton
            label="Anuluj"
            variant="ghost"
            onPress={() => router.back()}
            disabled={isSaving}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  inputMode,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  inputMode?: TextInputProps['inputMode'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
}) {
  return (
    <GlassPanel variant="solid">
      <Text className="mb-2 text-caption text-text-secondary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        inputMode={inputMode}
        autoCapitalize={autoCapitalize}
        selectTextOnFocus
        style={fieldInputStyle}
      />
    </GlassPanel>
  );
}

const fieldInputStyle: TextInputProps['style'] = {
  color: colors.textPrimary,
  fontSize: 18,
  fontWeight: '600',
  paddingVertical: 4,
};
