/**
 * Saved Queries JSON Store
 *
 * SEARCH-019: Persistent storage for saved queries using JSON file
 *
 * Storage location: ~/.local/share/australian-history-mcp/saved-queries.json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type {
  SavedQuery,
  SavedQueriesFile,
  ListQueryOptions,
} from './types.js';

const FILE_VERSION = '1.0.0';
const DATA_DIR = join(homedir(), '.local', 'share', 'australian-history-mcp');
const QUERIES_PATH = join(DATA_DIR, 'saved-queries.json');

/**
 * Validate query name format
 */
function isValidName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name) && name.length >= 1 && name.length <= 64;
}

/**
 * Saved queries store with JSON persistence
 */
export class SavedQueriesStore {
  private data: SavedQueriesFile | null = null;

  /**
   * Get the queries file path
   */
  static getFilePath(): string {
    return QUERIES_PATH;
  }

  /**
   * Check if queries file exists
   */
  static exists(): boolean {
    return existsSync(QUERIES_PATH);
  }

  /**
   * Load queries from disk
   */
  private load(): SavedQueriesFile {
    if (this.data) {
      return this.data;
    }

    if (!existsSync(QUERIES_PATH)) {
      this.data = {
        version: FILE_VERSION,
        queries: {},
        lastModified: new Date().toISOString(),
      };
      return this.data;
    }

    try {
      const content = readFileSync(QUERIES_PATH, 'utf-8');
      this.data = JSON.parse(content) as SavedQueriesFile;
      return this.data;
    } catch {
      // If file is corrupted, start fresh
      this.data = {
        version: FILE_VERSION,
        queries: {},
        lastModified: new Date().toISOString(),
      };
      return this.data;
    }
  }

  /**
   * Save queries to disk
   */
  private save(): void {
    if (!this.data) return;

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    this.data.lastModified = new Date().toISOString();
    writeFileSync(QUERIES_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  /**
   * Clear cached data (for testing)
   */
  clearCache(): void {
    this.data = null;
  }

  /**
   * Save a new query or update existing
   */
  saveQuery(query: Omit<SavedQuery, 'createdAt' | 'useCount'>): SavedQuery {
    if (!isValidName(query.name)) {
      throw new Error(
        'Invalid query name. Use only letters, numbers, hyphens, and underscores (1-64 chars).'
      );
    }

    const data = this.load();
    const existing = data.queries[query.name];

    const savedQuery: SavedQuery = {
      name: query.name,
      description: query.description,
      source: query.source,
      tool: query.tool,
      parameters: query.parameters,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      useCount: existing?.useCount ?? 0,
      tags: query.tags,
    };

    data.queries[query.name] = savedQuery;
    this.save();

    return savedQuery;
  }

  /**
   * Get a query by name
   */
  getQuery(name: string): SavedQuery | null {
    const data = this.load();
    return data.queries[name] ?? null;
  }

  /**
   * Delete a query by name
   */
  deleteQuery(name: string): boolean {
    const data = this.load();
    if (!data.queries[name]) {
      return false;
    }

    delete data.queries[name];
    this.save();
    return true;
  }

  /**
   * Mark a query as used (updates lastUsed and useCount)
   */
  markUsed(name: string): void {
    const data = this.load();
    const query = data.queries[name];
    if (query) {
      query.lastUsed = new Date().toISOString();
      query.useCount = (query.useCount ?? 0) + 1;
      this.save();
    }
  }

  /**
   * List queries with optional filtering and sorting
   */
  listQueries(options: ListQueryOptions = {}): SavedQuery[] {
    const data = this.load();
    let queries = Object.values(data.queries);

    // Apply filters
    if (options.source) {
      queries = queries.filter((q) => q.source === options.source);
    }

    if (options.tool) {
      queries = queries.filter((q) => q.tool === options.tool);
    }

    if (options.tag) {
      queries = queries.filter((q) => q.tags?.includes(options.tag!));
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      queries = queries.filter((q) => {
        // BUG-009: Search name, description, AND parameters
        const nameMatch = q.name.toLowerCase().includes(searchLower);
        const descMatch = q.description?.toLowerCase().includes(searchLower);
        const paramsMatch = JSON.stringify(q.parameters).toLowerCase().includes(searchLower);
        return nameMatch || descMatch || paramsMatch;
      });
    }

    // Apply sorting
    const sortBy = options.sortBy ?? 'name';
    const sortOrder = options.sortOrder ?? 'asc';
    const sortMultiplier = sortOrder === 'asc' ? 1 : -1;

    queries.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
          break;
        case 'lastUsed':
          comparison = (a.lastUsed ?? '').localeCompare(b.lastUsed ?? '');
          break;
        case 'useCount':
          comparison = (a.useCount ?? 0) - (b.useCount ?? 0);
          break;
      }
      return comparison * sortMultiplier;
    });

    // Apply pagination
    const offset = options.offset ?? 0;
    const limit = options.limit ?? queries.length;
    queries = queries.slice(offset, offset + limit);

    return queries;
  }

  /**
   * Get count of saved queries
   */
  count(): number {
    const data = this.load();
    return Object.keys(data.queries).length;
  }

  /**
   * Get all unique tags
   */
  getTags(): string[] {
    const data = this.load();
    const tags = new Set<string>();
    for (const query of Object.values(data.queries)) {
      if (query.tags) {
        for (const tag of query.tags) {
          tags.add(tag);
        }
      }
    }
    return Array.from(tags).sort();
  }

  /**
   * Get all unique sources
   */
  getSources(): string[] {
    const data = this.load();
    const sources = new Set<string>();
    for (const query of Object.values(data.queries)) {
      sources.add(query.source);
    }
    return Array.from(sources).sort();
  }
}

// Export singleton instance
export const savedQueriesStore = new SavedQueriesStore();
