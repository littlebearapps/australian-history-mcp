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

// Sort options for PROV search
// Note: Date sorting is not available because PROV's Solr uses SpatialField types
// for start_dt/end_dt which cannot be sorted (HTTP 400: "Sorting not supported on SpatialField")
export type PROVSortOption = 'relevance' | 'title';

export const PROV_SORT_OPTIONS: PROVSortOption[] = ['relevance', 'title'];

// Solr sort parameter mappings
export const PROV_SORT_MAPPINGS: Record<PROVSortOption, string | null> = {
  relevance: null, // Default Solr relevance (no sort param)
  title: 'title asc',
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
  sortby?: PROVSortOption; // sort order
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

// ============================================================================
// Internal API Response Types (for client.ts type safety)
// ============================================================================

/**
 * Raw document from PROV Solr API response
 */
export interface PROVSolrDoc {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  presentation_text?: string;
  'description.aggregate'?: string;
  series_id?: string | number;
  'is_part_of_series.title'?: string | string[];
  'agencies.ids'?: string | string[];
  'agencies.titles'?: string | string[];
  record_form?: string | string[];
  start_dt?: string;
  end_dt?: string;
  'iiif-manifest'?: string;
  citation?: string;
  VA?: string | number;
  history?: string;
  scope_content?: string;
  status?: string;
  series_count?: number;
  'identifier.PROV_ACM.id'?: string;
  resp_agency_id?: string | string[];
  resp_agency_title?: string | string[];
  rights_status?: string | string[];
  item_count?: number;
  function_content?: string | string[];
}

/**
 * PROV Solr API search response structure
 */
export interface PROVSolrResponse {
  response?: {
    numFound?: number;
    start?: number;
    docs?: PROVSolrDoc[];
  };
  facet_counts?: {
    facet_fields?: Record<string, unknown[]>;
  };
}

/**
 * IIIF v2/v3 manifest structure (simplified)
 */
export interface IIIFManifest {
  label?: string | string[] | Record<string, string[]> | Array<{ '@value': string }>;
  description?: string | string[] | Record<string, string[]> | Array<{ '@value': string }>;
  summary?: string | string[] | Record<string, string[]>;
  sequences?: IIIFSequence[];
  items?: IIIFCanvas[];
}

export interface IIIFSequence {
  canvases?: IIIFCanvas[];
}

export interface IIIFCanvas {
  label?: string;
  images?: IIIFImage[];
  items?: IIIFAnnotationPage[];
}

export interface IIIFImage {
  resource?: {
    '@id'?: string;
    service?: IIIFService | IIIFService[];
  };
}

export interface IIIFAnnotationPage {
  items?: IIIFAnnotation[];
}

export interface IIIFAnnotation {
  body?: {
    service?: IIIFService | IIIFService[];
  };
}

export interface IIIFService {
  '@id'?: string;
  id?: string;
}
