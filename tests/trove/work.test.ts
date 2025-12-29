/**
 * Trove Work Tools Integration Tests
 *
 * Tests trove_get_work, trove_get_versions, trove_get_person, trove_get_list.
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
import { troveGetWorkTool } from '../../src/sources/trove/tools/get-work.js';
import { troveGetVersionsTool } from '../../src/sources/trove/tools/get-versions.js';
import { troveGetPersonTool } from '../../src/sources/trove/tools/get-person.js';
import { troveGetListTool } from '../../src/sources/trove/tools/get-list.js';

// Generic response type for flexible testing
interface ToolResponse {
  source?: string;
  [key: string]: unknown;
}

describeWithKey('trove_get_work', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('basic work retrieval', () => {
    itWithKey('gets work by ID', async () => {
      // Use a known work ID (Melbourne history monographs)
      const result = await troveGetWorkTool.execute({
        workId: '8600864',
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data).toHaveProperty('work');

      // Work data is nested
      const work = data.work as Record<string, unknown>;
      expect(work.id).toBe('8600864');
      expect(work).toHaveProperty('title');
      expect(work).toHaveProperty('type');
    });
  });

  describe('include options', () => {
    itWithKey('includes holdings when requested', async () => {
      const result = await troveGetWorkTool.execute({
        workId: '8600864',
        include: ['holdings'],
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data).toHaveProperty('work');

      // Holdings are at top level if present
      if (data.holdings) {
        expect(Array.isArray(data.holdings)).toBe(true);
      }
    });

    itWithKey('includes links when requested', async () => {
      const result = await troveGetWorkTool.execute({
        workId: '8600864',
        include: ['links'],
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');

      // Links may or may not be present
      if (data.links) {
        expect(Array.isArray(data.links)).toBe(true);
      }
    });

    itWithKey('includes versions when requested', async () => {
      const result = await troveGetWorkTool.execute({
        workId: '8600864',
        include: ['workversions'],
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');

      // Versions at top level if present
      if (data.versions) {
        expect(Array.isArray(data.versions)).toBe(true);
      }
    });
  });

  describe('error handling', () => {
    itWithKey('handles invalid work ID', async () => {
      const result = await troveGetWorkTool.execute({
        workId: 'invalid-99999999999',
      });

      // Should return error response
      expect(result).toHaveProperty('isError', true);
    });
  });
});

describeWithKey('trove_get_versions', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('version retrieval', () => {
    itWithKey('gets all versions of a work', async () => {
      const result = await troveGetVersionsTool.execute({
        workId: '8600864',
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data.workId).toBe('8600864');
      expect(data).toHaveProperty('versions');
      expect(Array.isArray(data.versions)).toBe(true);
    });
  });
});

describeWithKey('trove_get_person', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('person retrieval', () => {
    itWithKey('gets person by ID', async () => {
      // Use a known person ID
      const result = await troveGetPersonTool.execute({
        personId: '510418',
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data).toHaveProperty('person');

      // Person data is nested
      const person = data.person as Record<string, unknown>;
      expect(person.id).toBe('510418');
      expect(person).toHaveProperty('type');
      expect(person).toHaveProperty('primaryName');
    });
  });

  describe('error handling', () => {
    itWithKey('handles invalid person ID', async () => {
      const result = await troveGetPersonTool.execute({
        personId: 'invalid-99999999999',
      });

      // Should return error response
      expect(result).toHaveProperty('isError', true);
    });
  });
});

describeWithKey('trove_get_list', () => {
  skipIfNoApiKey();

  beforeEach(async () => {
    await delay(RATE_LIMIT_DELAY);
  });

  describe('list retrieval', () => {
    itWithKey('gets list by ID', async () => {
      // Use a known list ID
      const result = await troveGetListTool.execute({
        listId: '83777',
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');
      expect(data).toHaveProperty('list');

      // List data is nested
      const list = data.list as Record<string, unknown>;
      expect(list.id).toBe('83777');
      expect(list).toHaveProperty('title');
      expect(list).toHaveProperty('creator');
    });

    itWithKey('includes items when requested', async () => {
      const result = await troveGetListTool.execute({
        listId: '83777',
        includeItems: true,
      });

      expectSuccessResponse(result);
      const data = parseResponseJson<ToolResponse>(result);

      expect(data.source).toBe('trove');

      // Items at top level if present
      if (data.items) {
        expect(Array.isArray(data.items)).toBe(true);
      }
    });
  });

  describe('error handling', () => {
    itWithKey('handles invalid list ID', async () => {
      const result = await troveGetListTool.execute({
        listId: 'invalid-99999999999',
      });

      // Should return error response
      expect(result).toHaveProperty('isError', true);
    });
  });
});
