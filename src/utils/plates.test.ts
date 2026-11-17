import { describe, expect, it } from 'vitest';

import {
  formatKg,
  parsePositiveNumber,
  solvePlatesToTarget,
  solveTargetToPlates,
  validateBarAndTarget,
} from './plates';

describe('solveTargetToPlates', () => {
  it('100 kg with 20 kg bar → 40 kg per side', () => {
    const result = solveTargetToPlates(100, 20);
    expect(result.ok).toBe(true);
    expect(result.solution).not.toBeNull();
    expect(result.solution?.perSideKg).toBe(40);
    expect(result.solution?.exact).toBe(true);

    const sideLoad = result.solution!.plates.reduce(
      (sum, p) => sum + p.plateKg * p.count,
      0,
    );
    expect(sideLoad).toBe(40);
    expect(result.solution!.totalKg).toBe(100);
  });

  it('60 kg with 20 kg bar → 20 kg per side', () => {
    const result = solveTargetToPlates(60, 20);
    expect(result.ok).toBe(true);
    expect(result.solution?.perSideKg).toBe(20);
    expect(result.solution?.plates).toEqual([{ plateKg: 20, count: 1 }]);
  });

  it('75 kg with 20 kg bar → 27.5 kg per side', () => {
    const result = solveTargetToPlates(75, 20);
    expect(result.ok).toBe(true);
    expect(result.solution?.perSideKg).toBe(27.5);

    const sideLoad = result.solution!.plates.reduce(
      (sum, p) => sum + p.plateKg * p.count,
      0,
    );
    expect(sideLoad).toBe(27.5);
    const plateCount = result.solution!.plates.reduce(
      (sum, p) => sum + p.count,
      0,
    );
    expect(plateCount).toBe(2);
  });

  it('20 kg with 20 kg bar → no plates', () => {
    const result = solveTargetToPlates(20, 20);
    expect(result.ok).toBe(true);
    expect(result.solution?.plates).toEqual([]);
    expect(result.solution?.perSideKg).toBe(0);
  });

  it('rejects total below bar weight', () => {
    const result = solveTargetToPlates(15, 20);
    expect(result.ok).toBe(false);
    expect(result.solution).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('reports nearest totals for unreachable weight', () => {
    // 21 kg total → 0.5 kg per side — not a multiple of 1.25
    const result = solveTargetToPlates(21, 20);
    expect(result.ok).toBe(false);
    expect(result.solution).toBeNull();
    expect(result.message).toBeTruthy();
    expect(result.nearest?.belowKg).toBe(20);
    expect(result.nearest?.aboveKg).toBe(22.5);
  });

  it('prefers minimal plate count over naive greedy when needed', () => {
    // With only 25 and 10 available, 30 kg/side: greedy 25+? fails path
    // that uses more plates; optimal is 3×10.
    const result = solveTargetToPlates(80, 20, [25, 10]);
    expect(result.ok).toBe(true);
    expect(result.solution?.perSideKg).toBe(30);
    expect(result.solution?.plates).toEqual([{ plateKg: 10, count: 3 }]);
  });
});

describe('solvePlatesToTarget', () => {
  it('computes reverse conversion symmetrically', () => {
    const result = solvePlatesToTarget(20, {
      25: 1,
      10: 1,
      5: 1,
    });
    expect(result.ok).toBe(true);
    expect(result.perSideKg).toBe(40);
    expect(result.totalKg).toBe(100);
  });

  it('matches forward then reverse for 75 kg', () => {
    const forward = solveTargetToPlates(75, 20);
    expect(forward.ok).toBe(true);
    const counts: Record<number, number> = {};
    for (const plate of forward.solution!.plates) {
      counts[plate.plateKg] = plate.count;
    }
    const reverse = solvePlatesToTarget(20, counts);
    expect(reverse.totalKg).toBe(75);
  });
});

describe('validation and parsing', () => {
  it('validateBarAndTarget rejects non-positive values', () => {
    expect(validateBarAndTarget(0, 20).ok).toBe(false);
    expect(validateBarAndTarget(100, -1).ok).toBe(false);
    expect(validateBarAndTarget(-10, 20).ok).toBe(false);
  });

  it('parsePositiveNumber rejects invalid text', () => {
    expect(parsePositiveNumber('')).toBeNull();
    expect(parsePositiveNumber('abc')).toBeNull();
    expect(parsePositiveNumber('-5')).toBeNull();
    expect(parsePositiveNumber('0')).toBeNull();
    expect(parsePositiveNumber('12.5')).toBe(12.5);
    expect(parsePositiveNumber('12,5')).toBe(12.5);
  });

  it('formatKg trims trailing zeros', () => {
    expect(formatKg(20)).toBe('20');
    expect(formatKg(2.5)).toBe('2.5');
    expect(formatKg(1.25)).toBe('1.25');
  });
});
