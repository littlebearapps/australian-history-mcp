/**
 * Integration Test Setup
 *
 * Provides utilities for testing meta-tools without API calls.
 * Uses mocked data for file system operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

// Test data directory
let testDataDir: string;

/**
 * Create a temporary test data directory
 */
export async function setupTestDataDir(): Promise<string> {
  testDataDir = path.join(os.tmpdir(), `australian-history-mcp-test-${Date.now()}`);
  await fs.mkdir(testDataDir, { recursive: true });
  await fs.mkdir(path.join(testDataDir, 'sessions'), { recursive: true });
  await fs.mkdir(path.join(testDataDir, 'checkpoints'), { recursive: true });
  await fs.mkdir(path.join(testDataDir, 'plans'), { recursive: true });
  return testDataDir;
}

/**
 * Clean up test data directory
 */
export async function cleanupTestDataDir(): Promise<void> {
  if (testDataDir) {
    await fs.rm(testDataDir, { recursive: true, force: true });
  }
}

/**
 * Get the test data directory path
 */
export function getTestDataDir(): string {
  return testDataDir;
}

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
 * Sample search results for testing compression
 */
export const sampleSearchResults = [
  {
    id: 'prov-123',
    source: 'prov',
    type: 'item',
    title: 'Melbourne Railway Station Plans 1920',
    url: 'https://prov.vic.gov.au/item/123',
    date: '1920-05-15',
    description: 'Architectural plans for Melbourne Railway Station showing proposed extensions.',
    creator: 'Victorian Railways',
  },
  {
    id: 'trove-456',
    source: 'trove',
    type: 'article',
    title: 'Railway Extension Announced',
    url: 'https://trove.nla.gov.au/article/456',
    date: '1920-06-20',
    description: 'Government announces plans to extend the Melbourne railway network.',
    newspaper: 'The Age',
  },
  {
    id: 'prov-789',
    source: 'prov',
    type: 'item',
    title: 'Melbourne Railway Station Plans 1920', // Duplicate title
    url: 'https://prov.vic.gov.au/item/789',
    date: '1920-05-16',
    description: 'Another set of plans for Melbourne Railway Station.',
    creator: 'Victorian Railways',
  },
  {
    id: 'nma-101',
    source: 'nma',
    type: 'object',
    title: 'Railway Worker Uniform 1920s',
    url: 'https://nma.gov.au/object/101',
    date: '1925',
    description: 'Wool uniform worn by railway workers in Victoria during the 1920s.',
    materials: ['wool', 'brass'],
  },
  {
    id: 'trove-duplicate',
    source: 'trove',
    type: 'article',
    title: 'Railway Extension Announced', // Same title, same source
    url: 'https://trove.nla.gov.au/article/456-duplicate',
    date: '1920-06-20',
    description: 'Duplicate entry for testing.',
    newspaper: 'The Age',
  },
];

/**
 * Sample session for testing
 */
export const sampleSession = {
  id: 'session-test-123',
  name: 'test-research',
  topic: 'Melbourne Railways 1920s',
  status: 'active' as const,
  createdAt: new Date().toISOString(),
  queries: [
    {
      timestamp: new Date().toISOString(),
      tool: 'prov_search',
      args: { query: 'railway', dateFrom: '1920', dateTo: '1929' },
      resultCount: 156,
      newRecords: 156,
      duplicates: 0,
    },
  ],
  fingerprints: new Set(['fp-123', 'fp-456', 'fp-789']),
  coverage: {
    prov: { searched: true, resultCount: 156 },
    trove: { searched: false, resultCount: 0 },
  },
  notes: ['Found excellent photos in PROV series VPRS 12903'],
};

/**
 * Standard test timeout
 */
export const TEST_TIMEOUT = 10000;
