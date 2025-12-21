/**
 * Trove (National Library of Australia) Type Definitions
 */

// ============================================================================
// Search Parameter Types
// ============================================================================

export type TroveCategory =
  | 'all'
  | 'newspaper'
  | 'gazette'
  | 'magazine'
  | 'image'
  | 'research'
  | 'book'
  | 'diary'
  | 'music'
  | 'people'
  | 'list';

export type TroveState =
  | 'vic'
  | 'nsw'
  | 'qld'
  | 'sa'
  | 'wa'
  | 'tas'
  | 'nt'
  | 'act'
  | 'national';

export const TROVE_CATEGORIES: TroveCategory[] = [
  'all',
  'newspaper',
  'gazette',
  'magazine',
  'image',
  'research',
  'book',
  'diary',
  'music',
];

export const TROVE_STATES: TroveState[] = [
  'vic',
  'nsw',
  'qld',
  'sa',
  'wa',
  'tas',
  'nt',
  'act',
  'national',
];

export interface TroveSearchParams {
  query: string;
  category?: TroveCategory | TroveCategory[];
  state?: TroveState;
  dateFrom?: string;    // YYYY or YYYY-MM-DD
  dateTo?: string;
  limit?: number;       // max 100
  start?: string;       // cursor for pagination
  bulkHarvest?: boolean;
  includeFullText?: boolean;
  format?: string;      // Photograph, Map, Book, etc.
  facets?: string[];
}

// ============================================================================
// Article and Work Types
// ============================================================================

export interface TroveArticle {
  id: string;
  heading: string;
  title: string;        // newspaper title
  titleId: string;
  date: string;
  page: string;
  category: string;     // Article, Advertising, etc.
  snippet?: string;
  fullText?: string;
  troveUrl: string;
  pdfUrl?: string;
  wordCount?: number;
  correctionCount?: number;
  illustrated?: boolean;
}

export interface TroveWork {
  id: string;
  title: string;
  contributor?: string;
  issued?: string;
  type: string[];
  holdingsCount?: number;
  versionCount?: number;
  troveUrl: string;
  thumbnailUrl?: string;
  abstract?: string;
  subjects?: string[];
}

export interface TroveSearchResult {
  query: string;
  category: string;
  totalResults: number;
  nextStart?: string;   // cursor for next page
  records: (TroveArticle | TroveWork)[];
}

// ============================================================================
// Newspaper Title Types
// ============================================================================

export interface TroveNewspaperTitle {
  id: string;
  title: string;
  state: string;
  issn?: string;
  startDate: string;
  endDate: string;
  troveUrl: string;
}

export interface TroveTitleDetail extends TroveNewspaperTitle {
  years?: {
    year: string;
    issueCount: number;
  }[];
  issues?: {
    id: string;
    date: string;
    url: string;
  }[];
}

// ============================================================================
// Full Article Detail
// ============================================================================

export interface TroveArticleDetail {
  id: string;
  heading: string;
  title: string;
  titleId: string;
  date: string;
  page: string;
  pageSequence?: number;
  category: string;
  troveUrl: string;
  pdfUrl?: string;
  fullText?: string;
  wordCount?: number;
  correctionCount?: number;
  tagCount?: number;
  commentCount?: number;
  illustrated?: boolean;
  lastCorrected?: string;
}
