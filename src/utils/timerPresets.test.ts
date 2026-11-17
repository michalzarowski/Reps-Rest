import { describe, expect, it } from 'vitest';

import {
  BUILTIN_TIMER_PRESETS,
  createCustomPreset,
  isBuiltinPresetId,
  mergePresetLists,
  presetToConfig,
  removeCustomPreset,
  upsertCustomPreset,
  validatePresetInput,
} from './timerPresets';

describe('builtin presets', () => {
  it('exposes boxing / tabata / calisthenics / strength', () => {
    const names = BUILTIN_TIMER_PRESETS.map((p) => p.name);
    expect(names).toEqual(['Boxing', 'Tabata', 'Calisthenics', 'Strength']);
    for (const preset of BUILTIN_TIMER_PRESETS) {
      expect(isBuiltinPresetId(preset.id)).toBe(true);
      expect(presetToConfig(preset).workSeconds).toBeGreaterThan(0);
    }
  });
});

describe('custom preset helpers', () => {
  it('validates preset name and config', () => {
    expect(
      validatePresetInput({
        name: '',
        rounds: 3,
        workSeconds: 30,
        restSeconds: 10,
        warmupSeconds: 0,
      }).ok,
    ).toBe(false);

    expect(
      validatePresetInput({
        name: 'Obwód',
        rounds: 3,
        workSeconds: 30,
        restSeconds: 10,
        warmupSeconds: 0,
      }).ok,
    ).toBe(true);
  });

  it('creates, upserts and removes custom presets without touching builtins', () => {
    const created = createCustomPreset({
      name: 'Custom A',
      rounds: 4,
      workSeconds: 40,
      restSeconds: 20,
      warmupSeconds: 5,
    });
    expect(isBuiltinPresetId(created.id)).toBe(false);

    const afterCreate = upsertCustomPreset([], created);
    expect(afterCreate).toHaveLength(1);

    const renamed = { ...created, name: 'Custom B' };
    const afterUpdate = upsertCustomPreset(afterCreate, renamed);
    expect(afterUpdate).toHaveLength(1);
    expect(afterUpdate[0]?.name).toBe('Custom B');

    const merged = mergePresetLists(afterUpdate);
    expect(merged.length).toBe(BUILTIN_TIMER_PRESETS.length + 1);

    const afterDelete = removeCustomPreset(afterUpdate, created.id);
    expect(afterDelete).toHaveLength(0);
    expect(() =>
      removeCustomPreset([], BUILTIN_TIMER_PRESETS[0]!.id),
    ).toThrow();
  });
});
