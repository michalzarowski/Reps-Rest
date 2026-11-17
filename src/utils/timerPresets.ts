import type { TimerPreset } from '@/types';
import type { TimerConfig, TimerValidationResult } from '@/types/timer';

import { validateTimerConfig } from './timerEngine';

function createPresetId(): string {
  return `preset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export const BUILTIN_PRESET_PREFIX = 'builtin:';

export const BUILTIN_TIMER_PRESETS: readonly TimerPreset[] = [
  {
    id: `${BUILTIN_PRESET_PREFIX}boxing`,
    name: 'Boxing',
    rounds: 3,
    workSeconds: 180,
    restSeconds: 60,
    warmupSeconds: 10,
  },
  {
    id: `${BUILTIN_PRESET_PREFIX}tabata`,
    name: 'Tabata',
    rounds: 8,
    workSeconds: 20,
    restSeconds: 10,
    warmupSeconds: 5,
  },
  {
    id: `${BUILTIN_PRESET_PREFIX}calisthenics`,
    name: 'Calisthenics',
    rounds: 5,
    workSeconds: 45,
    restSeconds: 15,
    warmupSeconds: 5,
  },
  {
    id: `${BUILTIN_PRESET_PREFIX}strength`,
    name: 'Strength',
    rounds: 4,
    workSeconds: 30,
    restSeconds: 120,
    warmupSeconds: 10,
  },
] as const;

export function isBuiltinPresetId(id: string): boolean {
  return id.startsWith(BUILTIN_PRESET_PREFIX);
}

export function presetToConfig(preset: TimerPreset): TimerConfig {
  return {
    rounds: preset.rounds,
    workSeconds: preset.workSeconds,
    restSeconds: preset.restSeconds,
    warmupSeconds: preset.warmupSeconds ?? 0,
  };
}

export function validatePresetInput(input: {
  name: string;
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  warmupSeconds: number;
}): TimerValidationResult {
  const errors: string[] = [];
  const name = input.name.trim();
  if (name.length === 0) {
    errors.push('Nazwa presetu jest wymagana');
  } else if (name.length > 40) {
    errors.push('Nazwa presetu może mieć maksymalnie 40 znaków');
  }

  const configErrors = validateTimerConfig({
    rounds: input.rounds,
    workSeconds: input.workSeconds,
    restSeconds: input.restSeconds,
    warmupSeconds: input.warmupSeconds,
  }).errors;

  return { ok: errors.length + configErrors.length === 0, errors: [...errors, ...configErrors] };
}

export function createCustomPreset(input: {
  name: string;
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  warmupSeconds: number;
}): TimerPreset {
  return {
    id: createPresetId(),
    name: input.name.trim(),
    rounds: input.rounds,
    workSeconds: input.workSeconds,
    restSeconds: input.restSeconds,
    warmupSeconds: input.warmupSeconds,
  };
}

export function mergePresetLists(
  custom: readonly TimerPreset[],
): TimerPreset[] {
  const customOnly = custom.filter((p) => !isBuiltinPresetId(p.id));
  return [...BUILTIN_TIMER_PRESETS, ...customOnly];
}

export function upsertCustomPreset(
  existing: readonly TimerPreset[],
  preset: TimerPreset,
): TimerPreset[] {
  if (isBuiltinPresetId(preset.id)) {
    throw new Error('Nie można nadpisać wbudowanego presetu');
  }
  const without = existing.filter(
    (p) => p.id !== preset.id && !isBuiltinPresetId(p.id),
  );
  return [...without, preset];
}

export function removeCustomPreset(
  existing: readonly TimerPreset[],
  id: string,
): TimerPreset[] {
  if (isBuiltinPresetId(id)) {
    throw new Error('Nie można usunąć wbudowanego presetu');
  }
  return existing.filter((p) => p.id !== id && !isBuiltinPresetId(p.id));
}
