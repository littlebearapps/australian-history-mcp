/**
 * Spatial query types for point+radius and bounding box searches.
 *
 * @module core/spatial/types
 */

/**
 * A geographic point in WGS84 coordinates.
 */
export interface Point {
  /** Latitude in degrees (-90 to 90) */
  lat: number;
  /** Longitude in degrees (-180 to 180) */
  lon: number;
}

/**
 * A bounding box defined by min/max coordinates.
 */
export interface BBox {
  /** Western boundary (minimum longitude) */
  minLon: number;
  /** Southern boundary (minimum latitude) */
  minLat: number;
  /** Eastern boundary (maximum longitude) */
  maxLon: number;
  /** Northern boundary (maximum latitude) */
  maxLat: number;
}

/**
 * A point+radius query for spatial search.
 */
export interface RadiusQuery {
  /** Centre point latitude (-90 to 90) */
  lat: number;
  /** Centre point longitude (-180 to 180) */
  lon: number;
  /** Search radius in kilometres */
  radiusKm: number;
}

/**
 * A spatial query that can be either bbox or radius-based.
 */
export interface SpatialQuery {
  type: 'bbox' | 'radius';
  bbox?: BBox;
  radius?: RadiusQuery;
}

/**
 * Validation result for coordinates.
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
