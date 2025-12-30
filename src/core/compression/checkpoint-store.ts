/**
 * Checkpoint Store - JSON Persistence
 *
 * Phase 3: Persistent storage for research checkpoints using JSON file
 *
 * Storage location: ~/.local/share/australian-history-mcp/checkpoints.json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type {
  Checkpoint,
  CheckpointStoreFile,
  CheckpointSummary,
  CompressedRecord,
} from './types.js';
import { createEmptyCheckpointStoreFile, isValidCheckpointName } from './types.js';

const _STORE_VERSION = 1; // Reserved for future store migrations
const DATA_DIR = join(homedir(), '.local', 'share', 'australian-history-mcp');
const CHECKPOINTS_PATH = join(DATA_DIR, 'checkpoints.json');

/**
 * Checkpoint store with JSON persistence
 */
export class CheckpointStore {
  private data: CheckpointStoreFile | null = null;

  /**
   * Get the checkpoints file path
   */
  static getFilePath(): string {
    return CHECKPOINTS_PATH;
  }

  /**
   * Check if checkpoints file exists
   */
  static exists(): boolean {
    return existsSync(CHECKPOINTS_PATH);
  }

  /**
   * Load checkpoints from disk
   */
  private load(): CheckpointStoreFile {
    if (this.data) {
      return this.data;
    }

    if (!existsSync(CHECKPOINTS_PATH)) {
      this.data = createEmptyCheckpointStoreFile();
      return this.data;
    }

    try {
      const content = readFileSync(CHECKPOINTS_PATH, 'utf-8');
      this.data = JSON.parse(content) as CheckpointStoreFile;
      return this.data;
    } catch {
      // If file is corrupted, start fresh
      this.data = createEmptyCheckpointStoreFile();
      return this.data;
    }
  }

  /**
   * Save checkpoints to disk (atomic write via temp file + rename)
   */
  private save(): void {
    if (!this.data) return;

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    this.data.lastModified = new Date().toISOString();

    // Atomic write: write to temp file then rename
    const tempPath = `${CHECKPOINTS_PATH}.tmp`;
    writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
    renameSync(tempPath, CHECKPOINTS_PATH);
  }

  /**
   * Clear cached data (for testing)
   */
  clearCache(): void {
    this.data = null;
  }

  // ==========================================================================
  // Checkpoint CRUD Operations
  // ==========================================================================

  /**
   * Create a new checkpoint
   */
  create(options: {
    name: string;
    records: CompressedRecord[];
    fingerprints?: string[];
    coverage?: Record<string, unknown>;
    sessionId?: string;
  }): Checkpoint {
    if (!isValidCheckpointName(options.name)) {
      throw new Error(
        'Invalid checkpoint name. Use only letters, numbers, hyphens, and underscores (1-64 chars).'
      );
    }

    const data = this.load();

    // Check for duplicate name
    if (data.checkpoints.some((c) => c.name === options.name)) {
      throw new Error(`Checkpoint name '${options.name}' already exists.`);
    }

    const checkpoint: Checkpoint = {
      id: randomUUID(),
      name: options.name,
      created: new Date().toISOString(),
      sessionId: options.sessionId,
      data: {
        records: options.records,
        fingerprints: options.fingerprints ?? [],
        coverage: options.coverage ?? {},
      },
    };

    data.checkpoints.push(checkpoint);
    this.save();

    return checkpoint;
  }

  /**
   * Get a checkpoint by ID
   */
  get(id: string): Checkpoint | undefined {
    const data = this.load();
    return data.checkpoints.find((c) => c.id === id);
  }

  /**
   * Get a checkpoint by name
   */
  getByName(name: string): Checkpoint | undefined {
    const data = this.load();
    return data.checkpoints.find((c) => c.name === name);
  }

  /**
   * Get checkpoint by ID or name
   */
  getByIdOrName(idOrName: string): Checkpoint | undefined {
    return this.get(idOrName) ?? this.getByName(idOrName);
  }

  /**
   * List checkpoints (most recent first)
   */
  list(options: { limit?: number; sessionId?: string } = {}): {
    checkpoints: CheckpointSummary[];
    total: number;
    hasMore: boolean;
  } {
    const data = this.load();
    let checkpoints = [...data.checkpoints];

    // Filter by session ID if provided
    if (options.sessionId) {
      checkpoints = checkpoints.filter((c) => c.sessionId === options.sessionId);
    }

    // Sort by created (newest first)
    checkpoints.sort((a, b) => b.created.localeCompare(a.created));

    const total = checkpoints.length;
    const limit = options.limit ?? 10;
    const limited = checkpoints.slice(0, limit);

    // Convert to summaries (without full data)
    const summaries: CheckpointSummary[] = limited.map((c) => ({
      id: c.id,
      name: c.name,
      created: c.created,
      sessionId: c.sessionId,
      recordCount: c.data.records.length,
    }));

    return {
      checkpoints: summaries,
      total,
      hasMore: total > limit,
    };
  }

  /**
   * Delete a checkpoint by ID
   */
  delete(id: string): boolean {
    const data = this.load();
    const index = data.checkpoints.findIndex((c) => c.id === id);

    if (index === -1) {
      return false;
    }

    data.checkpoints.splice(index, 1);
    this.save();
    return true;
  }

  /**
   * Delete a checkpoint by name
   */
  deleteByName(name: string): boolean {
    const checkpoint = this.getByName(name);
    if (!checkpoint) {
      return false;
    }
    return this.delete(checkpoint.id);
  }

  /**
   * Delete by ID or name
   */
  deleteByIdOrName(idOrName: string): boolean {
    return this.delete(idOrName) || this.deleteByName(idOrName);
  }

  /**
   * Update a checkpoint's records
   */
  update(
    id: string,
    updates: {
      name?: string;
      records?: CompressedRecord[];
      fingerprints?: string[];
      coverage?: Record<string, unknown>;
    }
  ): Checkpoint {
    const data = this.load();
    const checkpoint = data.checkpoints.find((c) => c.id === id);

    if (!checkpoint) {
      throw new Error(`Checkpoint '${id}' not found.`);
    }

    // Validate new name if provided
    if (updates.name && updates.name !== checkpoint.name) {
      if (!isValidCheckpointName(updates.name)) {
        throw new Error(
          'Invalid checkpoint name. Use only letters, numbers, hyphens, and underscores (1-64 chars).'
        );
      }
      if (data.checkpoints.some((c) => c.name === updates.name && c.id !== id)) {
        throw new Error(`Checkpoint name '${updates.name}' already exists.`);
      }
      checkpoint.name = updates.name;
    }

    // Update data fields
    if (updates.records !== undefined) {
      checkpoint.data.records = updates.records;
    }
    if (updates.fingerprints !== undefined) {
      checkpoint.data.fingerprints = updates.fingerprints;
    }
    if (updates.coverage !== undefined) {
      checkpoint.data.coverage = updates.coverage;
    }

    this.save();
    return checkpoint;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get count of all checkpoints
   */
  count(): number {
    const data = this.load();
    return data.checkpoints.length;
  }

  /**
   * Get total record count across all checkpoints
   */
  totalRecordCount(): number {
    const data = this.load();
    return data.checkpoints.reduce((sum, c) => sum + c.data.records.length, 0);
  }

  /**
   * Check if a checkpoint name is already taken
   */
  nameExists(name: string): boolean {
    const data = this.load();
    return data.checkpoints.some((c) => c.name === name);
  }
}

// Export singleton instance
export const checkpointStore = new CheckpointStore();
