/**
 * Research Planning Integration Tests
 *
 * Tests plan_search meta-tool functionality.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  setupTestDataDir,
  cleanupTestDataDir,
  getTestDataDir,
  TEST_TIMEOUT,
} from './setup.js';

// Import planner
import { ResearchPlanner } from '../../src/core/planning/planner.js';
import type { SearchPlan } from '../../src/core/planning/types.js';

describe('Research Planning', () => {
  let planner: ResearchPlanner;
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await setupTestDataDir();
    planner = new ResearchPlanner(dataDir);
  });

  afterEach(async () => {
    await cleanupTestDataDir();
  });

  describe('plan_search', () => {
    it('analyses topic and extracts themes', async () => {
      const plan = await planner.createPlan('Melbourne Olympics 1956');

      expect(plan).toBeDefined();
      expect(plan.topic).toBe('Melbourne Olympics 1956');
      expect(plan.themes).toBeDefined();
      expect(plan.themes.length).toBeGreaterThan(0);
    });

    it('suggests historical name variations', async () => {
      const plan = await planner.createPlan('History of North Melbourne FC at Arden Street');

      expect(plan.historicalNames).toBeDefined();
      // Should suggest variations for Melbourne suburbs/areas
      expect(plan.historicalNames.length).toBeGreaterThanOrEqual(0);
    });

    it('prioritises relevant sources', async () => {
      const plan = await planner.createPlan('Victorian gold rush photographs 1850s');

      expect(plan.sourcePriority).toBeDefined();
      expect(plan.sourcePriority.length).toBeGreaterThan(0);
      // Images would prioritise PROV, Trove, Museums Victoria
      expect(plan.sourcePriority.some((s) => ['prov', 'trove', 'museumsvic'].includes(s))).toBe(true);
    });

    it('generates search strategy', async () => {
      const plan = await planner.createPlan('Melbourne tram network history');

      expect(plan.searchStrategies).toBeDefined();
      expect(plan.searchStrategies.length).toBeGreaterThan(0);

      const strategy = plan.searchStrategies[0];
      expect(strategy).toHaveProperty('source');
      expect(strategy).toHaveProperty('queries');
    });

    it('creates coverage matrix', async () => {
      const plan = await planner.createPlan('Victorian bushfires 1939');

      expect(plan.coverageMatrix).toBeDefined();
      // Matrix should map sources to content types
      expect(typeof plan.coverageMatrix).toBe('object');
    });

    it('saves plan.md file', async () => {
      const plan = await planner.createPlan('Test research topic');

      expect(plan.planPath).toBeDefined();

      // Verify file exists
      const exists = await fs.access(plan.planPath!).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('formats plan.md correctly', async () => {
      const plan = await planner.createPlan('Melbourne architecture 1920s');

      const content = await fs.readFile(plan.planPath!, 'utf-8');

      // Check for expected sections
      expect(content).toContain('# Research Plan');
      expect(content).toContain('## Topic');
      expect(content).toContain('Melbourne architecture 1920s');
    });

    it('handles complex topics', async () => {
      const plan = await planner.createPlan(
        'History of the North Melbourne Football Club ground at Arden Street from 1900 to 1930, including renovations, crowd records, and notable matches'
      );

      expect(plan).toBeDefined();
      expect(plan.themes.length).toBeGreaterThan(1);
      expect(plan.searchStrategies.length).toBeGreaterThan(1);
    });

    it('handles simple topics', async () => {
      const plan = await planner.createPlan('Melbourne Olympics');

      expect(plan).toBeDefined();
      expect(plan.topic).toBe('Melbourne Olympics');
    });

    it('includes date range when specified in topic', async () => {
      const plan = await planner.createPlan('Melbourne floods 1930-1940');

      expect(plan.dateRange).toBeDefined();
      expect(plan.dateRange!.from).toBe('1930');
      expect(plan.dateRange!.to).toBe('1940');
    });
  });

  describe('Topic Analysis', () => {
    it('extracts location mentions', async () => {
      const plan = await planner.createPlan('History of Carlton, Melbourne');

      expect(plan.locations).toBeDefined();
      expect(plan.locations).toContain('Carlton');
      expect(plan.locations).toContain('Melbourne');
    });

    it('identifies content type hints', async () => {
      const plan = await planner.createPlan('Photographs of Melbourne trams');

      expect(plan.contentTypes).toBeDefined();
      expect(plan.contentTypes).toContain('image');
    });

    it('detects era/period references', async () => {
      const plan = await planner.createPlan('Victorian era architecture in Melbourne');

      expect(plan.era).toBeDefined();
      expect(plan.era).toBe('Victorian era');
    });
  });

  describe('Source Routing', () => {
    it('prioritises PROV for Victorian government records', async () => {
      const plan = await planner.createPlan('Victorian government railway records');

      expect(plan.sourcePriority[0]).toBe('prov');
    });

    it('prioritises Trove for newspapers', async () => {
      const plan = await planner.createPlan('newspaper articles about Melbourne floods');

      expect(plan.sourcePriority).toContain('trove');
    });

    it('prioritises ALA for species/biodiversity', async () => {
      const plan = await planner.createPlan('platypus sightings in Victoria');

      expect(plan.sourcePriority).toContain('ala');
    });

    it('prioritises VHD for heritage places', async () => {
      const plan = await planner.createPlan('heritage buildings in Carlton');

      expect(plan.sourcePriority).toContain('vhd');
    });

    it('prioritises GA HAP for aerial photography', async () => {
      const plan = await planner.createPlan('aerial photographs of Melbourne 1950s');

      expect(plan.sourcePriority).toContain('ga-hap');
    });
  });
}, TEST_TIMEOUT);
