import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import {
  AppCard,
  Button,
  ErrorState,
  FormField,
  ScreenContainer,
  SectionHeader,
  SegmentedControl,
} from '@/components';
import { useBodyWeight, useSettings } from '@/context';
import type { BodyGoal } from '@/types';
import {
  BMI_BAND_LABELS,
  HEIGHT_ERROR,
  calculateBmi,
  formatNumberPl,
  parseHeightCm,
} from '@/utils/bodyWeight';

import { BmiNote } from './BmiNote';

type GoalOption = BodyGoal | 'none';

/** Three goals fit one row at phone width; "no goal" is a separate action. */
const GOAL_OPTIONS = [
  { value: 'cut', label: 'Redukcja' },
  { value: 'maintain', label: 'Utrzymanie' },
  { value: 'gain', label: 'Masa' },
] as const satisfies readonly { value: GoalOption; label: string }[];

/** Height (for BMI) and the optional goal used to describe the trend. */
export function BodyProfileScreen() {
  const { settings, updateSettings, error: settingsError } = useSettings();
  const { entries } = useBodyWeight();

  const [heightText, setHeightText] = useState(formatHeight(settings.heightCm));
  const [heightError, setHeightError] = useState<string | null>(null);

  // Settings load asynchronously — sync the field once they arrive.
  useEffect(() => {
    setHeightText(formatHeight(settings.heightCm));
  }, [settings.heightCm]);

  const parsedHeight = parseHeightCm(heightText);
  const preview = calculateBmi(entries[0]?.weightKg, parsedHeight);

  const onSave = async () => {
    const trimmed = heightText.trim();
    if (trimmed === '') {
      setHeightError(null);
      await updateSettings({ heightCm: null });
      router.back();
      return;
    }
    if (parsedHeight == null) {
      setHeightError(HEIGHT_ERROR);
      return;
    }
    setHeightError(null);
    await updateSettings({ heightCm: parsedHeight });
    router.back();
  };

  return (
    <ScreenContainer>
      <View className="gap-8">
        {settingsError ? <ErrorState message={settingsError} /> : null}

        <View className="gap-3">
          <SectionHeader title="Wzrost" subtitle="Potrzebny tylko do obliczenia BMI." />
          <FormField
            label="Wzrost"
            value={heightText}
            onChangeText={(text) => {
              setHeightText(text);
              if (heightError) setHeightError(null);
            }}
            placeholder="np. 178"
            keyboardType="decimal-pad"
            inputMode="decimal"
            error={heightError}
            hint="Pozostaw puste, aby nie liczyć BMI."
            trailing={<Text className="text-body text-text-secondary">cm</Text>}
          />
          <AppCard variant="outline">
            <Text className="text-label text-text-secondary">BMI z ostatniego pomiaru</Text>
            <Text className="mt-1 text-title text-text-primary">
              {preview ? formatNumberPl(preview.value, 1) : '—'}
            </Text>
            <Text className="mt-0.5 text-label text-text-secondary">
              {preview
                ? BMI_BAND_LABELS[preview.band]
                : entries.length === 0
                  ? 'Dodaj pomiar masy ciała.'
                  : 'Podaj poprawny wzrost.'}
            </Text>
          </AppCard>
          <BmiNote />
          <Button label="Zapisz wzrost" onPress={() => void onSave()} />
        </View>

        <View className="gap-3">
          <SectionHeader
            title="Cel"
            subtitle="Opcjonalny. Służy wyłącznie do opisu obserwowanego trendu masy ciała."
          />
          <SegmentedControl
            accessibilityLabel="Cel"
            options={GOAL_OPTIONS}
            value={settings.bodyGoal ?? 'none'}
            onChange={(next) => void updateSettings({ bodyGoal: next === 'none' ? null : next })}
          />
          {settings.bodyGoal ? (
            <Button
              label="Bez celu"
              variant="ghost"
              size="sm"
              fullWidth={false}
              onPress={() => void updateSettings({ bodyGoal: null })}
            />
          ) : null}
          <Text className="text-label text-text-muted">
            Aplikacja nie wyznacza docelowej masy ani nie zaleca diety. Cel zmienia tylko opis
            trendu, np. „kierunek zgodny z wybranym celem”.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

function formatHeight(heightCm: number | null): string {
  return heightCm == null ? '' : formatNumberPl(heightCm, 1);
}
