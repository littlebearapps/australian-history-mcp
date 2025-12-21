/**
 * Museums Victoria Collections API Client
 *
 * Provides access to Museums Victoria's collection of objects, specimens,
 * species, and articles. No API key required.
 *
 * API Documentation: https://collections.museumsvictoria.com.au/developers
 */

import { BaseClient } from '../../core/base-client.js';
import type {
  MuseumSearchParams,
  MuseumSearchResult,
  MuseumRecord,
  MuseumArticle,
  MuseumItem,
  MuseumSpecies,
  MuseumSpecimen,
  MuseumMedia,
  MuseumRecordType,
} from './types.js';

const MUSEUMS_VIC_API_BASE = 'https://collections.museumsvictoria.com.au/api';

export class MuseumsVictoriaClient extends BaseClient {
  constructor() {
    super(MUSEUMS_VIC_API_BASE, { userAgent: 'australian-archives-mcp/0.2.0' });
  }

  // =========================================================================
  // Search
  // =========================================================================

  /**
   * Search across the entire collection
   */
  async search(params: MuseumSearchParams): Promise<MuseumSearchResult> {
    const queryParams: Record<string, string> = {
      envelope: 'true', // Include pagination info in response body
    };

    if (params.query) {
      queryParams.query = params.query;
    }

    if (params.recordType) {
      queryParams.recordtype = params.recordType;
    }

    if (params.category) {
      queryParams.category = params.category;
    }

    if (params.hasImages !== undefined) {
      queryParams.hasimages = params.hasImages ? 'yes' : 'no';
    }

    if (params.onDisplay !== undefined) {
      queryParams.ondisplay = params.onDisplay ? 'yes' : 'no';
    }

    if (params.imageLicence) {
      queryParams.imagelicence = params.imageLicence;
    }

    if (params.locality) {
      queryParams.locality = params.locality;
    }

    if (params.taxon) {
      queryParams.taxon = params.taxon;
    }

    if (params.collectingArea) {
      queryParams.collectingarea = params.collectingArea;
    }

    queryParams.perpage = (params.perPage ?? 20).toString();
    queryParams.page = (params.page ?? 1).toString();

    const url = this.buildUrl('/search', queryParams);
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;

    // API returns envelope format: { headers: {...}, response: [...], status: number }
    const data = await this.fetchJSON<{
      headers: {
        totalResults: number;
        totalPages: number;
        link: string;
      };
      response: unknown[];
      status: number;
    }>(url);

    return {
      totalResults: data.headers.totalResults,
      totalPages: data.headers.totalPages,
      currentPage: page,
      perPage: perPage,
      records: data.response.map((r) => this.parseRecord(r)),
      nextPage: page < data.headers.totalPages ? page + 1 : undefined,
    };
  }

  // =========================================================================
  // Individual Record Retrieval
  // =========================================================================

  /**
   * Strip type prefix from ID (e.g., "species/8436" -> "8436")
   */
  private stripIdPrefix(id: string, prefix: string): string {
    return id.startsWith(`${prefix}/`) ? id.slice(prefix.length + 1) : id;
  }

  /**
   * Get an article by ID
   */
  async getArticle(id: string): Promise<MuseumArticle | null> {
    const cleanId = this.stripIdPrefix(id, 'articles');
    const url = this.buildUrl(`/articles/${cleanId}`, {});

    try {
      const data = await this.fetchJSON<unknown>(url);
      return this.parseArticle(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get an item (object) by ID
   */
  async getItem(id: string): Promise<MuseumItem | null> {
    const cleanId = this.stripIdPrefix(id, 'items');
    const url = this.buildUrl(`/items/${cleanId}`, {});

    try {
      const data = await this.fetchJSON<unknown>(url);
      return this.parseItem(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get a species by ID
   */
  async getSpecies(id: string): Promise<MuseumSpecies | null> {
    const cleanId = this.stripIdPrefix(id, 'species');
    const url = this.buildUrl(`/species/${cleanId}`, {});

    try {
      const data = await this.fetchJSON<unknown>(url);
      return this.parseSpecies(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get a specimen by ID
   */
  async getSpecimen(id: string): Promise<MuseumSpecimen | null> {
    const cleanId = this.stripIdPrefix(id, 'specimens');
    const url = this.buildUrl(`/specimens/${cleanId}`, {});

    try {
      const data = await this.fetchJSON<unknown>(url);
      return this.parseSpecimen(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // =========================================================================
  // Convenience Methods
  // =========================================================================

  /**
   * Search only articles
   */
  async searchArticles(query: string, options?: Omit<MuseumSearchParams, 'query' | 'recordType'>) {
    return this.search({ ...options, query, recordType: 'article' });
  }

  /**
   * Search only items (objects)
   */
  async searchItems(query: string, options?: Omit<MuseumSearchParams, 'query' | 'recordType'>) {
    return this.search({ ...options, query, recordType: 'item' });
  }

  /**
   * Search only species
   */
  async searchSpecies(query: string, options?: Omit<MuseumSearchParams, 'query' | 'recordType'>) {
    return this.search({ ...options, query, recordType: 'species' });
  }

  /**
   * Search only specimens
   */
  async searchSpecimens(query: string, options?: Omit<MuseumSearchParams, 'query' | 'recordType'>) {
    return this.search({ ...options, query, recordType: 'specimen' });
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private parseRecord(data: unknown): MuseumRecord {
    const d = data as Record<string, unknown>;
    const recordType = this.extractRecordType(d);

    switch (recordType) {
      case 'article':
        return this.parseArticle(d);
      case 'item':
        return this.parseItem(d);
      case 'species':
        return this.parseSpecies(d);
      case 'specimen':
        return this.parseSpecimen(d);
      default:
        // Default to item if unknown
        return this.parseItem(d);
    }
  }

  private extractRecordType(d: Record<string, unknown>): MuseumRecordType {
    const type = d.recordType ?? d.type ?? '';
    const typeStr = String(type).toLowerCase();

    if (typeStr.includes('article')) return 'article';
    if (typeStr.includes('species')) return 'species';
    if (typeStr.includes('specimen')) return 'specimen';
    return 'item';
  }

  private parseArticle(data: unknown): MuseumArticle {
    const d = data as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      displayTitle: String(d.displayTitle ?? d.title ?? 'Untitled'),
      contentSummary: d.contentSummary ? String(d.contentSummary) : undefined,
      content: d.content ? String(d.content) : undefined,
      keywords: Array.isArray(d.keywords) ? d.keywords.map(String) : undefined,
      media: this.parseMedia(d.media),
      dateModified: String(d.dateModified ?? ''),
      recordType: 'article',
    };
  }

  private parseItem(data: unknown): MuseumItem {
    const d = data as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      displayTitle: String(d.displayTitle ?? d.title ?? 'Untitled'),
      objectSummary: d.objectSummary ? String(d.objectSummary) : undefined,
      objectName: d.objectName ? String(d.objectName) : undefined,
      physicalDescription: d.physicalDescription ? String(d.physicalDescription) : undefined,
      inscription: d.inscription ? String(d.inscription) : undefined,
      associations: Array.isArray(d.associations) ? d.associations.map(String) : undefined,
      category: d.category ? String(d.category) : undefined,
      discipline: d.discipline ? String(d.discipline) : undefined,
      type: d.type ? String(d.type) : undefined,
      registrationNumber: String(d.registrationNumber ?? ''),
      collectionNames: Array.isArray(d.collectionNames) ? d.collectionNames.map(String) : undefined,
      media: this.parseMedia(d.media),
      licence: this.parseLicence(d.licence),
      dateModified: String(d.dateModified ?? ''),
      recordType: 'item',
    };
  }

  private parseSpecies(data: unknown): MuseumSpecies {
    const d = data as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      displayTitle: String(d.displayTitle ?? d.title ?? 'Untitled'),
      taxonomy: this.parseTaxonomy(d.taxonomy),
      overview: d.overview ? String(d.overview) : undefined,
      biology: d.biology ? String(d.biology) : undefined,
      habitat: d.habitat ? String(d.habitat) : undefined,
      distribution: d.distribution ? String(d.distribution) : undefined,
      diet: d.diet ? String(d.diet) : undefined,
      localBiodiversity: d.localBiodiversity ? String(d.localBiodiversity) : undefined,
      media: this.parseMedia(d.media),
      dateModified: String(d.dateModified ?? ''),
      recordType: 'species',
    };
  }

  private parseSpecimen(data: unknown): MuseumSpecimen {
    const d = data as Record<string, unknown>;
    const event = d.collectionEvent as Record<string, unknown> | undefined;

    return {
      id: String(d.id ?? ''),
      displayTitle: String(d.displayTitle ?? d.title ?? 'Untitled'),
      objectSummary: d.objectSummary ? String(d.objectSummary) : undefined,
      registrationNumber: String(d.registrationNumber ?? ''),
      collectionNames: Array.isArray(d.collectionNames) ? d.collectionNames.map(String) : undefined,
      category: d.category ? String(d.category) : undefined,
      discipline: d.discipline ? String(d.discipline) : undefined,
      type: d.type ? String(d.type) : undefined,
      taxonomy: this.parseTaxonomy(d.taxonomy),
      collectionEvent: event ? {
        locality: event.locality ? String(event.locality) : undefined,
        site: event.site ? String(event.site) : undefined,
        state: event.state ? String(event.state) : undefined,
        country: event.country ? String(event.country) : undefined,
        dateVisitedFrom: event.dateVisitedFrom ? String(event.dateVisitedFrom) : undefined,
        dateVisitedTo: event.dateVisitedTo ? String(event.dateVisitedTo) : undefined,
        collectors: Array.isArray(event.collectors) ? event.collectors.map(String) : undefined,
      } : undefined,
      storageLocation: d.storageLocation ? String(d.storageLocation) : undefined,
      media: this.parseMedia(d.media),
      licence: this.parseLicence(d.licence),
      dateModified: String(d.dateModified ?? ''),
      recordType: 'specimen',
    };
  }

  private parseMedia(media: unknown): MuseumMedia[] | undefined {
    if (!Array.isArray(media)) return undefined;

    return media.map((m: Record<string, unknown>) => {
      const small = m.small as Record<string, unknown> | undefined;
      const medium = m.medium as Record<string, unknown> | undefined;
      const large = m.large as Record<string, unknown> | undefined;

      return {
        id: String(m.id ?? ''),
        type: (String(m.type ?? 'image').toLowerCase() as MuseumMedia['type']),
        caption: m.caption ? String(m.caption) : undefined,
        creators: Array.isArray(m.creators) ? m.creators.map(String) : undefined,
        sources: Array.isArray(m.sources) ? m.sources.map(String) : undefined,
        credit: m.credit ? String(m.credit) : undefined,
        rightsStatement: m.rightsStatement ? String(m.rightsStatement) : undefined,
        licence: this.parseLicence(m.licence),
        small: small ? {
          uri: String(small.uri ?? ''),
          width: Number(small.width ?? 0),
          height: Number(small.height ?? 0),
        } : undefined,
        medium: medium ? {
          uri: String(medium.uri ?? ''),
          width: Number(medium.width ?? 0),
          height: Number(medium.height ?? 0),
        } : undefined,
        large: large ? {
          uri: String(large.uri ?? ''),
          width: Number(large.width ?? 0),
          height: Number(large.height ?? 0),
        } : undefined,
      };
    });
  }

  private parseTaxonomy(taxonomy: unknown): MuseumSpecies['taxonomy'] | undefined {
    if (!taxonomy || typeof taxonomy !== 'object') return undefined;

    const t = taxonomy as Record<string, unknown>;
    return {
      kingdom: t.kingdom ? String(t.kingdom) : undefined,
      phylum: t.phylum ? String(t.phylum) : undefined,
      subphylum: t.subphylum ? String(t.subphylum) : undefined,
      superclass: t.superclass ? String(t.superclass) : undefined,
      class: t.class ? String(t.class) : undefined,
      subclass: t.subclass ? String(t.subclass) : undefined,
      superorder: t.superorder ? String(t.superorder) : undefined,
      order: t.order ? String(t.order) : undefined,
      suborder: t.suborder ? String(t.suborder) : undefined,
      infraorder: t.infraorder ? String(t.infraorder) : undefined,
      superfamily: t.superfamily ? String(t.superfamily) : undefined,
      family: t.family ? String(t.family) : undefined,
      subfamily: t.subfamily ? String(t.subfamily) : undefined,
      genus: t.genus ? String(t.genus) : undefined,
      species: t.species ? String(t.species) : undefined,
      subspecies: t.subspecies ? String(t.subspecies) : undefined,
      author: t.author ? String(t.author) : undefined,
      commonName: t.commonName ? String(t.commonName) : undefined,
    };
  }

  private parseLicence(licence: unknown): { name: string; shortName: string; uri: string } | undefined {
    if (!licence || typeof licence !== 'object') return undefined;

    const l = licence as Record<string, unknown>;
    return {
      name: String(l.name ?? ''),
      shortName: String(l.shortName ?? ''),
      uri: String(l.uri ?? ''),
    };
  }
}

// Export singleton instance
export const museumsVictoriaClient = new MuseumsVictoriaClient();
