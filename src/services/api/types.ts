export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse' | 'unknown';

export interface ApiError {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  cause?: unknown;
}

export interface WgerPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Raw exercise shape from wger — normalized to domain Exercise later. */
export interface WgerExerciseInfo {
  id: number;
  name?: string;
  uuid?: string;
  category?: number | { id: number; name: string };
  equipment?: Array<number | { id: number; name: string }>;
  muscles?: Array<number | { id: number; name: string }>;
  description?: string;
}
