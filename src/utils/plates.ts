import { DEFAULT_BAR_WEIGHT_KG, DEFAULT_PLATES_KG } from '@/constants';
import type {
  NearestTotals,
  PlateCount,
  PlateFromCountsResult,
  PlateSolution,
  PlateTargetResult,
  PlateValidationResult,
} from '@/types/plates';

/** Work in grams to avoid IEEE-754 drift on values like 1.25 / 2.5. */
const GRAMS_PER_KG = 1000;

export const STANDARD_PLATES_KG: readonly number[] = [...DEFAULT_PLATES_KG].sort(
  (a, b) => b - a,
);

export const STANDARD_BAR_OPTIONS_KG: readonly number[] = [20, 15];

export { DEFAULT_BAR_WEIGHT_KG };

function kgToGrams(kg: number): number {
  return Math.round(kg * GRAMS_PER_KG);
}

function gramsToKg(grams: number): number {
  return grams / GRAMS_PER_KG;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function gcdAll(values: number[]): number {
  return values.reduce((acc, value) => gcd(acc, value), values[0] ?? 0);
}

function normalizePlatesKg(platesKg: readonly number[]): number[] {
  const unique = new Set<number>();
  for (const plate of platesKg) {
    if (Number.isFinite(plate) && plate > 0) {
      unique.add(gramsToKg(kgToGrams(plate)));
    }
  }
  return [...unique].sort((a, b) => b - a);
}

function toPlateCounts(
  plateGramsUsed: Map<number, number>,
): PlateCount[] {
  return [...plateGramsUsed.entries()]
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => b - a)
    .map(([grams, count]) => ({
      plateKg: gramsToKg(grams),
      count,
    }));
}

/**
 * Minimal-plate combination for an exact per-side load (grams).
 * Uses unbounded DP on a GCD-reduced space so greedy edge cases stay correct.
 */
function solvePerSideGrams(
  targetGrams: number,
  plateGrams: number[],
): Map<number, number> | null {
  if (targetGrams < 0) {
    return null;
  }
  if (targetGrams === 0) {
    return new Map();
  }
  if (plateGrams.length === 0) {
    return null;
  }

  const unit = gcdAll(plateGrams);
  if (unit <= 0 || targetGrams % unit !== 0) {
    return null;
  }

  const reducedTarget = targetGrams / unit;
  const reducedPlates = [...new Set(plateGrams.map((p) => p / unit))].sort(
    (a, b) => b - a,
  );

  const INF = Number.POSITIVE_INFINITY;
  const minPlates = new Array<number>(reducedTarget + 1).fill(INF);
  const chosen = new Array<number>(reducedTarget + 1).fill(-1);
  minPlates[0] = 0;

  for (let amount = 1; amount <= reducedTarget; amount += 1) {
    for (const plate of reducedPlates) {
      if (amount < plate) {
        continue;
      }
      const prev = minPlates[amount - plate];
      if (prev + 1 < minPlates[amount]) {
        minPlates[amount] = prev + 1;
        chosen[amount] = plate;
      }
    }
  }

  if (!Number.isFinite(minPlates[reducedTarget])) {
    return null;
  }

  const counts = new Map<number, number>();
  let remaining = reducedTarget;
  while (remaining > 0) {
    const plate = chosen[remaining];
    if (plate <= 0) {
      return null;
    }
    const realGrams = plate * unit;
    counts.set(realGrams, (counts.get(realGrams) ?? 0) + 1);
    remaining -= plate;
  }

  return counts;
}

function findNearestPerSideGrams(
  targetGrams: number,
  plateGrams: number[],
  searchLimitGrams: number,
): { below: number | null; above: number | null } {
  if (plateGrams.length === 0) {
    return { below: targetGrams === 0 ? 0 : null, above: null };
  }

  const unit = gcdAll(plateGrams);
  if (unit <= 0) {
    return { below: null, above: null };
  }

  const maxSearch = Math.max(targetGrams + searchLimitGrams, unit);
  const reducedMax = Math.floor(maxSearch / unit);
  const reducedPlates = [...new Set(plateGrams.map((p) => p / unit))];

  const achievable = new Array<boolean>(reducedMax + 1).fill(false);
  achievable[0] = true;

  for (let amount = 0; amount <= reducedMax; amount += 1) {
    if (!achievable[amount]) {
      continue;
    }
    for (const plate of reducedPlates) {
      const next = amount + plate;
      if (next <= reducedMax) {
        achievable[next] = true;
      }
    }
  }

  const targetReduced = targetGrams / unit;
  let below: number | null = null;
  let above: number | null = null;

  if (Number.isInteger(targetReduced) && achievable[targetReduced]) {
    return { below: targetGrams, above: targetGrams };
  }

  const startFloor = Number.isInteger(targetReduced)
    ? targetReduced - 1
    : Math.floor(targetReduced);

  for (let i = startFloor; i >= 0; i -= 1) {
    if (achievable[i]) {
      below = i * unit;
      break;
    }
  }

  const startCeil = Number.isInteger(targetReduced)
    ? targetReduced + 1
    : Math.ceil(targetReduced);

  for (let i = startCeil; i <= reducedMax; i += 1) {
    if (achievable[i]) {
      above = i * unit;
      break;
    }
  }

  return { below, above };
}

export function parsePositiveNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.');
  if (trimmed === '' || trimmed === '.' || trimmed === '-') {
    return null;
  }
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

export function parseNonNegativeInteger(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 0) {
    return null;
  }
  return value;
}

export function validateBarAndTarget(
  totalKg: number,
  barKg: number,
): PlateValidationResult {
  const errors: string[] = [];

  if (!Number.isFinite(barKg) || barKg <= 0) {
    errors.push('Masa gryfu musi być większa od zera');
  }
  if (!Number.isFinite(totalKg) || totalKg <= 0) {
    errors.push('Ciężar całkowity musi być większy od zera');
  }
  if (
    Number.isFinite(totalKg) &&
    Number.isFinite(barKg) &&
    barKg > 0 &&
    totalKg > 0 &&
    totalKg < barKg
  ) {
    errors.push('Ciężar całkowity nie może być mniejszy niż masa gryfu');
  }

  return { ok: errors.length === 0, errors };
}

function buildSolution(
  totalKg: number,
  barKg: number,
  plates: PlateCount[],
  exact: boolean,
): PlateSolution {
  const perSideKg = gramsToKg(kgToGrams(totalKg) - kgToGrams(barKg)) / 2;
  return {
    totalKg: gramsToKg(kgToGrams(totalKg)),
    barKg: gramsToKg(kgToGrams(barKg)),
    perSideKg,
    plates,
    exact,
  };
}

/**
 * Mode A: target total weight → plates per side (symmetric).
 */
export function solveTargetToPlates(
  totalKg: number,
  barKg: number,
  availablePlatesKg: readonly number[] = STANDARD_PLATES_KG,
): PlateTargetResult {
  const validation = validateBarAndTarget(totalKg, barKg);
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      solution: null,
      nearest: null,
      message: validation.errors[0] ?? null,
    };
  }

  const platesKg = normalizePlatesKg(availablePlatesKg);
  if (platesKg.length === 0) {
    return {
      ok: false,
      errors: ['Brak dostępnych talerzy'],
      solution: null,
      nearest: null,
      message: 'Brak dostępnych talerzy',
    };
  }

  const totalGrams = kgToGrams(totalKg);
  const barGrams = kgToGrams(barKg);
  const loadGrams = totalGrams - barGrams;

  if (loadGrams === 0) {
    return {
      ok: true,
      errors: [],
      solution: buildSolution(totalKg, barKg, [], true),
      nearest: null,
      message: null,
    };
  }

  if (loadGrams % 2 !== 0) {
    const plateGrams = platesKg.map(kgToGrams);
    const halfApprox = loadGrams / 2;
    const nearestSides = findNearestPerSideGrams(
      Math.floor(halfApprox),
      plateGrams,
      kgToGrams(50),
    );
    const nearest: NearestTotals = {
      belowKg:
        nearestSides.below == null
          ? barKg
          : gramsToKg(barGrams + nearestSides.below * 2),
      aboveKg:
        nearestSides.above == null
          ? null
          : gramsToKg(barGrams + nearestSides.above * 2),
    };

    return {
      ok: false,
      errors: [],
      solution: null,
      nearest,
      message:
        'Nie da się uzyskać dokładnie tego ciężaru przy symetrycznym obciążeniu.',
    };
  }

  const perSideGrams = loadGrams / 2;
  const plateGrams = platesKg.map(kgToGrams);
  const solved = solvePerSideGrams(perSideGrams, plateGrams);

  if (solved) {
    return {
      ok: true,
      errors: [],
      solution: buildSolution(totalKg, barKg, toPlateCounts(solved), true),
      nearest: null,
      message: null,
    };
  }

  const nearestSides = findNearestPerSideGrams(
    perSideGrams,
    plateGrams,
    kgToGrams(50),
  );
  const nearest: NearestTotals = {
    belowKg:
      nearestSides.below == null
        ? null
        : gramsToKg(barGrams + nearestSides.below * 2),
    aboveKg:
      nearestSides.above == null
        ? null
        : gramsToKg(barGrams + nearestSides.above * 2),
  };

  return {
    ok: false,
    errors: [],
    solution: null,
    nearest,
    message: 'Nie da się uzyskać dokładnie tego ciężaru z dostępnych talerzy.',
  };
}

/**
 * Mode B: plate counts per side → total barbell weight.
 */
export function solvePlatesToTarget(
  barKg: number,
  countsByPlateKg: Readonly<Record<number, number>>,
  availablePlatesKg: readonly number[] = STANDARD_PLATES_KG,
): PlateFromCountsResult {
  const errors: string[] = [];

  if (!Number.isFinite(barKg) || barKg <= 0) {
    errors.push('Masa gryfu musi być większa od zera');
  }

  const platesKg = normalizePlatesKg(availablePlatesKg);
  const plates: PlateCount[] = [];
  let perSideGrams = 0;

  for (const plateKg of platesKg) {
    const rawCount = countsByPlateKg[plateKg] ?? 0;
    if (!Number.isInteger(rawCount) || rawCount < 0) {
      errors.push(`Nieprawidłowa liczba talerzy ${plateKg} kg`);
      continue;
    }
    if (rawCount > 0) {
      plates.push({ plateKg, count: rawCount });
      perSideGrams += kgToGrams(plateKg) * rawCount;
    }
  }

  for (const key of Object.keys(countsByPlateKg)) {
    const plateKg = Number(key);
    if (!platesKg.some((p) => kgToGrams(p) === kgToGrams(plateKg))) {
      const count = countsByPlateKg[plateKg];
      if (count && count > 0) {
        errors.push(`Nieobsługiwany talerz ${plateKg} kg`);
      }
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      totalKg: null,
      barKg,
      perSideKg: 0,
      plates: [],
    };
  }

  const totalGrams = kgToGrams(barKg) + perSideGrams * 2;
  return {
    ok: true,
    errors: [],
    totalKg: gramsToKg(totalGrams),
    barKg: gramsToKg(kgToGrams(barKg)),
    perSideKg: gramsToKg(perSideGrams),
    plates,
  };
}

/** Format kg for display (trim trailing zeros). */
export function formatKg(value: number, digits = 2): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const fixed = value.toFixed(digits);
  return fixed.replace(/\.?0+$/, '');
}
