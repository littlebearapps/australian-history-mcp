/**
 * Geometry utilities for spatial queries.
 *
 * @module core/spatial/geometry
 */

import type { Point, BBox, RadiusQuery, ValidationResult } from './types.js';

/** Earth's radius in kilometres */
const EARTH_RADIUS_KM = 6371;

/** Degrees per kilometre at equator (approximate) */
const DEG_PER_KM_LAT = 1 / 111.32;

/**
 * Convert degrees to radians.
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees.
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate the haversine distance between two points.
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Distance in kilometres
 */
export function haversineDistance(p1: Point, p2: Point): number {
  const lat1 = toRadians(p1.lat);
  const lat2 = toRadians(p2.lat);
  const dLat = toRadians(p2.lat - p1.lat);
  const dLon = toRadians(p2.lon - p1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Convert a point+radius query to a bounding box.
 *
 * Uses a simple approximation that works well for small radii (<500km).
 * For larger radii, the approximation becomes less accurate at high latitudes.
 *
 * @param query - Point and radius
 * @returns Bounding box containing the circle
 */
export function radiusToBBox(query: RadiusQuery): BBox {
  const { lat, lon, radiusKm } = query;

  // Calculate latitude offset (constant everywhere)
  const dLat = radiusKm * DEG_PER_KM_LAT;

  // Calculate longitude offset (varies with latitude)
  // At latitude θ, 1 degree of longitude = cos(θ) * 111.32 km
  const cosLat = Math.cos(toRadians(lat));
  const dLon = cosLat > 0.001 ? (radiusKm * DEG_PER_KM_LAT) / cosLat : 180;

  return {
    minLat: Math.max(-90, lat - dLat),
    maxLat: Math.min(90, lat + dLat),
    minLon: Math.max(-180, lon - dLon),
    maxLon: Math.min(180, lon + dLon),
  };
}

/**
 * Convert a bounding box to a string format "minLon,minLat,maxLon,maxLat".
 *
 * @param bbox - Bounding box
 * @returns String representation
 */
export function bboxToString(bbox: BBox): string {
  return `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`;
}

/**
 * Parse a bounding box string "minLon,minLat,maxLon,maxLat".
 *
 * @param str - Bounding box string
 * @returns Parsed bounding box or null if invalid
 */
export function parseBBox(str: string): BBox | null {
  const parts = str.split(',').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return null;
  }

  const [minLon, minLat, maxLon, maxLat] = parts;

  // Validate ranges
  if (minLat < -90 || maxLat > 90 || minLon < -180 || maxLon > 180) {
    return null;
  }

  return { minLon, minLat, maxLon, maxLat };
}

/**
 * Validate a point's coordinates.
 *
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Validation result
 */
export function validatePoint(lat: number, lon: number): ValidationResult {
  if (typeof lat !== 'number' || isNaN(lat)) {
    return { valid: false, error: 'Latitude must be a number' };
  }
  if (typeof lon !== 'number' || isNaN(lon)) {
    return { valid: false, error: 'Longitude must be a number' };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  if (lon < -180 || lon > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  return { valid: true };
}

/**
 * Validate a radius value.
 *
 * @param radiusKm - Radius in kilometres
 * @returns Validation result
 */
export function validateRadius(radiusKm: number): ValidationResult {
  if (typeof radiusKm !== 'number' || isNaN(radiusKm)) {
    return { valid: false, error: 'Radius must be a number' };
  }
  if (radiusKm <= 0) {
    return { valid: false, error: 'Radius must be greater than 0' };
  }
  if (radiusKm > 20000) {
    return { valid: false, error: 'Radius must be less than 20,000 km (half Earth circumference)' };
  }
  return { valid: true };
}

/**
 * Validate a complete radius query.
 *
 * @param query - Radius query to validate
 * @returns Validation result
 */
export function validateRadiusQuery(query: RadiusQuery): ValidationResult {
  const pointValidation = validatePoint(query.lat, query.lon);
  if (!pointValidation.valid) {
    return pointValidation;
  }
  return validateRadius(query.radiusKm);
}

/**
 * Convert WGS84 coordinates to Web Mercator (EPSG:3857).
 *
 * Used for ArcGIS API calls (e.g., GA HAP).
 *
 * @param point - WGS84 point
 * @returns Web Mercator coordinates [x, y]
 */
export function toWebMercator(point: Point): [number, number] {
  const x = point.lon * 20037508.34 / 180;
  const y = Math.log(Math.tan((90 + point.lat) * Math.PI / 360)) / (Math.PI / 180);
  const yMercator = y * 20037508.34 / 180;
  return [x, yMercator];
}

/**
 * Convert Web Mercator (EPSG:3857) to WGS84.
 *
 * @param x - Web Mercator x coordinate
 * @param y - Web Mercator y coordinate
 * @returns WGS84 point
 */
export function fromWebMercator(x: number, y: number): Point {
  const lon = x * 180 / 20037508.34;
  const lat = toDegrees(Math.atan(Math.exp(y * Math.PI / 20037508.34)) * 2 - Math.PI / 2);
  return { lat, lon };
}

/**
 * Convert a bounding box to Web Mercator envelope.
 *
 * @param bbox - WGS84 bounding box
 * @returns Web Mercator envelope { xmin, ymin, xmax, ymax }
 */
export function bboxToWebMercator(bbox: BBox): {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
} {
  const [xmin, ymin] = toWebMercator({ lat: bbox.minLat, lon: bbox.minLon });
  const [xmax, ymax] = toWebMercator({ lat: bbox.maxLat, lon: bbox.maxLon });
  return { xmin, ymin, xmax, ymax };
}

/**
 * Check if a point is within a bounding box.
 *
 * @param point - Point to check
 * @param bbox - Bounding box
 * @returns True if point is inside bbox
 */
export function isPointInBBox(point: Point, bbox: BBox): boolean {
  return (
    point.lat >= bbox.minLat &&
    point.lat <= bbox.maxLat &&
    point.lon >= bbox.minLon &&
    point.lon <= bbox.maxLon
  );
}

/**
 * Check if a point is within a radius of another point.
 *
 * @param point - Point to check
 * @param centre - Centre point
 * @param radiusKm - Radius in kilometres
 * @returns True if point is within radius
 */
export function isPointInRadius(point: Point, centre: Point, radiusKm: number): boolean {
  return haversineDistance(point, centre) <= radiusKm;
}
