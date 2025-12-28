/**
 * PROV (Public Record Office Victoria) Type Definitions
 *
 * Types specific to the PROV data source.
 */

import {
  PROV_RECORD_FORMS,
  PROV_DOCUMENT_CATEGORIES,
  type PROVRecordForm,
  type PROVDocumentCategory,
} from '../../core/enums.js';

// Re-export for backwards compatibility
export { PROV_RECORD_FORMS, PROV_DOCUMENT_CATEGORIES };
export type { PROVRecordForm, PROVDocumentCategory };

// ============================================================================
// Search Parameters
// ============================================================================

// Available facet fields for PROV search (Solr field names)
export type PROVFacetField =
  | 'record_form'
  | 'category'
  | 'series_id'
  | 'agencies.ids';

export const PROV_FACET_FIELDS: PROVFacetField[] = [
  'record_form',
  'category',
  'series_id',
  'agencies.ids',
];

// User-friendly facet field names
export const PROV_FACET_DISPLAY_NAMES: Record<PROVFacetField, string> = {
  'record_form': 'Record Form',
  'category': 'Category',
  'series_id': 'Series',
  'agencies.ids': 'Agency',
};

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
  // Faceted search
  includeFacets?: boolean;
  facetFields?: PROVFacetField[];
  facetLimit?: number;  // max values per facet (default 10)
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

// Facet types
export interface PROVFacetValue {
  value: string;
  count: number;
}

export interface PROVFacet {
  name: PROVFacetField;
  displayName: string;
  values: PROVFacetValue[];
}

export interface PROVSearchResult {
  totalResults: number;
  start: number;
  rows: number;
  records: PROVRecord[];
  facets?: PROVFacet[];
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
