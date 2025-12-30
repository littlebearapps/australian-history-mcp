/**
 * End-to-End Workflow Integration Tests
 *
 * Tests the complete research workflow:
 * Plan -> Session -> Search -> Compress -> End
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  setupTestDataDir,
  cleanupTestDataDir,
  getTestDataDir,
  sampleSearchResults,
  TEST_TIMEOUT,
} from './setup.js';

// Import modules
import { ResearchPlanner } from '../../src/core/planning/planner.js';
import { SessionManager } from '../../src/core/sessions/manager.js';
import { Compressor } from '../../src/core/compression/compressor.js';
import { Deduplicator } from '../../src/core/compression/dedupe.js';
import { CheckpointManager } from '../../src/core/compression/checkpoint.js';

describe('End-to-End Workflow', () => {
  let dataDir: string;
  let planner: ResearchPlanner;
  let sessionManager: SessionManager;
  let compressor: Compressor;
  let deduplicator: Deduplicator;
  let checkpointManager: CheckpointManager;

  beforeEach(async () => {
    dataDir = await setupTestDataDir();
    planner = new ResearchPlanner(dataDir);
    sessionManager = new SessionManager(dataDir);
    compressor = new Compressor();
    deduplicator = new Deduplicator();
    checkpointManager = new CheckpointManager(dataDir);
  });

  afterEach(async () => {
    await cleanupTestDataDir();
  });

  describe('Complete Research Session', () => {
    it('executes full workflow: plan -> session -> search -> compress -> end', async () => {
      // Stage 1: Create plan
      const plan = await planner.createPlan('Melbourne Railways 1920s');
      expect(plan).toBeDefined();
      expect(plan.planPath).toBeDefined();

      // Stage 2: Start session linked to plan
      const session = await sessionManager.startSession('railways-1920s', 'Melbourne Railways 1920s', {
        planId: plan.id,
      });
      expect(session.planId).toBe(plan.id);

      // Stage 2b: Log searches (simulated)
      await sessionManager.logQuery('prov_search', { query: 'railway' }, 50, 50, 0);
      await sessionManager.logQuery('trove_search', { query: 'Melbourne railway 1920s' }, 100, 95, 5);

      // Verify session status
      const status = await sessionManager.getStatus('full');
      expect(status.queryCount).toBe(2);
      expect(status.totalResults).toBe(150);

      // Stage 3: Compress results
      const compressed = compressor.compress(sampleSearchResults, 'standard');
      expect(compressed.stats.savingsPercent).toBeGreaterThan(0);

      // Stage 3b: Checkpoint progress
      await checkpointManager.save('railways-midpoint', compressed.records, {
        sessionId: session.id,
      });

      // Stage 4: End session
      const result = await sessionManager.endSession();
      expect(result.status).toBe('completed');
      expect(result.totalQueries).toBe(2);
    });

    it('handles compression after deduplication', async () => {
      await sessionManager.startSession('dedupe-compress-test', 'Test Topic');

      // Deduplicate first
      const deduped = deduplicator.dedupe(sampleSearchResults, 'both');
      expect(deduped.records.length).toBeLessThan(sampleSearchResults.length);

      // Then compress
      const compressed = compressor.compress(deduped.records, 'standard');
      expect(compressed.records.length).toBe(deduped.records.length);

      await sessionManager.endSession();
    });

    it('exports session data correctly', async () => {
      await sessionManager.startSession('export-test', 'Test Topic');
      await sessionManager.logQuery('prov_search', { query: 'test' }, 50, 50, 0);
      await sessionManager.addNote('Found useful records');

      // Export as JSON
      const jsonExport = await sessionManager.exportSession('json');
      const data = JSON.parse(jsonExport);
      expect(data.name).toBe('export-test');
      expect(data.queries.length).toBe(1);
      expect(data.notes).toContain('Found useful records');

      // Export as Markdown
      const mdExport = await sessionManager.exportSession('markdown');
      expect(mdExport).toContain('# Research Session: export-test');
      expect(mdExport).toContain('Found useful records');

      await sessionManager.endSession();
    });
  });

  describe('Recovery Workflow', () => {
    it('resumes session after simulated context reset', async () => {
      // Start session and do some work
      const original = await sessionManager.startSession('recovery-test', 'Test Topic');
      await sessionManager.logQuery('prov_search', { query: 'test' }, 50, 50, 0);

      // Create checkpoint
      const compressed = compressor.compress(sampleSearchResults, 'standard');
      await checkpointManager.save('recovery-checkpoint', compressed.records, {
        sessionId: original.id,
      });

      // End session (simulate context loss)
      await sessionManager.endSession('paused');

      // Simulate new context (new manager instances)
      const newSessionManager = new SessionManager(dataDir);
      const newCheckpointManager = new CheckpointManager(dataDir);

      // Find and resume session
      const sessions = await newSessionManager.listSessions({ status: 'paused' });
      expect(sessions.some((s) => s.name === 'recovery-test')).toBe(true);

      const resumed = await newSessionManager.resumeSession('recovery-test');
      expect(resumed.status).toBe('active');

      // Load checkpoint
      const checkpoint = await newCheckpointManager.load('recovery-checkpoint');
      expect(checkpoint).toBeDefined();
      expect(checkpoint!.records.length).toBeGreaterThan(0);

      await newSessionManager.endSession();
    });

    it('lists checkpoints for session', async () => {
      const session = await sessionManager.startSession('checkpoint-list-test', 'Test');

      // Create multiple checkpoints
      const compressed = compressor.compress(sampleSearchResults, 'minimal');
      await checkpointManager.save('cp-1', compressed.records, { sessionId: session.id });
      await checkpointManager.save('cp-2', compressed.records, { sessionId: session.id });

      const checkpoints = await checkpointManager.list({ sessionId: session.id });
      expect(checkpoints.length).toBe(2);

      await sessionManager.endSession();
    });

    it('deletes checkpoint', async () => {
      const session = await sessionManager.startSession('checkpoint-delete-test', 'Test');

      const compressed = compressor.compress(sampleSearchResults, 'minimal');
      const saved = await checkpointManager.save('delete-me', compressed.records);

      await checkpointManager.delete(saved.id);

      const loaded = await checkpointManager.load(saved.id);
      expect(loaded).toBeNull();

      await sessionManager.endSession();
    });
  });

  describe('Persistence', () => {
    it('sessions persist across restart', async () => {
      await sessionManager.startSession('persist-session', 'Test Topic');
      await sessionManager.logQuery('test_tool', {}, 10, 10, 0);
      await sessionManager.endSession('paused');

      // Create new manager (simulates restart)
      const newManager = new SessionManager(dataDir);
      const sessions = await newManager.listSessions();

      expect(sessions.some((s) => s.name === 'persist-session')).toBe(true);
    });

    it('checkpoints persist across restart', async () => {
      const compressed = compressor.compress(sampleSearchResults, 'standard');
      const saved = await checkpointManager.save('persist-checkpoint', compressed.records);

      // Create new manager (simulates restart)
      const newCheckpointManager = new CheckpointManager(dataDir);
      const loaded = await newCheckpointManager.load(saved.id);

      expect(loaded).toBeDefined();
      expect(loaded!.records.length).toBe(compressed.records.length);
    });

    it('plan files persist across restart', async () => {
      const plan = await planner.createPlan('Persist plan test');
      expect(plan.planPath).toBeDefined();

      // Verify file exists after "restart"
      const exists = await fs.access(plan.planPath!).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles missing checkpoint gracefully', async () => {
      const loaded = await checkpointManager.load('non-existent-id');
      expect(loaded).toBeNull();
    });

    it('handles invalid session resume', async () => {
      await expect(sessionManager.resumeSession('non-existent')).rejects.toThrow();
    });

    it('handles session already active error', async () => {
      await sessionManager.startSession('active-session', 'Topic');
      await expect(sessionManager.startSession('another-session', 'Topic')).rejects.toThrow(/already active/i);
      await sessionManager.endSession();
    });
  });
}, TEST_TIMEOUT);
