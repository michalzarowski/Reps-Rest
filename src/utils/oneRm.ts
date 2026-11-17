import type {
  IntensityRow,
  OneRmFormula,
  OneRmInput,
  OneRmValidationResult,
} from '@/types/oneRm';

/** Brzycki denominator hits zero at 37 reps. */
export const BRZYCKI_MAX_REPS = 36;

/**
 * Validate 1RM weight and reps.
 * weightKg > 0; reps positive integer; Brzycki requires reps ≤ 36.
 */
export function validateOneRmInput(
  input: Pick<OneRmInput, 'weightKg' | 'reps'> & {
    formula?: OneRmFormula;
  },
): OneRmValidationResult {
  const { weightKg, reps, formula } = input;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!(weightKg > 0) || !Number.isFinite(weightKg)) {
    errors.push('Ciężar musi być większy od zera');
  }

  if (!Number.isInteger(reps) || reps <= 0) {
    errors.push('Liczba powtórzeń musi być dodatnią liczbą całkowitą');
  } else {
    if (reps > 10) {
      warnings.push('Liczba powtórzeń poza zalecanym zakresem 1–10');
    }
    if (formula === 'brzycki' && reps > BRZYCKI_MAX_REPS) {
      errors.push(
        `Wzór Brzyckiego wymaga co najwyżej ${BRZYCKI_MAX_REPS} powtórzeń`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Epley: 1RM = weight × (1 + reps / 30).
 */
export function estimateOneRmEpley(
  weightKg: number,
  reps: number,
): number | null {
  if (!validateOneRmInput({ weightKg, reps, formula: 'epley' }).ok) {
    return null;
  }
  return weightKg * (1 + reps / 30);
}

/**
 * Brzycki: 1RM = weight × 36 / (37 − reps)
 */
export function estimateOneRmBrzycki(
  weightKg: number,
  reps: number,
): number | null {
  if (!validateOneRmInput({ weightKg, reps, formula: 'brzycki' }).ok) {
    return null;
  }
  return (weightKg * 36) / (37 - reps);
}

/**
 * Estimate 1RM with the selected formula after validation.
 */
export function estimateOneRm(input: OneRmInput): number | null {
  if (!validateOneRmInput(input).ok) {
    return null;
  }
  if (input.formula === 'epley') {
    return estimateOneRmEpley(input.weightKg, input.reps);
  }
  if (input.formula === 'brzycki') {
    return estimateOneRmBrzycki(input.weightKg, input.reps);
  }
  return null;
}

/** Suggested reps by % of 1RM. */
const REPS_HINT_BY_PCT: Record<number, string> = {
  100: '1',
  90: '3–4',
  80: '5–6',
  70: '8–10',
  60: '12+',
};

/**
 * Intensity table estimated from 1RM.
 * Each row: percent → working weight + reps hint.
 */
export function buildIntensityGuide(
  estimated1RmKg: number,
  percentages: number[] = [100, 90, 80, 70, 60],
): IntensityRow[] {
  if (!(estimated1RmKg > 0)) {
    return [];
  }

  return percentages.map((pct) => ({
    pct,
    weightKg: Math.round(estimated1RmKg * (pct / 100)),
    repsHint: REPS_HINT_BY_PCT[pct] ?? '—',
  }));
}

export const ONE_RM_FORMULAS: readonly OneRmFormula[] = ['epley', 'brzycki'];
