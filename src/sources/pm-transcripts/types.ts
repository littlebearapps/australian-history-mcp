/**
 * PM Transcripts Type Definitions
 *
 * Types for the Prime Ministerial Transcripts API.
 * API returns XML responses.
 */

// ============================================================================
// Transcript Types
// ============================================================================

/**
 * A transcript from the PM Transcripts archive
 */
export interface PMTranscript {
  /** Unique transcript ID */
  transcriptId: number;

  /** Title of the transcript */
  title: string;

  /** Prime Minister name */
  primeMinister: string;

  /** Period of service (format: YYYYMMDD - YYYYMMDD) */
  periodOfService: string;

  /** Release date (format: DD/MM/YYYY) */
  releaseDate: string;

  /** Type of release (e.g., "Media Release", "Speech", "Interview") */
  releaseType: string;

  /** URL to PDF document */
  documentUrl: string | null;

  /** Subject tags */
  subjects: string[];

  /** Full text content */
  content: string;
}

/**
 * Minimal transcript info from sitemap
 */
export interface PMTranscriptRef {
  /** Transcript ID */
  id: number;

  /** URL to transcript page */
  url: string;
}

// ============================================================================
// Search/Filter Types
// ============================================================================

/**
 * Filter options for harvest
 */
export interface PMTranscriptsHarvestParams {
  /** Filter by Prime Minister name */
  primeMinister?: string;

  /** Start date (YYYY-MM-DD) */
  dateFrom?: string;

  /** End date (YYYY-MM-DD) */
  dateTo?: string;

  /** Maximum records to harvest */
  maxRecords?: number;

  /** Starting transcript ID for pagination */
  startFrom?: number;
}
