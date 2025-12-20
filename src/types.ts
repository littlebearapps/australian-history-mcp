/**
 * Australian Archives MCP Server - Type Definitions
 */

// ============================================================================
// PROV (Public Record Office Victoria) Types
// ============================================================================

export interface PROVSearchParams {
  query?: string;
  series?: string;      // VPRS number (e.g., "VPRS 515")
  agency?: string;      // VA number (e.g., "VA 473")
  recordForm?: string;  // photograph, map, file, etc.
  startDate?: string;   // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  digitisedOnly?: boolean;
  rows?: number;        // max results (default 20)
  start?: number;       // pagination offset
}

export interface PROVRecord {
  id: string;
  title: string;
  description?: string;
  series?: string;
  seriesTitle?: string;
  agency?: string;
  agencyTitle?: string;
  recordForm?: string;
  startDate?: string;
  endDate?: string;
  iiifManifest?: string;
  digitised: boolean;
  url: string;
}

export interface PROVSearchResult {
  totalResults: number;
  start: number;
  rows: number;
  records: PROVRecord[];
}

export interface PROVSeries {
  id: string;
  title: string;
  description?: string;
  agency?: string;
  agencyTitle?: string;
  dateRange?: string;
  accessStatus?: string;
  itemCount?: number;
}

// ============================================================================
// Trove (National Library of Australia) Types
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
// data.gov.au (CKAN) Types
// ============================================================================

export interface DataGovAUSearchParams {
  query?: string;
  organization?: string;
  groups?: string[];
  tags?: string[];
  format?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface DataGovAUResource {
  id: string;
  name: string;
  description?: string;
  format: string;
  url: string;
  size?: number;
  lastModified?: string;
  datastoreActive?: boolean;
}

export interface DataGovAUDataset {
  id: string;
  name: string;
  title: string;
  notes?: string;
  organization?: {
    name: string;
    title: string;
    description?: string;
  };
  resources: DataGovAUResource[];
  tags: string[];
  metadataCreated: string;
  metadataModified: string;
  licenseId?: string;
  licenseTitle?: string;
  author?: string;
  maintainer?: string;
  url?: string;
}

export interface DataGovAUSearchResult {
  count: number;
  datasets: DataGovAUDataset[];
}

export interface DataGovAUOrganization {
  id: string;
  name: string;
  title: string;
  description?: string;
  packageCount: number;
  imageUrl?: string;
  created?: string;
}

export interface DataGovAUGroup {
  id: string;
  name: string;
  title: string;
  description?: string;
  packageCount: number;
  imageUrl?: string;
}

export interface DataGovAUDatastoreParams {
  resourceId: string;
  query?: string;
  filters?: Record<string, string | string[]>;
  limit?: number;
  offset?: number;
}

export interface DataGovAUDatastoreResult {
  resourceId: string;
  fields: Array<{ id: string; type: string }>;
  records: Record<string, unknown>[];
  total: number;
}

// ============================================================================
// Common Types
// ============================================================================

export interface HarvestResult {
  source: 'trove' | 'prov' | 'datagovau';
  query: string;
  totalHarvested: number;
  totalAvailable: number;
  records: (TroveArticle | TroveWork | PROVRecord | DataGovAUDataset)[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  [key: string]: unknown;
}

export interface APIError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
}
