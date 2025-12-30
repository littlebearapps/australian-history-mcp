/**
 * Context Compression Module
 *
 * Phase 3: Token-efficient result handling for research sessions.
 *
 * Exports:
 * - Types for compression, deduplication, and checkpoints
 * - Compressor functions for reducing record size
 * - Dedupe functions for removing duplicates
 * - Checkpoint store for persisting research snapshots
 */

// Types
export * from './types.js';

// Compressor functions
export {
  compressRecord,
  compressRecords,
  compressRecordArray,
  estimateTokens,
  truncateTitle,
  extractYear,
} from './compressor.js';

// Deduplication functions
export {
  dedupeRecords,
  areDuplicates,
  normaliseUrl,
  normaliseTitle,
  titleSimilarity,
} from './dedupe.js';

// Checkpoint store
export { CheckpointStore, checkpointStore } from './checkpoint-store.js';
