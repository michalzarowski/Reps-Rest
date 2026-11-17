import { API_DEFAULT_TIMEOUT_MS } from '@/constants';

import type { ApiError } from './types';

export class ApiRequestError extends Error {
  readonly kind: ApiError['kind'];
  readonly status?: number;
  readonly cause?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.kind = error.kind;
    this.status = error.status;
    this.cause = error.cause;
  }

  toApiError(): ApiError {
    return {
      kind: this.kind,
      message: this.message,
      status: this.status,
      cause: this.cause,
    };
  }
}

export interface RequestOptions extends Omit<RequestInit, 'signal'> {
  timeoutMs?: number;
}

export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeoutMs = API_DEFAULT_TIMEOUT_MS, ...init } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new ApiRequestError({
        kind: 'http',
        message: `HTTP ${response.status} for ${url}`,
        status: response.status,
      });
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new ApiRequestError({
        kind: 'parse',
        message: `Failed to parse JSON from ${url}`,
        cause: error,
      });
    }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError({
        kind: 'timeout',
        message: `Request timed out after ${timeoutMs}ms`,
        cause: error,
      });
    }

    throw new ApiRequestError({
      kind: 'network',
      message: 'Network request failed',
      cause: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
