/**
 * Search Intelligence Module
 *
 * Provides intelligent query analysis, source selection, and result ranking.
 * @module core/search
 */

// Intent classification
export {
  classifyIntent,
  getSourcesForIntent,
  type QueryIntent,
  type IntentResult,
} from './intent.js';

// Temporal analysis
export {
  filterByDateCoverage,
  getSourceCoverage,
  sourceCoversDates,
  parseYear,
  SOURCE_COVERAGE,
  type SourceCoverage,
  type TemporalFilterResult,
} from './temporal.js';

// Result ranking
export {
  scoreRecord,
  rankRecords,
  deduplicateByTitle,
  type RankedRecord,
  type ScoreBreakdown,
  type RankingConfig,
} from './ranker.js';

// Historical names
export {
  findNameSuggestions,
  getHistoricalName,
  getHistoricalNames,
  hasNameSuggestions,
  type NameSuggestion,
} from './names.js';
