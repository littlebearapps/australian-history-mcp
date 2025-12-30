/**
 * Session Management Integration Tests
 *
 * Tests session_start, session_status, session_end, session_resume,
 * session_list, session_export, and session_note meta-tools.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  setupTestDataDir,
  cleanupTestDataDir,
  getTestDataDir,
  sampleSession,
  TEST_TIMEOUT,
} from './setup.js';

// Import session manager
import { SessionManager } from '../../src/core/sessions/manager.js';
import type { Session, SessionStatus } from '../../src/core/sessions/types.js';

describe('Session Management', () => {
  let sessionManager: SessionManager;
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await setupTestDataDir();
    sessionManager = new SessionManager(dataDir);
  });

  afterEach(async () => {
    await cleanupTestDataDir();
  });

  describe('session_start', () => {
    it('creates a new session with valid name', async () => {
      const session = await sessionManager.startSession('test-research', 'Melbourne Railways 1920s');

      expect(session).toBeDefined();
      expect(session.id).toMatch(/^session-/);
      expect(session.name).toBe('test-research');
      expect(session.topic).toBe('Melbourne Railways 1920s');
      expect(session.status).toBe('active');
    });

    it('validates name format', async () => {
      // Valid names
      await expect(sessionManager.startSession('valid-name', 'Topic')).resolves.toBeDefined();
      await sessionManager.endSession();

      await expect(sessionManager.startSession('valid_name_2', 'Topic')).resolves.toBeDefined();
      await sessionManager.endSession();

      // Invalid names
      await expect(sessionManager.startSession('invalid name', 'Topic')).rejects.toThrow();
      await expect(sessionManager.startSession('invalid!name', 'Topic')).rejects.toThrow();
      await expect(sessionManager.startSession('', 'Topic')).rejects.toThrow();
    });

    it('rejects duplicate session names', async () => {
      await sessionManager.startSession('unique-name', 'Topic 1');
      await sessionManager.endSession();

      await expect(sessionManager.startSession('unique-name', 'Topic 2')).rejects.toThrow(/already exists/i);
    });

    it('rejects when session already active', async () => {
      await sessionManager.startSession('first-session', 'Topic');

      await expect(sessionManager.startSession('second-session', 'Topic')).rejects.toThrow(/already active/i);
    });

    it('links to planId when provided', async () => {
      const session = await sessionManager.startSession('planned-research', 'Topic', {
        planId: 'plan-abc123',
      });

      expect(session.planId).toBe('plan-abc123');
    });
  });

  describe('session_status', () => {
    it('returns quick status by default', async () => {
      await sessionManager.startSession('status-test', 'Test Topic');
      const status = await sessionManager.getStatus();

      expect(status).toBeDefined();
      expect(status.name).toBe('status-test');
      expect(status.status).toBe('active');
      expect(status.queryCount).toBe(0);
    });

    it('includes full detail when requested', async () => {
      const session = await sessionManager.startSession('full-status-test', 'Test Topic');

      // Log a query
      await sessionManager.logQuery('prov_search', { query: 'railway' }, 10, 10, 0);

      const status = await sessionManager.getStatus('full');

      expect(status.queries).toBeDefined();
      expect(status.queries!.length).toBe(1);
      expect(status.queries![0].tool).toBe('prov_search');
    });

    it('returns error when no active session', async () => {
      await expect(sessionManager.getStatus()).rejects.toThrow(/no active session/i);
    });
  });

  describe('session_end', () => {
    it('marks session as completed', async () => {
      await sessionManager.startSession('end-test', 'Test Topic');
      const result = await sessionManager.endSession();

      expect(result.status).toBe('completed');
    });

    it('generates final statistics', async () => {
      await sessionManager.startSession('stats-test', 'Test Topic');
      await sessionManager.logQuery('prov_search', { query: 'test' }, 50, 50, 0);
      await sessionManager.logQuery('trove_search', { query: 'test' }, 30, 25, 5);

      const result = await sessionManager.endSession();

      expect(result.totalQueries).toBe(2);
      expect(result.totalResults).toBe(80);
    });

    it('clears active session state', async () => {
      await sessionManager.startSession('clear-test', 'Test Topic');
      await sessionManager.endSession();

      // Should be able to start new session
      await expect(sessionManager.startSession('new-session', 'Topic')).resolves.toBeDefined();
    });

    it('supports archived status', async () => {
      await sessionManager.startSession('archive-test', 'Test Topic');
      const result = await sessionManager.endSession('archived');

      expect(result.status).toBe('archived');
    });
  });

  describe('session_resume', () => {
    it('resumes by session ID', async () => {
      const original = await sessionManager.startSession('resume-id-test', 'Topic');
      await sessionManager.logQuery('prov_search', { query: 'test' }, 10, 10, 0);
      await sessionManager.endSession('paused');

      const resumed = await sessionManager.resumeSession(original.id);

      expect(resumed.id).toBe(original.id);
      expect(resumed.status).toBe('active');
    });

    it('resumes by session name', async () => {
      await sessionManager.startSession('resume-name-test', 'Topic');
      await sessionManager.endSession('paused');

      const resumed = await sessionManager.resumeSession('resume-name-test');

      expect(resumed.name).toBe('resume-name-test');
      expect(resumed.status).toBe('active');
    });

    it('returns previous progress', async () => {
      await sessionManager.startSession('progress-test', 'Topic');
      await sessionManager.logQuery('prov_search', { query: 'test' }, 50, 50, 0);
      await sessionManager.endSession('paused');

      const resumed = await sessionManager.resumeSession('progress-test');
      const status = await sessionManager.getStatus('full');

      expect(status.queries!.length).toBe(1);
    });

    it('rejects resuming completed sessions', async () => {
      await sessionManager.startSession('completed-test', 'Topic');
      await sessionManager.endSession('completed');

      await expect(sessionManager.resumeSession('completed-test')).rejects.toThrow();
    });
  });

  describe('session_list', () => {
    it('lists all sessions', async () => {
      await sessionManager.startSession('list-test-1', 'Topic 1');
      await sessionManager.endSession();
      await sessionManager.startSession('list-test-2', 'Topic 2');
      await sessionManager.endSession();

      const list = await sessionManager.listSessions();

      expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('filters by status', async () => {
      await sessionManager.startSession('active-session', 'Topic');

      const activeList = await sessionManager.listSessions({ status: 'active' });

      expect(activeList.every((s) => s.status === 'active')).toBe(true);
    });

    it('respects limit parameter', async () => {
      await sessionManager.startSession('limit-1', 'Topic');
      await sessionManager.endSession();
      await sessionManager.startSession('limit-2', 'Topic');
      await sessionManager.endSession();
      await sessionManager.startSession('limit-3', 'Topic');
      await sessionManager.endSession();

      const list = await sessionManager.listSessions({ limit: 2 });

      expect(list.length).toBeLessThanOrEqual(2);
    });
  });

  describe('session_note', () => {
    it('adds note to active session', async () => {
      await sessionManager.startSession('note-test', 'Topic');
      await sessionManager.addNote('This is a test note');

      const status = await sessionManager.getStatus('full');
      expect(status.notes).toContain('This is a test note');
    });

    it('note appears in session export', async () => {
      await sessionManager.startSession('export-note-test', 'Topic');
      await sessionManager.addNote('Important finding');

      const exported = await sessionManager.exportSession('json');
      const data = JSON.parse(exported);

      expect(data.notes).toContain('Important finding');
    });
  });

  describe('Auto-logging', () => {
    it('logs queries when session active', async () => {
      await sessionManager.startSession('auto-log-test', 'Topic');

      await sessionManager.logQuery('prov_search', { query: 'railway' }, 50, 50, 0);

      const status = await sessionManager.getStatus('full');
      expect(status.queries!.length).toBe(1);
      expect(status.queryCount).toBe(1);
    });

    it('tracks duplicate results', async () => {
      await sessionManager.startSession('duplicate-test', 'Topic');

      await sessionManager.logQuery('prov_search', { query: 'test' }, 50, 45, 5);

      const status = await sessionManager.getStatus();
      expect(status.totalDuplicates).toBe(5);
    });

    it('updates coverage tracking', async () => {
      await sessionManager.startSession('coverage-test', 'Topic');

      await sessionManager.logQuery('prov_search', { query: 'test' }, 50, 50, 0);
      await sessionManager.logQuery('trove_search', { query: 'test' }, 30, 30, 0);

      const status = await sessionManager.getStatus();
      expect(status.sourcesSearched).toContain('prov');
      expect(status.sourcesSearched).toContain('trove');
    });
  });

  describe('Persistence', () => {
    it('sessions persist to disk', async () => {
      await sessionManager.startSession('persist-test', 'Topic');
      await sessionManager.endSession();

      // Create new manager instance
      const newManager = new SessionManager(dataDir);
      const list = await newManager.listSessions();

      expect(list.some((s) => s.name === 'persist-test')).toBe(true);
    });
  });
}, TEST_TIMEOUT);
