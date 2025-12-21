/**
 * Atlas of Living Australia (ALA) API Type Definitions
 *
 * ALA provides access to 165M+ species occurrence records across Australia.
 */

// ============================================================================
// Search Parameter Types
// ============================================================================

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
  /** Filter by data resource */
  dataResourceUid?: string;
  /** Start year */
  startYear?: number;
  /** End year */
  endYear?: number;
  /** Only records with images */
  hasImages?: boolean;
  /** Only spatially valid records */
  spatiallyValid?: boolean;
  /** Page size (max 100) */
  pageSize?: number;
  /** Start index for pagination */
  startIndex?: number;
  /** Sort field */
  sort?: 'score' | 'taxon_name' | 'event_date';
  /** Sort direction */
  dir?: 'asc' | 'desc';
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
