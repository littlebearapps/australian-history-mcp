/**
 * Victorian Heritage Database (VHD) API Client
 *
 * Provides access to Victorian heritage places, shipwrecks, and objects.
 * No API key required for read-only access.
 *
 * API Documentation: https://discover.data.vic.gov.au/dataset/victorian-heritage-api
 */

import { BaseClient } from '../../core/base-client.js';
import type {
  VHDPlaceSearchParams,
  VHDShipwreckSearchParams,
  VHDSearchResult,
  VHDPlace,
  VHDPlaceDetail,
  VHDShipwreck,
  VHDShipwreckDetail,
  VHDLookupItem,
  VHDLookupResponse,
  VHDMunicipalityRaw,
  VHDArchitecturalStyleRaw,
  VHDPeriodRaw,
} from './types.js';

const VHD_API_BASE = 'https://api.heritagecouncil.vic.gov.au/v1';

export class VHDClient extends BaseClient {
  constructor() {
    super(VHD_API_BASE, { userAgent: 'australian-archives-mcp/0.5.0' });
  }

  // =========================================================================
  // Place Search
  // =========================================================================

  /**
   * Search for heritage places
   */
  async searchPlaces(params: VHDPlaceSearchParams): Promise<VHDSearchResult<VHDPlace>> {
    const queryParams: Record<string, string> = {};

    // VHD API uses 'kw' for keyword search
    if (params.query) {
      queryParams.kw = params.query;
    }

    // VHD API uses 'mun' for municipality (expects numeric ID or name)
    if (params.municipality) {
      queryParams.sub = params.municipality; // 'sub' is suburb, more flexible
    }

    if (params.heritageAuthority) {
      queryParams.aut = params.heritageAuthority;
    }

    // VHD API uses 'arcs' for architectural style (numeric ID or name)
    if (params.architecturalStyle) {
      queryParams.arcs = params.architecturalStyle;
    }

    // VHD API uses 'per' for time period (numeric ID)
    if (params.period) {
      queryParams.per = params.period;
    }

    if (params.page) {
      queryParams.page = params.page.toString();
    }

    // VHD API uses 'rpp' (records per page), not 'limit'
    if (params.limit) {
      queryParams.rpp = params.limit.toString();
    }

    const url = this.buildUrl('/places', queryParams);
    return this.fetchJSON<VHDSearchResult<VHDPlace>>(url);
  }

  /**
   * Get a single place by ID
   */
  async getPlace(id: number): Promise<VHDPlaceDetail | null> {
    const url = this.buildUrl(`/places/${id}`, {});

    try {
      return await this.fetchJSON<VHDPlaceDetail>(url);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // =========================================================================
  // Shipwreck Search
  // =========================================================================

  /**
   * Search for shipwrecks
   */
  async searchShipwrecks(params: VHDShipwreckSearchParams): Promise<VHDSearchResult<VHDShipwreck>> {
    const queryParams: Record<string, string> = {};

    // VHD API uses 'kw' for keyword search
    if (params.query) {
      queryParams.kw = params.query;
    }

    if (params.page) {
      queryParams.page = params.page.toString();
    }

    // VHD API uses 'rpp' (records per page), not 'limit'
    if (params.limit) {
      queryParams.rpp = params.limit.toString();
    }

    const url = this.buildUrl('/shipwrecks', queryParams);
    return this.fetchJSON<VHDSearchResult<VHDShipwreck>>(url);
  }

  /**
   * Get a single shipwreck by ID
   */
  async getShipwreck(id: number): Promise<VHDShipwreckDetail | null> {
    const url = this.buildUrl(`/shipwrecks/${id}`, {});

    try {
      return await this.fetchJSON<VHDShipwreckDetail>(url);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // =========================================================================
  // Lookup Endpoints
  // =========================================================================

  /**
   * List all municipalities (local government areas)
   */
  async listMunicipalities(): Promise<VHDLookupItem[]> {
    const url = this.buildUrl('/municipalities', {});
    const response = await this.fetchJSON<VHDLookupResponse>(url);
    const raw = response._embedded?.local_government_authority ?? [];
    return raw.map((m: VHDMunicipalityRaw) => ({
      id: parseInt(m.id, 10) || 0,
      name: m.lga_name,
    }));
  }

  /**
   * List all architectural styles
   */
  async listArchitecturalStyles(): Promise<VHDLookupItem[]> {
    const url = this.buildUrl('/architectural-styles', {});
    const response = await this.fetchJSON<VHDLookupResponse>(url);
    const raw = response._embedded?.architectural_style ?? [];
    return raw.map((s: VHDArchitecturalStyleRaw) => ({
      id: parseInt(s.id, 10) || 0,
      name: s.architectural_style_name,
    }));
  }

  /**
   * List all heritage themes
   */
  async listThemes(): Promise<VHDLookupItem[]> {
    const url = this.buildUrl('/themes', {});
    const response = await this.fetchJSON<VHDLookupResponse>(url);
    const raw = response._embedded?.themes ?? [];
    return raw.map((t) => ({
      id: parseInt(t.id, 10) || 0,
      name: t.name,
    }));
  }

  /**
   * List all time periods
   */
  async listPeriods(): Promise<VHDLookupItem[]> {
    const url = this.buildUrl('/periods', {});
    const response = await this.fetchJSON<VHDLookupResponse>(url);
    const raw = response._embedded?.period ?? [];
    return raw.map((p: VHDPeriodRaw) => ({
      id: parseInt(p.id, 10) || 0,
      name: `${p.start_year} - ${p.end_year}`,
    }));
  }
}

// Export singleton instance
export const vhdClient = new VHDClient();
