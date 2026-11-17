import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  AppCard,
  ErrorState,
  FormField,
  IconButton,
  ScreenContainer,
  SectionHeader,
  SegmentedControl,
} from '@/components';
import type { OneRmFormula } from '@/types';
import {
  buildIntensityGuide,
  estimateOneRm,
  formatKg,
  parseNonNegativeInteger,
  parsePositiveNumber,
  validateOneRmInput,
} from '@/utils';

import { IntensityTable } from './IntensityTable';

const FORMULA_OPTIONS = [
  { value: 'epley', label: 'Epley' },
  { value: 'brzycki', label: 'Brzycki' },
] as const satisfies readonly { value: OneRmFormula; label: string }[];

const WEIGHT_STEP = 2.5;

export function OneRmScreen() {
  const [weightText, setWeightText] = useState('100');
  const [repsText, setRepsText] = useState('5');
  const [formula, setFormula] = useState<OneRmFormula>('epley');

  // Unparseable input maps to 0 so the existing validator reports the error.
  const weightKg = parsePositiveNumber(weightText) ?? 0;
  const reps = parseNonNegativeInteger(repsText) ?? 0;

  const validation = useMemo(
    () => validateOneRmInput({ weightKg, reps, formula }),
    [weightKg, reps, formula],
  );
  const estimated1Rm = useMemo(
    () => (validation.ok ? estimateOneRm({ weightKg, reps, formula }) : null),
    [validation.ok, weightKg, reps, formula],
  );
  const intensityRows = useMemo(
    () => (estimated1Rm == null ? [] : buildIntensityGuide(estimated1Rm)),
    [estimated1Rm],
  );

  const stepWeight = (delta: number) => {
    const next = Math.max(0, weightKg + delta);
    setWeightText(formatKg(next));
  };
  const stepReps = (delta: number) => {
    setRepsText(String(Math.max(0, reps + delta)));
  };

  return (
    <ScreenContainer>
      <View className="gap-4">
        <FormField
          label="Ciężar"
          value={weightText}
          onChangeText={setWeightText}
          keyboardType="decimal-pad"
          inputMode="decimal"
          size="lg"
          selectTextOnFocus
          trailing={
            <View className="flex-row items-center gap-2">
              <Text className="text-body text-text-secondary">kg</Text>
              <IconButton
                icon="minus"
                accessibilityLabel="Zmniejsz ciężar o 2,5 kg"
                onPress={() => stepWeight(-WEIGHT_STEP)}
                disabled={weightKg <= 0}
              />
              <IconButton
                icon="plus"
                accessibilityLabel="Zwiększ ciężar o 2,5 kg"
                onPress={() => stepWeight(WEIGHT_STEP)}
              />
            </View>
          }
        />
        <FormField
          label="Powtórzenia"
          value={repsText}
          onChangeText={setRepsText}
          keyboardType="number-pad"
          inputMode="numeric"
          size="lg"
          selectTextOnFocus
          trailing={
            <View className="flex-row items-center gap-2">
              <IconButton
                icon="minus"
                accessibilityLabel="Zmniejsz liczbę powtórzeń"
                onPress={() => stepReps(-1)}
                disabled={reps <= 1}
              />
              <IconButton
                icon="plus"
                accessibilityLabel="Zwiększ liczbę powtórzeń"
                onPress={() => stepReps(1)}
              />
            </View>
          }
        />
        <View>
          <Text className="mb-1.5 text-label font-medium text-text-secondary">Wzór</Text>
          <SegmentedControl
            accessibilityLabel="Wzór szacowania"
            options={FORMULA_OPTIONS}
            value={formula}
            onChange={setFormula}
          />
        </View>
      </View>

      <View className="mb-8 mt-6">
        {!validation.ok ? (
          <ErrorState
            message={validation.errors[0] ?? 'Sprawdź dane wejściowe'}
            details={validation.errors.slice(1)}
          />
        ) : (
          <AppCard variant="elevated">
            <Text className="text-label font-semibold text-accent">Szacowane 1RM</Text>
            <Text
              accessibilityLiveRegion="polite"
              className="mt-1 text-text-primary"
              style={{ fontSize: 44, lineHeight: 52, fontWeight: '700', fontVariant: ['tabular-nums'] }}
            >
              {estimated1Rm == null ? '—' : `${formatKg(estimated1Rm, 1)} kg`}
            </Text>
            <Text className="mt-1 text-body text-text-secondary">
              Tyle prawdopodobnie podniesiesz na 1 powtórzenie, skoro {formatKg(weightKg)} kg
              robisz {reps}× (wzór {formula === 'epley' ? 'Epleya' : 'Brzyckiego'}).
            </Text>
            {validation.warnings.length > 0 ? (
              <Text className="mt-3 text-label text-warning">
                {validation.warnings.join(' · ')}
              </Text>
            ) : null}
            <Text className="mt-3 text-label text-text-muted">
              To estymacja, nie wynik testu maksymalnego.
            </Text>
          </AppCard>
        )}
      </View>

      {intensityRows.length > 0 ? (
        <View>
          <SectionHeader
            title="Obciążenia robocze"
            subtitle="Procent szacowanego 1RM i typowy zakres powtórzeń"
          />
          <IntensityTable rows={intensityRows} />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
