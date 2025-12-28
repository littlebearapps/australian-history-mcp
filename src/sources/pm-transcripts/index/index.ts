/**
 * PM Transcripts FTS5 Index Module
 *
 * SEARCH-018: Full-text search index for PM Transcripts
 *
 * Exports:
 * - Types for index operations
 * - SQLite store for persistence
 * - Indexer for building the index
 */

export * from './types.js';
export { PMTranscriptsStore, pmTranscriptsStore } from './sqlite-store.js';
export { buildIndex, getPmIdRange, getKnownPrimeMinisters } from './indexer.js';
