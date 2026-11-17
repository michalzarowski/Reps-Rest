import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GlassPanel, Icon, Screen, SectionHeader } from '@/components';
import { colors, radii } from '@/theme';
import type { OneRmFormula } from '@/types';
import {
  ONE_RM_FORMULAS,
  buildIntensityGuide,
  estimateOneRm,
  validateOneRmInput,
} from '@/utils';

import { IntensityChart } from './IntensityChart';

export function OneRmScreen() {
  const [weightKg, setWeightKg] = useState(100);
  const [reps, setReps] = useState(5);
  const [formula, setFormula] = useState<OneRmFormula>('epley');

  const validation = useMemo(
    () => validateOneRmInput({ weightKg, reps, formula }),
    [weightKg, reps, formula],
  );
  const estimated1Rm = useMemo(
    () => estimateOneRm({ weightKg, reps, formula }),
    [weightKg, reps, formula],
  );
  const intensityRows = useMemo(
    () => (estimated1Rm == null ? [] : buildIntensityGuide(estimated1Rm)),
    [estimated1Rm],
  );

  return (
    <Screen tabBarInset={false}>
      <SectionHeader
        title="Kalkulator 1RM"
        subtitle="Oszacuj 1RM wzorem Epleya lub Brzyckiego"
      />

      <View className="mb-3 flex-row gap-2">
        {ONE_RM_FORMULAS.map((item) => {
          const active = item === formula;
          return (
            <Pressable
              key={item}
              onPress={() => setFormula(item)}
              style={{
                flex: 1,
                borderRadius: radii.pill,
                paddingVertical: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: active ? colors.aqua : colors.glassBorder,
                backgroundColor: active ? colors.activeGlow : colors.glassFill,
              }}
            >
              <Text
                style={{
                  color: active ? colors.aqua : colors.textSecondary,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mb-4 gap-3">
        <StepperField
          label="Ciężar (kg)"
          value={weightKg}
          onDecrement={() => setWeightKg((w) => Math.max(0, w - 2.5))}
          onIncrement={() => setWeightKg((w) => w + 2.5)}
        />
        <StepperField
          label="Powtórzenia"
          value={reps}
          onDecrement={() => setReps((r) => Math.max(0, r - 1))}
          onIncrement={() => setReps((r) => r + 1)}
        />
      </View>

      {!validation.ok && validation.errors.length > 0 ? (
        <Text className="mb-3 text-caption text-text-secondary">
          {validation.errors.join(' · ')}
        </Text>
      ) : null}

      {validation.ok && validation.warnings.length > 0 ? (
        <Text className="mb-3 text-caption text-lilac">
          {validation.warnings.join(' · ')}
        </Text>
      ) : null}

      <View
        style={{
          borderRadius: radii.lg,
          overflow: "hidden",
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        }}
      >
        <LinearGradient
          colors={[colors.aquaGlow, "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ padding: 24, alignItems: "center" }}
        >
          <Text className="text-caption font-semibold text-aqua">
            Szacowane 1RM
          </Text>
          <Text className="mt-2 text-hero text-text-primary">
            {estimated1Rm == null ? "—" : `${estimated1Rm.toFixed(1)} kg`}
          </Text>
          <Text className="mt-2 text-center text-caption text-text-secondary">
            To estymacja, nie wynik testu maksymalnego.
          </Text>
        </LinearGradient>
      </View>

      <SectionHeader title="Przewodnik intensywności" />
      <IntensityChart rows={intensityRows} />
      <GlassPanel variant="soft">
        {intensityRows.length === 0 ? (
          <Text className="text-caption text-text-secondary">
            Brak wierszy intensywności.
          </Text>
        ) : (
          intensityRows.map((row, index) => (
            <View
              key={row.pct}
              className="flex-row items-center justify-between py-2.5"
              style={
                index < intensityRows.length - 1
                  ? {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.glassBorder,
                    }
                  : undefined
              }
            >
              <Text className="text-caption text-aqua">{row.pct}%</Text>
              <Text className="text-body text-text-primary">
                {row.weightKg} kg
              </Text>
              <Text className="text-caption text-text-secondary">
                {row.repsHint}
              </Text>
            </View>
          ))
        )}
      </GlassPanel>
    </Screen>
  );
}

function StepperField({
  label,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <GlassPanel variant="solid">
      <Text className="mb-2 text-caption text-text-secondary">{label}</Text>
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onDecrement} style={chipStyle} hitSlop={8}>
          <Icon name="minus" color={colors.aqua} size="sm" />
        </Pressable>
        <Text className="text-title text-text-primary">{value}</Text>
        <Pressable onPress={onIncrement} style={chipStyle} hitSlop={8}>
          <Icon name="plus" color={colors.aqua} size="sm" />
        </Pressable>
      </View>
    </GlassPanel>
  );
}

const chipStyle = {
  width: 40,
  height: 40,
  borderRadius: radii.pill,
  borderWidth: 1,
  borderColor: colors.glassBorder,
  backgroundColor: colors.glassFill,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
