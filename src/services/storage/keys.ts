export const storageKeys = {
  settings: 'repsrest:settings',
  personalRecords: 'repsrest:personal_records',
  bodyWeight: 'repsrest:body_weight',
  workoutPlans: 'repsrest:workout_plans',
  customExercises: 'repsrest:custom_exercises',
  timerPresets: 'repsrest:timer_presets',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
