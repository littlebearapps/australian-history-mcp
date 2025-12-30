/**
 * Session Management Module
 *
 * Phase 2: Barrel export for session types, store, and fingerprinting
 */

// Types
export type {
  SessionStatus,
  SourceName,
  SessionQuery,
  ResultFingerprint,
  SourceCoverage,
  SessionStats,
  Session,
  SessionStoreFile,
  ListSessionOptions,
  ExportSessionOptions,
  DuplicateCheckResult,
} from './types.js';

export {
  ALL_SOURCES,
  isSessionStatus,
  isSourceName,
  isValidSessionName,
  isSession,
  createInitialCoverage,
  createInitialStats,
  createEmptyStoreFile,
} from './types.js';

// Store
export { SessionStore, sessionStore } from './store.js';

// Fingerprinting
export {
  normaliseUrl,
  normaliseTitle,
  hashTitle,
  titleSimilarity,
  generateFingerprint,
  isDuplicate,
  checkDuplicates,
} from './fingerprint.js';
