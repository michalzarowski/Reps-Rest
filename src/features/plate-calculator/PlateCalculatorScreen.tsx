import { Fragment, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";

import {
  AppCard,
  Button,
  ErrorState,
  FormField,
  IconButton,
  ListDivider,
  ScreenContainer,
  SectionHeader,
  SegmentedControl,
} from "@/components";
import { useTheme } from "@/context";
import type { ColorPalette } from "@/theme";
import type { PlateConverterMode, PlateCount } from "@/types";
import {
  DEFAULT_BAR_WEIGHT_KG,
  STANDARD_BAR_OPTIONS_KG,
  STANDARD_PLATES_KG,
  formatKg,
  parseNonNegativeInteger,
  parsePositiveNumber,
  solvePlatesToTarget,
  solveTargetToPlates,
} from "@/utils";

type BarPreset = 20 | 15 | "custom";

const MODE_OPTIONS = [
  { value: "target-to-plates", label: "Ciężar → talerze" },
  { value: "plates-to-target", label: "Talerze → ciężar" },
] as const satisfies readonly { value: PlateConverterMode; label: string }[];

const BAR_OPTIONS: readonly { value: BarPreset; label: string }[] = [
  ...STANDARD_BAR_OPTIONS_KG.map((kg) => ({
    value: kg as 20 | 15,
    label: `${kg} kg`,
  })),
  { value: "custom", label: "Inny" },
];

/** Wysokość talerza w rysunku gryfu, proporcjonalna do masy talerza. */
function plateHeight(plateKg: number): number {
  const clamped = Math.min(25, Math.max(1.25, plateKg));
  return 36 + ((clamped - 1.25) / (25 - 1.25)) * 64;
}

function plateColor(plateKg: number, colors: ColorPalette): string {
  if (plateKg >= 25) return colors.accent;
  if (plateKg >= 20) return colors.mint;
  if (plateKg >= 15) return colors.lilac;
  if (plateKg >= 10) return colors.lime;
  if (plateKg >= 5) return colors.textSecondary;
  return colors.textMuted;
}

type TargetResult =
  | ReturnType<typeof solveTargetToPlates>
  | {
      ok: false;
      errors: string[];
      solution: null;
      nearest: null;
      message: string | null;
    };

export function PlateCalculatorScreen() {
  const [mode, setMode] = useState<PlateConverterMode>("target-to-plates");
  const [targetText, setTargetText] = useState("100");
  const [barPreset, setBarPreset] = useState<BarPreset>(
    DEFAULT_BAR_WEIGHT_KG as 20,
  );
  const [customBarText, setCustomBarText] = useState("20");
  const [plateCounts, setPlateCounts] = useState<Record<number, number>>(() =>
    Object.fromEntries(STANDARD_PLATES_KG.map((p) => [p, 0])),
  );

  const barKg = useMemo(
    () =>
      barPreset === "custom" ? parsePositiveNumber(customBarText) : barPreset,
    [barPreset, customBarText],
  );

  const targetResult = useMemo<TargetResult>(() => {
    const totalKg = parsePositiveNumber(targetText);
    if (totalKg == null || barKg == null) {
      const errors: string[] = [];
      if (totalKg == null) errors.push("Podaj prawidłowy ciężar całkowity");
      if (barKg == null) errors.push("Podaj prawidłową masę gryfu");
      return {
        ok: false,
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
        errors: ["Podaj prawidłową masę gryfu"],
        totalKg: null,
        barKg: 0,
        perSideKg: 0,
        plates: [] as PlateCount[],
      };
    }
    return solvePlatesToTarget(barKg, plateCounts);
  }, [barKg, plateCounts]);

  const bumpPlate = (plateKg: number, delta: number) => {
    setPlateCounts((prev) => ({
      ...prev,
      [plateKg]: Math.max(0, (prev[plateKg] ?? 0) + delta),
    }));
  };

  const setPlateCountText = (plateKg: number, raw: string) => {
    if (raw.trim() === "") {
      setPlateCounts((prev) => ({ ...prev, [plateKg]: 0 }));
      return;
    }
    const parsed = parseNonNegativeInteger(raw);
    if (parsed != null) {
      setPlateCounts((prev) => ({ ...prev, [plateKg]: parsed }));
    }
  };

  const solution = mode === "target-to-plates" ? targetResult.solution : null;
  const showPlates =
    (mode === "target-to-plates" && solution != null) ||
    (mode === "plates-to-target" && fromPlatesResult.ok);
  const resultPlates: PlateCount[] =
    mode === "target-to-plates"
      ? (solution?.plates ?? [])
      : fromPlatesResult.plates;

  return (
    <ScreenContainer>
      <View className="mb-6 gap-4">
        <SegmentedControl
          accessibilityLabel="Tryb konwertera"
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
        />

        <View>
          <Text className="mb-1.5 text-label font-medium text-text-secondary">
            Gryf
          </Text>
          <SegmentedControl
            accessibilityLabel="Masa gryfu"
            options={BAR_OPTIONS}
            value={barPreset}
            onChange={setBarPreset}
          />
        </View>

        {barPreset === "custom" ? (
          <FormField
            label="Masa gryfu"
            value={customBarText}
            onChangeText={setCustomBarText}
            placeholder="np. 10"
            keyboardType="decimal-pad"
            inputMode="decimal"
            selectTextOnFocus
            trailing={<Text className="text-body text-text-secondary">kg</Text>}
          />
        ) : null}

        {mode === "target-to-plates" ? (
          <FormField
            label="Ciężar docelowy (gryf + talerze)"
            value={targetText}
            onChangeText={setTargetText}
            placeholder="np. 100"
            keyboardType="decimal-pad"
            inputMode="decimal"
            selectTextOnFocus
            size="lg"
            trailing={<Text className="text-body text-text-secondary">kg</Text>}
          />
        ) : null}
      </View>

      {mode === "plates-to-target" ? (
        <View className="mb-6">
          <SectionHeader title="Talerze na jedną stronę" />
          <AppCard padding="none" className="overflow-hidden">
            {STANDARD_PLATES_KG.map((plateKg, index) => (
              <Fragment key={plateKg}>
                {index > 0 ? <ListDivider /> : null}
                <PlateCountRow
                  plateKg={plateKg}
                  count={plateCounts[plateKg] ?? 0}
                  onBump={(delta) => bumpPlate(plateKg, delta)}
                  onChangeText={(text) => setPlateCountText(plateKg, text)}
                />
              </Fragment>
            ))}
          </AppCard>
        </View>
      ) : null}

      <View className="mb-6">
        {mode === "target-to-plates" ? (
          <TargetResultBlock
            result={targetResult}
            onPickTarget={(kg) => setTargetText(formatKg(kg))}
          />
        ) : (
          <FromPlatesResultBlock result={fromPlatesResult} />
        )}
      </View>

      {showPlates ? (
        <View>
          <SectionHeader
            title="Układ talerzy"
            subtitle="Jedna strona gryfu, od środka"
          />
          <AppCard>
            <BarbellSleeve plates={resultPlates} />
            {resultPlates.length > 0 ? (
              <View className="mt-4 gap-2">
                {resultPlates.map((item) => (
                  <PlateLegendRow key={item.plateKg} plate={item} />
                ))}
              </View>
            ) : (
              <Text className="mt-3 text-body text-text-secondary">
                Tylko gryf — talerze nie są potrzebne.
              </Text>
            )}
          </AppCard>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

function TargetResultBlock({
  result,
  onPickTarget,
}: {
  result: TargetResult;
  onPickTarget: (kg: number) => void;
}) {
  if (!result.ok || !result.solution) {
    const nearest = result.nearest;
    const hasNearest =
      nearest && (nearest.belowKg != null || nearest.aboveKg != null);
    return (
      <View className="gap-3">
        <ErrorState
          message={
            result.message ?? result.errors[0] ?? "Nieprawidłowe dane wejściowe"
          }
          details={result.errors.slice(1)}
        />
        {hasNearest ? (
          <View>
            <Text className="mb-2 text-label text-text-secondary">
              Najbliższe ciężary możliwe do ułożenia:
            </Text>
            <View className="flex-row gap-3">
              {nearest.belowKg != null ? (
                <View className="flex-1">
                  <Button
                    label={`${formatKg(nearest.belowKg)} kg`}
                    variant="secondary"
                    icon="minus"
                    onPress={() => onPickTarget(nearest.belowKg!)}
                    accessibilityHint="Ustawia ten ciężar jako docelowy"
                  />
                </View>
              ) : null}
              {nearest.aboveKg != null ? (
                <View className="flex-1">
                  <Button
                    label={`${formatKg(nearest.aboveKg)} kg`}
                    variant="secondary"
                    icon="plus"
                    onPress={() => onPickTarget(nearest.aboveKg!)}
                    accessibilityHint="Ustawia ten ciężar jako docelowy"
                  />
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  const { solution } = result;
  return (
    <ResultCard
      label="Załóż na każdą stronę"
      totalKg={solution.perSideKg}
      detail={`Gryf ${formatKg(solution.barKg)} kg · razem ${formatKg(solution.totalKg)} kg`}
    />
  );
}

function FromPlatesResultBlock({
  result,
}: {
  result: ReturnType<typeof solvePlatesToTarget>;
}) {
  if (!result.ok || result.totalKg == null) {
    return (
      <ErrorState
        message={result.errors[0] ?? "Nieprawidłowe dane wejściowe"}
      />
    );
  }
  return (
    <ResultCard
      label="Ciężar całkowity"
      totalKg={result.totalKg}
      detail={`Gryf ${formatKg(result.barKg)} kg · ${formatKg(result.perSideKg)} kg na stronę`}
    />
  );
}

function ResultCard({
  label,
  totalKg,
  detail,
}: {
  label: string;
  totalKg: number;
  detail: string;
}) {
  return (
    <AppCard variant="elevated" glow>
      <Text className="text-label font-semibold text-accent">{label}</Text>
      <Text
        accessibilityLiveRegion="polite"
        className="mt-1 text-text-primary"
        style={{
          fontSize: 44,
          lineHeight: 52,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        }}
      >
        {formatKg(totalKg)} kg
      </Text>
      <Text className="mt-1 text-body text-text-secondary">{detail}</Text>
    </AppCard>
  );
}

function PlateCountRow({
  plateKg,
  count,
  onBump,
  onChangeText,
}: {
  plateKg: number;
  count: number;
  onBump: (delta: number) => void;
  onChangeText: (text: string) => void;
}) {
  const { colors } = useTheme();
  const label = `${formatKg(plateKg)} kg`;
  return (
    <View className="min-h-[60px] flex-row items-center gap-3 px-4 py-2">
      <View
        className="w-2 rounded-full"
        style={{ height: 28, backgroundColor: plateColor(plateKg, colors) }}
      />
      <Text className="flex-1 text-card-title text-text-primary">{label}</Text>
      <IconButton
        icon="minus"
        accessibilityLabel={`Usuń talerz ${label}`}
        onPress={() => onBump(-1)}
        disabled={count <= 0}
      />
      <TextInput
        value={String(count)}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        inputMode="numeric"
        selectTextOnFocus
        accessibilityLabel={`Liczba talerzy ${label}`}
        selectionColor={colors.accent}
        style={{
          minWidth: 40,
          minHeight: 44,
          textAlign: "center",
          color: colors.textPrimary,
          fontSize: 18,
          fontWeight: "600",
          fontVariant: ["tabular-nums"],
        }}
      />
      <IconButton
        icon="plus"
        accessibilityLabel={`Dodaj talerz ${label}`}
        onPress={() => onBump(1)}
      />
    </View>
  );
}

function PlateLegendRow({ plate }: { plate: PlateCount }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-3">
      <View
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: plateColor(plate.plateKg, colors) }}
      />
      <Text className="flex-1 text-body text-text-primary">
        {formatKg(plate.plateKg)} kg
      </Text>
      <Text className="text-body font-semibold text-text-primary">
        × {plate.count}
      </Text>
    </View>
  );
}

/** Side view of one sleeve: collar on the left, heaviest plates closest to it. */
function BarbellSleeve({ plates }: { plates: PlateCount[] }) {
  const { colors } = useTheme();
  const stacked: number[] = [];
  for (const item of plates) {
    for (let i = 0; i < item.count; i += 1) {
      stacked.push(item.plateKg);
    }
  }

  return (
    <View
      accessible
      accessibilityLabel={
        stacked.length === 0
          ? "Pusty gryf"
          : `Na stronę: ${stacked.map((kg) => `${formatKg(kg)} kg`).join(", ")}`
      }
      className="min-h-[108px] flex-row items-center py-2"
    >
      <View
        className="h-4 w-4 rounded-sm"
        style={{ backgroundColor: colors.textMuted }}
      />
      <View
        className="h-8 w-2 rounded-sm"
        style={{ backgroundColor: colors.textMuted }}
      />
      <View className="flex-1 flex-row items-center">
        <View
          className="absolute left-0 right-0 h-2.5 rounded-full"
          style={{ backgroundColor: colors.border }}
        />
        <View className="flex-row flex-wrap items-center" style={{ gap: 3 }}>
          {stacked.map((plateKg, index) => (
            <View
              key={`${plateKg}-${index}`}
              className="rounded-[3px]"
              style={{
                width: plateKg >= 10 ? 12 : 9,
                height: plateHeight(plateKg),
                backgroundColor: plateColor(plateKg, colors),
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
