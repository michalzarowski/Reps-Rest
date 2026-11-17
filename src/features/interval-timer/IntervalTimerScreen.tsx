import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Switch, Text, useWindowDimensions, View } from 'react-native';

import {
  AppCard,
  Button,
  ErrorState,
  FormField,
  GlassSurface,
  IconButton,
  ScreenContainer,
  SectionHeader,
  Stepper,
  confirmAction,
  showMessage,
} from '@/components';
import { useTheme } from '@/context';
import { useIntervalTimer } from '@/hooks/useIntervalTimer';
import {
  deleteCustomPreset,
  listAllTimerPresets,
  persistCustomPreset,
} from '@/services/timerPresets';
import type { TimerPreset } from '@/types';
import type { TimerConfig } from '@/types/timer';
import {
  computePlannedDurations,
  formatTimerMmSs,
  phaseDisplayName,
  validateTimerConfig,
} from '@/utils/timerEngine';
import {
  BUILTIN_TIMER_PRESETS,
  createCustomPreset,
  isBuiltinPresetId,
  presetToConfig,
  validatePresetInput,
} from '@/utils/timerPresets';

import { ProgressRing } from './ProgressRing';

const DEFAULT_CONFIG: TimerConfig = presetToConfig(BUILTIN_TIMER_PRESETS[0]!);

export function IntervalTimerScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [presets, setPresets] = useState<TimerPreset[]>([...BUILTIN_TIMER_PRESETS]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    BUILTIN_TIMER_PRESETS[0]!.id,
  );
  const [draft, setDraft] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [warmupEnabled, setWarmupEnabled] = useState(DEFAULT_CONFIG.warmupSeconds > 0);
  const [cuesEnabled, setCuesEnabled] = useState(true);
  const [countdownCues, setCountdownCues] = useState(true);
  const [presetName, setPresetName] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetsError, setPresetsError] = useState<string | null>(null);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [presetNotice, setPresetNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!presetNotice) {
      return;
    }
    const id = setTimeout(() => setPresetNotice(null), 3000);
    return () => clearTimeout(id);
  }, [presetNotice]);

  const { snapshot, start, pause, resume, reset, restart, setConfig } = useIntervalTimer(
    DEFAULT_CONFIG,
    {
      cuesEnabled,
      countdownCuesEnabled: countdownCues,
    },
  );

  const isActive = snapshot.status === 'running' || snapshot.status === 'paused';
  const isCompleted = snapshot.status === 'completed';

  const configValidation = useMemo(
    () =>
      validateTimerConfig({
        ...draft,
        warmupSeconds: warmupEnabled ? draft.warmupSeconds : 0,
      }),
    [draft, warmupEnabled],
  );

  const reloadPresets = useCallback(async () => {
    setPresetsLoading(true);
    setPresetsError(null);
    try {
      const list = await listAllTimerPresets();
      setPresets(list);
    } catch {
      setPresetsError('Nie udało się wczytać zapisanych presetów.');
      setPresets([...BUILTIN_TIMER_PRESETS]);
    } finally {
      setPresetsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadPresets();
  }, [reloadPresets]);

  const applyConfig = useCallback(
    (config: TimerConfig, presetId: string | null) => {
      const next: TimerConfig = {
        ...config,
        warmupSeconds: config.warmupSeconds,
      };
      setDraft(next);
      setWarmupEnabled(next.warmupSeconds > 0);
      setSelectedPresetId(presetId);
      setConfig(next);
    },
    [setConfig],
  );

  const loadPreset = (preset: TimerPreset) => {
    if (isActive || isCompleted) {
      reset();
    }
    applyConfig(presetToConfig(preset), preset.id);
    setEditingPresetId(null);
    setPresetName('');
  };

  const bump = (key: keyof TimerConfig, delta: number, min: number) => {
    setSelectedPresetId(null);
    setDraft((prev) => ({
      ...prev,
      [key]: Math.max(min, prev[key] + delta),
    }));
  };

  const effectiveConfig = useMemo<TimerConfig>(
    () => ({
      ...draft,
      warmupSeconds: warmupEnabled ? Math.max(0, draft.warmupSeconds) : 0,
    }),
    [draft, warmupEnabled],
  );

  const handleStart = () => {
    if (!configValidation.ok) {
      return;
    }
    setConfig(effectiveConfig);
    start();
  };

  const savePreset = async () => {
    const input = {
      name: presetName,
      ...effectiveConfig,
    };
    const validation = validatePresetInput(input);
    if (!validation.ok) {
      showMessage('Preset', validation.errors.join('\n'));
      return;
    }

    try {
      let preset: TimerPreset;
      if (editingPresetId && !isBuiltinPresetId(editingPresetId)) {
        preset = {
          id: editingPresetId,
          name: input.name.trim(),
          rounds: input.rounds,
          workSeconds: input.workSeconds,
          restSeconds: input.restSeconds,
          warmupSeconds: input.warmupSeconds,
        };
      } else {
        preset = createCustomPreset(input);
      }
      const list = await persistCustomPreset(preset);
      setPresets(list);
      setSelectedPresetId(preset.id);
      setEditingPresetId(null);
      setPresetName('');
      setPresetNotice(`Zapisano preset „${preset.name}”.`);
    } catch {
      showMessage('Błąd', 'Nie udało się zapisać presetu.');
    }
  };

  const beginEditPreset = (preset: TimerPreset) => {
    if (isBuiltinPresetId(preset.id)) {
      return;
    }
    loadPreset(preset);
    setEditingPresetId(preset.id);
    setPresetName(preset.name);
  };

  const removePreset = async (preset: TimerPreset) => {
    if (isBuiltinPresetId(preset.id)) {
      return;
    }
    const confirmed = await confirmAction({
      title: 'Usuń preset',
      message: `Usunąć „${preset.name}”?`,
      confirmLabel: 'Usuń',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      const list = await deleteCustomPreset(preset.id);
      setPresets(list);
      if (selectedPresetId === preset.id) {
        setSelectedPresetId(null);
      }
      if (editingPresetId === preset.id) {
        setEditingPresetId(null);
        setPresetName('');
      }
    } catch {
      showMessage('Błąd', 'Nie udało się usunąć presetu.');
    }
  };

  const plannedTotal = formatTimerMmSs(computePlannedDurations(effectiveConfig).totalMs);
  const ringSize = Math.min(280, Math.max(200, width - 96));

  if (isCompleted) {
    return (
      <ScreenContainer>
        <AppCard variant="elevated" glow className="mb-6" contentClassName="items-center">
          <Text className="text-label font-semibold text-success">Trening zakończony</Text>
          <Text
            className="mt-1 text-text-primary"
            style={{
              fontSize: 44,
              lineHeight: 52,
              fontWeight: '700',
              fontVariant: ['tabular-nums'],
            }}
          >
            {snapshot.completedRounds}/{snapshot.totalRounds}
          </Text>
          <Text className="text-body text-text-secondary">ukończonych rund</Text>
        </AppCard>

        <AppCard padding="none" className="mb-3 overflow-hidden">
          <SummaryRow label="Zaplanowana praca" value={formatTimerMmSs(snapshot.plannedWorkMs)} />
          <SummaryRow label="Zaplanowane przerwy" value={formatTimerMmSs(snapshot.plannedRestMs)} />
          {snapshot.plannedWarmupMs > 0 ? (
            <SummaryRow label="Przygotowanie" value={formatTimerMmSs(snapshot.plannedWarmupMs)} />
          ) : null}
          <SummaryRow
            label="Łączny czas sesji"
            value={formatTimerMmSs(snapshot.totalSessionMs)}
            last
          />
        </AppCard>
        <Text className="mb-6 text-label text-text-muted">
          Czasy powyżej to plan treningu, a nie pomiar faktycznie wykonanej pracy.
        </Text>
        <View className="gap-3">
          <Button label="Uruchom ponownie" icon="refresh" onPress={() => restart()} />
          <Button label="Wróć do ustawień" variant="secondary" onPress={() => reset()} />
        </View>
      </ScreenContainer>
    );
  }

  if (isActive) {
    const paused = snapshot.status === 'paused';
    const roundLabel =
      snapshot.phase === 'preparation'
        ? 'Przed startem'
        : `Runda ${snapshot.currentRound} z ${snapshot.totalRounds}`;

    return (
      <ScreenContainer contentStyle={{ justifyContent: 'center' }}>
        <View className="items-center">
          <ProgressRing
            size={ringSize}
            progress={snapshot.phaseProgress}
            phase={snapshot.phase}
            label={paused ? 'Wstrzymano' : phaseDisplayName(snapshot.phase)}
            timeLabel={formatTimerMmSs(snapshot.remainingMs)}
            subtitle={roundLabel}
          />
          {snapshot.nextPhaseLabel ? (
            <Text className="mt-4 text-body text-text-secondary">
              Dalej:{' '}
              <Text className="font-semibold text-text-primary">{snapshot.nextPhaseLabel}</Text>
            </Text>
          ) : null}
        </View>

        <View className="mt-8 flex-row items-center justify-center gap-8">
          <View className="items-center">
            <IconButton
              icon="rotateCcw"
              size={48}
              accessibilityLabel="Zakończ i zresetuj sesję"
              onPress={() => {
                void (async () => {
                  const confirmed = await confirmAction({
                    title: 'Zakończyć sesję?',
                    message: 'Licznik wróci do ustawień początkowych.',
                    confirmLabel: 'Zakończ',
                    destructive: true,
                  });
                  if (confirmed) reset();
                })();
              }}
            />
            <Text className="mt-1.5 text-label text-text-secondary">Reset</Text>
          </View>
          <View className="items-center">
            <IconButton
              icon={paused ? 'play' : 'pause'}
              variant="accent"
              size={72}
              accessibilityLabel={paused ? 'Wznów' : 'Wstrzymaj'}
              onPress={() => (paused ? resume() : pause())}
            />
            <Text className="mt-1.5 text-label font-semibold text-text-primary">
              {paused ? 'Wznów' : 'Pauza'}
            </Text>
          </View>
          {/* Keeps the main control centred. */}
          <View style={{ width: 48 }} />
        </View>

        <Text className="mt-8 text-center text-label text-text-muted">
          Sygnały działają przy otwartej aplikacji — nie są alarmami w tle.
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Summary + start first: the main action is reachable without scrolling. */}
      <AppCard variant="elevated" glow className="mb-8">
        <Text className="text-label text-text-secondary">Sesja</Text>
        <Text className="mt-0.5 text-card-title text-text-primary">
          {draft.rounds} × {draft.workSeconds} s pracy / {draft.restSeconds} s przerwy
        </Text>
        <Text className="mt-0.5 text-label text-text-secondary">
          Łącznie ok. {plannedTotal}
          {warmupEnabled ? ` · z przygotowaniem ${Math.max(5, draft.warmupSeconds || 5)} s` : ''}
        </Text>
        {!configValidation.ok ? (
          <View className="mt-3">
            <ErrorState message={configValidation.errors[0]!} />
          </View>
        ) : null}
        <View className="mt-4">
          <Button label="Start" icon="play" onPress={handleStart} disabled={!configValidation.ok} />
        </View>
      </AppCard>

      <View className="mb-8">
        <SectionHeader title="Presety" />
        {presetsError ? (
          <View className="mb-3">
            <ErrorState
              message={presetsError}
              actionLabel="Spróbuj ponownie"
              onActionPress={() => void reloadPresets()}
            />
          </View>
        ) : null}
        <View className="flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
          {presets.map((preset) => {
            const active = selectedPresetId === preset.id;
            const builtin = isBuiltinPresetId(preset.id);
            return (
              <View key={preset.id} style={{ width: '50%', padding: 5 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Preset ${preset.name}: ${preset.workSeconds} sekund pracy, ${preset.restSeconds} sekund przerwy, ${preset.rounds} rund`}
                  onPress={() => loadPreset(preset)}
                  onLongPress={() => {
                    if (!builtin) beginEditPreset(preset);
                  }}
                >
                  {({ pressed }) => (
                    <GlassSurface
                      radius={14}
                      intensity="subtle"
                      glow={active}
                      pressed={pressed}
                      contentClassName="min-h-[64px] p-3"
                    >
                      <Text
                        numberOfLines={1}
                        className={`text-body font-semibold ${active ? 'text-accent' : 'text-text-primary'}`}
                      >
                        {preset.name}
                      </Text>
                      <Text className="mt-0.5 text-label text-text-secondary">
                        {preset.workSeconds}/{preset.restSeconds} s · {preset.rounds} r.
                      </Text>
                    </GlassSurface>
                  )}
                </Pressable>
                {!builtin ? (
                  <View className="mt-1 flex-row justify-end gap-1">
                    <IconButton
                      icon="pencil"
                      variant="plain"
                      accessibilityLabel={`Edytuj preset ${preset.name}`}
                      onPress={() => beginEditPreset(preset)}
                    />
                    <IconButton
                      icon="trash"
                      variant="plain"
                      accessibilityLabel={`Usuń preset ${preset.name}`}
                      onPress={() => void removePreset(preset)}
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
        {presetsLoading ? (
          <Text className="mt-2 text-label text-text-secondary">Ładowanie presetów…</Text>
        ) : null}
      </View>

      <View className="mb-8">
        <SectionHeader title="Ustawienia" />
        <View className="gap-3">
          <Stepper
            label="Praca"
            value={draft.workSeconds}
            unit="s"
            onDecrement={() => bump('workSeconds', -5, 5)}
            onIncrement={() => bump('workSeconds', 5, 5)}
            decrementDisabled={draft.workSeconds <= 5}
          />
          <Stepper
            label="Przerwa"
            value={draft.restSeconds}
            unit="s"
            onDecrement={() => bump('restSeconds', -5, 0)}
            onIncrement={() => bump('restSeconds', 5, 0)}
            decrementDisabled={draft.restSeconds <= 0}
          />
          <Stepper
            label="Rundy"
            value={draft.rounds}
            onDecrement={() => bump('rounds', -1, 1)}
            onIncrement={() => bump('rounds', 1, 1)}
            decrementDisabled={draft.rounds <= 1}
          />
        </View>
      </View>

      <View className="mb-8">
        <SectionHeader title="Opcje" />
        <AppCard padding="none" className="overflow-hidden">
          <SwitchRow
            label="Odliczanie przed startem"
            value={warmupEnabled}
            onValueChange={(next) => {
              setSelectedPresetId(null);
              if (next) {
                setDraft((prev) => ({
                  ...prev,
                  warmupSeconds: prev.warmupSeconds > 0 ? prev.warmupSeconds : 5,
                }));
              }
              setWarmupEnabled(next);
            }}
          />
          {warmupEnabled ? (
            <View className="px-3 pb-3">
              <Stepper
                label="Czas przygotowania"
                value={Math.max(5, draft.warmupSeconds || 5)}
                unit="s"
                onDecrement={() => bump('warmupSeconds', -5, 5)}
                onIncrement={() => bump('warmupSeconds', 5, 5)}
                decrementDisabled={draft.warmupSeconds <= 5}
              />
            </View>
          ) : null}
          <View className="ml-4 h-px bg-border" />
          <SwitchRow label="Sygnały haptyczne" value={cuesEnabled} onValueChange={setCuesEnabled} />
          <View className="ml-4 h-px bg-border" />
          <SwitchRow
            label="Odliczanie ostatnich 3 s"
            value={countdownCues}
            onValueChange={setCountdownCues}
          />
        </AppCard>
      </View>

      <View>
        <SectionHeader title={editingPresetId ? 'Edytuj preset' : 'Zapisz jako preset'} />
        <AppCard>
          <FormField
            label="Nazwa presetu"
            value={presetName}
            onChangeText={setPresetName}
            placeholder="np. Obwód A"
            returnKeyType="done"
            onSubmitEditing={() => void savePreset()}
          />
          {presetNotice ? (
            <Text accessibilityLiveRegion="polite" className="mt-2 text-label text-success">
              {presetNotice}
            </Text>
          ) : null}
          <View className="mt-3 flex-row gap-3">
            <View className="flex-1">
              <Button
                label={editingPresetId ? 'Zapisz zmiany' : 'Zapisz preset'}
                variant="secondary"
                onPress={() => void savePreset()}
              />
            </View>
            {editingPresetId ? (
              <View className="flex-1">
                <Button
                  label="Anuluj"
                  variant="ghost"
                  onPress={() => {
                    setEditingPresetId(null);
                    setPresetName('');
                  }}
                />
              </View>
            ) : null}
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

function SummaryRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`min-h-[52px] flex-row items-center justify-between px-4 py-3 ${
        last ? '' : 'border-b border-border'
      }`}
    >
      <Text className="text-body text-text-secondary">{label}</Text>
      <Text
        className="text-body font-semibold text-text-primary"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
    </View>
  );
}

function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View className="min-h-[56px] flex-row items-center gap-3 px-4 py-2">
      <Text className="flex-1 text-body text-text-primary">{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}
