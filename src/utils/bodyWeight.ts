import type {
  BmiBand,
  BmiResult,
  BodyGoal,
  BodyWeightDraft,
  BodyWeightEntry,
  WeightTrend,
} from '@/types';

import { isValidIsoDate } from './records';

/** Plausible adult body-weight range accepted by the form, kg. */
export const BODY_WEIGHT_MIN_KG = 20;
export const BODY_WEIGHT_MAX_KG = 350;

/** Plausible adult height range accepted by the form, cm. */
export const HEIGHT_MIN_CM = 100;
export const HEIGHT_MAX_CM = 250;

/** Trend looks at measurements from this many days before the latest one. */
export const TREND_WINDOW_DAYS = 30;
/** Minimum span between first and last measurement to describe a trend. */
export const TREND_MIN_SPAN_DAYS = 7;
/** Average weekly change below this (kg) counts as stable. */
export const TREND_STABLE_KG_PER_WEEK = 0.2;

const DAY_MS = 24 * 60 * 60 * 1000;

function createBodyWeightId(): string {
  return `bw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Days between two YYYY-MM-DD dates (b − a), calendar-based, DST-safe. */
export function daysBetween(a: string, b: string): number {
  const toUtc = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / DAY_MS);
}

function parseDecimal(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/** Accepts Polish comma decimals. Returns null outside the plausible range. */
export function parseBodyWeight(raw: string): number | null {
  const value = parseDecimal(raw);
  if (value == null || value < BODY_WEIGHT_MIN_KG || value > BODY_WEIGHT_MAX_KG) {
    return null;
  }
  return roundTo(value, 2);
}

/** Height in centimetres. Returns null outside the plausible range. */
export function parseHeightCm(raw: string): number | null {
  const value = parseDecimal(raw);
  if (value == null || value < HEIGHT_MIN_CM || value > HEIGHT_MAX_CM) {
    return null;
  }
  return roundTo(value, 1);
}

export const BODY_WEIGHT_ERROR = `Masa ciała musi być liczbą od ${BODY_WEIGHT_MIN_KG} do ${BODY_WEIGHT_MAX_KG} kg`;
export const HEIGHT_ERROR = `Wzrost musi być liczbą od ${HEIGHT_MIN_CM} do ${HEIGHT_MAX_CM} cm`;
const DATE_ERROR = 'Data musi mieć format RRRR-MM-DD';
const DUPLICATE_DATE_ERROR = 'Dla tej daty jest już zapisany pomiar. Edytuj istniejący wpis.';
const FUTURE_DATE_ERROR = 'Data pomiaru nie może być z przyszłości';

/**
 * Validate the weight form. `existing` + `editingId` enforce one measurement
 * per day; `today` rejects future dates.
 */
export function parseAndValidateBodyWeightForm(input: {
  weightText: string;
  dateText: string;
  existing?: readonly BodyWeightEntry[];
  editingId?: string | null;
  today?: string;
}): { ok: true; draft: BodyWeightDraft } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const weightKg = parseBodyWeight(input.weightText);
  if (weightKg == null) {
    errors.push(BODY_WEIGHT_ERROR);
  }

  const date = input.dateText.trim();
  if (!isValidIsoDate(date)) {
    errors.push(DATE_ERROR);
  } else {
    if (input.today && date > input.today) {
      errors.push(FUTURE_DATE_ERROR);
    }
    const clash = input.existing?.find(
      (entry) => entry.date === date && entry.id !== input.editingId,
    );
    if (clash) {
      errors.push(DUPLICATE_DATE_ERROR);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, draft: { date, weightKg: weightKg! } };
}

function assertValidDraft(draft: BodyWeightDraft): void {
  const errors: string[] = [];
  if (
    !Number.isFinite(draft.weightKg) ||
    draft.weightKg < BODY_WEIGHT_MIN_KG ||
    draft.weightKg > BODY_WEIGHT_MAX_KG
  ) {
    errors.push(BODY_WEIGHT_ERROR);
  }
  if (!isValidIsoDate(draft.date)) {
    errors.push(DATE_ERROR);
  }
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
}

export function createBodyWeightEntry(
  draft: BodyWeightDraft,
  nowIso: string = new Date().toISOString(),
): BodyWeightEntry {
  assertValidDraft(draft);
  return {
    id: createBodyWeightId(),
    date: draft.date,
    weightKg: draft.weightKg,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function applyBodyWeightDraft(
  existing: BodyWeightEntry,
  draft: BodyWeightDraft,
  nowIso: string = new Date().toISOString(),
): BodyWeightEntry {
  assertValidDraft(draft);
  return { ...existing, date: draft.date, weightKg: draft.weightKg, updatedAt: nowIso };
}

/** Newest first by date, then by creation time. */
export function sortBodyWeightEntries(
  entries: readonly BodyWeightEntry[],
  direction: 'asc' | 'desc' = 'desc',
): BodyWeightEntry[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...entries].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate * sign;
    const byCreated = a.createdAt.localeCompare(b.createdAt);
    if (byCreated !== 0) return byCreated * sign;
    return a.id.localeCompare(b.id) * sign;
  });
}

/** Insert or replace by id; result is sorted newest first. */
export function upsertBodyWeightEntry(
  entries: readonly BodyWeightEntry[],
  entry: BodyWeightEntry,
): BodyWeightEntry[] {
  const rest = entries.filter((item) => item.id !== entry.id);
  return sortBodyWeightEntries([...rest, entry]);
}

export function removeBodyWeightEntry(
  entries: readonly BodyWeightEntry[],
  id: string,
): BodyWeightEntry[] {
  return entries.filter((item) => item.id !== id);
}

/** Soft type guard used when reading persisted payloads. */
export function isBodyWeightEntryLike(value: unknown): value is BodyWeightEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.date === 'string' &&
    isValidIsoDate(entry.date) &&
    typeof entry.weightKg === 'number' &&
    Number.isFinite(entry.weightKg) &&
    entry.weightKg > 0 &&
    typeof entry.createdAt === 'string' &&
    typeof entry.updatedAt === 'string'
  );
}

/**
 * BMI = masa [kg] / wzrost [m]². Orientation only — it does not measure body
 * fat and can mislead for muscular people. Returns null for missing input.
 */
export function calculateBmi(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined,
): BmiResult | null {
  if (
    weightKg == null ||
    heightCm == null ||
    !Number.isFinite(weightKg) ||
    !Number.isFinite(heightCm) ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return null;
  }
  const heightM = heightCm / 100;
  const value = roundTo(weightKg / (heightM * heightM), 1);
  return { value, band: bmiBand(value) };
}

/** WHO adult reference ranges, used only to place the number on a scale. */
export function bmiBand(bmi: number): BmiBand {
  if (bmi < 18.5) return 'below';
  if (bmi < 25) return 'reference';
  if (bmi < 30) return 'above';
  return 'wellAbove';
}

/** Neutral wording — a range, not a diagnosis. */
export const BMI_BAND_LABELS: Record<BmiBand, string> = {
  below: 'Poniżej przedziału 18,5–24,9',
  reference: 'W przedziale 18,5–24,9',
  above: 'W przedziale 25–29,9',
  wellAbove: '30 lub więcej',
};

/**
 * Trend over the last `TREND_WINDOW_DAYS` before the newest entry.
 * Direction comes from a least-squares slope (robust to day-to-day noise);
 * `changeKg` is the plain difference between first and last measurement.
 */
export function computeWeightTrend(
  entries: readonly BodyWeightEntry[],
  windowDays: number = TREND_WINDOW_DAYS,
): WeightTrend {
  if (entries.length === 0) {
    return { status: 'insufficient', reason: 'noData' };
  }
  const sorted = sortBodyWeightEntries(entries, 'asc');
  const latest = sorted[sorted.length - 1];
  const inWindow = sorted.filter((entry) => daysBetween(entry.date, latest.date) <= windowDays);

  if (inWindow.length < 2) {
    return { status: 'insufficient', reason: 'singleEntry' };
  }

  const first = inWindow[0];
  const spanDays = daysBetween(first.date, latest.date);
  if (spanDays < TREND_MIN_SPAN_DAYS) {
    return { status: 'insufficient', reason: 'shortSpan' };
  }

  const xs = inWindow.map((entry) => daysBetween(first.date, entry.date));
  const ys = inWindow.map((entry) => entry.weightKg);
  const n = xs.length;
  const meanX = xs.reduce((sum, x) => sum + x, 0) / n;
  const meanY = ys.reduce((sum, y) => sum + y, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slopePerDay = den === 0 ? 0 : num / den;
  const weeklyChangeKg = roundTo(slopePerDay * 7, 2);

  const direction =
    Math.abs(weeklyChangeKg) < TREND_STABLE_KG_PER_WEEK
      ? 'stable'
      : weeklyChangeKg < 0
        ? 'down'
        : 'up';

  return {
    status: 'ok',
    direction,
    changeKg: roundTo(latest.weightKg - first.weightKg, 2),
    weeklyChangeKg,
    spanDays,
    fromDate: first.date,
    toDate: latest.date,
  };
}

export const BODY_GOAL_LABELS: Record<BodyGoal, string> = {
  cut: 'Redukcja',
  maintain: 'Utrzymanie',
  gain: 'Budowa masy',
};

export interface TrendDescription {
  title: string;
  description: string;
  /** `match` when the trend agrees with the chosen goal. */
  tone: 'neutral' | 'match' | 'differs';
}

const DIRECTION_TITLES = {
  down: 'Trend spadkowy',
  stable: 'Masa stabilna',
  up: 'Trend wzrostowy',
} as const;

const GOAL_DIRECTION: Record<BodyGoal, 'down' | 'stable' | 'up'> = {
  cut: 'down',
  maintain: 'stable',
  gain: 'up',
};

/**
 * Describe the observed trend, optionally relative to the user's goal.
 * Descriptive only: no advice, no target weights.
 */
export function describeWeightTrend(
  trend: WeightTrend,
  goal: BodyGoal | null,
): TrendDescription {
  if (trend.status === 'insufficient') {
    const description =
      trend.reason === 'noData'
        ? 'Dodaj pierwszy pomiar, aby zacząć śledzić masę ciała.'
        : trend.reason === 'singleEntry'
          ? 'Potrzebne są co najmniej dwa pomiary z ostatnich 30 dni.'
          : `Pomiary obejmują mniej niż ${TREND_MIN_SPAN_DAYS} dni — za krótko, by ocenić trend.`;
    return { title: 'Za mało danych', description, tone: 'neutral' };
  }

  const weekly = formatSignedKg(trend.weeklyChangeKg);
  const base =
    weekly === '0 kg'
      ? `Średnia zmiana poniżej 0,1 kg na tydzień w ciągu ${trend.spanDays} dni.`
      : `Średnio ${weekly} na tydzień w ciągu ${trend.spanDays} dni.`;
  if (!goal) {
    return { title: DIRECTION_TITLES[trend.direction], description: base, tone: 'neutral' };
  }

  const matches = GOAL_DIRECTION[goal] === trend.direction;
  const goalLabel = BODY_GOAL_LABELS[goal].toLocaleLowerCase('pl-PL');
  const relation = matches
    ? `Kierunek zgodny z wybranym celem (${goalLabel}).`
    : `Kierunek inny niż wybrany cel (${goalLabel}).`;
  return {
    title: DIRECTION_TITLES[trend.direction],
    description: `${base} ${relation}`,
    tone: matches ? 'match' : 'differs',
  };
}

/** "82,4 kg" — Polish decimal comma, up to one decimal place. */
export function formatBodyWeight(weightKg: number): string {
  if (!Number.isFinite(weightKg)) return '—';
  return `${formatNumberPl(weightKg, 1)} kg`;
}

/** "+0,3 kg" / "−1,2 kg" / "0 kg". */
export function formatSignedKg(value: number): string {
  if (!Number.isFinite(value)) return '—';
  // Round the magnitude so −1,25 and +1,25 format symmetrically.
  const magnitude = roundTo(Math.abs(value), 1);
  if (magnitude === 0) return '0 kg';
  const sign = value > 0 ? '+' : '−';
  return `${sign}${formatNumberPl(magnitude, 1)} kg`;
}

export function formatNumberPl(value: number, maxDigits: number): string {
  const fixed = roundTo(value, maxDigits).toFixed(maxDigits).replace(/\.?0+$/, '');
  return fixed.replace('.', ',');
}

export interface WeightChartPoint {
  value: number;
  label: string;
  date: string;
}

export interface WeightChartScale {
  /** Bottom of the Y axis, kg. */
  min: number;
  /** Top of the Y axis, kg. */
  max: number;
  step: number;
  sections: number;
}

/** Oldest → newest, at most `maxPoints` latest measurements. */
export function buildWeightChartPoints(
  entries: readonly BodyWeightEntry[],
  maxPoints = 30,
): WeightChartPoint[] {
  const sorted = sortBodyWeightEntries(entries, 'asc');
  return sorted.slice(-maxPoints).map((entry) => {
    const [, month, day] = entry.date.split('-');
    return { value: entry.weightKg, label: `${day}.${month}`, date: entry.date };
  });
}

/**
 * Y axis bounds snapped to a "nice" step so labels stay whole numbers and
 * small fluctuations are not exaggerated (minimum 4 kg visible range).
 */
export function buildWeightChartScale(
  values: readonly number[],
  sections = 4,
): WeightChartScale | null {
  if (values.length === 0) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const range = Math.max(hi - lo, 4);
  const rawStep = range / sections;
  const niceSteps = [1, 2, 2.5, 5, 10, 20, 25, 50];
  const step = niceSteps.find((candidate) => candidate >= rawStep) ?? Math.ceil(rawStep);
  let min = Math.floor(lo / step) * step;
  let max = Math.ceil(hi / step) * step;
  if (max === min) max += step;
  // Pad alternately below / above until the target number of sections.
  let padBelow = true;
  while (Math.round((max - min) / step) < sections) {
    if (padBelow && min - step >= 0) {
      min -= step;
    } else {
      max += step;
    }
    padBelow = !padBelow;
  }
  return { min, max, step, sections: Math.round((max - min) / step) };
}
