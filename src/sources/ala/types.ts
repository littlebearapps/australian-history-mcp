/**
 * Atlas of Living Australia (ALA) API Type Definitions
 *
 * ALA provides access to 165M+ species occurrence records across Australia.
 */

// ============================================================================
// Facet Types
// ============================================================================

// Available facet fields for ALA occurrence search
export type ALAFacetField =
  | 'kingdom'
  | 'phylum'
  | 'class'
  | 'order'
  | 'family'
  | 'genus'
  | 'species'
  | 'stateProvince'
  | 'basisOfRecord'
  | 'year'
  | 'month'
  | 'dataResourceName';

export const ALA_FACET_FIELDS: ALAFacetField[] = [
  'kingdom',
  'phylum',
  'class',
  'order',
  'family',
  'genus',
  'stateProvince',
  'basisOfRecord',
  'year',
];

// User-friendly facet field names
export const ALA_FACET_DISPLAY_NAMES: Record<ALAFacetField, string> = {
  'kingdom': 'Kingdom',
  'phylum': 'Phylum',
  'class': 'Class',
  'order': 'Order',
  'family': 'Family',
  'genus': 'Genus',
  'species': 'Species',
  'stateProvince': 'State/Province',
  'basisOfRecord': 'Basis of Record',
  'year': 'Year',
  'month': 'Month',
  'dataResourceName': 'Data Resource',
};

export interface ALAFacetValue {
  value: string;
  count: number;
}

export interface ALAFacet {
  name: ALAFacetField;
  displayName: string;
  values: ALAFacetValue[];
}

// ============================================================================
// Sort Options
// ============================================================================

export type ALASortOption = 'relevance' | 'date_asc' | 'date_desc' | 'taxon_name';

export const ALA_SORT_OPTIONS: ALASortOption[] = ['relevance', 'date_asc', 'date_desc', 'taxon_name'];

// Map user-friendly sort options to ALA API sort/dir parameters
export const ALA_SORT_MAPPINGS: Record<ALASortOption, { sort: string; dir: string } | null> = {
  relevance: null, // Default (no sort param)
  date_asc: { sort: 'event_date', dir: 'asc' },
  date_desc: { sort: 'event_date', dir: 'desc' },
  taxon_name: { sort: 'taxon_name', dir: 'asc' },
};

// ============================================================================
// Search Parameter Types
// ============================================================================

/** Basis of record types - how the occurrence was recorded */
export type ALABasisOfRecord =
  | 'PRESERVED_SPECIMEN'
  | 'HUMAN_OBSERVATION'
  | 'MACHINE_OBSERVATION'
  | 'FOSSIL_SPECIMEN'
  | 'LIVING_SPECIMEN';

export const ALA_BASIS_OF_RECORD: ALABasisOfRecord[] = [
  'PRESERVED_SPECIMEN',
  'HUMAN_OBSERVATION',
  'MACHINE_OBSERVATION',
  'FOSSIL_SPECIMEN',
  'LIVING_SPECIMEN',
];

export interface ALAOccurrenceSearchParams {
  /** Search query (taxon name, location, etc.) */
  q?: string;
  /** Filter by scientific name */
  scientificName?: string;
  /** Filter by common name */
  vernacularName?: string;
  /** Filter by kingdom (Animalia, Plantae, etc.) */
  kingdom?: string;
  /** Filter by family */
  family?: string;
  /** Filter by genus */
  genus?: string;
  /** Filter by species */
  species?: string;
  /** Filter by state/territory */
  stateProvince?: string;
  /** Filter by data resource UID */
  dataResourceUid?: string;
  /** Filter by data resource name */
  dataResourceName?: string;
  /** Start year */
  startYear?: number;
  /** End year */
  endYear?: number;
  /** Only records with images */
  hasImages?: boolean;
  /** Only spatially valid records */
  spatiallyValid?: boolean;
  /** Basis of record filter */
  basisOfRecord?: ALABasisOfRecord;
  /** Maximum coordinate uncertainty in metres */
  coordinateUncertaintyMax?: number;
  /** Occurrence status (present/absent) */
  occurrenceStatus?: 'present' | 'absent';
  /** Collector/recorded by name */
  collector?: string;
  /** Page size (max 100) */
  pageSize?: number;
  /** Start index for pagination */
  startIndex?: number;
  /** Sort field */
  sort?: 'score' | 'taxon_name' | 'event_date';
  /** Sort direction */
  dir?: 'asc' | 'desc';
  /** Include facet counts */
  includeFacets?: boolean;
  /** Facet fields to return */
  facetFields?: ALAFacetField[];
  /** Max values per facet */
  facetLimit?: number;
}

export interface ALASpeciesSearchParams {
  /** Search query */
  q: string;
  /** Filter by ID list */
  idxtype?: 'TAXON' | 'COMMON' | 'IDENTIFIER';
  /** Maximum results */
  max?: number;
  /** Start offset */
  start?: number;
}

// ============================================================================
// Occurrence Types
// ============================================================================

export interface ALAOccurrence {
  uuid: string;
  occurrenceID?: string;
  scientificName: string;
  vernacularName?: string;
  taxonRank?: string;
  kingdom?: string;
  phylum?: string;
  classs?: string; // Note: 'class' is reserved in JS
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  stateProvince?: string;
  country?: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  coordinateUncertaintyInMeters?: number;
  eventDate?: number; // Unix timestamp
  year?: number;
  month?: string;
  basisOfRecord?: string;
  dataResourceName?: string;
  dataResourceUid?: string;
  dataProviderName?: string;
  license?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  images?: string[];
  spatiallyValid?: boolean;
  assertions?: string[];
  recordedBy?: string[];
  collectors?: string[];
}

export interface ALAOccurrenceSearchResult {
  totalRecords: number;
  pageSize: number;
  startIndex: number;
  status: string;
  sort: string;
  dir: string;
  occurrences: ALAOccurrence[];
  facets?: ALAFacet[];
}

// ============================================================================
// Species Types
// ============================================================================

export interface ALASpecies {
  guid: string;
  name: string;
  scientificName: string;
  author?: string;
  rank?: string;
  rankId?: number;
  commonName?: string;
  commonNames?: string[];
  kingdom?: string;
  phylum?: string;
  classs?: string;
  order?: string;
  family?: string;
  genus?: string;
  nameComplete?: string;
  acceptedConceptGuid?: string;
  acceptedConceptName?: string;
  taxonomicStatus?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  occurrenceCount?: number;
}

export interface ALASpeciesProfile {
  taxonConcept: ALASpecies;
  commonNames?: Array<{
    nameString: string;
    status?: string;
    priority?: number;
  }>;
  synonyms?: Array<{
    nameString: string;
    author?: string;
  }>;
  imageIdentifier?: string;
  images?: Array<{
    imageId: string;
    title?: string;
    creator?: string;
    license?: string;
    thumbnailUrl?: string;
    largeImageUrl?: string;
  }>;
  conservationStatuses?: Array<{
    status: string;
    region?: string;
    system?: string;
  }>;
  habitats?: string[];
}

export interface ALASpeciesSearchResult {
  searchResults: {
    totalRecords: number;
    startIndex: number;
    pageSize: number;
    results: ALASpecies[];
  };
}

// ============================================================================
// Auto-complete Types
// ============================================================================

export interface ALAAutoCompleteResult {
  guid: string;
  name: string;
  commonName?: string;
  matchedNames?: string[];
  kingdom?: string;
  rankId?: number;
  rankString?: string;
}

// ============================================================================
// Image Types
// ============================================================================

export interface ALAImageSearchParams {
  /** Search query */
  q: string;
  /** Maximum results (default 20) */
  pageSize?: number;
  /** Start offset */
  offset?: number;
}

export interface ALAImage {
  imageId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  largeImageUrl?: string;
  title?: string;
  creator?: string;
  license?: string;
  dataResourceName?: string;
  occurrenceId?: string;
  scientificName?: string;
  vernacularName?: string;
  recognisedLicence?: string;
}

export interface ALAImageSearchResult {
  totalRecords: number;
  pageSize: number;
  startIndex: number;
  images: ALAImage[];
}

// ============================================================================
// Name Matching Types
// ============================================================================

export interface ALANameMatchResult {
  success: boolean;
  scientificName?: string;
  scientificNameAuthorship?: string;
  taxonConceptID?: string;
  rank?: string;
  rankId?: number;
  lft?: number;
  rgt?: number;
  matchType?: string;
  nameType?: string;
  synonymType?: string;
  kingdom?: string;
  kingdomID?: string;
  phylum?: string;
  phylumID?: string;
  classs?: string;
  classID?: string;
  order?: string;
  orderID?: string;
  family?: string;
  familyID?: string;
  genus?: string;
  genusID?: string;
  species?: string;
  speciesID?: string;
  vernacularName?: string;
  issues?: string[];
}

// ============================================================================
// Species List Types
// ============================================================================

export interface ALASpeciesList {
  dataResourceUid: string;
  listName: string;
  listType?: string;
  dateCreated?: string;
  lastUpdated?: string;
  itemCount: number;
  isAuthoritative?: boolean;
  isPrivate?: boolean;
  region?: string;
  description?: string;
}

export interface ALASpeciesListSearchResult {
  lists: ALASpeciesList[];
  listCount: number;
  max: number;
  offset: number;
}

export interface ALASpeciesListItem {
  id: number;
  lsid?: string;
  name: string;
  commonName?: string;
  scientificName?: string;
  kvpValues?: Record<string, string>[];
}

export interface ALASpeciesListDetail {
  dataResourceUid: string;
  listName: string;
  listType?: string;
  description?: string;
  dateCreated?: string;
  lastUpdated?: string;
  itemCount: number;
  items: ALASpeciesListItem[];
}
