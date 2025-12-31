/**
 * Context Compression Integration Tests
 *
 * Tests compress, urls, dedupe, and compression utilities.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  setupTestDataDir,
  cleanupTestDataDir,
  sampleSearchResults,
  TEST_TIMEOUT,
} from './setup.js';

// Import the compression module functions (actual API)
import {
  compressRecords,
  compressRecordArray,
  estimateTokens,
  truncateTitle,
  dedupeRecords,
  areDuplicates,
  normaliseUrl,
  normaliseTitle,
  titleSimilarity,
} from '../../src/core/compression/index.js';
import type { CompressionLevel } from '../../src/core/compression/types.js';

describe('Context Compression', () => {
  beforeEach(async () => {
    await setupTestDataDir();
  });

  afterEach(async () => {
    await cleanupTestDataDir();
  });

  describe('compressRecords', () => {
    it('compresses records at minimal level', () => {
      const records = sampleSearchResults.map((r) => ({
        record: r as Record<string, unknown>,
        source: r.source,
      }));
      const result = compressRecords(records, { level: 'minimal' });

      expect(result.compressed.count).toBe(sampleSearchResults.length);
      expect(result.compressed.estimatedTokens).toBeLessThan(result.original.estimatedTokens);

      // Minimal should only have id, url, source
      const record = result.compressed.records[0];
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('source');
      // Minimal excludes title
      expect(record).not.toHaveProperty('creator');
    });

    it('compresses records at standard level', () => {
      const records = sampleSearchResults.map((r) => ({
        record: r as Record<string, unknown>,
        source: r.source,
      }));
      const result = compressRecords(records, { level: 'standard' });

      // Standard adds title and year
      const record = result.compressed.records[0];
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('source');
      expect(record).toHaveProperty('title');
    });

    it('compresses records at full level', () => {
      const records = sampleSearchResults.map((r) => ({
        record: r as Record<string, unknown>,
        source: r.source,
      }));
      const result = compressRecords(records, { level: 'full' });

      // Full adds type and creator
      const record = result.compressed.records[0];
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('source');
      expect(record).toHaveProperty('title');
      expect(record).toHaveProperty('type');
    });

    it('reports token savings correctly', () => {
      const records = sampleSearchResults.map((r) => ({
        record: r as Record<string, unknown>,
        source: r.source,
      }));
      const result = compressRecords(records, { level: 'minimal' });

      expect(result.savings.percentageSaved).toBeGreaterThan(0);
      expect(result.savings.percentageSaved).toBeLessThanOrEqual(100);
      expect(result.original.estimatedTokens).toBeGreaterThan(0);
      expect(result.compressed.estimatedTokens).toBeGreaterThan(0);
    });

    it('truncates long titles', () => {
      const longTitleRecords = [
        {
          record: {
            id: 'test-1',
            source: 'prov',
            url: 'https://example.com/1',
            title:
              'This is a very long title that should be truncated because it exceeds the maximum length allowed for titles in the compressed output format',
          } as Record<string, unknown>,
          source: 'prov',
        },
      ];

      const result = compressRecords(longTitleRecords, {
        level: 'standard',
        maxTitleLength: 50,
      });

      const record = result.compressed.records[0];
      expect(record.title).toBeDefined();
      expect((record.title as string).length).toBeLessThanOrEqual(53); // 50 + '...'
    });
  });

  describe('compressRecordArray', () => {
    it('compresses array with inferred source', () => {
      const result = compressRecordArray(
        sampleSearchResults as Record<string, unknown>[],
        { level: 'standard' }
      );

      expect(result.compressed.count).toBe(sampleSearchResults.length);
      expect(result.compressed.records[0]).toHaveProperty('source');
    });
  });

  describe('dedupeRecords', () => {
    it('removes duplicates by URL', () => {
      const recordsWithDuplicateUrl = [
        { id: '1', url: 'https://example.com/same', source: 'prov', title: 'First' },
        { id: '2', url: 'https://example.com/same', source: 'trove', title: 'Second' },
        { id: '3', url: 'https://example.com/different', source: 'prov', title: 'Third' },
      ];

      const result = dedupeRecords(recordsWithDuplicateUrl, { strategy: 'url' });

      expect(result.unique.length).toBe(2);
      expect(result.stats.removed).toBe(1);
    });

    it('removes duplicates by title similarity', () => {
      const result = dedupeRecords(sampleSearchResults as Record<string, unknown>[], {
        strategy: 'title',
      });

      // Should detect the duplicate titles
      expect(result.stats.removed).toBeGreaterThan(0);
      expect(result.unique.length).toBeLessThan(sampleSearchResults.length);
    });

    it('uses both strategies when specified', () => {
      const result = dedupeRecords(sampleSearchResults as Record<string, unknown>[], {
        strategy: 'both',
      });

      expect(result.stats.removed).toBeGreaterThan(0);
    });

    it('respects source priority', () => {
      const recordsWithPriority = [
        { id: '1', url: 'https://a.com/1', source: 'trove', title: 'Same Title' },
        { id: '2', url: 'https://b.com/2', source: 'prov', title: 'Same Title' },
      ];

      // Default priority: trove first
      const result = dedupeRecords(recordsWithPriority, {
        strategy: 'title',
        preferSource: ['trove', 'prov'],
      });

      expect(result.unique.length).toBe(1);
      expect((result.unique[0] as Record<string, unknown>).source).toBe('trove');
    });

    it('applies year proximity filter', () => {
      const recordsWithDates = [
        { id: '1', url: 'https://a.com/1', source: 'prov', title: 'Melbourne Railway', date: '1920' },
        { id: '2', url: 'https://b.com/2', source: 'prov', title: 'Melbourne Railway', date: '1950' },
      ];

      // With year proximity of 2, these should NOT be considered duplicates
      const result = dedupeRecords(recordsWithDates, {
        strategy: 'title',
        yearProximity: 2,
      });

      expect(result.unique.length).toBe(2); // Both kept due to year difference
    });
  });

  describe('areDuplicates', () => {
    it('detects URL duplicates', () => {
      const a = { url: 'https://example.com/test', source: 'prov' };
      const b = { url: 'https://example.com/test', source: 'trove' };

      const result = areDuplicates(a, b, { strategy: 'url' });
      expect(result.isDuplicate).toBe(true);
      expect(result.matchType).toBe('url');
    });

    it('detects title duplicates', () => {
      const a = { title: 'Melbourne Railway Plans', source: 'prov' };
      const b = { title: 'Melbourne Railway Plans', source: 'trove' };

      const result = areDuplicates(a, b, { strategy: 'title' });
      expect(result.isDuplicate).toBe(true);
      expect(result.matchType).toBe('title');
    });
  });

  describe('URL Extraction', () => {
    it('extracts URLs from records', () => {
      const urls = sampleSearchResults
        .filter((r) => r.url)
        .map((r) => ({
          url: r.url,
          source: r.source,
          title: r.title,
        }));

      expect(urls.length).toBe(5);
      expect(urls[0]).toHaveProperty('url');
      expect(urls[0]).toHaveProperty('source');
      expect(urls[0]).toHaveProperty('title');
    });

    it('handles records with missing URLs', () => {
      const recordsWithMissingUrls = [
        { id: '1', source: 'prov', title: 'No URL' },
        { id: '2', source: 'trove', url: 'https://example.com', title: 'Has URL' },
      ];

      const urls = recordsWithMissingUrls.filter((r) => 'url' in r && r.url);
      expect(urls.length).toBe(1);
    });
  });

  describe('Utility Functions', () => {
    it('estimates tokens correctly', () => {
      const data = { title: 'Test', description: 'A longer description here' };
      const tokens = estimateTokens(data);
      expect(tokens).toBeGreaterThan(0);
    });

    it('truncates titles at word boundaries', () => {
      const title = 'This is a long title that needs truncation';
      const truncated = truncateTitle(title, 20);
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
      expect(truncated.endsWith('...')).toBe(true);
    });

    it('normalises URLs correctly', () => {
      const url = 'HTTPS://EXAMPLE.COM/Path/?b=2&a=1#fragment';
      const normalised = normaliseUrl(url);
      expect(normalised).toBe('https://example.com/path?a=1&b=2');
    });

    it('normalises titles correctly', () => {
      const title = '  Melbourne, Railway: Plans!  ';
      const normalised = normaliseTitle(title);
      expect(normalised).toBe('melbourne railway plans');
    });

    it('calculates title similarity', () => {
      const sim1 = titleSimilarity('Melbourne Railway Plans', 'Melbourne Railway Plans');
      expect(sim1).toBe(1);

      const sim2 = titleSimilarity('Melbourne Railway Plans', 'Sydney Railway Plans');
      expect(sim2).toBeGreaterThan(0);
      expect(sim2).toBeLessThan(1);

      const sim3 = titleSimilarity('Melbourne Railway', 'Completely Different');
      expect(sim3).toBeLessThan(0.5);
    });
  });

  describe('Compression with Deduplication', () => {
    it('deduplicates before compressing when combined', () => {
      // First dedupe
      const deduped = dedupeRecords(sampleSearchResults as Record<string, unknown>[], {
        strategy: 'both',
      });
      expect(deduped.unique.length).toBeLessThan(sampleSearchResults.length);

      // Then compress
      const records = deduped.unique.map((r) => ({
        record: r,
        source: String((r as Record<string, unknown>).source ?? 'unknown'),
      }));
      const compressed = compressRecords(records, { level: 'standard' });
      expect(compressed.compressed.count).toBe(deduped.unique.length);
    });
  });
}, TEST_TIMEOUT);
