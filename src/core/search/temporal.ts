/**
 * Temporal Analysis and Date-Aware Routing
 *
 * Extracts date/era information from queries and filters sources
 * based on their historical coverage.
 * @module core/search/temporal
 */

import type { DateRange } from '../query/types.js';

// ============================================================================
// Types - Original (backward compatibility)
// ============================================================================

export interface SourceCoverage {
  /** Source identifier */
  source: string;
  /** Start year of coverage */
  fromYear: number;
  /** End year of coverage */
  toYear: number;
  /** Description of coverage */
  description: string;
}

export interface TemporalFilterResult {
  /** Sources that cover the date range */
  includedSources: string[];
  /** Sources excluded with reasons */
  excludedSources: Record<string, string>;
  /** Date range used for filtering */
  dateRange: DateRange;
}

// ============================================================================
// Types - Enhanced (Phase 1 Research Planning)
// ============================================================================

/** Content types a source provides */
export type ContentType = 'newspaper' | 'image' | 'document' | 'object' | 'record' | 'map' | 'film' | 'audio';

/** Extended source coverage with content types and strengths */
export interface ExtendedSourceCoverage extends SourceCoverage {
  /** Types of content available from this source */
  contentTypes: ContentType[];
  /** What this source is best for */
  strengths: string[];
  /** Notable coverage gaps or limitations */
  limitations?: string;
}

/** Analysis of how a source covers a specific date range */
export interface SourceCoverageAnalysis {
  /** Source identifier */
  source: string;
  /** Coverage level for the query range */
  coverage: 'full' | 'partial' | 'none';
  /** Source's available date range */
  availableRange: { from: number; to: number };
  /** Overlap between source and query (null if none) */
  overlapWithQuery: { from: number; to: number } | null;
  /** Human-readable notes about coverage */
  notes: string;
  /** Content types available */
  contentTypes: ContentType[];
  /** Source strengths relevant to query period */
  strengths: string[];
}

/** Suggested research phase based on temporal coverage */
export interface SuggestedPhase {
  /** Phase number (1, 2, 3...) */
  phase: number;
  /** Period covered (e.g., "1920-1930") */
  period: string;
  /** Sources to query in this phase */
  sources: string[];
  /** Why this phase and these sources */
  rationale: string;
}

/** Complete temporal analysis for a research query */
export interface TemporalAnalysis {
  /** Per-source coverage analysis */
  coverageMatrix: Record<string, SourceCoverageAnalysis>;
  /** Actionable recommendations */
  recommendations: string[];
  /** Suggested research phases ordered by priority */
  suggestedPhases: SuggestedPhase[];
  /** Periods with no or limited coverage */
  gaps: string[];
  /** Date range analysed */
  queryRange: { from: number; to: number };
}

// ============================================================================
// Source Coverage Matrix
// ============================================================================

/**
 * Historical date coverage for each source.
 * Used to exclude sources that don't cover the query's time period.
 */
export const SOURCE_COVERAGE: SourceCoverage[] = [
  {
    source: 'prov',
    fromYear: 1800,
    toYear: 2010,
    description: 'Victorian colonial to contemporary government records',
  },
  {
    source: 'trove',
    fromYear: 1800,
    toYear: 2024,
    description: 'Newspapers from 1800s, books and images from various eras',
  },
  {
    source: 'museumsvic',
    fromYear: 1850,
    toYear: 2024,
    description: 'Museum collections spanning Victoria\'s history',
  },
  {
    source: 'ala',
    fromYear: 1800,
    toYear: 2024,
    description: 'Historical specimens and contemporary observations',
  },
  {
    source: 'nma',
    fromYear: 1788,
    toYear: 2024,
    description: 'National collection from First Fleet to present',
  },
  {
    source: 'vhd',
    fromYear: 1835,
    toYear: 2024,
    description: 'Victorian heritage places from settlement onwards',
  },
  {
    source: 'acmi',
    fromYear: 1900,
    toYear: 2024,
    description: 'Film, TV, and digital media from early cinema',
  },
  {
    source: 'ghap',
    fromYear: 1788,
    toYear: 1970,
    description: 'Historical placenames from colonial records',
  },
  {
    source: 'ga-hap',
    fromYear: 1928,
    toYear: 1996,
    description: 'Aerial photography program dates',
  },
];

/**
 * Extended coverage data with content types and strengths.
 * Used for intelligent source routing and phase recommendations.
 */
export const EXTENDED_COVERAGE: ExtendedSourceCoverage[] = [
  {
    source: 'prov',
    fromYear: 1800,
    toYear: 2010,
    description: 'Victorian colonial to contemporary government records',
    contentTypes: ['document', 'record', 'image', 'map'],
    strengths: ['Official government records', 'Colonial administration', 'Court records', 'Immigration records'],
    limitations: 'Primarily Victorian state records',
  },
  {
    source: 'trove',
    fromYear: 1800,
    toYear: 2024,
    description: 'Newspapers from 1800s, books and images from various eras',
    contentTypes: ['newspaper', 'image', 'document', 'map'],
    strengths: ['Newspaper articles', 'Contemporary accounts', 'Wide geographic coverage', 'Full-text search'],
    limitations: 'Newspaper OCR quality varies; post-1954 newspapers limited',
  },
  {
    source: 'museumsvic',
    fromYear: 1850,
    toYear: 2024,
    description: 'Museum collections spanning Victoria\'s history',
    contentTypes: ['object', 'image', 'document'],
    strengths: ['Physical artefacts', 'Natural history specimens', 'Cultural objects'],
    limitations: 'Victorian focus',
  },
  {
    source: 'ala',
    fromYear: 1800,
    toYear: 2024,
    description: 'Historical specimens and contemporary observations',
    contentTypes: ['record', 'image'],
    strengths: ['Biodiversity records', 'Historical specimens', 'Species distributions'],
    limitations: 'Natural history focus only',
  },
  {
    source: 'nma',
    fromYear: 1788,
    toYear: 2024,
    description: 'National collection from First Fleet to present',
    contentTypes: ['object', 'image', 'document'],
    strengths: ['National significance items', 'Indigenous heritage', 'Social history'],
  },
  {
    source: 'vhd',
    fromYear: 1835,
    toYear: 2024,
    description: 'Victorian heritage places from settlement onwards',
    contentTypes: ['record', 'image'],
    strengths: ['Heritage places', 'Architectural history', 'Shipwrecks'],
    limitations: 'Victorian places only',
  },
  {
    source: 'acmi',
    fromYear: 1900,
    toYear: 2024,
    description: 'Film, TV, and digital media from early cinema',
    contentTypes: ['film', 'audio', 'image'],
    strengths: ['Moving image', 'Australian cinema', 'Television history'],
    limitations: 'No pre-1900 content',
  },
  {
    source: 'ghap',
    fromYear: 1788,
    toYear: 1970,
    description: 'Historical placenames from colonial records',
    contentTypes: ['record', 'map'],
    strengths: ['Historical placenames', 'Colonial geography', 'Name variants'],
    limitations: 'Placename data only',
  },
  {
    source: 'ga-hap',
    fromYear: 1928,
    toYear: 1996,
    description: 'Aerial photography program dates',
    contentTypes: ['image', 'map'],
    strengths: ['Aerial photographs', 'Landscape change', 'Urban development'],
    limitations: 'Photos 1928-1996 only',
  },
  {
    source: 'pm-transcripts',
    fromYear: 1945,
    toYear: 2024,
    description: 'Prime Ministerial speeches and media releases',
    contentTypes: ['document'],
    strengths: ['Political speeches', 'Government policy', 'Media releases'],
    limitations: 'Federal PM content only; starts 1945',
  },
];

// ============================================================================
// Filtering
// ============================================================================

/**
 * Get coverage info for a source.
 */
export function getSourceCoverage(source: string): SourceCoverage | undefined {
  return SOURCE_COVERAGE.find((c) => c.source === source);
}

/**
 * Check if a source covers a given date range.
 *
 * @param source - Source identifier
 * @param fromYear - Start year (or undefined for open start)
 * @param toYear - End year (or undefined for open end)
 * @returns true if any overlap exists
 */
export function sourceCoversDates(
  source: string,
  fromYear?: number,
  toYear?: number
): boolean {
  const coverage = getSourceCoverage(source);
  if (!coverage) return true; // Unknown source, include by default

  // If no date constraint, include
  if (fromYear === undefined && toYear === undefined) return true;

  // Check for overlap
  const queryFrom = fromYear ?? coverage.fromYear;
  const queryTo = toYear ?? coverage.toYear;

  // Overlap exists if query range and coverage range intersect
  return queryTo >= coverage.fromYear && queryFrom <= coverage.toYear;
}

/**
 * Filter sources based on date coverage.
 *
 * @param sources - Source identifiers to filter
 * @param dateRange - Date range to filter by
 * @returns Filtered sources with exclusion reasons
 */
export function filterByDateCoverage(
  sources: string[],
  dateRange: DateRange
): TemporalFilterResult {
  const fromYear = dateRange.from !== '*' ? parseInt(dateRange.from, 10) : undefined;
  const toYear = dateRange.to !== '*' ? parseInt(dateRange.to, 10) : undefined;

  const includedSources: string[] = [];
  const excludedSources: Record<string, string> = {};

  for (const source of sources) {
    if (sourceCoversDates(source, fromYear, toYear)) {
      includedSources.push(source);
    } else {
      const coverage = getSourceCoverage(source);
      if (coverage) {
        excludedSources[source] = `Coverage ${coverage.fromYear}-${coverage.toYear} doesn't overlap with ${dateRange.from}-${dateRange.to}`;
      } else {
        excludedSources[source] = 'Unknown coverage';
      }
    }
  }

  return {
    includedSources,
    excludedSources,
    dateRange,
  };
}

/**
 * Parse a year from a date string.
 * Handles YYYY format.
 */
export function parseYear(dateStr: string): number | undefined {
  if (!dateStr || dateStr === '*') return undefined;
  const year = parseInt(dateStr, 10);
  return isNaN(year) ? undefined : year;
}

// ============================================================================
// Enhanced Analysis Functions (Phase 1 Research Planning)
// ============================================================================

/**
 * Get extended coverage info for a source.
 */
export function getExtendedCoverage(source: string): ExtendedSourceCoverage | undefined {
  return EXTENDED_COVERAGE.find((c) => c.source === source);
}

/**
 * Generate coverage analysis for each source against a date range.
 *
 * @param fromYear - Start year of query range
 * @param toYear - End year of query range
 * @param sources - Sources to analyse
 * @returns Per-source coverage analysis
 */
export function generateCoverageMatrix(
  fromYear: number,
  toYear: number,
  sources: string[]
): Record<string, SourceCoverageAnalysis> {
  const matrix: Record<string, SourceCoverageAnalysis> = {};

  for (const source of sources) {
    const extended = getExtendedCoverage(source);
    const basic = getSourceCoverage(source);
    const coverage = extended ?? basic;

    if (!coverage) {
      matrix[source] = {
        source,
        coverage: 'none',
        availableRange: { from: 0, to: 0 },
        overlapWithQuery: null,
        notes: 'Unknown source',
        contentTypes: [],
        strengths: [],
      };
      continue;
    }

    // Calculate overlap
    const overlapFrom = Math.max(fromYear, coverage.fromYear);
    const overlapTo = Math.min(toYear, coverage.toYear);
    const hasOverlap = overlapFrom <= overlapTo;

    // Determine coverage level
    let coverageLevel: 'full' | 'partial' | 'none';
    if (!hasOverlap) {
      coverageLevel = 'none';
    } else if (coverage.fromYear <= fromYear && coverage.toYear >= toYear) {
      coverageLevel = 'full';
    } else {
      coverageLevel = 'partial';
    }

    // Generate notes
    let notes = coverage.description;
    if (coverageLevel === 'partial') {
      if (coverage.fromYear > fromYear) {
        notes += ` (no data before ${coverage.fromYear})`;
      }
      if (coverage.toYear < toYear) {
        notes += ` (no data after ${coverage.toYear})`;
      }
    } else if (coverageLevel === 'none') {
      notes = `No coverage: source covers ${coverage.fromYear}-${coverage.toYear}`;
    }

    // Add limitations if present
    if (extended?.limitations) {
      notes += `. ${extended.limitations}`;
    }

    matrix[source] = {
      source,
      coverage: coverageLevel,
      availableRange: { from: coverage.fromYear, to: coverage.toYear },
      overlapWithQuery: hasOverlap ? { from: overlapFrom, to: overlapTo } : null,
      notes,
      contentTypes: extended?.contentTypes ?? [],
      strengths: extended?.strengths ?? [],
    };
  }

  return matrix;
}

/**
 * Generate recommended research phases based on coverage analysis.
 *
 * @param fromYear - Start year of query range
 * @param toYear - End year of query range
 * @param coverageMatrix - Per-source coverage analysis
 * @returns Ordered list of suggested research phases
 */
export function generatePhaseRecommendations(
  fromYear: number,
  toYear: number,
  coverageMatrix: Record<string, SourceCoverageAnalysis>
): SuggestedPhase[] {
  const phases: SuggestedPhase[] = [];
  const fullCoverage: string[] = [];
  const partialCoverage: string[] = [];

  // Separate sources by coverage level
  for (const [source, analysis] of Object.entries(coverageMatrix)) {
    if (analysis.coverage === 'full') {
      fullCoverage.push(source);
    } else if (analysis.coverage === 'partial') {
      partialCoverage.push(source);
    }
  }

  // Phase 1: Discovery with full-coverage sources
  if (fullCoverage.length > 0) {
    // Prioritise by content type diversity
    const prioritised = fullCoverage.sort((a, b) => {
      const aTypes = coverageMatrix[a].contentTypes.length;
      const bTypes = coverageMatrix[b].contentTypes.length;
      return bTypes - aTypes;
    });

    phases.push({
      phase: 1,
      period: `${fromYear}-${toYear}`,
      sources: prioritised.slice(0, 3), // Top 3 for discovery
      rationale: 'Full coverage sources for initial discovery',
    });
  }

  // Phase 2: Refinement with all applicable sources
  if (partialCoverage.length > 0) {
    // Group partial sources by their overlap periods
    const byPeriod = new Map<string, string[]>();
    for (const source of partialCoverage) {
      const overlap = coverageMatrix[source].overlapWithQuery;
      if (overlap) {
        const key = `${overlap.from}-${overlap.to}`;
        const existing = byPeriod.get(key) ?? [];
        existing.push(source);
        byPeriod.set(key, existing);
      }
    }

    // Create phases for each period
    let phaseNum = phases.length + 1;
    for (const [period, sources] of byPeriod) {
      phases.push({
        phase: phaseNum++,
        period,
        sources,
        rationale: `Partial coverage sources for ${period}`,
      });
    }
  }

  // Phase 3: Deep-dive with specialised sources
  const specialised = Object.entries(coverageMatrix)
    .filter(([, a]) => a.coverage !== 'none' && a.strengths.length > 0)
    .map(([source]) => source);

  if (specialised.length > 0 && phases.length > 0) {
    phases.push({
      phase: phases.length + 1,
      period: `${fromYear}-${toYear}`,
      sources: specialised,
      rationale: 'Deep-dive with specialised sources based on research themes',
    });
  }

  return phases;
}

/**
 * Identify gaps in coverage for the query period.
 *
 * @param fromYear - Start year of query range
 * @param toYear - End year of query range
 * @param coverageMatrix - Per-source coverage analysis
 * @returns List of gap descriptions
 */
export function identifyGaps(
  fromYear: number,
  toYear: number,
  coverageMatrix: Record<string, SourceCoverageAnalysis>
): string[] {
  const gaps: string[] = [];
  const yearsCovered = new Set<number>();

  // Track which years are covered by at least one source
  for (const analysis of Object.values(coverageMatrix)) {
    if (analysis.overlapWithQuery) {
      for (let y = analysis.overlapWithQuery.from; y <= analysis.overlapWithQuery.to; y++) {
        yearsCovered.add(y);
      }
    }
  }

  // Find uncovered years
  const uncoveredYears: number[] = [];
  for (let y = fromYear; y <= toYear; y++) {
    if (!yearsCovered.has(y)) {
      uncoveredYears.push(y);
    }
  }

  // Convert to readable ranges
  if (uncoveredYears.length > 0) {
    let rangeStart = uncoveredYears[0];
    let rangeEnd = uncoveredYears[0];

    for (let i = 1; i < uncoveredYears.length; i++) {
      if (uncoveredYears[i] === rangeEnd + 1) {
        rangeEnd = uncoveredYears[i];
      } else {
        if (rangeStart === rangeEnd) {
          gaps.push(`No coverage for ${rangeStart}`);
        } else {
          gaps.push(`No coverage for ${rangeStart}-${rangeEnd}`);
        }
        rangeStart = uncoveredYears[i];
        rangeEnd = uncoveredYears[i];
      }
    }

    // Add last range
    if (rangeStart === rangeEnd) {
      gaps.push(`No coverage for ${rangeStart}`);
    } else {
      gaps.push(`No coverage for ${rangeStart}-${rangeEnd}`);
    }
  }

  // Check for content type gaps
  const allContentTypes = new Set<ContentType>();
  for (const analysis of Object.values(coverageMatrix)) {
    if (analysis.coverage !== 'none') {
      for (const ct of analysis.contentTypes) {
        allContentTypes.add(ct);
      }
    }
  }

  // Common research content types that might be missing
  const commonTypes: ContentType[] = ['newspaper', 'image', 'document'];
  for (const ct of commonTypes) {
    if (!allContentTypes.has(ct)) {
      gaps.push(`No ${ct} sources cover this period`);
    }
  }

  return gaps;
}

/**
 * Generate actionable recommendations based on coverage analysis.
 */
function generateRecommendations(
  coverageMatrix: Record<string, SourceCoverageAnalysis>,
  gaps: string[]
): string[] {
  const recommendations: string[] = [];

  // Check for Trove newspaper coverage
  const trove = coverageMatrix['trove'];
  if (trove?.coverage !== 'none') {
    recommendations.push('Use Trove for contemporary newspaper accounts');
    if (trove.overlapWithQuery && trove.overlapWithQuery.to > 1954) {
      recommendations.push('Note: Post-1954 Trove newspaper coverage is limited');
    }
  }

  // Check for PROV government records
  const prov = coverageMatrix['prov'];
  if (prov?.coverage !== 'none') {
    recommendations.push('Search PROV for official government records and correspondence');
  }

  // Check for aerial photography
  const gaHap = coverageMatrix['ga-hap'];
  if (gaHap?.coverage !== 'none') {
    recommendations.push('GA HAP aerial photos can show physical landscape changes');
  }

  // Add gap-based recommendations
  for (const gap of gaps) {
    if (gap.includes('newspaper')) {
      recommendations.push('Consider State Library newspaper collections for missing periods');
    }
  }

  return recommendations;
}

/**
 * Perform comprehensive temporal analysis for a research query.
 *
 * @param dateRange - Date range to analyse
 * @param sources - Sources to include in analysis (defaults to all)
 * @returns Complete temporal analysis with recommendations
 */
export function analyzeTemporalCoverage(
  dateRange: DateRange,
  sources?: string[]
): TemporalAnalysis {
  const fromYear = parseYear(dateRange.from) ?? 1788;
  const toYear = parseYear(dateRange.to) ?? new Date().getFullYear();

  // Default to all known sources
  const sourcesToAnalyze = sources ?? EXTENDED_COVERAGE.map((c) => c.source);

  // Generate coverage matrix
  const coverageMatrix = generateCoverageMatrix(fromYear, toYear, sourcesToAnalyze);

  // Identify gaps
  const gaps = identifyGaps(fromYear, toYear, coverageMatrix);

  // Generate recommendations
  const recommendations = generateRecommendations(coverageMatrix, gaps);

  // Generate phase recommendations
  const suggestedPhases = generatePhaseRecommendations(fromYear, toYear, coverageMatrix);

  return {
    coverageMatrix,
    recommendations,
    suggestedPhases,
    gaps,
    queryRange: { from: fromYear, to: toYear },
  };
}
