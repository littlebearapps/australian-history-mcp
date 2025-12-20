/**
 * PROV (Public Record Office Victoria) API Client
 *
 * The PROV Collection API is a Solr-based search interface for Victorian
 * state government archives. No API key is required (CC-BY-NC license).
 *
 * API Documentation: https://prov.vic.gov.au/prov-collection-api
 * GLAM Workbench: https://glam-workbench.net/prov/
 */

import type {
  PROVSearchParams,
  PROVSearchResult,
  PROVRecord,
  PROVSeries,
} from '../types.js';

const PROV_API_BASE = 'https://api.prov.vic.gov.au/search';

export class PROVClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = PROV_API_BASE;
  }

  /**
   * Search the PROV collection
   */
  async search(params: PROVSearchParams): Promise<PROVSearchResult> {
    const queryParts: string[] = [];

    // Build Solr query
    if (params.query) {
      queryParts.push(`text:${this.escapeQuery(params.query)}`);
    }

    if (params.series) {
      // Series are in format "VPRS 515" or just "515"
      const seriesNum = params.series.replace(/^VPRS\s*/i, '');
      queryParts.push(`VPRS:${seriesNum}`);
    }

    if (params.agency) {
      // Agency numbers in format "VA 473" or just "473"
      const agencyNum = params.agency.replace(/^VA\s*/i, '');
      queryParts.push(`VA:${agencyNum}`);
    }

    if (params.recordForm) {
      queryParts.push(`record_form:"${params.recordForm}"`);
    }

    // Date range
    if (params.startDate || params.endDate) {
      const start = params.startDate || '*';
      const end = params.endDate || '*';
      queryParts.push(`start_dt:[${start} TO ${end}]`);
    }

    // Build filter queries
    const fqParts: string[] = [];
    if (params.digitisedOnly) {
      fqParts.push('iiif-manifest:*');
    }

    // Construct URL
    const q = queryParts.length > 0 ? queryParts.join(' AND ') : '*:*';
    const rows = params.rows ?? 20;
    const start = params.start ?? 0;

    const urlParams = new URLSearchParams({
      q,
      wt: 'json',
      rows: rows.toString(),
      start: start.toString(),
    });

    if (fqParts.length > 0) {
      fqParts.forEach(fq => urlParams.append('fq', fq));
    }

    const url = `${this.baseUrl}/query?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`PROV API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseSearchResponse(data, start, rows);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`PROV search failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get details of a specific series (VPRS)
   */
  async getSeries(seriesId: string): Promise<PROVSeries | null> {
    const seriesNum = seriesId.replace(/^VPRS\s*/i, '');

    const urlParams = new URLSearchParams({
      q: `VPRS:${seriesNum} AND document_type:series`,
      wt: 'json',
      rows: '1',
    });

    const url = `${this.baseUrl}/query?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`PROV API error: ${response.status}`);
      }

      const data = await response.json() as { response?: { docs?: any[] } };
      const docs = data.response?.docs ?? [];

      if (docs.length === 0) {
        return null;
      }

      return this.parseSeriesDoc(docs[0]);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`PROV getSeries failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get IIIF manifest URL for a digitised item
   */
  async getIIIFManifest(itemId: string): Promise<string | null> {
    const urlParams = new URLSearchParams({
      q: `id:${itemId}`,
      wt: 'json',
      rows: '1',
      fl: 'iiif_manifest',
    });

    const url = `${this.baseUrl}/query?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`PROV API error: ${response.status}`);
      }

      const data = await response.json() as { response?: { docs?: any[] } };
      const docs = data.response?.docs ?? [];

      if (docs.length === 0 || !docs[0].iiif_manifest) {
        return null;
      }

      return docs[0].iiif_manifest;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`PROV getIIIFManifest failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for digitised photos
   */
  async searchPhotos(query: string, options?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<PROVSearchResult> {
    return this.search({
      query,
      recordForm: 'photograph',
      digitisedOnly: true,
      startDate: options?.dateFrom,
      endDate: options?.dateTo,
      rows: options?.limit,
    });
  }

  /**
   * Search for maps
   */
  async searchMaps(query: string, options?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<PROVSearchResult> {
    return this.search({
      query,
      recordForm: 'map',
      digitisedOnly: true,
      startDate: options?.dateFrom,
      endDate: options?.dateTo,
      rows: options?.limit,
    });
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private escapeQuery(query: string): string {
    // For multi-word queries, wrap in quotes for phrase matching
    // For single words, use as-is
    const trimmed = query.trim();
    if (trimmed.includes(' ')) {
      // Escape internal quotes and wrap in quotes
      return `"${trimmed.replace(/"/g, '\\"')}"`;
    }
    // Single word - escape Solr special characters
    return trimmed.replace(/([+\-!(){}[\]^"~*?:\\/])/g, '\\$1');
  }

  private parseSearchResponse(
    data: any,
    start: number,
    rows: number
  ): PROVSearchResult {
    const response = data.response ?? {};
    const docs = response.docs ?? [];

    return {
      totalResults: response.numFound ?? 0,
      start,
      rows,
      records: docs.map((doc: any) => this.parseRecordDoc(doc)),
    };
  }

  private parseRecordDoc(doc: any): PROVRecord {
    // Extract first value from arrays if needed
    const getFirst = (val: any) => Array.isArray(val) ? val[0] : val;

    return {
      id: doc._id ?? doc.id ?? '',
      title: doc.title ?? doc.name ?? 'Untitled',
      description: doc.presentation_text ?? doc['description.aggregate'] ?? undefined,
      series: doc.series_id ? `VPRS ${doc.series_id}` : undefined,
      seriesTitle: getFirst(doc['is_part_of_series.title']) ?? undefined,
      agency: getFirst(doc['agencies.ids']) ?? undefined,
      agencyTitle: getFirst(doc['agencies.titles']) ?? undefined,
      recordForm: getFirst(doc.record_form) ?? undefined,
      startDate: doc.start_dt ?? undefined,
      endDate: doc.end_dt ?? undefined,
      iiifManifest: doc['iiif-manifest'] ?? undefined,
      digitised: !!doc['iiif-manifest'],
      url: this.buildRecordUrl(doc),
    };
  }

  private parseSeriesDoc(doc: any): PROVSeries {
    return {
      id: `VPRS ${doc.VPRS ?? doc.id}`,
      title: doc.title ?? doc.name ?? 'Untitled',
      description: doc.description ?? doc.scope_content ?? undefined,
      agency: doc.VA ?? undefined,
      agencyTitle: doc.agency_title ?? undefined,
      dateRange: this.formatDateRange(doc.start_dt, doc.end_dt),
      accessStatus: doc.access_status ?? undefined,
      itemCount: doc.item_count ?? undefined,
    };
  }

  private buildRecordUrl(doc: any): string {
    // PROV record URLs - use the identifier if available
    const id = doc._id ?? doc.id;
    if (doc.series_id) {
      return `https://prov.vic.gov.au/archive/VPRS${doc.series_id}`;
    }
    if (id) {
      return `https://prov.vic.gov.au/archive/${id}`;
    }
    return 'https://prov.vic.gov.au/';
  }

  private formatDateRange(start?: string, end?: string): string | undefined {
    if (!start && !end) return undefined;
    if (start && end) return `${start} - ${end}`;
    if (start) return `${start} -`;
    return `- ${end}`;
  }
}

// Export singleton instance
export const provClient = new PROVClient();
