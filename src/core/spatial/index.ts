/**
 * Spatial query module for point+radius and bounding box searches.
 *
 * @module core/spatial
 */

export type {
  Point,
  BBox,
  RadiusQuery,
  SpatialQuery,
  ValidationResult,
} from './types.js';

export {
  haversineDistance,
  radiusToBBox,
  bboxToString,
  parseBBox,
  validatePoint,
  validateRadius,
  validateRadiusQuery,
  toWebMercator,
  fromWebMercator,
  bboxToWebMercator,
  isPointInBBox,
  isPointInRadius,
} from './geometry.js';
