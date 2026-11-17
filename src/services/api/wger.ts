import { WGER_DEFAULT_BASE_URL } from '@/constants';

import { apiRequest } from './client';
import type { WgerExerciseInfo, WgerPaginatedResponse } from './types';

function getBaseUrl(): string {
  return (
    process.env.EXPO_PUBLIC_WGER_BASE_URL?.replace(/\/$/, '') ??
    WGER_DEFAULT_BASE_URL
  );
}

/**
 * Stub client for the wger exercise catalogue.
 * Full pagination, filtering, and domain normalization come in a later milestone.
 */
export async function fetchExercises(params?: {
  limit?: number;
  offset?: number;
}): Promise<WgerPaginatedResponse<WgerExerciseInfo>> {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;
  const url = `${getBaseUrl()}/exerciseinfo/?limit=${limit}&offset=${offset}`;

  return apiRequest<WgerPaginatedResponse<WgerExerciseInfo>>(url);
}
