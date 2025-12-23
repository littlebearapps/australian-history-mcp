/**
 * Base Client
 *
 * Shared HTTP client functionality for all data sources.
 * Provides common patterns for fetch, error handling, and retries.
 */

import { APIRequestError } from './types.js';

/**
 * Options for fetch requests
 */
export interface FetchOptions extends RequestInit {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts for transient failures */
  retries?: number;
  /** Custom error handler */
  onError?: (error: Error) => void;
}

/**
 * Base client with shared fetch functionality
 */
export abstract class BaseClient {
  protected readonly baseUrl: string;
  protected readonly userAgent: string;
  protected readonly defaultTimeout: number;

  constructor(baseUrl: string, options?: { userAgent?: string; timeout?: number }) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.userAgent = options?.userAgent ?? 'australian-archives-mcp/0.5.0';
    this.defaultTimeout = options?.timeout ?? 30000;
  }

  /**
   * Make a JSON fetch request with standard error handling
   */
  protected async fetchJSON<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, retries = 0, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        const _body = await response.text().catch(() => 'No response body');
        throw new APIRequestError(
          `HTTP ${response.status}: ${response.statusText}`,
          `HTTP_${response.status}`,
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof APIRequestError) {
        // If retryable and retries remaining, retry after delay
        if (error.retryable && retries > 0) {
          await this.delay(1000 * (4 - retries)); // Backoff: 1s, 2s, 3s
          return this.fetchJSON(url, { ...options, retries: retries - 1 });
        }
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIRequestError(
          `Request timeout after ${timeout}ms`,
          'TIMEOUT',
          undefined,
          true
        );
      }

      throw new APIRequestError(
        error instanceof Error ? error.message : 'Unknown fetch error',
        'FETCH_ERROR',
        undefined,
        false
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Make a fetch request and return raw response (for header-based pagination)
   */
  protected async fetchWithHeaders<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<{ data: T; headers: Headers }> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        throw new APIRequestError(
          `HTTP ${response.status}: ${response.statusText}`,
          `HTTP_${response.status}`,
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      const data = await response.json() as T;
      return { data, headers: response.headers };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(path.startsWith('http') ? path : `${this.baseUrl}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            for (const v of value) {
              url.searchParams.append(key, String(v));
            }
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      }
    }

    return url.toString();
  }

  /**
   * Delay helper for retries
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
