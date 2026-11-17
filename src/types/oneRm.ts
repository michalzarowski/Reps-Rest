export type OneRmFormula = "epley" | "brzycki";

export interface OneRmInput {
  weightKg: number;
  reps: number;
  formula: OneRmFormula;
}

export interface OneRmValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface IntensityRow {
  /** procent oszacowanego 1RM (np. 80). */
  pct: number;
  weightKg: number;
  repsHint: string;
}
