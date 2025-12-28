/**
 * Victorian Heritage Database (VHD) API Types
 */

// ============================================================================
// Search Parameters
// ============================================================================

export interface VHDPlaceSearchParams {
  /** Full-text search query */
  query?: string;
  /** Municipality filter */
  municipality?: string;
  /** Heritage authority filter */
  heritageAuthority?: string;
  /** Architectural style filter */
  architecturalStyle?: string;
  /** Period filter */
  period?: string;
  /** Heritage theme filter (from vhd_list_themes) */
  theme?: string;
  /** Only return places with images */
  hasImages?: boolean;
  /** Page number (1-based) */
  page?: number;
  /** Results per page */
  limit?: number;
}

export interface VHDShipwreckSearchParams {
  /** Full-text search query */
  query?: string;
  /** Page number (1-based) */
  page?: number;
  /** Results per page */
  limit?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface VHDSearchResult<T> {
  facets?: Record<string, Record<string, VHDFacetValue>>;
  _links?: {
    self?: { href: string };
    first?: { href: string };
    last?: { href: string };
    next?: { href: string };
    prev?: { href: string };
  };
  _embedded: {
    places?: T[];
    shipwrecks?: T[];
  };
}

export interface VHDFacetValue {
  id: string;
  name: string;
  count: number;
}

// ============================================================================
// Place Types
// ============================================================================

export interface VHDPlace {
  id: number;
  name: string;
  latlon?: string;
  summary?: string;
  location?: string;
  primary_image_id?: number;
  primary_image_caption?: string;
  primary_image_url?: string;
  heritage_authority_id?: string;
  heritage_authority_name?: string;
  heritage_authority_brief?: string;
  vhr_number?: string;
  overlay_numbers?: string[];
  score?: number;
  url?: string;
  heritage_authority_logo?: string;
  _links?: {
    self?: { href: string };
  };
}

export interface VHDPlaceDetail extends VHDPlace {
  description?: string;
  history?: string;
  date_created?: string;
  date_modified?: string;
  municipality?: {
    id: number;
    name: string;
  };
  architectural_style?: {
    id: number;
    name: string;
  };
  period?: {
    id: number;
    name: string;
  };
  /** Images keyed by ID (e.g., "1_44342") */
  images?: Record<string, VHDImageDetail>;
}

export interface VHDImageDetail {
  image_type?: string;
  image_file?: string;
  image_caption?: string;
  image_by?: string;
  image_id?: string;
  image_url?: string;
}

// ============================================================================
// Shipwreck Types
// ============================================================================

export interface VHDShipwreck {
  id: number;
  name: string;
  sw_location?: string;
  heritage_authority_id?: string;
  heritage_authority_name?: string;
  heritage_authority_brief?: string;
  vhr_number?: string;
  score?: number;
  url?: string;
  _links?: {
    self?: { href: string };
  };
}

export interface VHDShipwreckDetail extends VHDShipwreck {
  description?: string;
  history?: string;
  construction_date?: string;
  loss_date?: string;
  vessel_type?: string;
  tonnage?: string;
  length?: string;
  cause_of_loss?: string;
  cargo?: string;
  crew?: string;
  passengers?: string;
  lives_lost?: string;
}

// ============================================================================
// Lookup Types
// ============================================================================

export interface VHDLookupItem {
  id: number;
  name: string;
  /** Description for themes */
  description?: string;
  /** Count of places/records (if returned) */
  count?: number;
}

export interface VHDLookupResponse {
  _embedded?: {
    // API returns different key names than endpoint paths
    local_government_authority?: VHDMunicipalityRaw[];
    architectural_style?: VHDArchitecturalStyleRaw[];
    themes?: VHDThemeRaw[];
    period?: VHDPeriodRaw[];
  };
}

// Raw API response types (before normalisation to VHDLookupItem)
export interface VHDMunicipalityRaw {
  id: string;
  lga_code: string;
  lga_name: string;
  lga_name_brief: string;
  url?: string;
}

export interface VHDArchitecturalStyleRaw {
  id: string;
  architectural_style_name: string;
  architectural_style_id?: string;
  place_id?: string;
  comment?: string;
  sort_order?: string;
}

export interface VHDThemeRaw {
  id: string;
  name: string;
}

export interface VHDPeriodRaw {
  id: string;
  start_year: string;
  end_year: string;
  image_image_id?: string;
}
