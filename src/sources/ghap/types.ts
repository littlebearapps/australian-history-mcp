/**
 * GHAP (Gazetteer of Historical Australian Placenames) Type Definitions
 *
 * Types specific to the GHAP/TLCMap data source.
 */

// ============================================================================
// Search Parameters
// ============================================================================

export interface GHAPSearchParams {
  name?: string;         // Exact name match
  containsname?: string; // Partial name match
  fuzzyname?: string;    // Fuzzy name match
  state?: GHAPState;     // Australian state filter
  lga?: string;          // Local Government Area
  bbox?: string;         // Bounding box: minLon,minLat,maxLon,maxLat
  anpsId?: string;       // ANPS ID for exact lookup
  limit?: number;        // Max results
}

// ============================================================================
// Record Types
// ============================================================================

export interface GHAPPlace {
  id: string;
  anpsId?: string;
  name: string;
  state?: string;
  lga?: string;
  latitude?: number;
  longitude?: number;
  featureType?: string;
  description?: string;
  source?: string;
  dateRange?: string;
  url?: string;
}

export interface GHAPSearchResult {
  totalResults: number;
  returned: number;
  places: GHAPPlace[];
}

export interface GHAPLayer {
  id: number;
  name: string;
  description?: string;
  creator?: string;
  placeCount?: number;
  url?: string;
}

export interface GHAPLayerResult {
  layer: GHAPLayer;
  places: GHAPPlace[];
}

// ============================================================================
// Australian State Enum
// ============================================================================

export const GHAP_STATES = [
  'NSW',
  'VIC',
  'QLD',
  'SA',
  'WA',
  'TAS',
  'NT',
  'ACT',
] as const;

export type GHAPState = typeof GHAP_STATES[number];
