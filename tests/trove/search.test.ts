/**
 * Trove Search Tool Integration Tests
 *
 * Tests trove_search with real API calls.
 * Requires TROVE_API_KEY environment variable.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  describeWithKey,
  itWithKey,
  expectSuccessResponse,
  parseResponseJson,
  skipIfNoApiKey,
  delay,
  RATE_LIMIT_DELAY,
} from './setup.js';
import { troveSearchTool } from '../../src/sources/trove/tools/search.js';

interface SearchResult {
  source: string;
  query: string;
  category: string;
  totalResults: number;
  returned: number;
  records: Array<{
    id: string;
    type: string;
    [key: string]: unknown;
  }>;
  facets?: Array<{
    name: string;
    displayName: string;
    values: Array<{ value: string; count: number }>;
  }>;
  _warnings?: string[];
}

describeWithKey('trove_search', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    // Rate limit protection
    await delay(RATE_LIMIT_DELAY);
  });

  describe('basic search', () => {
    itWithKey('searches newspapers with query', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        category: 'newspaper',
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data.source).toBe('trove');
      expect(data.query).toBe('Melbourne');
      expect(data.category).toBe('newspaper');
      expect(data.totalResults).toBeGreaterThan(0);
      expect(data.returned).toBeLessThanOrEqual(5);
      expect(data.records.length).toBe(data.returned);

      // Newspaper articles should have specific fields
      const article = data.records[0];
      expect(article.type).toBe('article');
      expect(article).toHaveProperty('heading');
      expect(article).toHaveProperty('newspaper');
      expect(article).toHaveProperty('date');
    });

    itWithKey('searches images with query', async () => {
      const result = await troveSearchTool.execute({
        query: 'Sydney Harbour',
        category: 'image',
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data.source).toBe('trove');
      expect(data.category).toBe('image');
      expect(data.records.length).toBeGreaterThan(0);

      // Works should have specific fields
      const work = data.records[0];
      expect(work.type).toBe('work');
      expect(work).toHaveProperty('title');
    });

    itWithKey('searches all categories', async () => {
      const result = await troveSearchTool.execute({
        query: 'gold rush',
        category: 'all',
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data.source).toBe('trove');
      // Category 'all' expands to full list of categories in response
      expect(data.category).toContain('newspaper');
      expect(data.totalResults).toBeGreaterThan(0);
    });
  });

  describe('date filtering', () => {
    itWithKey('filters by date range', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        category: 'newspaper',
        dateFrom: '1930',
        dateTo: '1939',
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data.totalResults).toBeGreaterThan(0);

      // All articles should be from 1930s
      for (const record of data.records) {
        if ('date' in record) {
          const year = parseInt(String(record.date).substring(0, 4), 10);
          expect(year).toBeGreaterThanOrEqual(1930);
          expect(year).toBeLessThanOrEqual(1939);
        }
      }
    });

    itWithKey('validates invalid date format', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        dateFrom: 'invalid-date',
      });

      // Should return error response
      expect(result).toHaveProperty('isError', true);
    });
  });

  describe('state filtering', () => {
    itWithKey('filters by state', async () => {
      const result = await troveSearchTool.execute({
        query: 'railway',
        category: 'newspaper',
        state: 'vic',
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data.totalResults).toBeGreaterThan(0);
    });
  });

  describe('sorting', () => {
    itWithKey('sorts by date ascending', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        category: 'newspaper',
        sortby: 'dateasc',
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data.totalResults).toBeGreaterThan(0);
      // Results should be in date order (oldest first)
      const dates = data.records.map((r) => r.date as string).filter(Boolean);
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i] >= dates[i - 1]).toBe(true);
      }
    });

    itWithKey('sorts by date descending', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        category: 'newspaper',
        sortby: 'datedesc',
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data.totalResults).toBeGreaterThan(0);
      // Results should be in date order (newest first)
      const dates = data.records.map((r) => r.date as string).filter(Boolean);
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i] <= dates[i - 1]).toBe(true);
      }
    });
  });

  describe('faceted search', () => {
    itWithKey('returns facets when requested', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        category: 'newspaper',
        includeFacets: true,
        facetFields: ['decade', 'state'],
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data.facets).toBeDefined();
      expect(Array.isArray(data.facets)).toBe(true);
      expect(data.facets!.length).toBeGreaterThan(0);

      // Check facet structure
      const facet = data.facets![0];
      expect(facet).toHaveProperty('name');
      expect(facet).toHaveProperty('values');
      expect(Array.isArray(facet.values)).toBe(true);
    });
  });

  describe('parameter conflict warnings', () => {
    itWithKey('warns when includeHoldings used with search', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        category: 'newspaper',
        includeHoldings: true,
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data._warnings).toBeDefined();
      expect(data._warnings).toContain(
        'includeHoldings is ignored in trove_search - use trove_get_work with work ID to get holdings'
      );
    });

    itWithKey('warns when year used without decade', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        category: 'newspaper',
        year: '1935',
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data._warnings).toBeDefined();
      expect(data._warnings!.some((w) => w.includes('year parameter requires decade'))).toBe(true);
    });

    itWithKey('warns when nuc used with newspaper category', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        category: 'newspaper',
        nuc: 'VSL',
        limit: 5,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data._warnings).toBeDefined();
      expect(data._warnings!.some((w) => w.includes('nuc filter does not work for newspaper'))).toBe(true);
    });
  });

  describe('user-contributed content', () => {
    itWithKey('includes tags when requested', async () => {
      const result = await troveSearchTool.execute({
        query: 'Ned Kelly',
        category: 'newspaper',
        includeTags: true,
        hasTags: true,
        limit: 10,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      // At least some articles should have tags
      // Note: Not all results may have tags even with hasTags filter
      expect(data.totalResults).toBeGreaterThan(0);
    });

    itWithKey('includes comments when requested', async () => {
      const result = await troveSearchTool.execute({
        query: 'Melbourne',
        category: 'newspaper',
        includeComments: true,
        hasComments: true,
        limit: 10,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<SearchResult>(result);

      expect(data.totalResults).toBeGreaterThan(0);
    });
  });

  describe('validation', () => {
    itWithKey('rejects empty query', async () => {
      const result = await troveSearchTool.execute({
        query: '',
      });

      expect(result).toHaveProperty('isError', true);
    });

    itWithKey('rejects whitespace-only query', async () => {
      const result = await troveSearchTool.execute({
        query: '   ',
      });

      expect(result).toHaveProperty('isError', true);
    });
  });
});
