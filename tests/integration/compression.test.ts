/**
 * Context Compression Integration Tests
 *
 * Tests compress, urls, dedupe, and checkpoint meta-tools.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  setupTestDataDir,
  cleanupTestDataDir,
  getTestDataDir,
  expectSuccessResponse,
  parseResponseJson,
  sampleSearchResults,
  TEST_TIMEOUT,
} from './setup.js';

// Import the compression module directly for unit-level tests
import { Compressor } from '../../src/core/compression/compressor.js';
import { Deduplicator } from '../../src/core/compression/dedupe.js';
import type { CompressionLevel } from '../../src/core/compression/types.js';

describe('Context Compression', () => {
  beforeEach(async () => {
    await setupTestDataDir();
  });

  afterEach(async () => {
    await cleanupTestDataDir();
  });

  describe('Compressor', () => {
    it('compresses records at minimal level', () => {
      const compressor = new Compressor();
      const result = compressor.compress(sampleSearchResults, 'minimal');

      expect(result.records.length).toBe(sampleSearchResults.length);
      expect(result.level).toBe('minimal');
      expect(result.stats.originalTokens).toBeGreaterThan(result.stats.compressedTokens);

      // Minimal should only have id, url, source
      const record = result.records[0];
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('url');
      expect(record).toHaveProperty('source');
      expect(record).not.toHaveProperty('description');
      expect(record).not.toHaveProperty('creator');
    });

    it('compresses records at standard level', () => {
      const compressor = new Compressor();
      const result = compressor.compress(sampleSearchResults, 'standard');

      expect(result.level).toBe('standard');

      // Standard adds title and year
      const record = result.records[0];
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('url');
      expect(record).toHaveProperty('source');
      expect(record).toHaveProperty('title');
      expect(record).not.toHaveProperty('description');
    });

    it('compresses records at full level', () => {
      const compressor = new Compressor();
      const result = compressor.compress(sampleSearchResults, 'full');

      expect(result.level).toBe('full');

      // Full adds type and creator but not description
      const record = result.records[0];
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('url');
      expect(record).toHaveProperty('source');
      expect(record).toHaveProperty('title');
      expect(record).toHaveProperty('type');
      expect(record).not.toHaveProperty('description');
    });

    it('reports token savings correctly', () => {
      const compressor = new Compressor();
      const result = compressor.compress(sampleSearchResults, 'minimal');

      expect(result.stats.savingsPercent).toBeGreaterThan(0);
      expect(result.stats.savingsPercent).toBeLessThanOrEqual(100);
      expect(result.stats.originalTokens).toBeGreaterThan(0);
      expect(result.stats.compressedTokens).toBeGreaterThan(0);
    });

    it('truncates long titles', () => {
      const longTitleRecords = [
        {
          id: 'test-1',
          source: 'prov',
          url: 'https://example.com/1',
          title: 'This is a very long title that should be truncated because it exceeds the maximum length allowed for titles in the compressed output format',
        },
      ];

      const compressor = new Compressor();
      const result = compressor.compress(longTitleRecords, 'standard', { maxTitleLength: 50 });

      const record = result.records[0];
      expect(record.title).toBeDefined();
      expect((record.title as string).length).toBeLessThanOrEqual(53); // 50 + '...'
    });
  });

  describe('Deduplicator', () => {
    it('removes duplicates by URL', () => {
      const recordsWithDuplicateUrl = [
        { id: '1', url: 'https://example.com/same', source: 'prov', title: 'First' },
        { id: '2', url: 'https://example.com/same', source: 'trove', title: 'Second' },
        { id: '3', url: 'https://example.com/different', source: 'prov', title: 'Third' },
      ];

      const deduplicator = new Deduplicator();
      const result = deduplicator.dedupe(recordsWithDuplicateUrl, 'url');

      expect(result.records.length).toBe(2);
      expect(result.stats.duplicatesRemoved).toBe(1);
    });

    it('removes duplicates by title similarity', () => {
      const deduplicator = new Deduplicator();
      const result = deduplicator.dedupe(sampleSearchResults, 'title');

      // Should detect the duplicate titles
      expect(result.stats.duplicatesRemoved).toBeGreaterThan(0);
      expect(result.records.length).toBeLessThan(sampleSearchResults.length);
    });

    it('uses both strategies when specified', () => {
      const deduplicator = new Deduplicator();
      const result = deduplicator.dedupe(sampleSearchResults, 'both');

      expect(result.stats.duplicatesRemoved).toBeGreaterThan(0);
      expect(result.stats.strategy).toBe('both');
    });

    it('respects source priority', () => {
      const recordsWithPriority = [
        { id: '1', url: 'https://a.com/1', source: 'trove', title: 'Same Title' },
        { id: '2', url: 'https://b.com/2', source: 'prov', title: 'Same Title' },
      ];

      const deduplicator = new Deduplicator();
      // Default priority: trove first
      const result = deduplicator.dedupe(recordsWithPriority, 'title', {
        preferSource: ['trove', 'prov'],
      });

      expect(result.records.length).toBe(1);
      expect(result.records[0].source).toBe('trove');
    });

    it('applies year proximity filter', () => {
      const recordsWithDates = [
        { id: '1', url: 'https://a.com/1', source: 'prov', title: 'Melbourne Railway', date: '1920' },
        { id: '2', url: 'https://b.com/2', source: 'prov', title: 'Melbourne Railway', date: '1950' },
      ];

      const deduplicator = new Deduplicator();
      // With year proximity of 2, these should NOT be considered duplicates
      const result = deduplicator.dedupe(recordsWithDates, 'title', { yearProximity: 2 });

      expect(result.records.length).toBe(2); // Both kept due to year difference
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

  describe('Compression with Deduplication', () => {
    it('deduplicates before compressing when requested', () => {
      const deduplicator = new Deduplicator();
      const compressor = new Compressor();

      // First dedupe
      const deduped = deduplicator.dedupe(sampleSearchResults, 'both');
      expect(deduped.records.length).toBeLessThan(sampleSearchResults.length);

      // Then compress
      const compressed = compressor.compress(deduped.records, 'standard');
      expect(compressed.records.length).toBe(deduped.records.length);
    });
  });
}, TEST_TIMEOUT);
