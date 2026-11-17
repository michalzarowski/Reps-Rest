import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ErrorBanner,
  GlassButton,
  GlassPanel,
  Icon,
  Screen,
  SectionHeader,
} from '@/components';
import { useIntervalTimer } from '@/hooks/useIntervalTimer';
import {
  deleteCustomPreset,
  listAllTimerPresets,
  persistCustomPreset,
} from '@/services/timerPresets';
import { colors, radii, shadows } from '@/theme';
import type { TimerPreset } from '@/types';
import type { TimerConfig } from '@/types/timer';
import {
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
  const [presets, setPresets] = useState<TimerPreset[]>([
    ...BUILTIN_TIMER_PRESETS,
  ]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    BUILTIN_TIMER_PRESETS[0]!.id,
  );
  const [draft, setDraft] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [warmupEnabled, setWarmupEnabled] = useState(
    DEFAULT_CONFIG.warmupSeconds > 0,
  );
  const [cuesEnabled, setCuesEnabled] = useState(true);
  const [countdownCues, setCountdownCues] = useState(true);
  const [presetName, setPresetName] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetsError, setPresetsError] = useState<string | null>(null);
  const [presetsLoading, setPresetsLoading] = useState(true);

  const { snapshot, start, pause, resume, reset, restart, setConfig } =
    useIntervalTimer(DEFAULT_CONFIG, {
      cuesEnabled,
      countdownCuesEnabled: countdownCues,
    });

  const isActive =
    snapshot.status === 'running' || snapshot.status === 'paused';
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
      Alert.alert('Preset', validation.errors.join('\n'));
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
      Alert.alert('Zapisano', `Preset „${preset.name}” jest dostępny lokalnie.`);
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać presetu.');
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

  const removePreset = (preset: TimerPreset) => {
    if (isBuiltinPresetId(preset.id)) {
      return;
    }
    Alert.alert('Usuń preset', `Usunąć „${preset.name}”?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => {
          void (async () => {
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
              Alert.alert('Błąd', 'Nie udało się usunąć presetu.');
            }
          })();
        },
      },
    ]);
  };

  if (isCompleted) {
    return (
      <Screen tabBarInset={false}>
        <SectionHeader
          title="Trening zakończony"
          subtitle="Podsumowanie zaplanowanej sesji"
        />
        <GlassPanel variant="elevated" className="mb-4">
          <Text className="text-caption text-aqua">Ukończone rundy</Text>
          <Text className="mt-1 text-hero text-text-primary">
            {snapshot.completedRounds}/{snapshot.totalRounds}
          </Text>
        </GlassPanel>
        <View className="mb-4 gap-3">
          <SummaryRow
            label="Zaplanowana praca"
            value={formatTimerMmSs(snapshot.plannedWorkMs)}
          />
          <SummaryRow
            label="Zaplanowane przerwy"
            value={formatTimerMmSs(snapshot.plannedRestMs)}
          />
          {snapshot.plannedWarmupMs > 0 ? (
            <SummaryRow
              label="Przygotowanie"
              value={formatTimerMmSs(snapshot.plannedWarmupMs)}
            />
          ) : null}
          <SummaryRow
            label="Łączny czas sesji"
            value={formatTimerMmSs(snapshot.totalSessionMs)}
          />
        </View>
        <Text className="mb-4 text-caption text-text-secondary">
          Czasy powyżej to plan treningu, nie pomiar faktycznie odbytej pracy przy
          wcześniejszym przerwaniu.
        </Text>
        <View className="gap-3">
          <GlassButton label="Uruchom ponownie" onPress={() => restart()} />
          <GlassButton
            label="Wróć do konfiguracji"
            variant="secondary"
            onPress={() => reset()}
          />
        </View>
      </Screen>
    );
  }

  if (isActive) {
    const roundLabel =
      snapshot.phase === 'preparation'
        ? 'Przed startem'
        : `Runda ${snapshot.currentRound}/${snapshot.totalRounds}`;

    return (
      <Screen tabBarInset={false}>
        <SectionHeader
          title="Timer interwałowy"
          subtitle={
            snapshot.status === 'paused' ? 'Wstrzymano' : 'Sesja w toku'
          }
        />

        <View className="mb-6 items-center">
          <ProgressRing
            progress={snapshot.phaseProgress}
            phase={snapshot.phase}
            label={phaseDisplayName(snapshot.phase)}
            timeLabel={formatTimerMmSs(snapshot.remainingMs)}
            subtitle={roundLabel}
          />
        </View>

        {snapshot.nextPhaseLabel ? (
          <GlassPanel variant="soft" className="mb-6">
            <Text className="text-center text-caption text-text-secondary">
              Następna faza
            </Text>
            <Text className="mt-1 text-center text-body font-semibold text-text-primary">
              {snapshot.nextPhaseLabel}
            </Text>
          </GlassPanel>
        ) : null}

        <View className="flex-row items-center justify-center gap-8">
          <ControlButton
            icon="rotateCcw"
            label="Reset"
            onPress={() => reset()}
          />
          <Pressable
            onPress={() => {
              if (snapshot.status === 'paused') {
                resume();
              } else {
                pause();
              }
            }}
            style={[
              {
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: colors.aqua,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadows.softGlow,
            ]}
          >
            <Icon
              name={snapshot.status === 'paused' ? 'play' : 'pause'}
              color={colors.deepWater}
              size="lg"
            />
          </Pressable>
          <View style={{ width: 64 }} />
        </View>
        <Text className="mt-4 text-center text-caption text-text-muted">
          Sygnały działają przy otwartej aplikacji — nie są alarmami w tle.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen tabBarInset={false}>
      <SectionHeader
        title="Timer interwałowy"
        subtitle="Konfiguracja rund, przerw i presetów"
      />

      {presetsError ? (
        <View className="mb-3">
          <ErrorBanner message={presetsError} />
        </View>
      ) : null}

      <SectionHeader title="Presety" />
      <View className="mb-4 flex-row flex-wrap gap-2">
        {presets.map((preset) => {
          const active = selectedPresetId === preset.id;
          const builtin = isBuiltinPresetId(preset.id);
          return (
            <View key={preset.id} style={{ width: '48%' }}>
              <Pressable
                onPress={() => loadPreset(preset)}
                onLongPress={() => {
                  if (!builtin) {
                    beginEditPreset(preset);
                  }
                }}
                style={{
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: active ? colors.aqua : colors.glassBorder,
                  backgroundColor: active ? colors.activeGlow : colors.glassFill,
                  padding: 12,
                  minHeight: 72,
                }}
              >
                <Text
                  style={{
                    color: active ? colors.aqua : colors.textPrimary,
                    fontWeight: '700',
                    fontSize: 14,
                  }}
                  numberOfLines={1}
                >
                  {preset.name}
                </Text>
                <Text className="mt-1 text-caption text-text-secondary">
                  {preset.workSeconds}s / {preset.restSeconds}s · {preset.rounds}r
                </Text>
                {!builtin ? (
                  <View className="mt-2 flex-row gap-3">
                    <Pressable
                      onPress={() => beginEditPreset(preset)}
                      hitSlop={8}
                    >
                      <Text className="text-caption text-aqua">Edytuj</Text>
                    </Pressable>
                    <Pressable onPress={() => removePreset(preset)} hitSlop={8}>
                      <Text style={{ color: colors.danger, fontSize: 13 }}>
                        Usuń
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text className="mt-2 text-caption text-text-muted">
                    Wbudowany
                  </Text>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
      {presetsLoading ? (
        <Text className="mb-3 text-caption text-text-secondary">
          Ładowanie presetów…
        </Text>
      ) : null}

      <View className="mb-4 gap-3">
        <StepperField
          label="Praca (s)"
          value={draft.workSeconds}
          onDecrement={() => bump('workSeconds', -5, 5)}
          onIncrement={() => bump('workSeconds', 5, 5)}
        />
        <StepperField
          label="Przerwa (s)"
          value={draft.restSeconds}
          onDecrement={() => bump('restSeconds', -5, 0)}
          onIncrement={() => bump('restSeconds', 5, 0)}
        />
        <StepperField
          label="Rundy"
          value={draft.rounds}
          onDecrement={() => bump('rounds', -1, 1)}
          onIncrement={() => bump('rounds', 1, 1)}
        />
      </View>

      <GlassPanel variant="soft" className="mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-body text-text-primary">Przygotowanie</Text>
          <ToggleChip
            active={warmupEnabled}
            label={warmupEnabled ? 'Wł.' : 'Wył.'}
            onPress={() => {
              setSelectedPresetId(null);
              setWarmupEnabled((v) => {
                const next = !v;
                if (next) {
                  setDraft((prev) => ({
                    ...prev,
                    warmupSeconds: prev.warmupSeconds > 0 ? prev.warmupSeconds : 5,
                  }));
                }
                return next;
              });
            }}
          />
        </View>
        {warmupEnabled ? (
          <View className="mt-3">
            <StepperField
              label="Czas przygotowania (s)"
              value={Math.max(5, draft.warmupSeconds || 5)}
              onDecrement={() => bump('warmupSeconds', -5, 5)}
              onIncrement={() => bump('warmupSeconds', 5, 5)}
            />
          </View>
        ) : null}
      </GlassPanel>

      <GlassPanel variant="soft" className="mb-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-body text-text-primary">Sygnały haptyczne</Text>
          <ToggleChip
            active={cuesEnabled}
            label={cuesEnabled ? 'Wł.' : 'Wył.'}
            onPress={() => setCuesEnabled((v) => !v)}
          />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-caption text-text-secondary">
            Odliczanie ostatnich 3 s
          </Text>
          <ToggleChip
            active={countdownCues}
            label={countdownCues ? 'Wł.' : 'Wył.'}
            onPress={() => setCountdownCues((v) => !v)}
          />
        </View>
      </GlassPanel>

      <GlassPanel variant="solid" className="mb-4">
        <Text className="mb-2 text-caption text-text-secondary">
          {editingPresetId ? 'Edytuj preset' : 'Zapisz jako własny preset'}
        </Text>
        <TextInput
          value={presetName}
          onChangeText={setPresetName}
          placeholder="Nazwa, np. Obwód A"
          placeholderTextColor={colors.textMuted}
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
            paddingVertical: 6,
          }}
        />
        <View className="mt-3 flex-row gap-2">
          <View className="flex-1">
            <GlassButton
              label={editingPresetId ? 'Zapisz zmiany' : 'Zapisz preset'}
              size="sm"
              onPress={() => void savePreset()}
            />
          </View>
          {editingPresetId ? (
            <View className="flex-1">
              <GlassButton
                label="Anuluj"
                size="sm"
                variant="secondary"
                onPress={() => {
                  setEditingPresetId(null);
                  setPresetName('');
                }}
              />
            </View>
          ) : null}
        </View>
      </GlassPanel>

      {!configValidation.ok ? (
        <View className="mb-3">
          <ErrorBanner message={configValidation.errors[0]!} />
        </View>
      ) : null}

      <GlassButton
        label="Start"
        onPress={handleStart}
        disabled={!configValidation.ok}
      />
      <Text className="mt-3 text-center text-caption text-text-muted">
        Po ostatniej rundzie trening kończy się bez dodatkowej przerwy.
      </Text>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <GlassPanel variant="soft">
      <View className="flex-row items-center justify-between">
        <Text className="text-caption text-text-secondary">{label}</Text>
        <Text className="text-body font-semibold text-text-primary">{value}</Text>
      </View>
    </GlassPanel>
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

function ToggleChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: radii.pill,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: active ? colors.aqua : colors.glassBorder,
        backgroundColor: active ? colors.activeGlow : colors.glassFill,
      }}
    >
      <Text style={{ color: active ? colors.aqua : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
}: {
  icon: 'rotateCcw';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="items-center">
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          backgroundColor: colors.glassFill,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} color={colors.textSecondary} />
      </View>
      <Text className="mt-2 text-caption text-text-secondary">{label}</Text>
    </Pressable>
  );
}

const chipStyle = {
  width: 40,
  height: 40,
  borderRadius: radii.pill,
  borderWidth: 1,
  borderColor: colors.glassBorder,
  backgroundColor: colors.glassFill,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
