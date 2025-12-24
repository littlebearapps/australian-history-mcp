/**
 * National Museum of Australia API Client
 *
 * Provides access to museum collection objects, parties (people/orgs),
 * places, and media. Optional API key for higher rate limits.
 *
 * API Documentation: https://github.com/NationalMuseumAustralia/Collection-API
 */

import { BaseClient } from '../../core/base-client.js';
import type {
  NMASearchParams,
  NMASearchResult,
  NMAObject,
  NMAParty,
  NMAPlace,
  NMAMedia,
} from './types.js';

const NMA_API_BASE = 'https://data.nma.gov.au';

export class NMAClient extends BaseClient {
  private apiKey?: string;

  constructor() {
    super(NMA_API_BASE, { userAgent: 'australian-history-mcp/0.6.0' });
    this.apiKey = process.env.NMA_API_KEY;
  }

  // =========================================================================
  // Object Search
  // =========================================================================

  /**
   * Search for museum objects
   */
  async searchObjects(params: NMASearchParams): Promise<NMASearchResult<NMAObject>> {
    const queryParams: Record<string, string> = {};

    if (params.text) {
      queryParams.text = params.text;
    }

    if (params.type) {
      queryParams.type = params.type;
    }

    if (params.collection) {
      queryParams.collection = params.collection;
    }

    queryParams.limit = (params.limit ?? 20).toString();

    if (params.offset) {
      queryParams.offset = params.offset.toString();
    }

    const url = this.buildUrl('/object', queryParams);
    return this.fetchWithAuth<NMASearchResult<NMAObject>>(url);
  }

  /**
   * Get a single object by ID
   */
  async getObject(id: string): Promise<NMAObject | null> {
    const url = this.buildUrl(`/object/${id}`, {});

    try {
      const result = await this.fetchWithAuth<NMASearchResult<NMAObject>>(url);
      return result.data[0] ?? null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // =========================================================================
  // Party Search (People/Organisations)
  // =========================================================================

  /**
   * Search for parties (people and organisations)
   */
  async searchParties(params: NMASearchParams): Promise<NMASearchResult<NMAParty>> {
    const queryParams: Record<string, string> = {};

    if (params.text) {
      queryParams.text = params.text;
    }

    queryParams.limit = (params.limit ?? 20).toString();

    if (params.offset) {
      queryParams.offset = params.offset.toString();
    }

    const url = this.buildUrl('/party', queryParams);
    return this.fetchWithAuth<NMASearchResult<NMAParty>>(url);
  }

  /**
   * Get a single party by ID
   */
  async getParty(id: string): Promise<NMAParty | null> {
    const url = this.buildUrl(`/party/${id}`, {});

    try {
      const result = await this.fetchWithAuth<NMASearchResult<NMAParty>>(url);
      return result.data[0] ?? null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // =========================================================================
  // Place Search
  // =========================================================================

  /**
   * Search for places
   */
  async searchPlaces(params: NMASearchParams): Promise<NMASearchResult<NMAPlace>> {
    const queryParams: Record<string, string> = {};

    if (params.text) {
      queryParams.text = params.text;
    }

    queryParams.limit = (params.limit ?? 20).toString();

    if (params.offset) {
      queryParams.offset = params.offset.toString();
    }

    const url = this.buildUrl('/place', queryParams);
    return this.fetchWithAuth<NMASearchResult<NMAPlace>>(url);
  }

  /**
   * Get a single place by ID
   */
  async getPlace(id: string): Promise<NMAPlace | null> {
    const url = this.buildUrl(`/place/${id}`, {});

    try {
      const result = await this.fetchWithAuth<NMASearchResult<NMAPlace>>(url);
      return result.data[0] ?? null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // =========================================================================
  // Media Search
  // =========================================================================

  /**
   * Search for media items
   */
  async searchMedia(params: NMASearchParams): Promise<NMASearchResult<NMAMedia>> {
    const queryParams: Record<string, string> = {};

    if (params.text) {
      queryParams.text = params.text;
    }

    queryParams.limit = (params.limit ?? 20).toString();

    if (params.offset) {
      queryParams.offset = params.offset.toString();
    }

    const url = this.buildUrl('/media', queryParams);
    return this.fetchWithAuth<NMASearchResult<NMAMedia>>(url);
  }

  /**
   * Get a single media item by ID
   */
  async getMedia(id: string): Promise<NMAMedia | null> {
    const url = this.buildUrl(`/media/${id}`, {});

    try {
      const result = await this.fetchWithAuth<NMASearchResult<NMAMedia>>(url);
      return result.data[0] ?? null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  /**
   * Fetch with optional API key header
   */
  private async fetchWithAuth<T>(url: string): Promise<T> {
    const headers: Record<string, string> = {};

    if (this.apiKey) {
      headers['apikey'] = this.apiKey;
    }

    return this.fetchJSON<T>(url, { headers });
  }
}

// Export singleton instance
export const nmaClient = new NMAClient();
