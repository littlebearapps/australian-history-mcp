/**
 * Geoscience Australia Historical Aerial Photography (HAP) API Client
 *
 * ArcGIS REST Feature Service for historical aerial photographs (1928-1996).
 * No API key required - CC-BY 4.0 licensed.
 *
 * API Base: https://services1.arcgis.com/wfNKYeHsOyaFyPw3/arcgis/rest/services/
 * Feature Service: HistoricalAerialPhotography_AGOL_DIST_gdb/FeatureServer/
 * Layer 0: HAP_Photo_Centres_AGOL
 */

import { BaseClient } from '../../core/base-client.js';
import type {
  GAHAPSearchParams,
  GAHAPGetPhotoParams,
  GAHAPQueryResponse,
  GAHAPPhoto,
  GAHAPAttributes,
  GAHAPSearchResult,
  STATE_CODES,
  STATE_NAMES,
} from './types.js';
import { STATE_CODES as CODES, STATE_NAMES as NAMES } from './types.js';

const API_BASE =
  'https://services1.arcgis.com/wfNKYeHsOyaFyPw3/arcgis/rest/services/HistoricalAerialPhotography_AGOL_DIST_gdb/FeatureServer';

// ArcGIS Feature Service has a max of 2000 records per query
const MAX_RECORDS_PER_QUERY = 2000;

// Web Mercator (EPSG:3857) to WGS84 (EPSG:4326) conversion constants
const EARTH_RADIUS = 6378137;

export class GAHAPClient extends BaseClient {
  constructor() {
    super(API_BASE, { userAgent: 'australian-archives-mcp/0.5.0' });
  }

  // =========================================================================
  // Search Photos
  // =========================================================================

  /**
   * Search for historical aerial photographs
   */
  async searchPhotos(params: GAHAPSearchParams): Promise<GAHAPSearchResult> {
    const where = this.buildWhereClause(params);
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;

    const queryParams: Record<string, unknown> = {
      where,
      outFields: '*',
      returnGeometry: true,
      resultRecordCount: limit,
      resultOffset: offset,
      f: 'json',
    };

    // Add spatial filter if bbox provided
    if (params.bbox) {
      const [minX, minY, maxX, maxY] = params.bbox.split(',').map(Number);
      // Convert WGS84 to Web Mercator for the query
      const webMercatorGeometry = {
        xmin: this.lonToWebMercator(minX),
        ymin: this.latToWebMercator(minY),
        xmax: this.lonToWebMercator(maxX),
        ymax: this.latToWebMercator(maxY),
        spatialReference: { wkid: 3857 },
      };
      queryParams.geometry = JSON.stringify(webMercatorGeometry);
      queryParams.geometryType = 'esriGeometryEnvelope';
      queryParams.spatialRel = 'esriSpatialRelIntersects';
      queryParams.inSR = 3857;
    }

    const url = this.buildUrl('/0/query', queryParams);
    const response = await this.fetchJSON<GAHAPQueryResponse>(url);

    const photos = response.features.map((f) => this.parsePhoto(f.attributes, f.geometry));

    return {
      photos,
      totalReturned: photos.length,
      offset,
      limit,
      hasMore: response.exceededTransferLimit ?? false,
    };
  }

  // =========================================================================
  // Get Single Photo
  // =========================================================================

  /**
   * Get a single photo by OBJECTID or film/run/frame
   */
  async getPhoto(params: GAHAPGetPhotoParams): Promise<GAHAPPhoto | null> {
    let where: string;

    if (params.objectId !== undefined) {
      where = `OBJECTID = ${params.objectId}`;
    } else if (params.filmNumber && params.run !== undefined && params.frame !== undefined) {
      where = `FILM_NUMBER = '${params.filmNumber}' AND RUN = '${params.run}' AND FRAME = '${params.frame}'`;
    } else {
      throw new Error('Either objectId or filmNumber+run+frame must be provided');
    }

    const url = this.buildUrl('/0/query', {
      where,
      outFields: '*',
      returnGeometry: true,
      f: 'json',
    });

    const response = await this.fetchJSON<GAHAPQueryResponse>(url);

    if (response.features.length === 0) {
      return null;
    }

    const feature = response.features[0];
    return this.parsePhoto(feature.attributes, feature.geometry);
  }

  // =========================================================================
  // Harvest (Bulk Download)
  // =========================================================================

  /**
   * Harvest photos with pagination for bulk download
   */
  async harvest(
    params: GAHAPSearchParams & { maxRecords?: number; startFrom?: number }
  ): Promise<{ records: GAHAPPhoto[]; hasMore: boolean; nextOffset: number }> {
    const where = this.buildWhereClause(params);
    const maxRecords = Math.min(params.maxRecords ?? 100, 1000);
    const startFrom = params.startFrom ?? 0;

    // Use min of maxRecords and MAX_RECORDS_PER_QUERY
    const recordCount = Math.min(maxRecords, MAX_RECORDS_PER_QUERY);

    const url = this.buildUrl('/0/query', {
      where,
      outFields: '*',
      returnGeometry: true,
      resultRecordCount: recordCount,
      resultOffset: startFrom,
      f: 'json',
    });

    const response = await this.fetchJSON<GAHAPQueryResponse>(url);
    const records = response.features.map((f) => this.parsePhoto(f.attributes, f.geometry));

    const hasMore = response.exceededTransferLimit ?? records.length === recordCount;
    const nextOffset = startFrom + records.length;

    return { records, hasMore, nextOffset };
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  /**
   * Build WHERE clause from search parameters
   */
  private buildWhereClause(params: GAHAPSearchParams): string {
    const conditions: string[] = [];

    // State filter
    if (params.state) {
      const stateCode = CODES[params.state.toUpperCase()];
      if (stateCode) {
        conditions.push(`STATE = '${stateCode}'`);
      }
    }

    // Year range filter
    if (params.yearFrom !== undefined || params.yearTo !== undefined) {
      if (params.yearFrom !== undefined && params.yearTo !== undefined) {
        // Photos that overlap with the year range
        conditions.push(`YEAR_START <= ${params.yearTo}`);
        conditions.push(`YEAR_END >= ${params.yearFrom}`);
      } else if (params.yearFrom !== undefined) {
        conditions.push(`YEAR_END >= ${params.yearFrom}`);
      } else if (params.yearTo !== undefined) {
        conditions.push(`YEAR_START <= ${params.yearTo}`);
      }
    }

    // Scanned only filter
    if (params.scannedOnly) {
      conditions.push(`SCANNED = '1'`);
    }

    // Film number filter
    if (params.filmNumber) {
      conditions.push(`FILM_NUMBER = '${params.filmNumber}'`);
    }

    // Return all records if no conditions
    return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  }

  /**
   * Extract URL from HTML anchor tag
   * API returns: <a href="https://..." target="_blank">text</a>
   */
  private extractUrl(html: string | undefined): string | undefined {
    if (!html) return undefined;

    // Match href attribute in anchor tag
    const match = html.match(/href="([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }

    // If no anchor tag, return as-is (might be a plain URL)
    if (html.startsWith('http')) {
      return html;
    }

    return undefined;
  }

  /**
   * Parse ArcGIS attributes to GAHAPPhoto
   */
  private parsePhoto(
    attrs: GAHAPAttributes,
    geometry?: { x: number; y: number }
  ): GAHAPPhoto {
    // Convert Web Mercator to WGS84 if geometry present
    let longitude: number | undefined;
    let latitude: number | undefined;

    if (geometry) {
      longitude = this.webMercatorToLon(geometry.x);
      latitude = this.webMercatorToLat(geometry.y);
    }

    return {
      objectId: attrs.OBJECTID,
      filmNumber: attrs.FILM_NUMBER,
      run: attrs.RUN,
      frame: attrs.FRAME,
      dateStart: attrs.DATE_START,
      dateEnd: attrs.DATE_END,
      yearStart: attrs.YEAR_START,
      yearEnd: attrs.YEAR_END,
      stateCode: attrs.STATE,
      stateName: attrs.STATE ? NAMES[attrs.STATE] : undefined,
      camera: attrs.CAMERA,
      focalLength: attrs.FOCAL_LENG,
      averageHeight: attrs.AVE_HEIGHT,
      averageScale: attrs.AVE_SCALE,
      filmType: attrs.FILM_TYPE,
      scanned: attrs.SCANNED === '1',
      previewUrl: this.extractUrl(attrs.PREVIEW_URL),
      tifUrl: this.extractUrl(attrs.TIF_URL),
      fileSize: attrs.FILESIZE,
      longitude,
      latitude,
    };
  }

  // =========================================================================
  // Coordinate Conversion (Web Mercator <-> WGS84)
  // =========================================================================

  /**
   * Convert Web Mercator X to WGS84 longitude
   */
  private webMercatorToLon(x: number): number {
    return (x / EARTH_RADIUS) * (180 / Math.PI);
  }

  /**
   * Convert Web Mercator Y to WGS84 latitude
   */
  private webMercatorToLat(y: number): number {
    return (
      (Math.atan(Math.exp(y / EARTH_RADIUS)) * 2 - Math.PI / 2) * (180 / Math.PI)
    );
  }

  /**
   * Convert WGS84 longitude to Web Mercator X
   */
  private lonToWebMercator(lon: number): number {
    return (lon * Math.PI * EARTH_RADIUS) / 180;
  }

  /**
   * Convert WGS84 latitude to Web Mercator Y
   */
  private latToWebMercator(lat: number): number {
    const rad = (lat * Math.PI) / 180;
    return EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + rad / 2));
  }
}

// Export singleton instance
export const gaHapClient = new GAHAPClient();
