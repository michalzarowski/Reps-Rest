/** Domain types for the barbell plate converter. */

export type PlateConverterMode = 'target-to-plates' | 'plates-to-target';

export interface PlateCount {
  plateKg: number;
  count: number;
}

export interface PlateSolution {
  totalKg: number;
  barKg: number;
  perSideKg: number;
  plates: PlateCount[];
  exact: boolean;
}

export interface NearestTotals {
  belowKg: number | null;
  aboveKg: number | null;
}

export interface PlateTargetResult {
  ok: boolean;
  errors: string[];
  solution: PlateSolution | null;
  nearest: NearestTotals | null;
  message: string | null;
}

export interface PlateFromCountsResult {
  ok: boolean;
  errors: string[];
  totalKg: number | null;
  barKg: number;
  perSideKg: number;
  plates: PlateCount[];
}

export interface PlateValidationResult {
  ok: boolean;
  errors: string[];
}
