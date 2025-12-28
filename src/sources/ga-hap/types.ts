/**
 * Geoscience Australia Historical Aerial Photography (HAP) API Types
 *
 * ArcGIS REST Feature Service API
 * No API key required - CC-BY 4.0 licensed.
 */

// ============================================================================
// State Code Mapping
// ============================================================================

export const STATE_CODES: Record<string, string> = {
  NSW: '1',
  VIC: '2',
  QLD: '3',
  SA: '4',
  WA: '5',
  TAS: '6',
  NT: '7',
  ACT: '8',
};

export const STATE_NAMES: Record<string, string> = {
  '1': 'New South Wales',
  '2': 'Victoria',
  '3': 'Queensland',
  '4': 'South Australia',
  '5': 'Western Australia',
  '6': 'Tasmania',
  '7': 'Northern Territory',
  '8': 'Australian Capital Territory',
};

// ============================================================================
// Sort Options
// ============================================================================

export type GAHAPSortOption = 'relevance' | 'year_asc' | 'year_desc';

export const GAHAP_SORT_OPTIONS: GAHAPSortOption[] = ['relevance', 'year_asc', 'year_desc'];

// Map user-friendly sort options to ArcGIS orderByFields parameter
export const GAHAP_SORT_MAPPINGS: Record<GAHAPSortOption, string | null> = {
  relevance: null, // Default (no sort param)
  year_asc: 'YEAR_START ASC',
  year_desc: 'YEAR_START DESC',
};

// ============================================================================
// Search Parameters
// ============================================================================

export interface GAHAPSearchParams {
  /** Australian state (NSW, VIC, QLD, SA, WA, TAS, NT, ACT) */
  state?: string;
  /** Filter by start year (e.g., 1950) */
  yearFrom?: number;
  /** Filter by end year (e.g., 1970) */
  yearTo?: number;
  /** Only return records with digitised images */
  scannedOnly?: boolean;
  /** Maximum results to return (1-100, default 20) */
  limit?: number;
  /** Number of results to skip (for pagination) */
  offset?: number;
  /** Bounding box: minX,minY,maxX,maxY in WGS84 coordinates */
  bbox?: string;
  /** Film number filter (e.g., "MAP2080") */
  filmNumber?: string;
  /** Sort order for results */
  sortby?: GAHAPSortOption;
}

export interface GAHAPGetPhotoParams {
  /** ArcGIS OBJECTID */
  objectId?: number;
  /** Film number (e.g., "MAP2080") */
  filmNumber?: string;
  /** Run identifier (e.g., "1", "COAST TIE 2") */
  run?: string;
  /** Frame identifier (e.g., "80", "5014") */
  frame?: string;
}

export interface GAHAPHarvestParams {
  /** Australian state (NSW, VIC, QLD, SA, WA, TAS, NT, ACT) */
  state?: string;
  /** Filter by start year */
  yearFrom?: number;
  /** Filter by end year */
  yearTo?: number;
  /** Only return records with digitised images */
  scannedOnly?: boolean;
  /** Maximum records to harvest (1-1000, default 100) */
  maxRecords?: number;
  /** Offset for pagination (default 0) */
  startFrom?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * ArcGIS Feature Service query response
 */
export interface GAHAPQueryResponse {
  objectIdFieldName: string;
  globalIdFieldName?: string;
  geometryType?: string;
  spatialReference?: {
    wkid: number;
    latestWkid?: number;
  };
  fields: GAHAPField[];
  features: GAHAPFeature[];
  exceededTransferLimit?: boolean;
}

export interface GAHAPField {
  name: string;
  type: string;
  alias?: string;
  length?: number;
  domain?: {
    type: string;
    name: string;
    codedValues?: Array<{
      name: string;
      code: string | number;
    }>;
  };
}

export interface GAHAPFeature {
  attributes: GAHAPAttributes;
  geometry?: {
    x: number;
    y: number;
  };
}

// ============================================================================
// Photo Record Types
// ============================================================================

/**
 * Raw attributes from ArcGIS Feature Service
 */
export interface GAHAPAttributes {
  OBJECTID: number;
  FILM_NUMBER: string;
  RUN?: string;
  FRAME?: string;
  DATE_START?: string;
  DATE_END?: string;
  YEAR_START?: number;
  YEAR_END?: number;
  STATE?: string;
  CAMERA?: string;
  FOCAL_LENG?: number;
  AVE_HEIGHT?: number;
  AVE_SCALE?: number;
  FILM_TYPE?: string;
  SCANNED?: string;
  PREVIEW_URL?: string;
  TIF_URL?: string;
  FILESIZE?: number;
  GlobalID?: string;
}

/**
 * Parsed photo record for tool responses
 */
export interface GAHAPPhoto {
  /** ArcGIS OBJECTID */
  objectId: number;
  /** Film identifier (e.g., "MAP2080") */
  filmNumber: string;
  /** Run identifier (e.g., "1", "COAST TIE 2") */
  run?: string;
  /** Frame identifier (e.g., "80", "5014") */
  frame?: string;
  /** Capture date range start */
  dateStart?: string;
  /** Capture date range end */
  dateEnd?: string;
  /** Start year */
  yearStart?: number;
  /** End year */
  yearEnd?: number;
  /** Australian state code */
  stateCode?: string;
  /** Australian state name */
  stateName?: string;
  /** Camera type */
  camera?: string;
  /** Focal length (mm) */
  focalLength?: number;
  /** Average flight height (metres) */
  averageHeight?: number;
  /** Average scale (e.g., 80000 for 1:80000) */
  averageScale?: number;
  /** Film type (B&W, Colour, IR) */
  filmType?: string;
  /** Whether the photo has been digitised */
  scanned: boolean;
  /** Preview image URL (JPG) */
  previewUrl?: string;
  /** Full resolution TIFF download URL */
  tifUrl?: string;
  /** File size in bytes */
  fileSize?: number;
  /** Longitude (WGS84) */
  longitude?: number;
  /** Latitude (WGS84) */
  latitude?: number;
}

/**
 * Search result with pagination metadata
 */
export interface GAHAPSearchResult {
  photos: GAHAPPhoto[];
  totalReturned: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Harvest result with pagination metadata
 */
export interface GAHAPHarvestResult {
  records: GAHAPPhoto[];
  totalHarvested: number;
  startFrom: number;
  hasMore: boolean;
  nextOffset?: number;
}
