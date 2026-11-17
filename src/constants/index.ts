import type { UserSettings } from '@/types';

export const APP_NAME = 'Rep&Rest';

export const STORAGE_SCHEMA_VERSION = 1;

export const DEFAULT_PLATES_KG = [1.25, 2.5, 5, 10, 15, 20, 25] as const;

export const DEFAULT_BAR_WEIGHT_KG = 20;

export const DEFAULT_SETTINGS: UserSettings = {
  heightCm: null,
  preferredUnit: 'kg',
  availablePlatesKg: [...DEFAULT_PLATES_KG],
  theme: 'system',
};

export const WGER_DEFAULT_BASE_URL = 'https://wger.de/api/v2';

export const API_DEFAULT_TIMEOUT_MS = 10_000;
