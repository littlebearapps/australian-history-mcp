/**
 * Search Intelligence Module
 *
 * Provides intelligent query analysis, source selection, and result ranking.
 * @module core/search
 */

// Intent classification (original)
export {
  classifyIntent,
  getSourcesForIntent,
  type QueryIntent,
  type IntentResult,
} from './intent.js';

// Intent analysis (enhanced - Phase 1)
export {
  analyzeIntent,
  extractPotentialLocations,
  validateLocationsViaGHAP,
  extractDateRange,
  extractEntityTypes,
  extractThemes,
  classifyResearchIntent,
  detectState,
  type ResearchIntent,
  type EntityType,
  type LocationMatch,
  type ExtractedDateRange,
  type IntentAnalysis,
} from './intent.js';

// Temporal analysis (original)
export {
  filterByDateCoverage,
  getSourceCoverage,
  sourceCoversDates,
  parseYear,
  SOURCE_COVERAGE,
  type SourceCoverage,
  type TemporalFilterResult,
} from './temporal.js';

// Temporal analysis (enhanced - Phase 1)
export {
  analyzeTemporalCoverage,
  generateCoverageMatrix,
  generatePhaseRecommendations,
  identifyGaps,
  getExtendedCoverage,
  EXTENDED_COVERAGE,
  type ContentType,
  type ExtendedSourceCoverage,
  type SourceCoverageAnalysis,
  type SuggestedPhase,
  type TemporalAnalysis,
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

// Historical names (original)
export {
  findNameSuggestions,
  getHistoricalName,
  getHistoricalNames,
  hasNameSuggestions,
  type NameSuggestion,
} from './names.js';

// Historical names (enhanced - Phase 1)
export {
  getHistoricalNamesFromGHAP,
  getHistoricalNameInfo,
  generateSearchTerms,
  type EntityNameType,
  type HistoricalNameInfo,
  type NameSuggestions,
} from './names.js';
