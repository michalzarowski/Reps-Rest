import { describe, expect, it } from 'vitest';

import type { BodyWeightEntry } from '@/types';

import {
  applyBodyWeightDraft,
  bmiBand,
  buildWeightChartPoints,
  buildWeightChartScale,
  calculateBmi,
  computeWeightTrend,
  createBodyWeightEntry,
  daysBetween,
  describeWeightTrend,
  formatBodyWeight,
  formatSignedKg,
  isBodyWeightEntryLike,
  parseAndValidateBodyWeightForm,
  parseBodyWeight,
  parseHeightCm,
  removeBodyWeightEntry,
  sortBodyWeightEntries,
  upsertBodyWeightEntry,
} from './bodyWeight';

function entry(id: string, date: string, weightKg: number): BodyWeightEntry {
  return {
    id,
    date,
    weightKg,
    createdAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T08:00:00.000Z`,
  };
}

/** Daily entries starting at `start`, weight changing by `perDay`. */
function series(start: string, days: number, startKg: number, perDay: number) {
  const [y, m, d] = start.split('-').map(Number);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10);
    return entry(`e${i}`, date, Math.round((startKg + perDay * i) * 100) / 100);
  });
}

describe('parsing', () => {
  it('accepts comma and dot decimals within range', () => {
    expect(parseBodyWeight('82,4')).toBe(82.4);
    expect(parseBodyWeight(' 75.25 ')).toBe(75.25);
  });

  it('rejects empty, negative and implausible weights', () => {
    expect(parseBodyWeight('')).toBeNull();
    expect(parseBodyWeight('-70')).toBeNull();
    expect(parseBodyWeight('abc')).toBeNull();
    expect(parseBodyWeight('19.9')).toBeNull();
    expect(parseBodyWeight('351')).toBeNull();
  });

  it('parses height in centimetres', () => {
    expect(parseHeightCm('180')).toBe(180);
    expect(parseHeightCm('172,5')).toBe(172.5);
    expect(parseHeightCm('1.80')).toBeNull(); // metres are not accepted
    expect(parseHeightCm('260')).toBeNull();
  });
});

describe('parseAndValidateBodyWeightForm', () => {
  const existing = [entry('a', '2026-03-01', 80)];

  it('returns a draft for valid input', () => {
    expect(
      parseAndValidateBodyWeightForm({ weightText: '79,6', dateText: '2026-03-02' }),
    ).toEqual({ ok: true, draft: { weightKg: 79.6, date: '2026-03-02' } });
  });

  it('collects weight and date errors', () => {
    const result = parseAndValidateBodyWeightForm({ weightText: 'x', dateText: '2026-02-30' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toHaveLength(2);
  });

  it('rejects a second measurement on the same day', () => {
    const result = parseAndValidateBodyWeightForm({
      weightText: '80',
      dateText: '2026-03-01',
      existing,
    });
    expect(result.ok).toBe(false);
  });

  it('allows keeping the date when editing the same entry', () => {
    const result = parseAndValidateBodyWeightForm({
      weightText: '80',
      dateText: '2026-03-01',
      existing,
      editingId: 'a',
    });
    expect(result.ok).toBe(true);
  });

  it('rejects future dates when today is given', () => {
    const result = parseAndValidateBodyWeightForm({
      weightText: '80',
      dateText: '2026-03-05',
      today: '2026-03-04',
    });
    expect(result.ok).toBe(false);
  });
});

describe('entry CRUD helpers', () => {
  it('creates and updates entries with timestamps', () => {
    const created = createBodyWeightEntry(
      { date: '2026-03-01', weightKg: 80 },
      '2026-03-01T07:00:00.000Z',
    );
    expect(created.id).toMatch(/^bw_/);
    expect(created.createdAt).toBe('2026-03-01T07:00:00.000Z');

    const updated = applyBodyWeightDraft(
      created,
      { date: '2026-03-02', weightKg: 79.5 },
      '2026-03-02T07:00:00.000Z',
    );
    expect(updated).toMatchObject({
      id: created.id,
      date: '2026-03-02',
      weightKg: 79.5,
      createdAt: created.createdAt,
      updatedAt: '2026-03-02T07:00:00.000Z',
    });
  });

  it('refuses invalid drafts', () => {
    expect(() => createBodyWeightEntry({ date: '2026-03-01', weightKg: 5 })).toThrow();
    expect(() => createBodyWeightEntry({ date: 'today', weightKg: 80 })).toThrow();
  });

  it('upserts, sorts newest first and removes', () => {
    const a = entry('a', '2026-03-01', 80);
    const b = entry('b', '2026-03-03', 79);
    let list = upsertBodyWeightEntry([a], b);
    expect(list.map((e) => e.id)).toEqual(['b', 'a']);
    list = upsertBodyWeightEntry(list, { ...a, weightKg: 81 });
    expect(list).toHaveLength(2);
    expect(list[1]?.weightKg).toBe(81);
    expect(removeBodyWeightEntry(list, 'b').map((e) => e.id)).toEqual(['a']);
    expect(sortBodyWeightEntries(list, 'asc').map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('validates persisted shapes', () => {
    expect(isBodyWeightEntryLike(entry('a', '2026-03-01', 80))).toBe(true);
    expect(isBodyWeightEntryLike({ id: 'a', date: '2026-03-01', weightKg: 80 })).toBe(false);
    expect(isBodyWeightEntryLike({ ...entry('a', '2026-03-01', 80), weightKg: NaN })).toBe(false);
    expect(isBodyWeightEntryLike(null)).toBe(false);
  });
});

describe('BMI', () => {
  it('computes BMI rounded to one decimal', () => {
    expect(calculateBmi(80, 180)).toEqual({ value: 24.7, band: 'reference' });
    expect(calculateBmi(70, 175)?.value).toBe(22.9);
  });

  it('returns null when height or weight is missing', () => {
    expect(calculateBmi(80, null)).toBeNull();
    expect(calculateBmi(null, 180)).toBeNull();
    expect(calculateBmi(80, 0)).toBeNull();
  });

  it('places values on WHO reference bands at the boundaries', () => {
    expect(bmiBand(18.4)).toBe('below');
    expect(bmiBand(18.5)).toBe('reference');
    expect(bmiBand(24.9)).toBe('reference');
    expect(bmiBand(25)).toBe('above');
    expect(bmiBand(29.9)).toBe('above');
    expect(bmiBand(30)).toBe('wellAbove');
  });
});

describe('computeWeightTrend', () => {
  it('reports missing data', () => {
    expect(computeWeightTrend([])).toEqual({ status: 'insufficient', reason: 'noData' });
    expect(computeWeightTrend([entry('a', '2026-03-01', 80)])).toEqual({
      status: 'insufficient',
      reason: 'singleEntry',
    });
  });

  it('needs at least a week between measurements', () => {
    const trend = computeWeightTrend(series('2026-03-01', 5, 80, -0.2));
    expect(trend).toEqual({ status: 'insufficient', reason: 'shortSpan' });
  });

  it('ignores measurements older than the window', () => {
    const trend = computeWeightTrend([
      entry('old', '2026-01-01', 90),
      entry('recent', '2026-03-01', 80),
    ]);
    expect(trend).toEqual({ status: 'insufficient', reason: 'singleEntry' });
  });

  it('detects a downward trend', () => {
    const trend = computeWeightTrend(series('2026-03-01', 15, 82, -0.1));
    expect(trend.status).toBe('ok');
    if (trend.status === 'ok') {
      expect(trend.direction).toBe('down');
      expect(trend.weeklyChangeKg).toBeCloseTo(-0.7, 5);
      expect(trend.changeKg).toBeCloseTo(-1.4, 5);
      expect(trend.spanDays).toBe(14);
    }
  });

  it('detects an upward trend', () => {
    const trend = computeWeightTrend(series('2026-03-01', 15, 70, 0.05));
    expect(trend.status === 'ok' && trend.direction).toBe('up');
  });

  it('treats small fluctuations as stable', () => {
    const noisy = [80, 80.4, 79.8, 80.2, 79.9, 80.3, 80].map((kg, i) =>
      entry(`n${i}`, `2026-03-${String(1 + i * 2).padStart(2, '0')}`, kg),
    );
    const trend = computeWeightTrend(noisy);
    expect(trend.status === 'ok' && trend.direction).toBe('stable');
  });

  it('is robust to an outlier at the end compared with first-vs-last', () => {
    const data = [...series('2026-03-01', 14, 80, -0.1), entry('spike', '2026-03-15', 80)];
    const trend = computeWeightTrend(data);
    expect(trend.status === 'ok' && trend.direction).toBe('down');
  });

  it('counts days across month boundaries', () => {
    expect(daysBetween('2026-02-25', '2026-03-04')).toBe(7);
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
  });
});

describe('describeWeightTrend', () => {
  const down = computeWeightTrend(series('2026-03-01', 15, 82, -0.1));

  it('describes the trend without a goal', () => {
    const text = describeWeightTrend(down, null);
    expect(text.title).toBe('Trend spadkowy');
    expect(text.tone).toBe('neutral');
    expect(text.description).toContain('−0,7 kg');
  });

  it('marks agreement with the goal', () => {
    expect(describeWeightTrend(down, 'cut').tone).toBe('match');
    expect(describeWeightTrend(down, 'gain').tone).toBe('differs');
    expect(describeWeightTrend(down, 'maintain').tone).toBe('differs');
  });

  it('never gives advice — only describes', () => {
    const text = describeWeightTrend(down, 'gain').description.toLowerCase();
    expect(text).not.toMatch(/powinien|powinna|zalec|zjedz|dieta/);
  });

  it('explains insufficient data', () => {
    const text = describeWeightTrend({ status: 'insufficient', reason: 'shortSpan' }, 'cut');
    expect(text.title).toBe('Za mało danych');
  });
});

describe('formatting', () => {
  it('uses Polish decimal comma', () => {
    expect(formatBodyWeight(82.4)).toBe('82,4 kg');
    expect(formatBodyWeight(80)).toBe('80 kg');
    expect(formatSignedKg(0.34)).toBe('+0,3 kg');
    expect(formatSignedKg(-1.25)).toBe('−1,3 kg');
    expect(formatSignedKg(0.01)).toBe('0 kg');
  });
});

describe('chart helpers', () => {
  it('returns oldest → newest points, capped', () => {
    const points = buildWeightChartPoints(series('2026-03-01', 40, 80, 0), 30);
    expect(points).toHaveLength(30);
    expect(points[0]?.date < points[29]!.date).toBe(true);
    expect(points[29]?.label).toBe('09.04');
  });

  it('builds a scale covering all values with a minimum visible range', () => {
    const scale = buildWeightChartScale([80, 80.4, 79.8]);
    expect(scale).not.toBeNull();
    expect(scale!.min).toBeLessThanOrEqual(79.8);
    expect(scale!.max).toBeGreaterThanOrEqual(80.4);
    expect(scale!.max - scale!.min).toBeGreaterThanOrEqual(4);
    expect(scale!.sections).toBe(4);
    expect(Number.isInteger(scale!.min)).toBe(true);
  });

  it('covers wide ranges', () => {
    const scale = buildWeightChartScale([60, 95]);
    expect(scale!.min).toBeLessThanOrEqual(60);
    expect(scale!.max).toBeGreaterThanOrEqual(95);
  });

  it('returns null for no values', () => {
    expect(buildWeightChartScale([])).toBeNull();
  });
});
