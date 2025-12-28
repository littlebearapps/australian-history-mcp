/**
 * Standardised Parameter Descriptions for MCP Tools
 *
 * DESIGN GOAL: Reduce token usage by using short, consistent descriptions.
 * Each description should be ≤10 words.
 *
 * USAGE: Import and use in tool schema definitions:
 *   import { PARAMS } from '../../../core/param-descriptions.js';
 *   description: PARAMS.QUERY
 */

// ============================================================================
// Common Parameters (used across multiple sources)
// ============================================================================

export const PARAMS = {
  // Search & Query
  QUERY: 'Search terms',
  QUERY_OPTIONAL: 'Search terms (optional)',

  // Pagination
  LIMIT: 'Max results (1-100)',
  LIMIT_1000: 'Max results (1-1000)',
  OFFSET: 'Skip N results',
  PAGE: 'Page number (1-based)',

  // Dates
  DATE_FROM: 'Start date (YYYY or YYYY-MM-DD)',
  DATE_TO: 'End date (YYYY or YYYY-MM-DD)',
  YEAR: 'Year filter',
  YEAR_FROM: 'Start year (e.g., 2020)',
  YEAR_TO: 'End year (e.g., 2024)',
  DECADE: 'Decade filter (e.g., "199" for 1990s)',

  // Location
  STATE: 'Australian state/territory',
  STATE_FULL: 'State (full name)',
  LGA: 'Local Government Area',
  BBOX: 'Bounding box: minLon,minLat,maxLon,maxLat',
  MUNICIPALITY: 'Municipality name',
  LAT: 'Centre latitude (-90 to 90)',
  LON: 'Centre longitude (-180 to 180)',
  RADIUS_KM: 'Search radius in kilometres',

  // Identifiers
  ID: 'Record ID',
  ID_NUMERIC: 'Numeric record ID',
  SERIES: 'VPRS series number',
  AGENCY: 'VA agency number',
  NUC: 'NUC code (e.g., VSL, ANL)',
  GUID: 'Species GUID',
  WORK_ID: 'Work ID',
  LIST_ID: 'List ID',
  LAYER_ID: 'Layer ID',
  MANIFEST_URL: 'IIIF manifest URL',

  // Filters - Boolean
  DIGITISED_ONLY: 'Digitised records only',
  HAS_IMAGES: 'Records with images only',
  SCANNED_ONLY: 'Scanned records only',
  ON_DISPLAY: 'Items on display only',
  RANDOM: 'Random order',
  FUZZY: 'Fuzzy matching',
  AUSTRALIAN: 'Australian content only',
  FIRST_NATIONS: 'First Nations content only',
  SPATIALLY_VALID: 'Valid coordinates only',
  INCLUDE_FULL_TEXT: 'Include full text',
  INCLUDE_HOLDINGS: 'Include library holdings',
  INCLUDE_LINKS: 'Include external links',
  INCLUDE_YEARS: 'Include available years',
  INCLUDE_ITEMS: 'Include list items',
  INCLUDE_CANVASES: 'Include canvas/image details',

  // Content Types
  CATEGORY: 'Content category',
  RECORD_TYPE: 'Record type',
  RECORD_FORM: 'Record form/format',
  WORK_TYPE: 'Work type filter',
  FORMAT: 'Format filter',
  TYPE: 'Type filter',
  ILLUSTRATION_TYPE: 'Illustrated or Not Illustrated',
  AVAILABILITY: 'Online availability',
  LANGUAGE: 'Language filter',

  // Taxonomy (ALA)
  SCIENTIFIC_NAME: 'Scientific name',
  VERNACULAR_NAME: 'Common name',
  KINGDOM: 'Taxonomic kingdom',
  FAMILY: 'Taxonomic family',
  GENUS: 'Genus name',
  TAXON: 'Taxonomic classification',
  BASIS_OF_RECORD: 'How recorded (specimen, observation)',
  COORDINATE_UNCERTAINTY: 'Max coord uncertainty in metres',
  OCCURRENCE_STATUS: 'present or absent',
  DATA_RESOURCE_NAME: 'Contributing dataset name',
  COLLECTOR: 'Collector name',

  // Search Indexes
  CREATOR: 'Author/creator name',
  SUBJECT: 'Subject term',
  ISBN: 'ISBN',
  ISSN: 'ISSN',

  // Sorting
  SORT_BY: 'Sort order',
  SORT_BY_RELEVANCE: 'Sort: relevance, datedesc, dateasc',

  // Harvest/Pagination
  START_FROM: 'Starting offset',
  MAX_RECORDS: 'Max records (1-1000)',
  CURSOR: 'Pagination cursor',

  // IIIF-specific
  IMAGE_SERVICE_URL: 'IIIF Image API base URL',
  REGION: 'Image region (full, square, x,y,w,h)',
  SIZE: 'Image size (max, !w,h, pct:n)',
  ROTATION: 'Rotation degrees',
  QUALITY: 'Image quality',
  IMAGE_FORMAT: 'Output format (jpg, png, etc.)',
  PAGES: 'Page range (e.g., "1-5", "1,3,7")',
  MAX_CANVASES: 'Max canvases to include',

  // GA HAP specific
  FILM_NUMBER: 'Film number (e.g., MAP2080)',
  RUN: 'Run identifier',
  FRAME: 'Frame identifier',
  OBJECT_ID: 'ArcGIS OBJECTID',

  // PM Transcripts
  PRIME_MINISTER: 'PM name (partial match)',
  TRANSCRIPT_ID: 'Transcript ID (1-26000)',

  // VHD
  ARCHITECTURAL_STYLE: 'Architectural style',
  ARCH_STYLE: 'Architectural style', // Alias
  PERIOD: 'Historical period',
  THEME: 'Heritage theme (from vhd_list_themes)',
  COLLECTION: 'Collection name',
  START_PAGE: 'Starting page number',

  // Include options (for include arrays)
  INCLUDE: 'Data to include',
  RECLEVEL: 'Detail level (brief/full)',

  // NMA
  PARTY_ID: 'Person/organisation ID',
  MEDIA_ID: 'Media ID',
  PLACE_ID: 'Place ID',

  // ACMI
  CONSTELLATION_ID: 'Constellation ID',
  CREATOR_ID: 'Creator ID',

  // Image sizes (PROV)
  IMAGE_SIZE: 'Image size (thumbnail, medium, full)',

  // Faceted Search
  INCLUDE_FACETS: 'Include facet counts',
  FACET_FIELDS: 'Facets to return',
  FACET_LIMIT: 'Max values per facet',
} as const;

// Type for autocomplete
export type ParamKey = keyof typeof PARAMS;

// ============================================================================
// Common Enum Descriptions (for description fields on enum properties)
// ============================================================================

export const ENUM_DESC = {
  TROVE_CATEGORY: 'all, newspaper, gazette, magazine, image, book, etc.',
  TROVE_SORT: 'relevance, datedesc, dateasc',
  TROVE_AVAILABILITY: 'online, free, restricted, subscription',
  AU_STATE_ABBREV: 'vic, nsw, qld, sa, wa, tas, nt, act',
  AU_STATE_FULL: 'Victoria, New South Wales, Queensland, etc.',
  VHD_STYLE: 'Victorian Period, Federation Period, etc.',
  VHD_PERIOD: 'Historical period classification',
  ACMI_TYPE: 'Film, Television, Videogame, Artwork, etc.',
  ALA_KINGDOM: 'Animalia, Plantae, Fungi, etc.',
  IIIF_SIZE: 'max, full, !w,h, pct:n, w, or ,h',
  IIIF_FORMAT: 'jpg, png, gif, webp, tif',
  IIIF_QUALITY: 'default, color, gray, bitonal',
  IMAGE_SIZE: 'thumbnail, medium, full, all',
  PROV_RECORD_FORM: 'Photograph, Map, File, etc.',
  PROV_CATEGORY: 'agency, function, series, item, image',
  MV_RECORD_TYPE: 'article, item, species, specimen',
  MV_CATEGORY: 'natural sciences, first peoples, history',
  MV_LICENCE: 'public domain, cc by, cc by-nc, etc.',
} as const;
