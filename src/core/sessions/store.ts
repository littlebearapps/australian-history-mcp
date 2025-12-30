/**
 * Session Store - JSON Persistence
 *
 * Phase 2: Persistent storage for research sessions using JSON file
 *
 * Storage location: ~/.local/share/australian-history-mcp/sessions.json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type {
  Session,
  SessionStoreFile,
  SessionQuery,
  ResultFingerprint,
  SourceCoverage,
  ListSessionOptions,
  SessionStatus,
} from './types.js';
import {
  createInitialCoverage,
  createInitialStats,
  createEmptyStoreFile,
  isValidSessionName,
} from './types.js';

const STORE_VERSION = 1;
const DATA_DIR = join(homedir(), '.local', 'share', 'australian-history-mcp');
const SESSIONS_PATH = join(DATA_DIR, 'sessions.json');

/**
 * Session store with JSON persistence
 */
export class SessionStore {
  private data: SessionStoreFile | null = null;

  /**
   * Get the sessions file path
   */
  static getFilePath(): string {
    return SESSIONS_PATH;
  }

  /**
   * Check if sessions file exists
   */
  static exists(): boolean {
    return existsSync(SESSIONS_PATH);
  }

  /**
   * Load sessions from disk
   */
  private load(): SessionStoreFile {
    if (this.data) {
      return this.data;
    }

    if (!existsSync(SESSIONS_PATH)) {
      this.data = createEmptyStoreFile();
      return this.data;
    }

    try {
      const content = readFileSync(SESSIONS_PATH, 'utf-8');
      this.data = JSON.parse(content) as SessionStoreFile;
      return this.data;
    } catch {
      // If file is corrupted, start fresh
      this.data = createEmptyStoreFile();
      return this.data;
    }
  }

  /**
   * Save sessions to disk (atomic write via temp file + rename)
   */
  private save(): void {
    if (!this.data) return;

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    this.data.lastModified = new Date().toISOString();

    // Atomic write: write to temp file then rename
    const tempPath = `${SESSIONS_PATH}.tmp`;
    writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
    renameSync(tempPath, SESSIONS_PATH);
  }

  /**
   * Clear cached data (for testing)
   */
  clearCache(): void {
    this.data = null;
  }

  // ==========================================================================
  // Session CRUD Operations
  // ==========================================================================

  /**
   * Create a new session
   */
  create(options: {
    name: string;
    topic: string;
    planId?: string;
    planPath?: string;
  }): Session {
    if (!isValidSessionName(options.name)) {
      throw new Error(
        'Invalid session name. Use only letters, numbers, hyphens, and underscores (1-64 chars).'
      );
    }

    const data = this.load();

    // Check for duplicate name
    if (data.sessions.some((s) => s.name === options.name)) {
      throw new Error(`Session name '${options.name}' already exists.`);
    }

    // Check for active session
    if (data.activeSessionId) {
      const activeSession = data.sessions.find((s) => s.id === data.activeSessionId);
      if (activeSession && activeSession.status === 'active') {
        throw new Error(
          `Another session '${activeSession.name}' is active. End or pause it first.`
        );
      }
    }

    const now = new Date().toISOString();
    const session: Session = {
      id: randomUUID(),
      name: options.name,
      topic: options.topic,
      status: 'active',
      planId: options.planId,
      planPath: options.planPath,
      created: now,
      updated: now,
      queries: [],
      fingerprints: [],
      coverage: createInitialCoverage(),
      notes: [],
      stats: createInitialStats(),
    };

    data.sessions.push(session);
    data.activeSessionId = session.id;
    this.save();

    return session;
  }

  /**
   * Get a session by ID
   */
  get(id: string): Session | undefined {
    const data = this.load();
    return data.sessions.find((s) => s.id === id);
  }

  /**
   * Get a session by name
   */
  getByName(name: string): Session | undefined {
    const data = this.load();
    return data.sessions.find((s) => s.name === name);
  }

  /**
   * Get the currently active session
   */
  getActive(): Session | undefined {
    const data = this.load();
    if (!data.activeSessionId) {
      return undefined;
    }
    return data.sessions.find((s) => s.id === data.activeSessionId);
  }

  /**
   * Set a session as active
   */
  setActive(id: string): void {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === id);

    if (!session) {
      throw new Error(`Session '${id}' not found.`);
    }

    if (session.status === 'completed' || session.status === 'archived') {
      throw new Error(
        `Cannot activate a ${session.status} session. Use resume for paused sessions.`
      );
    }

    // Check for existing active session
    if (data.activeSessionId && data.activeSessionId !== id) {
      const existingActive = data.sessions.find((s) => s.id === data.activeSessionId);
      if (existingActive && existingActive.status === 'active') {
        throw new Error(
          `Another session '${existingActive.name}' is active. End or pause it first.`
        );
      }
    }

    data.activeSessionId = id;
    session.status = 'active';
    session.updated = new Date().toISOString();
    this.save();
  }

  /**
   * Clear the active session flag
   */
  clearActive(): void {
    const data = this.load();
    data.activeSessionId = undefined;
    this.save();
  }

  /**
   * Update a session
   */
  update(
    id: string,
    updates: Partial<Pick<Session, 'name' | 'topic' | 'status' | 'planId' | 'planPath'>>
  ): Session {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === id);

    if (!session) {
      throw new Error(`Session '${id}' not found.`);
    }

    // Validate new name if provided
    if (updates.name && updates.name !== session.name) {
      if (!isValidSessionName(updates.name)) {
        throw new Error(
          'Invalid session name. Use only letters, numbers, hyphens, and underscores (1-64 chars).'
        );
      }
      if (data.sessions.some((s) => s.name === updates.name && s.id !== id)) {
        throw new Error(`Session name '${updates.name}' already exists.`);
      }
    }

    // Apply updates
    if (updates.name !== undefined) session.name = updates.name;
    if (updates.topic !== undefined) session.topic = updates.topic;
    if (updates.status !== undefined) session.status = updates.status;
    if (updates.planId !== undefined) session.planId = updates.planId;
    if (updates.planPath !== undefined) session.planPath = updates.planPath;

    session.updated = new Date().toISOString();
    this.save();

    return session;
  }

  /**
   * End a session (set status to completed or archived)
   */
  end(id: string, status: 'completed' | 'archived' = 'completed'): Session {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === id);

    if (!session) {
      throw new Error(`Session '${id}' not found.`);
    }

    session.status = status;
    session.updated = new Date().toISOString();

    // Clear active if this was the active session
    if (data.activeSessionId === id) {
      data.activeSessionId = undefined;
    }

    this.save();
    return session;
  }

  /**
   * Pause a session
   */
  pause(id: string): Session {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === id);

    if (!session) {
      throw new Error(`Session '${id}' not found.`);
    }

    if (session.status !== 'active') {
      throw new Error(`Can only pause active sessions.`);
    }

    session.status = 'paused';
    session.updated = new Date().toISOString();

    // Clear active if this was the active session
    if (data.activeSessionId === id) {
      data.activeSessionId = undefined;
    }

    this.save();
    return session;
  }

  /**
   * Resume a paused session
   */
  resume(id: string): Session {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === id);

    if (!session) {
      throw new Error(`Session '${id}' not found.`);
    }

    if (session.status === 'completed' || session.status === 'archived') {
      throw new Error(`Cannot resume a ${session.status} session.`);
    }

    // Check for existing active session
    if (data.activeSessionId && data.activeSessionId !== id) {
      const existingActive = data.sessions.find((s) => s.id === data.activeSessionId);
      if (existingActive && existingActive.status === 'active') {
        throw new Error(
          `Another session '${existingActive.name}' is active. End or pause it first.`
        );
      }
    }

    session.status = 'active';
    session.updated = new Date().toISOString();
    data.activeSessionId = id;

    this.save();
    return session;
  }

  /**
   * List sessions with optional filtering
   */
  list(options: ListSessionOptions = {}): { sessions: Session[]; total: number; hasMore: boolean } {
    const data = this.load();
    let sessions = [...data.sessions];

    // Filter by status
    if (options.status) {
      sessions = sessions.filter((s) => s.status === options.status);
    }

    // Exclude archived by default
    if (!options.includeArchived) {
      sessions = sessions.filter((s) => s.status !== 'archived');
    }

    // Search in topic
    if (options.topic) {
      const searchLower = options.topic.toLowerCase();
      sessions = sessions.filter((s) => s.topic.toLowerCase().includes(searchLower));
    }

    // Sort by updated (newest first)
    sessions.sort((a, b) => b.updated.localeCompare(a.updated));

    const total = sessions.length;
    const limit = options.limit ?? 10;
    const limited = sessions.slice(0, limit);

    return {
      sessions: limited,
      total,
      hasMore: total > limit,
    };
  }

  // ==========================================================================
  // Query Logging
  // ==========================================================================

  /**
   * Log a query to a session
   */
  logQuery(sessionId: string, query: SessionQuery): void {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new Error(`Session '${sessionId}' not found.`);
    }

    session.queries.push(query);

    // Update stats
    session.stats.totalQueries++;
    session.stats.totalResults += query.resultCount;
    session.stats.uniqueResults += query.uniqueCount;
    session.stats.duplicatesRemoved += query.duplicatesRemoved;

    session.updated = new Date().toISOString();
    this.save();
  }

  // ==========================================================================
  // Fingerprint Management
  // ==========================================================================

  /**
   * Add a fingerprint to a session
   */
  addFingerprint(sessionId: string, fingerprint: ResultFingerprint): void {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new Error(`Session '${sessionId}' not found.`);
    }

    session.fingerprints.push(fingerprint);
    session.updated = new Date().toISOString();
    this.save();
  }

  /**
   * Check if a fingerprint exists in a session
   */
  hasFingerprint(sessionId: string, fingerprintId: string): boolean {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === sessionId);

    if (!session) {
      return false;
    }

    return session.fingerprints.some((fp) => fp.id === fingerprintId);
  }

  /**
   * Get all fingerprints for a session
   */
  getFingerprints(sessionId: string): ResultFingerprint[] {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === sessionId);
    return session?.fingerprints ?? [];
  }

  // ==========================================================================
  // Coverage Tracking
  // ==========================================================================

  /**
   * Update coverage for a source
   */
  updateCoverage(
    sessionId: string,
    source: string,
    status: SourceCoverage['status'],
    resultsFound?: number,
    error?: string
  ): void {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new Error(`Session '${sessionId}' not found.`);
    }

    const coverage = session.coverage.find((c) => c.source === source);
    if (!coverage) {
      // Source not in coverage list - add it
      session.coverage.push({
        source,
        status,
        queriesExecuted: 1,
        resultsFound: resultsFound ?? 0,
        lastSearched: new Date().toISOString(),
        errors: error ? [error] : undefined,
      });
    } else {
      coverage.status = status;
      coverage.queriesExecuted++;
      coverage.resultsFound += resultsFound ?? 0;
      coverage.lastSearched = new Date().toISOString();
      if (error) {
        coverage.errors = coverage.errors ?? [];
        coverage.errors.push(error);
      }
    }

    // Update sourcesSearched count
    session.stats.sourcesSearched = session.coverage.filter(
      (c) => c.status === 'searched' || c.status === 'partial'
    ).length;

    session.updated = new Date().toISOString();
    this.save();
  }

  /**
   * Get coverage summary for a session
   */
  getCoverageSummary(sessionId: string): {
    searched: string[];
    pending: string[];
    failed: string[];
  } {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === sessionId);

    if (!session) {
      return { searched: [], pending: [], failed: [] };
    }

    return {
      searched: session.coverage
        .filter((c) => c.status === 'searched' || c.status === 'partial')
        .map((c) => c.source),
      pending: session.coverage
        .filter((c) => c.status === 'not_searched')
        .map((c) => c.source),
      failed: session.coverage.filter((c) => c.status === 'failed').map((c) => c.source),
    };
  }

  // ==========================================================================
  // Notes
  // ==========================================================================

  /**
   * Add a note to a session
   */
  addNote(sessionId: string, note: string): number {
    const data = this.load();
    const session = data.sessions.find((s) => s.id === sessionId);

    if (!session) {
      throw new Error(`Session '${sessionId}' not found.`);
    }

    session.notes.push(note);
    session.updated = new Date().toISOString();
    this.save();

    return session.notes.length;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get count of all sessions
   */
  count(): number {
    const data = this.load();
    return data.sessions.length;
  }

  /**
   * Delete a session by ID
   */
  delete(id: string): boolean {
    const data = this.load();
    const index = data.sessions.findIndex((s) => s.id === id);

    if (index === -1) {
      return false;
    }

    // Clear active if deleting the active session
    if (data.activeSessionId === id) {
      data.activeSessionId = undefined;
    }

    data.sessions.splice(index, 1);
    this.save();
    return true;
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();
