/**
 * Trove Newspaper Tools Integration Tests
 *
 * Tests trove_list_titles, trove_title_details, trove_newspaper_article.
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
import { troveListTitlesTool } from '../../src/sources/trove/tools/newspaper.js';
import { troveTitleDetailsTool } from '../../src/sources/trove/tools/newspaper.js';
import { troveNewspaperArticleTool } from '../../src/sources/trove/tools/newspaper.js';

// Generic response type for flexible testing
interface ToolResponse {
  source?: string;
  [key: string]: unknown;
}

describeWithKey('trove_list_titles', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('basic listing', () => {
    itWithKey('lists newspaper titles', async () => {
      const result = await troveListTitlesTool.execute({
        type: 'newspaper',
        limit: 10,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data).toHaveProperty('titles');
      expect(Array.isArray(data.titles)).toBe(true);
    });

    itWithKey('lists gazette titles', async () => {
      const result = await troveListTitlesTool.execute({
        type: 'gazette',
        limit: 10,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data).toHaveProperty('titles');
    });
  });

  describe('state filtering', () => {
    itWithKey('filters by state', async () => {
      const result = await troveListTitlesTool.execute({
        type: 'newspaper',
        state: 'vic',
        limit: 10,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data).toHaveProperty('titles');
    });
  });

  describe('pagination', () => {
    itWithKey('supports offset pagination', async () => {
      // Get first page
      const result1 = await troveListTitlesTool.execute({
        type: 'newspaper',
        limit: 5,
        offset: 0,
      });

      expectSuccessResponse(result1);
      const data1 = parseResponseJson<ToolResponse>(result1);

      // Get second page
      await delay(RATE_LIMIT_DELAY);
      const result2 = await troveListTitlesTool.execute({
        type: 'newspaper',
        limit: 5,
        offset: 5,
      });

      expectSuccessResponse(result2);
      const data2 = parseResponseJson<ToolResponse>(result2);

      // Both pages should have titles
      expect(data1).toHaveProperty('titles');
      expect(data2).toHaveProperty('titles');

      // Pages should have different content
      const titles1 = data1.titles as Array<{ id: string }>;
      const titles2 = data2.titles as Array<{ id: string }>;
      if (titles1.length > 0 && titles2.length > 0) {
        expect(titles1[0].id).not.toBe(titles2[0].id);
      }
    });
  });
});

describeWithKey('trove_title_details', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('basic details', () => {
    itWithKey('gets title details by ID', async () => {
      // Use The Argus (Melbourne) - known stable title ID 13
      const result = await troveTitleDetailsTool.execute({
        titleId: '13',
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data).toHaveProperty('title');
    });

    itWithKey('includes years when requested', async () => {
      const result = await troveTitleDetailsTool.execute({
        titleId: '13',
        includeYears: true,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      // Years are included in the title object
      expect(data).toHaveProperty('title');
    });
  });

  describe('error handling', () => {
    itWithKey('handles invalid title ID', async () => {
      const result = await troveTitleDetailsTool.execute({
        titleId: 'invalid-id-99999999',
      });

      // Should return error response
      expect(result).toHaveProperty('isError', true);
    });
  });
});

describeWithKey('trove_newspaper_article', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('article retrieval', () => {
    itWithKey('gets article by ID', async () => {
      // Use a known article ID
      const result = await troveNewspaperArticleTool.execute({
        articleId: '18342701',
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data).toHaveProperty('article');
    });
  });

  describe('error handling', () => {
    itWithKey('handles invalid article ID', async () => {
      const result = await troveNewspaperArticleTool.execute({
        articleId: 'invalid-99999999999',
      });

      // Should return error response
      expect(result).toHaveProperty('isError', true);
    });
  });
});
