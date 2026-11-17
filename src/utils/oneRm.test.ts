import { describe, expect, it } from 'vitest';

import {
  BRZYCKI_MAX_REPS,
  buildIntensityGuide,
  estimateOneRm,
  estimateOneRmBrzycki,
  estimateOneRmEpley,
  validateOneRmInput,
} from './oneRm';

describe('estimateOneRm formulas', () => {
  it('computes Epley correctly', () => {
    // 100 × (1 + 5/30) = 116.666...
    const result = estimateOneRmEpley(100, 5);
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(116.6667, 3);
  });

  it('computes Brzycki correctly', () => {
    // 100 × 36 / (37 − 5) = 112.5
    const result = estimateOneRmBrzycki(100, 5);
    expect(result).toBe(112.5);
  });

  it('handles one repetition', () => {
    expect(estimateOneRmEpley(100, 1)).toBeCloseTo(100 * (1 + 1 / 30), 6);
    expect(estimateOneRmBrzycki(100, 1)).toBe(100);
    expect(estimateOneRm({ weightKg: 100, reps: 1, formula: 'epley' })).toBeCloseTo(
      103.3333,
      3,
    );
  });

  it('returns null for Brzycki at or above the singularity', () => {
    expect(estimateOneRmBrzycki(100, BRZYCKI_MAX_REPS + 1)).toBeNull();
    expect(
      estimateOneRm({
        weightKg: 100,
        reps: BRZYCKI_MAX_REPS + 1,
        formula: 'brzycki',
      }),
    ).toBeNull();
  });

  it('still computes Brzycki at max safe reps', () => {
    // 100 × 36 / (37 − 36) = 3600
    expect(estimateOneRmBrzycki(100, BRZYCKI_MAX_REPS)).toBe(3600);
  });
});

describe('validateOneRmInput', () => {
  it('rejects non-positive weight', () => {
    expect(validateOneRmInput({ weightKg: 0, reps: 5 }).ok).toBe(false);
    expect(validateOneRmInput({ weightKg: -10, reps: 5 }).ok).toBe(false);
  });

  it('rejects non-positive or non-integer reps', () => {
    expect(validateOneRmInput({ weightKg: 100, reps: 0 }).ok).toBe(false);
    expect(validateOneRmInput({ weightKg: 100, reps: 2.5 }).ok).toBe(false);
    expect(validateOneRmInput({ weightKg: 100, reps: -1 }).ok).toBe(false);
  });

  it('warns above 10 reps but still accepts for Epley', () => {
    const result = validateOneRmInput({
      weightKg: 100,
      reps: 12,
      formula: 'epley',
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('errors for Brzycki when reps exceed formula limit', () => {
    const result = validateOneRmInput({
      weightKg: 100,
      reps: 37,
      formula: 'brzycki',
    });
    expect(result.ok).toBe(false);
  });
});

describe('buildIntensityGuide', () => {
  it('builds percent rows from estimated 1RM', () => {
    const rows = buildIntensityGuide(100);
    expect(rows).toHaveLength(5);
    expect(rows[0]).toMatchObject({ pct: 100, weightKg: 100, repsHint: '1' });
    expect(rows.find((r) => r.pct === 80)?.weightKg).toBe(80);
  });

  it('returns empty for non-positive 1RM', () => {
    expect(buildIntensityGuide(0)).toEqual([]);
    expect(buildIntensityGuide(-1)).toEqual([]);
  });
});
