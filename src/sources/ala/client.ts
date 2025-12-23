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
  ALAImageSearchParams,
  ALAImageSearchResult,
  ALAImage,
  ALANameMatchResult,
  ALASpeciesListSearchResult,
  ALASpeciesList,
  ALASpeciesListDetail,
} from './types.js';

// ALA uses multiple API endpoints
const BIOCACHE_API_BASE = 'https://biocache-ws.ala.org.au/ws';
const BIE_API_BASE = 'https://bie-ws.ala.org.au/ws';
const IMAGES_API_BASE = 'https://images.ala.org.au/ws';
const NAMEMATCHING_API_BASE = 'https://namematching-ws.ala.org.au/api';
const LISTS_API_BASE = 'https://lists.ala.org.au/ws';

export class ALAClient extends BaseClient {
  constructor() {
    super(BIOCACHE_API_BASE, { userAgent: 'australian-archives-mcp/0.5.0' });
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
          'User-Agent': 'australian-archives-mcp/0.5.0',
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
  // Image Search
  // =========================================================================

  /**
   * Build URL for Images API
   */
  private buildImagesUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${IMAGES_API_BASE}${path}`);
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
   * Search for images
   */
  async searchImages(params: ALAImageSearchParams): Promise<ALAImageSearchResult> {
    const url = this.buildImagesUrl('/search', {
      q: params.q,
      pageSize: (params.pageSize ?? 20).toString(),
      offset: (params.offset ?? 0).toString(),
    });

    const data = await this.fetchBieJSON<{
      totalRecords: number;
      pageSize: number;
      startIndex: number;
      images: unknown[];
    }>(url);

    return {
      totalRecords: data.totalRecords ?? 0,
      pageSize: data.pageSize ?? 20,
      startIndex: data.startIndex ?? 0,
      images: (data.images ?? []).map((img) => this.parseImage(img)),
    };
  }

  // =========================================================================
  // Name Matching
  // =========================================================================

  /**
   * Match a scientific name to the ALA taxonomy
   */
  async matchName(scientificName: string): Promise<ALANameMatchResult> {
    const url = new URL(`${NAMEMATCHING_API_BASE}/searchByClassification`);
    url.searchParams.set('scientificName', scientificName);

    const data = await this.fetchBieJSON<unknown>(url.toString());
    return this.parseNameMatch(data);
  }

  // =========================================================================
  // Species Lists
  // =========================================================================

  /**
   * Build URL for Lists API
   */
  private buildListsUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(`${LISTS_API_BASE}${path}`);
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
   * List species lists
   */
  async listSpeciesLists(params?: { max?: number; offset?: number; listType?: string }): Promise<ALASpeciesListSearchResult> {
    const url = this.buildListsUrl('/speciesList', {
      max: (params?.max ?? 20).toString(),
      offset: (params?.offset ?? 0).toString(),
      listType: params?.listType,
    });

    const data = await this.fetchBieJSON<{
      lists: unknown[];
      listCount: number;
      max: number;
      offset: number;
    }>(url);

    return {
      lists: (data.lists ?? []).map((l) => this.parseSpeciesList(l)),
      listCount: data.listCount ?? 0,
      max: data.max ?? 20,
      offset: data.offset ?? 0,
    };
  }

  /**
   * Get a species list by ID (includes list items from separate endpoint)
   */
  async getSpeciesList(dataResourceUid: string): Promise<ALASpeciesListDetail | null> {
    const listUrl = this.buildListsUrl(`/speciesList/${dataResourceUid}`, {});
    const itemsUrl = this.buildListsUrl(`/speciesListItems/${dataResourceUid}`, {
      max: '100',  // Get up to 100 items
    });

    try {
      // Fetch both list metadata and items in parallel
      const [listData, itemsData] = await Promise.all([
        this.fetchBieJSON<unknown>(listUrl),
        this.fetchBieJSON<unknown[]>(itemsUrl).catch(() => [] as unknown[]),
      ]);

      const detail = this.parseSpeciesListDetail(listData);

      // Add items from the separate endpoint
      if (Array.isArray(itemsData)) {
        detail.items = itemsData.map((item: unknown) => {
          const d = item as Record<string, unknown>;
          return {
            id: typeof d.id === 'number' ? d.id : 0,
            lsid: d.lsid ? String(d.lsid) : undefined,
            name: String(d.name ?? d.scientificName ?? ''),
            commonName: d.commonName ? String(d.commonName) : undefined,
            scientificName: d.scientificName ? String(d.scientificName) : undefined,
            kvpValues: Array.isArray(d.kvpValues) ? d.kvpValues as Record<string, string>[] : undefined,
          };
        });
      }

      return detail;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
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

  private parseImage(data: unknown): ALAImage {
    const d = data as Record<string, unknown>;

    // ALA Images API returns imageIdentifier, not imageUrl
    // We need to construct URLs from the identifier
    const imageId = String(d.imageId ?? d.imageIdentifier ?? '');
    const imageBaseUrl = imageId ? `https://images.ala.org.au/image/${imageId}` : '';

    return {
      imageId: imageId,
      // Construct URLs from imageIdentifier since they're not in the response
      imageUrl: imageBaseUrl ? `${imageBaseUrl}/original` : (d.imageUrl ? String(d.imageUrl) : ''),
      thumbnailUrl: imageBaseUrl ? `${imageBaseUrl}/thumbnail` : (d.thumbnailUrl ? String(d.thumbnailUrl) : undefined),
      largeImageUrl: imageBaseUrl ? `${imageBaseUrl}/large` : (d.largeImageUrl ? String(d.largeImageUrl) : undefined),
      title: d.title ? String(d.title) : undefined,
      creator: d.creator ? String(d.creator) : undefined,
      license: d.license ? String(d.license) : undefined,
      dataResourceName: d.dataResourceName ? String(d.dataResourceName) : undefined,
      occurrenceId: d.occurrenceId ? String(d.occurrenceId) : undefined,
      scientificName: d.scientificName ? String(d.scientificName) : undefined,
      vernacularName: d.vernacularName ? String(d.vernacularName) : undefined,
      recognisedLicence: d.recognisedLicence ? String(d.recognisedLicence) : undefined,
    };
  }

  private parseNameMatch(data: unknown): ALANameMatchResult {
    const d = data as Record<string, unknown>;

    return {
      success: d.success === true,
      scientificName: d.scientificName ? String(d.scientificName) : undefined,
      scientificNameAuthorship: d.scientificNameAuthorship ? String(d.scientificNameAuthorship) : undefined,
      taxonConceptID: d.taxonConceptID ? String(d.taxonConceptID) : undefined,
      rank: d.rank ? String(d.rank) : undefined,
      rankId: typeof d.rankId === 'number' ? d.rankId : undefined,
      lft: typeof d.lft === 'number' ? d.lft : undefined,
      rgt: typeof d.rgt === 'number' ? d.rgt : undefined,
      matchType: d.matchType ? String(d.matchType) : undefined,
      nameType: d.nameType ? String(d.nameType) : undefined,
      synonymType: d.synonymType ? String(d.synonymType) : undefined,
      kingdom: d.kingdom ? String(d.kingdom) : undefined,
      kingdomID: d.kingdomID ? String(d.kingdomID) : undefined,
      phylum: d.phylum ? String(d.phylum) : undefined,
      phylumID: d.phylumID ? String(d.phylumID) : undefined,
      classs: d.classs ? String(d.classs) : undefined,
      classID: d.classID ? String(d.classID) : undefined,
      order: d.order ? String(d.order) : undefined,
      orderID: d.orderID ? String(d.orderID) : undefined,
      family: d.family ? String(d.family) : undefined,
      familyID: d.familyID ? String(d.familyID) : undefined,
      genus: d.genus ? String(d.genus) : undefined,
      genusID: d.genusID ? String(d.genusID) : undefined,
      species: d.species ? String(d.species) : undefined,
      speciesID: d.speciesID ? String(d.speciesID) : undefined,
      vernacularName: d.vernacularName ? String(d.vernacularName) : undefined,
      issues: Array.isArray(d.issues) ? d.issues.map(String) : undefined,
    };
  }

  private parseSpeciesList(data: unknown): ALASpeciesList {
    const d = data as Record<string, unknown>;

    return {
      dataResourceUid: String(d.dataResourceUid ?? ''),
      listName: String(d.listName ?? ''),
      listType: d.listType ? String(d.listType) : undefined,
      dateCreated: d.dateCreated ? String(d.dateCreated) : undefined,
      lastUpdated: d.lastUpdated ? String(d.lastUpdated) : undefined,
      itemCount: typeof d.itemCount === 'number' ? d.itemCount : 0,
      isAuthoritative: typeof d.isAuthoritative === 'boolean' ? d.isAuthoritative : undefined,
      isPrivate: typeof d.isPrivate === 'boolean' ? d.isPrivate : undefined,
      region: d.region ? String(d.region) : undefined,
      description: d.description ? String(d.description) : undefined,
    };
  }

  private parseSpeciesListDetail(data: unknown): ALASpeciesListDetail {
    const d = data as Record<string, unknown>;

    return {
      dataResourceUid: String(d.dataResourceUid ?? ''),
      listName: String(d.listName ?? ''),
      listType: d.listType ? String(d.listType) : undefined,
      description: d.description ? String(d.description) : undefined,
      dateCreated: d.dateCreated ? String(d.dateCreated) : undefined,
      lastUpdated: d.lastUpdated ? String(d.lastUpdated) : undefined,
      itemCount: typeof d.itemCount === 'number' ? d.itemCount : 0,
      items: Array.isArray(d.items)
        ? d.items.map((item: Record<string, unknown>) => ({
            id: typeof item.id === 'number' ? item.id : 0,
            lsid: item.lsid ? String(item.lsid) : undefined,
            name: String(item.name ?? ''),
            commonName: item.commonName ? String(item.commonName) : undefined,
            kvpValues: Array.isArray(item.kvpValues) ? item.kvpValues as Record<string, string>[] : undefined,
          }))
        : [],
    };
  }
}

// Export singleton instance
export const alaClient = new ALAClient();
