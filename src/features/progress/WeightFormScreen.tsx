import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import {
  Button,
  ErrorState,
  FormField,
  ScreenContainer,
  confirmAction,
  showMessage,
} from '@/components';
import { useBodyWeight } from '@/context';
import { parseAndValidateBodyWeightForm } from '@/utils/bodyWeight';
import { todayIsoDate } from '@/utils/records';

/** Add or edit one body-weight measurement (`?id=` edits). */
export function WeightFormScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const entryId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isEdit = Boolean(entryId);

  const { entries, getEntry, addEntry, updateEntry, deleteEntry, isSaving, error, clearError, hasLoaded } =
    useBodyWeight();
  const existing = useMemo(() => (entryId ? getEntry(entryId) : undefined), [entryId, getEntry]);

  const [weightText, setWeightText] = useState(
    existing ? String(existing.weightKg).replace('.', ',') : '',
  );
  const [dateText, setDateText] = useState(existing?.date ?? todayIsoDate());
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const submittingRef = useRef(false);

  // Prefill once the entry is available (e.g. deep link before storage loaded).
  const prefilledRef = useRef(Boolean(existing));
  useEffect(() => {
    if (existing && !prefilledRef.current) {
      prefilledRef.current = true;
      setWeightText(String(existing.weightKg).replace('.', ','));
      setDateText(existing.date);
    }
  }, [existing]);

  useEffect(() => {
    if (isEdit && hasLoaded && !existing && !submittingRef.current) {
      showMessage('Brak pomiaru', 'Nie znaleziono pomiaru do edycji.', () => router.back());
    }
  }, [existing, hasLoaded, isEdit]);

  const onSubmit = async () => {
    if (submittingRef.current || isSaving) return;
    clearError();

    const parsed = parseAndValidateBodyWeightForm({
      weightText,
      dateText,
      existing: entries,
      editingId: entryId ?? null,
      today: todayIsoDate(),
    });
    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      return;
    }

    setFieldErrors([]);
    submittingRef.current = true;
    try {
      if (isEdit && entryId) {
        await updateEntry(entryId, parsed.draft);
      } else {
        await addEntry(parsed.draft);
      }
      router.back();
    } catch {
      showMessage(
        'Zapis nieudany',
        'Pomiar nie został trwale zapisany. Sprawdź pamięć urządzenia i spróbuj ponownie.',
      );
    } finally {
      submittingRef.current = false;
    }
  };

  const onDelete = async () => {
    if (!entryId || !existing) return;
    const confirmed = await confirmAction({
      title: 'Usuń pomiar',
      message: 'Usunąć ten pomiar? Tej operacji nie można cofnąć.',
      confirmLabel: 'Usuń',
      destructive: true,
    });
    if (!confirmed) return;
    submittingRef.current = true;
    try {
      await deleteEntry(entryId);
      router.back();
    } catch {
      showMessage('Błąd', 'Nie udało się usunąć pomiaru.');
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: isEdit ? 'Edytuj pomiar' : 'Nowy pomiar' }} />

      {error ? (
        <View className="mb-4">
          <ErrorState message={error} />
        </View>
      ) : null}

      {fieldErrors.length > 0 ? (
        <View className="mb-4">
          <ErrorState message="Popraw dane formularza" details={fieldErrors} />
        </View>
      ) : null}

      <View className="gap-4">
        <FormField
          label="Masa ciała"
          value={weightText}
          onChangeText={setWeightText}
          placeholder="np. 78,4"
          keyboardType="decimal-pad"
          inputMode="decimal"
          selectTextOnFocus
          size="lg"
          autoFocus={!isEdit}
          trailing={<Text className="text-body text-text-secondary">kg</Text>}
        />
        <FormField
          label="Data"
          hint="Format RRRR-MM-DD. Jeden pomiar na dzień."
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
        <Text className="text-label text-text-muted">
          Najlepiej ważyć się o podobnej porze, np. rano przed posiłkiem — wtedy trend jest
          czytelniejszy.
        </Text>
      </View>

      <View className="mt-6 gap-2">
        <Button
          label={isEdit ? 'Zapisz zmiany' : 'Zapisz pomiar'}
          loading={isSaving}
          onPress={() => void onSubmit()}
        />
        {isEdit && existing ? (
          <Button
            label="Usuń pomiar"
            variant="danger"
            icon="trash"
            disabled={isSaving}
            onPress={() => void onDelete()}
          />
        ) : null}
        <Button label="Anuluj" variant="ghost" onPress={() => router.back()} disabled={isSaving} />
      </View>
    </ScreenContainer>
  );
}
