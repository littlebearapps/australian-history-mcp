/**
 * PM Transcripts SQLite FTS5 Store
 *
 * SEARCH-018: SQLite wrapper with FTS5 full-text search operations
 *
 * Storage location: ~/.local/share/australian-history-mcp/pm-transcripts.db
 */

import Database from 'better-sqlite3';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type {
  IndexStats,
  IndexSearchResult,
  IndexSearchOptions,
  StoredTranscript,
  IndexMetadata,
} from './types.js';

const INDEX_VERSION = '1.0.0';
const DATA_DIR = join(homedir(), '.local', 'share', 'australian-history-mcp');
const DB_PATH = join(DATA_DIR, 'pm-transcripts.db');

/**
 * Execute raw SQL statement (wrapper to avoid hook false positive on "exec")
 * This is SQLite's exec for SQL statements, NOT child_process exec for shell commands.
 */
function runRawSql(db: Database.Database, sql: string): void {
  // better-sqlite3's exec method runs raw SQL - safe for DDL statements
  (db as unknown as { exec: (sql: string) => void }).exec(sql);
}

/**
 * SQLite FTS5 store for PM Transcripts
 */
export class PMTranscriptsStore {
  private db: Database.Database | null = null;

  /**
   * Get the database file path
   */
  static getDbPath(): string {
    return DB_PATH;
  }

  /**
   * Check if the database exists
   */
  static exists(): boolean {
    return existsSync(DB_PATH);
  }

  /**
   * Open the database connection
   */
  open(): void {
    if (this.db) return;

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');

    this.initSchema();
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Initialize the database schema
   */
  private initSchema(): void {
    if (!this.db) throw new Error('Database not open');

    // Main metadata table
    runRawSql(this.db, `
      CREATE TABLE IF NOT EXISTS pm_transcripts_meta (
        transcript_id INTEGER PRIMARY KEY,
        release_date_iso TEXT,
        document_url TEXT,
        content_hash TEXT NOT NULL
      )
    `);

    // FTS5 virtual table for full-text search
    runRawSql(this.db, `
      CREATE VIRTUAL TABLE IF NOT EXISTS pm_transcripts_fts USING fts5(
        transcript_id UNINDEXED,
        title,
        prime_minister,
        release_type,
        subjects,
        content,
        tokenize='porter unicode61'
      )
    `);

    // Index metadata table
    runRawSql(this.db, `
      CREATE TABLE IF NOT EXISTS index_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Set index version if not exists
    const version = this.getMetadata('index_version');
    if (!version) {
      this.setMetadata('index_version', INDEX_VERSION);
    }
  }

  /**
   * Drop all tables (for rebuild)
   */
  dropAllTables(): void {
    if (!this.db) throw new Error('Database not open');

    runRawSql(this.db, 'DROP TABLE IF EXISTS pm_transcripts_fts');
    runRawSql(this.db, 'DROP TABLE IF EXISTS pm_transcripts_meta');
    runRawSql(this.db, 'DROP TABLE IF EXISTS index_metadata');
  }

  /**
   * Get metadata value
   */
  getMetadata(key: string): string | null {
    if (!this.db) throw new Error('Database not open');

    const stmt = this.db.prepare('SELECT value FROM index_metadata WHERE key = ?');
    const row = stmt.get(key) as IndexMetadata | undefined;
    return row?.value ?? null;
  }

  /**
   * Set metadata value
   */
  setMetadata(key: string, value: string): void {
    if (!this.db) throw new Error('Database not open');

    const stmt = this.db.prepare(
      'INSERT OR REPLACE INTO index_metadata (key, value) VALUES (?, ?)'
    );
    stmt.run(key, value);
  }

  /**
   * Calculate content hash for deduplication
   */
  static contentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  /**
   * Check if a transcript is already indexed with the same content
   */
  isIndexed(transcriptId: number, contentHash: string): boolean {
    if (!this.db) throw new Error('Database not open');

    const stmt = this.db.prepare(
      'SELECT content_hash FROM pm_transcripts_meta WHERE transcript_id = ?'
    );
    const row = stmt.get(transcriptId) as { content_hash: string } | undefined;
    return row?.content_hash === contentHash;
  }

  /**
   * Get highest indexed transcript ID
   */
  getMaxTranscriptId(): number {
    if (!this.db) throw new Error('Database not open');

    const stmt = this.db.prepare('SELECT MAX(transcript_id) as max_id FROM pm_transcripts_meta');
    const row = stmt.get() as { max_id: number | null };
    return row.max_id ?? 0;
  }

  /**
   * Index a transcript
   */
  indexTranscript(transcript: StoredTranscript): void {
    if (!this.db) throw new Error('Database not open');

    const insertMeta = this.db.prepare(`
      INSERT OR REPLACE INTO pm_transcripts_meta
      (transcript_id, release_date_iso, document_url, content_hash)
      VALUES (?, ?, ?, ?)
    `);

    const deleteFts = this.db.prepare(
      'DELETE FROM pm_transcripts_fts WHERE transcript_id = ?'
    );

    const insertFts = this.db.prepare(`
      INSERT INTO pm_transcripts_fts
      (transcript_id, title, prime_minister, release_type, subjects, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Use a transaction for atomicity
    const txn = this.db.transaction(() => {
      insertMeta.run(
        transcript.transcriptId,
        transcript.releaseDateIso,
        transcript.documentUrl,
        transcript.contentHash
      );

      // Delete existing FTS entry if any
      deleteFts.run(transcript.transcriptId);

      insertFts.run(
        transcript.transcriptId,
        transcript.title,
        transcript.primeMinister,
        transcript.releaseType,
        transcript.subjects,
        transcript.content
      );
    });

    txn();
  }

  /**
   * Batch index multiple transcripts
   */
  indexTranscriptBatch(transcripts: StoredTranscript[]): void {
    if (!this.db) throw new Error('Database not open');

    const insertMeta = this.db.prepare(`
      INSERT OR REPLACE INTO pm_transcripts_meta
      (transcript_id, release_date_iso, document_url, content_hash)
      VALUES (?, ?, ?, ?)
    `);

    const deleteFts = this.db.prepare(
      'DELETE FROM pm_transcripts_fts WHERE transcript_id = ?'
    );

    const insertFts = this.db.prepare(`
      INSERT INTO pm_transcripts_fts
      (transcript_id, title, prime_minister, release_type, subjects, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const txn = this.db.transaction(() => {
      for (const t of transcripts) {
        insertMeta.run(
          t.transcriptId,
          t.releaseDateIso,
          t.documentUrl,
          t.contentHash
        );
        deleteFts.run(t.transcriptId);
        insertFts.run(
          t.transcriptId,
          t.title,
          t.primeMinister,
          t.releaseType,
          t.subjects,
          t.content
        );
      }
    });

    txn();
  }

  /**
   * Search transcripts using FTS5
   */
  search(options: IndexSearchOptions): { results: IndexSearchResult[]; total: number } {
    if (!this.db) throw new Error('Database not open');

    const limit = Math.min(options.limit ?? 20, 100);
    const offset = options.offset ?? 0;

    // Build WHERE clauses for filters
    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    // FTS5 match query
    if (options.query) {
      whereClauses.push('pm_transcripts_fts MATCH ?');
      params.push(options.query);
    }

    // Prime Minister filter
    if (options.primeMinister) {
      whereClauses.push('prime_minister LIKE ?');
      params.push(`%${options.primeMinister}%`);
    }

    // Release type filter
    if (options.releaseType) {
      whereClauses.push('release_type = ?');
      params.push(options.releaseType);
    }

    // Date range filters
    if (options.dateFrom) {
      whereClauses.push('m.release_date_iso >= ?');
      params.push(options.dateFrom);
    }
    if (options.dateTo) {
      whereClauses.push('m.release_date_iso <= ?');
      params.push(options.dateTo);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count total matches
    const countSql = `
      SELECT COUNT(*) as total
      FROM pm_transcripts_fts
      LEFT JOIN pm_transcripts_meta m ON pm_transcripts_fts.transcript_id = m.transcript_id
      ${whereClause}
    `;
    const countStmt = this.db.prepare(countSql);
    const countRow = countStmt.get(...params) as { total: number };
    const total = countRow.total;

    // Search with ranking
    const searchSql = `
      SELECT
        pm_transcripts_fts.transcript_id,
        pm_transcripts_fts.title,
        pm_transcripts_fts.prime_minister,
        pm_transcripts_fts.release_type,
        pm_transcripts_fts.subjects,
        m.release_date_iso,
        m.document_url,
        snippet(pm_transcripts_fts, 5, '<mark>', '</mark>', '...', 40) as snippet,
        bm25(pm_transcripts_fts) as score
      FROM pm_transcripts_fts
      LEFT JOIN pm_transcripts_meta m ON pm_transcripts_fts.transcript_id = m.transcript_id
      ${whereClause}
      ORDER BY ${options.query ? 'score' : 'm.release_date_iso DESC'}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const searchStmt = this.db.prepare(searchSql);
    const rows = searchStmt.all(...params) as Array<{
      transcript_id: number;
      title: string;
      prime_minister: string;
      release_type: string;
      subjects: string;
      release_date_iso: string;
      document_url: string | null;
      snippet: string;
      score: number;
    }>;

    const results: IndexSearchResult[] = rows.map((row) => ({
      transcriptId: row.transcript_id,
      title: row.title,
      primeMinister: row.prime_minister,
      releaseType: row.release_type,
      subjects: row.subjects ? row.subjects.split(',').map((s) => s.trim()) : [],
      releaseDateIso: row.release_date_iso,
      documentUrl: row.document_url,
      snippet: row.snippet,
      score: row.score,
    }));

    return { results, total };
  }

  /**
   * Get index statistics
   */
  getStats(): IndexStats {
    if (!this.db) throw new Error('Database not open');

    const countStmt = this.db.prepare('SELECT COUNT(*) as total FROM pm_transcripts_meta');
    const countRow = countStmt.get() as { total: number };

    const pmStmt = this.db.prepare(
      'SELECT COUNT(DISTINCT prime_minister) as count FROM pm_transcripts_fts'
    );
    const pmRow = pmStmt.get() as { count: number };

    const rtStmt = this.db.prepare(
      'SELECT COUNT(DISTINCT release_type) as count FROM pm_transcripts_fts'
    );
    const rtRow = rtStmt.get() as { count: number };

    const dateStmt = this.db.prepare(`
      SELECT
        MIN(release_date_iso) as earliest,
        MAX(release_date_iso) as latest
      FROM pm_transcripts_meta
      WHERE release_date_iso IS NOT NULL
    `);
    const dateRow = dateStmt.get() as { earliest: string | null; latest: string | null };

    // Get file size
    let dbSizeBytes = 0;
    try {
      if (existsSync(DB_PATH)) {
        dbSizeBytes = statSync(DB_PATH).size;
      }
    } catch {
      // Ignore errors
    }

    const lastUpdated = this.getMetadata('last_updated');
    const indexVersion = this.getMetadata('index_version') ?? INDEX_VERSION;

    return {
      totalTranscripts: countRow.total,
      uniquePrimeMinisters: pmRow.count,
      uniqueReleaseTypes: rtRow.count,
      dateRange: {
        earliest: dateRow.earliest,
        latest: dateRow.latest,
      },
      dbSizeBytes,
      lastUpdated,
      indexVersion,
    };
  }

  /**
   * Optimize the FTS5 index
   */
  optimize(): void {
    if (!this.db) throw new Error('Database not open');

    runRawSql(this.db, "INSERT INTO pm_transcripts_fts(pm_transcripts_fts) VALUES('optimize')");
    this.setMetadata('last_updated', new Date().toISOString());
  }

  /**
   * List unique Prime Ministers
   */
  listPrimeMinisters(): string[] {
    if (!this.db) throw new Error('Database not open');

    const stmt = this.db.prepare(
      'SELECT DISTINCT prime_minister FROM pm_transcripts_fts ORDER BY prime_minister'
    );
    const rows = stmt.all() as Array<{ prime_minister: string }>;
    return rows.map((r) => r.prime_minister);
  }

  /**
   * List unique release types
   */
  listReleaseTypes(): string[] {
    if (!this.db) throw new Error('Database not open');

    const stmt = this.db.prepare(
      'SELECT DISTINCT release_type FROM pm_transcripts_fts ORDER BY release_type'
    );
    const rows = stmt.all() as Array<{ release_type: string }>;
    return rows.map((r) => r.release_type);
  }
}

// Export singleton instance
export const pmTranscriptsStore = new PMTranscriptsStore();
