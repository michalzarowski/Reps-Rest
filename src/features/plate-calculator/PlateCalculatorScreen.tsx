import { useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import {
  ErrorBanner,
  GlassPanel,
  Icon,
  Screen,
  SectionHeader,
} from '@/components';
import { colors, radii } from '@/theme';
import type { PlateConverterMode, PlateCount } from '@/types';
import {
  DEFAULT_BAR_WEIGHT_KG,
  STANDARD_BAR_OPTIONS_KG,
  STANDARD_PLATES_KG,
  formatKg,
  parseNonNegativeInteger,
  parsePositiveNumber,
  solvePlatesToTarget,
  solveTargetToPlates,
} from '@/utils';

type BarPreset = 20 | 15 | 'custom';

function plateVisualWidth(plateKg: number): number {
  const min = 22;
  const max = 48;
  const clamped = Math.min(25, Math.max(1.25, plateKg));
  return min + ((clamped - 1.25) / (25 - 1.25)) * (max - min);
}

function plateVisualColor(plateKg: number): string {
  if (plateKg >= 25) return colors.aqua;
  if (plateKg >= 20) return colors.liquidMint;
  if (plateKg >= 15) return colors.lilac;
  if (plateKg >= 10) return colors.acidLime;
  if (plateKg >= 5) return colors.aqua;
  return colors.textSecondary;
}

export function PlateCalculatorScreen() {
  const [mode, setMode] = useState<PlateConverterMode>('target-to-plates');
  const [targetText, setTargetText] = useState('100');
  const [barPreset, setBarPreset] = useState<BarPreset>(DEFAULT_BAR_WEIGHT_KG);
  const [customBarText, setCustomBarText] = useState('20');
  const [plateCounts, setPlateCounts] = useState<Record<number, number>>(() =>
    Object.fromEntries(STANDARD_PLATES_KG.map((p) => [p, 0])),
  );

  const barKg = useMemo(() => {
    if (barPreset === 'custom') {
      return parsePositiveNumber(customBarText);
    }
    return barPreset;
  }, [barPreset, customBarText]);

  const targetResult = useMemo(() => {
    const totalKg = parsePositiveNumber(targetText);
    if (totalKg == null || barKg == null) {
      const errors: string[] = [];
      if (totalKg == null) {
        errors.push('Podaj prawidłowy ciężar całkowity');
      }
      if (barKg == null) {
        errors.push('Podaj prawidłową masę gryfu');
      }
      return {
        ok: false as const,
        errors,
        solution: null,
        nearest: null,
        message: errors[0] ?? null,
      };
    }
    return solveTargetToPlates(totalKg, barKg);
  }, [targetText, barKg]);

  const fromPlatesResult = useMemo(() => {
    if (barKg == null) {
      return {
        ok: false as const,
        errors: ['Podaj prawidłową masę gryfu'],
        totalKg: null,
        barKg: 0,
        perSideKg: 0,
        plates: [] as PlateCount[],
      };
    }
    return solvePlatesToTarget(barKg, plateCounts);
  }, [barKg, plateCounts]);

  const resultPlates: PlateCount[] =
    mode === 'target-to-plates'
      ? (targetResult.solution?.plates ?? [])
      : fromPlatesResult.plates;

  const bumpPlate = (plateKg: number, delta: number) => {
    setPlateCounts((prev) => {
      const next = Math.max(0, (prev[plateKg] ?? 0) + delta);
      return { ...prev, [plateKg]: next };
    });
  };

  const setPlateCountText = (plateKg: number, raw: string) => {
    if (raw.trim() === '') {
      setPlateCounts((prev) => ({ ...prev, [plateKg]: 0 }));
      return;
    }
    const parsed = parseNonNegativeInteger(raw);
    if (parsed == null) {
      return;
    }
    setPlateCounts((prev) => ({ ...prev, [plateKg]: parsed }));
  };

  return (
    <Screen tabBarInset={false}>
      <SectionHeader
        title="Konwerter talerzy"
        subtitle="Cel ↔ układ talerzy na jedną stronę sztangi"
      />

      <View className="mb-4 flex-row gap-2">
        <ModePill
          label="Cel → talerze"
          active={mode === 'target-to-plates'}
          onPress={() => setMode('target-to-plates')}
        />
        <ModePill
          label="Talerze → cel"
          active={mode === 'plates-to-target'}
          onPress={() => setMode('plates-to-target')}
        />
      </View>

      <SectionHeader title="Masa gryfu" />
      <View className="mb-3 flex-row gap-2">
        {STANDARD_BAR_OPTIONS_KG.map((option) => (
          <ModePill
            key={option}
            label={`${option} kg`}
            active={barPreset === option}
            onPress={() => setBarPreset(option as 20 | 15)}
          />
        ))}
        <ModePill
          label="Własna"
          active={barPreset === 'custom'}
          onPress={() => setBarPreset('custom')}
        />
      </View>

      {barPreset === 'custom' ? (
        <View className="mb-4">
          <NumberField
            label="Własna masa gryfu (kg)"
            value={customBarText}
            onChangeText={setCustomBarText}
            placeholder="np. 10"
          />
        </View>
      ) : null}

      {mode === 'target-to-plates' ? (
        <View className="mb-4">
          <NumberField
            label="Ciężar całkowity (kg)"
            value={targetText}
            onChangeText={setTargetText}
            placeholder="np. 100"
          />
        </View>
      ) : (
        <View className="mb-4 gap-2">
          <SectionHeader title="Talerze na jedną stronę" />
          {STANDARD_PLATES_KG.map((plateKg) => (
            <GlassPanel key={plateKg} variant="soft">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    style={{
                      width: plateVisualWidth(plateKg) * 0.55,
                      height: 18,
                      borderRadius: 4,
                      backgroundColor: plateVisualColor(plateKg),
                      opacity: 0.85,
                    }}
                  />
                  <Text className="text-body text-text-primary">
                    {formatKg(plateKg)} kg
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() => bumpPlate(plateKg, -1)}
                    style={chipStyle}
                    hitSlop={8}
                  >
                    <Icon name="minus" color={colors.aqua} size="sm" />
                  </Pressable>
                  <TextInput
                    value={String(plateCounts[plateKg] ?? 0)}
                    onChangeText={(text) => setPlateCountText(plateKg, text)}
                    keyboardType="number-pad"
                    selectTextOnFocus
                    style={countInputStyle}
                  />
                  <Pressable
                    onPress={() => bumpPlate(plateKg, 1)}
                    style={chipStyle}
                    hitSlop={8}
                  >
                    <Icon name="plus" color={colors.aqua} size="sm" />
                  </Pressable>
                </View>
              </View>
            </GlassPanel>
          ))}
        </View>
      )}

      {mode === 'target-to-plates' ? (
        <TargetResultBlock result={targetResult} barKg={barKg} />
      ) : (
        <FromPlatesResultBlock result={fromPlatesResult} />
      )}

      {(mode === 'target-to-plates' && targetResult.solution) ||
      (mode === 'plates-to-target' && fromPlatesResult.ok) ? (
        <>
          <SectionHeader title="Na jedną stronę" />
          <View className="mb-6 flex-row gap-4">
            <View className="flex-1 gap-2">
              {resultPlates.length === 0 ? (
                <GlassPanel variant="soft">
                  <Text className="text-body text-text-secondary">
                    Tylko gryf — bez talerzy
                  </Text>
                </GlassPanel>
              ) : (
                resultPlates.map((item) => (
                  <GlassPanel key={item.plateKg} variant="soft">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-body text-text-primary">
                        {formatKg(item.plateKg)} kg
                      </Text>
                      <Text className="text-caption text-aqua">
                        × {item.count}
                      </Text>
                    </View>
                  </GlassPanel>
                ))
              )}
            </View>
            <BarbellSleeve plates={resultPlates} />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function TargetResultBlock({
  result,
  barKg,
}: {
  result: ReturnType<typeof solveTargetToPlates> | {
    ok: false;
    errors: string[];
    solution: null;
    nearest: null;
    message: string | null;
  };
  barKg: number | null;
}) {
  if (!result.ok || !result.solution) {
    return (
      <View className="mb-4 gap-3">
        {result.message ? <ErrorBanner message={result.message} /> : null}
        {result.errors.length > 1 ? (
          <Text className="text-caption text-text-secondary">
            {result.errors.slice(1).join(' · ')}
          </Text>
        ) : null}
        {result.nearest &&
        (result.nearest.belowKg != null || result.nearest.aboveKg != null) ? (
          <GlassPanel variant="solid">
            <Text className="text-caption text-text-secondary">
              Najbliższe możliwe obciążenia
            </Text>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-body text-text-primary">
                ↓{' '}
                {result.nearest.belowKg != null
                  ? `${formatKg(result.nearest.belowKg)} kg`
                  : '—'}
              </Text>
              <Text className="text-body text-text-primary">
                ↑{' '}
                {result.nearest.aboveKg != null
                  ? `${formatKg(result.nearest.aboveKg)} kg`
                  : '—'}
              </Text>
            </View>
          </GlassPanel>
        ) : null}
      </View>
    );
  }

  const { solution } = result;
  return (
    <View className="mb-4 gap-3">
      <GlassPanel variant="elevated">
        <Text className="text-caption font-semibold text-aqua">
          Wynik
        </Text>
        <Text className="mt-1 text-title text-text-primary">
          {formatKg(solution.totalKg)} kg
        </Text>
        <Text className="mt-2 text-caption text-text-secondary">
          Gryf {formatKg(solution.barKg)} kg · {formatKg(solution.perSideKg)} kg
          na stronę
        </Text>
      </GlassPanel>
      {barKg != null && solution.totalKg === solution.barKg ? (
        <Text className="text-caption text-text-secondary">
          Ciężar równy masie gryfu — talerze nie są potrzebne.
        </Text>
      ) : null}
    </View>
  );
}

function FromPlatesResultBlock({
  result,
}: {
  result: ReturnType<typeof solvePlatesToTarget>;
}) {
  if (!result.ok || result.totalKg == null) {
    return (
      <View className="mb-4">
        <ErrorBanner
          message={result.errors[0] ?? 'Nieprawidłowe dane wejściowe'}
        />
      </View>
    );
  }

  return (
    <View className="mb-4">
      <GlassPanel variant="elevated">
        <Text className="text-caption font-semibold text-aqua">
          Ciężar całkowity
        </Text>
        <Text className="mt-1 text-hero text-text-primary">
          {formatKg(result.totalKg)} kg
        </Text>
        <Text className="mt-2 text-caption text-text-secondary">
          Gryf {formatKg(result.barKg)} kg · {formatKg(result.perSideKg)} kg na
          stronę (symetrycznie)
        </Text>
      </GlassPanel>
    </View>
  );
}

function BarbellSleeve({ plates }: { plates: PlateCount[] }) {
  const stacked: number[] = [];
  for (const item of plates) {
    for (let i = 0; i < item.count; i += 1) {
      stacked.push(item.plateKg);
    }
  }

  return (
    <View
      style={{
        width: 64,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.seaDepth,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 5,
        minHeight: 160,
      }}
    >
      {stacked.length === 0 ? (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 11,
            transform: [{ rotate: '-90deg' }],
            width: 80,
            textAlign: 'center',
          }}
        >
          pusty rękaw
        </Text>
      ) : (
        stacked.map((plateKg, index) => (
          <View
            key={`${plateKg}-${index}`}
            style={{
              width: plateVisualWidth(plateKg),
              height: 12,
              borderRadius: 3,
              backgroundColor: plateVisualColor(plateKg),
              opacity: 0.55 + Math.min(plateKg, 25) / 70,
            }}
          />
        ))
      )}
      <View
        style={{
          width: 10,
          height: 48,
          borderRadius: 4,
          backgroundColor: colors.textMuted,
        }}
      />
    </View>
  );
}

function ModePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: radii.pill,
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: active ? colors.aqua : colors.glassBorder,
        backgroundColor: active ? colors.activeGlow : colors.glassFill,
      }}
    >
      <Text
        style={{
          color: active ? colors.aqua : colors.textSecondary,
          fontWeight: '600',
          fontSize: 13,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NumberField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <GlassPanel variant="solid">
      <Text className="mb-2 text-caption text-text-secondary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
        inputMode="decimal"
        selectTextOnFocus
        style={fieldInputStyle}
      />
    </GlassPanel>
  );
}

const chipStyle = {
  width: 36,
  height: 36,
  borderRadius: radii.pill,
  borderWidth: 1,
  borderColor: colors.glassBorder,
  backgroundColor: colors.glassFill,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const fieldInputStyle: TextInputProps['style'] = {
  color: colors.textPrimary,
  fontSize: 22,
  fontWeight: '600',
  paddingVertical: 4,
};

const countInputStyle: TextInputProps['style'] = {
  color: colors.textPrimary,
  fontSize: 16,
  fontWeight: '600',
  minWidth: 36,
  textAlign: 'center',
  paddingVertical: 4,
};
