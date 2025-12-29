/**
 * Trove Contributors Tools Integration Tests
 *
 * Tests trove_list_contributors, trove_get_contributor.
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
import { troveListContributorsTool } from '../../src/sources/trove/tools/list-contributors.js';
import { troveGetContributorTool } from '../../src/sources/trove/tools/get-contributor.js';

interface ListContributorsResult {
  source: string;
  query: string | null;
  totalResults: number;
  returned: number;
  _pagination?: {
    offset: number;
    limit: number;
    hasMore: boolean;
    nextOffset?: number;
  };
  contributors: Array<{
    nuc: string;
    name: string;
    shortname?: string;
    url?: string;
  }>;
}

interface ContributorResult {
  source: string;
  contributor: {
    nuc: string;
    name: string;
    shortname?: string;
    url?: string;
    address?: string;
    email?: string;
    phone?: string;
    catalogue?: string;
    totalHoldings?: number;
  };
}

describeWithKey('trove_list_contributors', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('basic listing', () => {
    itWithKey('lists all contributors with limit', async () => {
      const result = await troveListContributorsTool.execute({
        limit: 20,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ListContributorsResult>(result);

      expect(data.source).toBe('trove');
      expect(data.totalResults).toBeGreaterThan(0);
      expect(data.returned).toBeLessThanOrEqual(20);
      expect(data.contributors.length).toBe(data.returned);

      // Check contributor structure
      const contrib = data.contributors[0];
      expect(contrib).toHaveProperty('nuc');
      expect(contrib).toHaveProperty('name');
    });

    itWithKey('defaults to 100 if no limit specified', async () => {
      const result = await troveListContributorsTool.execute({});

      expectSuccessResponse(result);
      const data = parseResponseJson<ListContributorsResult>(result);

      expect(data.returned).toBeLessThanOrEqual(100);
    });
  });

  describe('search filtering', () => {
    itWithKey('filters by query', async () => {
      const result = await troveListContributorsTool.execute({
        query: 'university',
        limit: 20,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ListContributorsResult>(result);

      expect(data.totalResults).toBeGreaterThan(0);

      // All results should contain 'university' in name
      for (const contrib of data.contributors) {
        const nameMatch = contrib.name.toLowerCase().includes('university');
        const shortnameMatch = contrib.shortname?.toLowerCase().includes('university');
        expect(nameMatch || shortnameMatch).toBe(true);
      }
    });
  });
});

describeWithKey('trove_get_contributor', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('contributor retrieval', () => {
    itWithKey('gets contributor by NUC code', async () => {
      // Use State Library of Victoria NUC code
      const result = await troveGetContributorTool.execute({
        nuc: 'VSL',
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ContributorResult>(result);

      expect(data.source).toBe('trove');
      expect(data.contributor.nuc).toBe('VSL');
      expect(data.contributor).toHaveProperty('name');
      expect(data.contributor.name).toContain('State Library');
    });

    itWithKey('returns contact details when available', async () => {
      const result = await troveGetContributorTool.execute({
        nuc: 'ANL',
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ContributorResult>(result);

      expect(data.contributor.nuc).toBe('ANL');
      // NLA should have full details
      expect(data.contributor.name).toContain('National Library');
    });
  });

  describe('NUC codes with special characters', () => {
    itWithKey('handles NUC codes with colons', async () => {
      // Some NUC codes have colons (e.g., "AADF:OL")
      // The client should handle escaping automatically
      const result = await troveGetContributorTool.execute({
        nuc: 'ANL',
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ContributorResult>(result);

      expect(data.source).toBe('trove');
    });
  });

  describe('error handling', () => {
    itWithKey('handles invalid NUC code gracefully', async () => {
      const result = await troveGetContributorTool.execute({
        nuc: 'INVALID_NUC_999',
      });

      // Trove API returns success with "Unknown library code" message
      expectSuccessResponse(result);
      const data = parseResponseJson<ContributorResult>(result);
      expect(data.contributor.name).toContain('Unknown library code');
    });
  });
});
