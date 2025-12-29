/**
 * Trove Integration Test Setup
 *
 * Provides utilities for testing Trove tools with real API calls.
 * Tests require TROVE_API_KEY environment variable.
 */

import { beforeAll, describe, it, expect } from 'vitest';

// Check for API key availability
export const TROVE_API_KEY = process.env.TROVE_API_KEY;
export const hasApiKey = !!TROVE_API_KEY;

/**
 * Skip test suite if no API key is available.
 * Use this at the start of describe blocks.
 */
export function skipIfNoApiKey(): void {
  if (!hasApiKey) {
    console.warn('⚠️  TROVE_API_KEY not set - skipping Trove integration tests');
  }
}

/**
 * Conditional describe that skips if no API key
 */
export const describeWithKey = hasApiKey ? describe : describe.skip;

/**
 * Conditional it that skips if no API key
 */
export const itWithKey = hasApiKey ? it : it.skip;

/**
 * Helper to validate MCP tool response structure
 */
export function expectSuccessResponse(result: unknown): asserts result is { content: Array<{ type: string; text: string }> } {
  expect(result).toBeDefined();
  expect(result).toHaveProperty('content');
  const r = result as { content: unknown };
  expect(Array.isArray(r.content)).toBe(true);
  const content = r.content as Array<unknown>;
  expect(content.length).toBeGreaterThan(0);
  expect(content[0]).toHaveProperty('type', 'text');
  expect(content[0]).toHaveProperty('text');
}

/**
 * Helper to parse JSON from MCP tool response
 */
export function parseResponseJson<T>(result: { content: Array<{ type: string; text: string }> }): T {
  const text = result.content[0].text;
  return JSON.parse(text) as T;
}

/**
 * Helper to validate error response structure
 */
export function expectErrorResponse(result: unknown): asserts result is { content: Array<{ type: string; text: string }>; isError: boolean } {
  expect(result).toBeDefined();
  expect(result).toHaveProperty('content');
  expect(result).toHaveProperty('isError', true);
}

/**
 * Standard test timeout for API calls (30 seconds)
 */
export const API_TIMEOUT = 30000;

/**
 * Rate limit delay between tests (to avoid 429 errors)
 */
export const RATE_LIMIT_DELAY = 500; // 500ms between tests

/**
 * Helper to add delay between API calls
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
