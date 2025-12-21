/**
 * Atlas of Living Australia (ALA) API Client
 *
 * Provides access to species occurrence records and taxonomic information.
 * No API key required for read-only access.
 *
 * API Documentation: https://api.ala.org.au/
 */

import { BaseClient } from '../../core/base-client.js';
import { APIRequestError } from '../../core/types.js';
import type {
  ALAOccurrenceSearchParams,
  ALAOccurrenceSearchResult,
  ALAOccurrence,
  ALASpeciesSearchParams,
  ALASpeciesSearchResult,
  ALASpeciesProfile,
  ALAAutoCompleteResult,
} from './types.js';

// ALA uses multiple API endpoints
const BIOCACHE_API_BASE = 'https://biocache-ws.ala.org.au/ws';
const BIE_API_BASE = 'https://bie-ws.ala.org.au/ws';

export class ALAClient extends BaseClient {
  constructor() {
    super(BIOCACHE_API_BASE, { userAgent: 'australian-archives-mcp/0.2.0' });
  }

  // =========================================================================
  // BIE API Helpers (Species Information)
  // =========================================================================

  /**
   * Build URL for BIE (species) API
   */
  private buildBieUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${BIE_API_BASE}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  /**
   * Fetch JSON from BIE API
   */
  private async fetchBieJSON<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'australian-archives-mcp/0.2.0',
        },
      });

      if (!response.ok) {
        throw new APIRequestError(
          `HTTP ${response.status}: ${response.statusText}`,
          `HTTP_${response.status}`,
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIRequestError('Request timeout after 30000ms', 'TIMEOUT', undefined, true);
      }
      throw new APIRequestError(
        error instanceof Error ? error.message : 'Unknown fetch error',
        'FETCH_ERROR',
        undefined,
        false
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // =========================================================================
  // Occurrence Search
  // =========================================================================

  /**
   * Search for species occurrence records
   */
  async searchOccurrences(params: ALAOccurrenceSearchParams): Promise<ALAOccurrenceSearchResult> {
    const queryParams: Record<string, string> = {};

    // Build query string
    const queryParts: string[] = [];

    if (params.q) {
      queryParts.push(params.q);
    }

    if (params.scientificName) {
      queryParts.push(`scientificName:"${params.scientificName}"`);
    }

    if (params.vernacularName) {
      queryParts.push(`vernacularName:"${params.vernacularName}"`);
    }

    if (params.kingdom) {
      queryParts.push(`kingdom:"${params.kingdom}"`);
    }

    if (params.family) {
      queryParts.push(`family:"${params.family}"`);
    }

    if (params.genus) {
      queryParts.push(`genus:"${params.genus}"`);
    }

    if (params.species) {
      queryParts.push(`species:"${params.species}"`);
    }

    if (params.stateProvince) {
      queryParts.push(`stateProvince:"${params.stateProvince}"`);
    }

    if (params.dataResourceUid) {
      queryParts.push(`data_resource_uid:${params.dataResourceUid}`);
    }

    if (params.startYear || params.endYear) {
      const startYear = params.startYear ?? '*';
      const endYear = params.endYear ?? '*';
      queryParts.push(`year:[${startYear} TO ${endYear}]`);
    }

    if (params.hasImages) {
      queryParts.push('multimedia:Image');
    }

    if (params.spatiallyValid !== undefined) {
      queryParts.push(`geospatialKosher:${params.spatiallyValid}`);
    }

    // Set query, default to all records if empty
    queryParams.q = queryParts.length > 0 ? queryParts.join(' AND ') : '*:*';

    // Pagination
    queryParams.pageSize = (params.pageSize ?? 20).toString();
    queryParams.startIndex = (params.startIndex ?? 0).toString();

    // Sorting
    if (params.sort) {
      queryParams.sort = params.sort;
    }
    if (params.dir) {
      queryParams.dir = params.dir;
    }

    const url = this.buildUrl('/occurrences/search', queryParams);
    const data = await this.fetchJSON<ALAOccurrenceSearchResult>(url);

    return {
      totalRecords: data.totalRecords ?? 0,
      pageSize: data.pageSize ?? 20,
      startIndex: data.startIndex ?? 0,
      status: data.status ?? 'OK',
      sort: data.sort ?? 'score',
      dir: data.dir ?? 'asc',
      occurrences: (data.occurrences ?? []).map((occ) => this.parseOccurrence(occ)),
    };
  }

  /**
   * Get a single occurrence by UUID
   */
  async getOccurrence(uuid: string): Promise<ALAOccurrence | null> {
    const url = this.buildUrl(`/occurrence/${uuid}`, {});

    try {
      const data = await this.fetchJSON<unknown>(url);
      return this.parseOccurrence(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // =========================================================================
  // Species Search (BIE)
  // =========================================================================

  /**
   * Search for species by name
   */
  async searchSpecies(params: ALASpeciesSearchParams): Promise<ALASpeciesSearchResult> {
    const queryParams: Record<string, unknown> = {
      q: params.q,
      pageSize: (params.max ?? 20).toString(),
      start: (params.start ?? 0).toString(),
    };

    if (params.idxtype) {
      queryParams.idxtype = params.idxtype;
    }

    const url = this.buildBieUrl('/search', queryParams);
    const data = await this.fetchBieJSON<{
      searchResults: {
        totalRecords: number;
        startIndex: number;
        pageSize: number;
        results: unknown[];
      };
    }>(url);

    return {
      searchResults: {
        totalRecords: data.searchResults?.totalRecords ?? 0,
        startIndex: data.searchResults?.startIndex ?? 0,
        pageSize: data.searchResults?.pageSize ?? 20,
        results: (data.searchResults?.results ?? []).map((s) => this.parseSpecies(s)),
      },
    };
  }

  /**
   * Get species profile by GUID
   */
  async getSpeciesProfile(guid: string): Promise<ALASpeciesProfile | null> {
    const url = this.buildBieUrl(`/species/${encodeURIComponent(guid)}`, {});

    try {
      const data = await this.fetchBieJSON<unknown>(url);
      return this.parseSpeciesProfile(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Auto-complete species names
   */
  async autoComplete(query: string, limit: number = 10): Promise<ALAAutoCompleteResult[]> {
    const url = this.buildBieUrl('/search/auto', {
      q: query,
      limit: limit.toString(),
      idxType: 'TAXON',
    });

    const data = await this.fetchBieJSON<{ autoCompleteList: unknown[] }>(url);
    return (data.autoCompleteList ?? []).map((item) => this.parseAutoComplete(item));
  }

  // =========================================================================
  // Private Parsers
  // =========================================================================

  private parseOccurrence(data: unknown): ALAOccurrence {
    const d = data as Record<string, unknown>;

    return {
      uuid: String(d.uuid ?? ''),
      occurrenceID: d.occurrenceID ? String(d.occurrenceID) : undefined,
      scientificName: String(d.scientificName ?? ''),
      vernacularName: d.vernacularName ? String(d.vernacularName) : undefined,
      taxonRank: d.taxonRank ? String(d.taxonRank) : undefined,
      kingdom: d.kingdom ? String(d.kingdom) : undefined,
      phylum: d.phylum ? String(d.phylum) : undefined,
      classs: d.classs ? String(d.classs) : undefined,
      order: d.order ? String(d.order) : undefined,
      family: d.family ? String(d.family) : undefined,
      genus: d.genus ? String(d.genus) : undefined,
      species: d.species ? String(d.species) : undefined,
      stateProvince: d.stateProvince ? String(d.stateProvince) : undefined,
      country: d.country ? String(d.country) : undefined,
      decimalLatitude: typeof d.decimalLatitude === 'number' ? d.decimalLatitude : undefined,
      decimalLongitude: typeof d.decimalLongitude === 'number' ? d.decimalLongitude : undefined,
      coordinateUncertaintyInMeters: typeof d.coordinateUncertaintyInMeters === 'number' ? d.coordinateUncertaintyInMeters : undefined,
      eventDate: typeof d.eventDate === 'number' ? d.eventDate : undefined,
      year: typeof d.year === 'number' ? d.year : undefined,
      month: d.month ? String(d.month) : undefined,
      basisOfRecord: d.basisOfRecord ? String(d.basisOfRecord) : undefined,
      dataResourceName: d.dataResourceName ? String(d.dataResourceName) : undefined,
      dataResourceUid: d.dataResourceUid ? String(d.dataResourceUid) : undefined,
      dataProviderName: d.dataProviderName ? String(d.dataProviderName) : undefined,
      license: d.license ? String(d.license) : undefined,
      imageUrl: d.imageUrl ? String(d.imageUrl) : undefined,
      thumbnailUrl: d.thumbnailUrl ? String(d.thumbnailUrl) : undefined,
      images: Array.isArray(d.images) ? d.images.map(String) : undefined,
      spatiallyValid: typeof d.spatiallyValid === 'boolean' ? d.spatiallyValid : undefined,
      assertions: Array.isArray(d.assertions) ? d.assertions.map(String) : undefined,
      recordedBy: Array.isArray(d.recordedBy) ? d.recordedBy.map(String) : undefined,
      collectors: Array.isArray(d.collectors) ? d.collectors.map(String) : undefined,
    };
  }

  private parseSpecies(data: unknown): ALASpeciesSearchResult['searchResults']['results'][0] {
    const d = data as Record<string, unknown>;

    return {
      guid: String(d.guid ?? d.id ?? ''),
      // BIE API uses nameString, nameComplete, or scientificName depending on context
      name: String(d.name ?? d.nameString ?? d.scientificName ?? ''),
      scientificName: String(d.scientificName ?? d.nameString ?? d.nameComplete ?? d.name ?? ''),
      author: d.author ? String(d.author) : undefined,
      rank: d.rank ? String(d.rank) : undefined,
      rankId: typeof d.rankId === 'number' ? d.rankId : undefined,
      commonName: d.commonName ? String(d.commonName) : undefined,
      commonNames: Array.isArray(d.commonNames) ? d.commonNames.map(String) : undefined,
      kingdom: d.kingdom ? String(d.kingdom) : undefined,
      phylum: d.phylum ? String(d.phylum) : undefined,
      classs: d.classs ? String(d.classs) : undefined,
      order: d.order ? String(d.order) : undefined,
      family: d.family ? String(d.family) : undefined,
      genus: d.genus ? String(d.genus) : undefined,
      nameComplete: d.nameComplete ? String(d.nameComplete) : undefined,
      acceptedConceptGuid: d.acceptedConceptGuid ? String(d.acceptedConceptGuid) : undefined,
      acceptedConceptName: d.acceptedConceptName ? String(d.acceptedConceptName) : undefined,
      taxonomicStatus: d.taxonomicStatus ? String(d.taxonomicStatus) : undefined,
      imageUrl: d.imageUrl ? String(d.imageUrl) : undefined,
      thumbnailUrl: d.thumbnailUrl ? String(d.thumbnailUrl) : undefined,
      occurrenceCount: typeof d.occurrenceCount === 'number' ? d.occurrenceCount : undefined,
    };
  }

  private parseSpeciesProfile(data: unknown): ALASpeciesProfile {
    const d = data as Record<string, unknown>;
    const taxon = d.taxonConcept as Record<string, unknown> | undefined;
    const classification = d.classification as Record<string, unknown> | undefined;

    // Merge taxonConcept with classification for full taxonomy
    const mergedTaxon = {
      ...taxon,
      kingdom: classification?.kingdom ?? taxon?.kingdom,
      phylum: classification?.phylum ?? taxon?.phylum,
      classs: classification?.class ?? taxon?.classs,
      order: classification?.order ?? taxon?.order,
      family: classification?.family ?? taxon?.family,
      genus: classification?.genus ?? taxon?.genus,
    };

    return {
      taxonConcept: mergedTaxon ? this.parseSpecies(mergedTaxon) : {
        guid: '',
        name: '',
        scientificName: '',
      },
      commonNames: Array.isArray(d.commonNames)
        ? d.commonNames.map((n: Record<string, unknown>) => ({
            nameString: String(n.nameString ?? ''),
            status: n.status ? String(n.status) : undefined,
            priority: typeof n.priority === 'number' ? n.priority : undefined,
          }))
        : undefined,
      synonyms: Array.isArray(d.synonyms)
        ? d.synonyms.map((s: Record<string, unknown>) => ({
            nameString: String(s.nameString ?? ''),
            author: s.author ? String(s.author) : undefined,
          }))
        : undefined,
      imageIdentifier: d.imageIdentifier ? String(d.imageIdentifier) : undefined,
      images: Array.isArray(d.images)
        ? d.images.map((img: Record<string, unknown>) => ({
            imageId: String(img.imageId ?? img.identifier ?? ''),
            title: img.title ? String(img.title) : undefined,
            creator: img.creator ? String(img.creator) : undefined,
            license: img.license ? String(img.license) : undefined,
            thumbnailUrl: img.thumbnailUrl ? String(img.thumbnailUrl) : undefined,
            largeImageUrl: img.largeImageUrl ? String(img.largeImageUrl) : undefined,
          }))
        : undefined,
      conservationStatuses: Array.isArray(d.conservationStatuses)
        ? d.conservationStatuses.map((cs: Record<string, unknown>) => ({
            status: String(cs.status ?? ''),
            region: cs.region ? String(cs.region) : undefined,
            system: cs.system ? String(cs.system) : undefined,
          }))
        : undefined,
      habitats: Array.isArray(d.habitats) ? d.habitats.map(String) : undefined,
    };
  }

  private parseAutoComplete(data: unknown): ALAAutoCompleteResult {
    const d = data as Record<string, unknown>;

    return {
      guid: String(d.guid ?? ''),
      name: String(d.name ?? ''),
      commonName: d.commonName ? String(d.commonName) : undefined,
      matchedNames: Array.isArray(d.matchedNames) ? d.matchedNames.map(String) : undefined,
      kingdom: d.kingdom ? String(d.kingdom) : undefined,
      rankId: typeof d.rankId === 'number' ? d.rankId : undefined,
      rankString: d.rankString ? String(d.rankString) : undefined,
    };
  }
}

// Export singleton instance
export const alaClient = new ALAClient();
