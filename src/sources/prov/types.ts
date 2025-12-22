/**
 * PROV (Public Record Office Victoria) Type Definitions
 *
 * Types specific to the PROV data source.
 */

// ============================================================================
// Search Parameters
// ============================================================================

export interface PROVSearchParams {
  query?: string;
  series?: string;      // VPRS number (e.g., "VPRS 515")
  agency?: string;      // VA number (e.g., "VA 473")
  category?: PROVDocumentCategory; // document type filter
  recordForm?: string;  // photograph, map, file, etc.
  startDate?: string;   // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  digitisedOnly?: boolean;
  rows?: number;        // max results (default 20)
  start?: number;       // pagination offset
}

// ============================================================================
// Record Types
// ============================================================================

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
// Image Types
// ============================================================================

export interface PROVImage {
  page: number;
  label: string;
  thumbnail: string;    // 200x200
  medium: string;       // 800x800
  full: string;         // full resolution
}

export interface PROVImagesResult {
  manifestUrl: string;
  title: string;
  description?: string;
  totalPages: number;
  images: PROVImage[];
}

// ============================================================================
// Record Form Enum
// ============================================================================

export const PROV_RECORD_FORMS = [
  'Photograph or Image',
  'Map, Plan, or Drawing',
  'File',
  'Volume',
  'Document',
  'Card',
  'Object',
  'Moving Image',
  'Sound Recording',
] as const;

export type PROVRecordForm = typeof PROV_RECORD_FORMS[number];

// ============================================================================
// Document Category Enum
// ============================================================================

export const PROV_DOCUMENT_CATEGORIES = [
  'agency',
  'function',
  'series',
  'consignment',
  'item',
  'image',
] as const;

export type PROVDocumentCategory = typeof PROV_DOCUMENT_CATEGORIES[number];

// ============================================================================
// Agency Types
// ============================================================================

export interface PROVAgency {
  id: string;
  title: string;
  description?: string;
  dateRange?: string;
  status?: string;
  seriesCount?: number;
}
