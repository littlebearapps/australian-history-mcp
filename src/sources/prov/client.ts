/**
 * PROV (Public Record Office Victoria) API Client
 *
 * The PROV Collection API is a Solr-based search interface for Victorian
 * state government archives. No API key is required (CC-BY-NC license).
 *
 * API Documentation: https://prov.vic.gov.au/prov-collection-api
 * GLAM Workbench: https://glam-workbench.net/prov/
 */

import { BaseClient } from '../../core/base-client.js';
import type {
  PROVSearchParams,
  PROVSearchResult,
  PROVRecord,
  PROVSeries,
  PROVAgency,
  PROVImage,
  PROVImagesResult,
  PROVFacetField,
  PROVFacet,
  PROVSolrDoc,
  PROVSolrResponse,
  IIIFManifest,
  IIIFCanvas,
  IIIFService,
} from './types.js';
import { PROV_FACET_DISPLAY_NAMES, PROV_SORT_MAPPINGS } from './types.js';

const PROV_API_BASE = 'https://api.prov.vic.gov.au/search';

export class PROVClient extends BaseClient {
  constructor() {
    super(PROV_API_BASE, { userAgent: 'australian-history-mcp/0.6.0' });
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
      const seriesNum = params.series.replace(/^VPRS\s*/i, '');
      queryParts.push(`series_id:${seriesNum}`);
    }

    if (params.agency) {
      const agencyNum = params.agency.replace(/^VA\s*/i, '');
      queryParts.push(`agencies.ids:VA${agencyNum}`);
    }

    if (params.recordForm) {
      queryParts.push(`record_form:"${params.recordForm}"`);
    }

    if (params.startDate || params.endDate) {
      const start = params.startDate || '*';
      const end = params.endDate || '*';
      queryParts.push(`start_dt:[${start} TO ${end}]`);
    }

    if (params.digitisedOnly) {
      queryParts.push('iiif-manifest:[* TO *]');
    }

    if (params.category) {
      // Use proper case for category: 'agency' -> 'Agency', 'series' -> 'Series', etc.
      const capitalizedCategory = params.category.charAt(0).toUpperCase() + params.category.slice(1).toLowerCase();
      queryParts.push(`category:${capitalizedCategory}`);
    }

    const q = queryParts.length > 0 ? queryParts.join(' AND ') : '*:*';
    const rows = params.rows ?? 20;
    const start = params.start ?? 0;

    // Build URL with facet parameters (Solr requires multiple facet.field entries)
    const urlParams = new URLSearchParams();
    urlParams.append('q', q);
    urlParams.append('wt', 'json');
    urlParams.append('rows', String(rows));
    urlParams.append('start', String(start));

    // Add sort parameter if specified
    if (params.sortby && params.sortby !== 'relevance') {
      const sortValue = PROV_SORT_MAPPINGS[params.sortby];
      if (sortValue) {
        urlParams.append('sort', sortValue);
      }
    }

    // Add Solr facet parameters if requested
    if (params.includeFacets) {
      urlParams.append('facet', 'true');
      urlParams.append('facet.mincount', '1');
      urlParams.append('facet.limit', String(params.facetLimit ?? 10));

      const facetFields = params.facetFields ?? ['record_form', 'category'];
      for (const field of facetFields) {
        urlParams.append('facet.field', field);
      }
    }

    const url = `${this.baseUrl}/query?${urlParams.toString()}`;
    const data = await this.fetchJSON<PROVSolrResponse>(url);
    return this.parseSearchResponse(data, start, rows, params.includeFacets);
  }

  /**
   * Get details of a specific series (VPRS)
   */
  async getSeries(seriesId: string): Promise<PROVSeries | null> {
    const seriesNum = seriesId.replace(/^VPRS\s*/i, '');

    const url = this.buildUrl('/query', {
      q: `category:Series AND series_id:${seriesNum}`,
      wt: 'json',
      rows: 1,
    });

    const data = await this.fetchJSON<PROVSolrResponse>(url);
    const docs = data.response?.docs ?? [];

    if (docs.length === 0) {
      return null;
    }

    return this.parseSeriesDoc(docs[0]);
  }

  /**
   * Get details of a specific agency (VA)
   */
  async getAgency(agencyId: string): Promise<PROVAgency | null> {
    const agencyNum = agencyId.replace(/^VA\s*/i, '');

    const url = this.buildUrl('/query', {
      q: `category:Agency AND citation:"VA ${agencyNum}"`,
      wt: 'json',
      rows: 1,
    });

    const data = await this.fetchJSON<PROVSolrResponse>(url);
    const docs = data.response?.docs ?? [];

    if (docs.length === 0) {
      return null;
    }

    return this.parseAgencyDoc(docs[0]);
  }

  /**
   * Get image URLs from a PROV IIIF manifest
   */
  async getImages(manifestUrl: string, options?: {
    pages?: number[];
    pageRange?: string;
  }): Promise<PROVImagesResult> {
    // PROV IIIF manifests reject Accept: application/json header (HTTP 406)
    const manifest = await this.fetchJSON<IIIFManifest>(manifestUrl, { skipAcceptHeader: true });

    const title = this.extractManifestTitle(manifest);
    const description = this.extractManifestDescription(manifest);
    const canvases: IIIFCanvas[] = manifest.sequences?.[0]?.canvases ?? manifest.items ?? [];

    const pageFilter = this.parsePageFilter(options?.pages, options?.pageRange);

    const images: PROVImage[] = [];
    for (let i = 0; i < canvases.length; i++) {
      const pageNum = i + 1;

      if (pageFilter && !pageFilter.has(pageNum)) {
        continue;
      }

      const canvas = canvases[i];
      const imageUrls = this.extractImageUrls(canvas);

      if (imageUrls) {
        images.push({
          page: pageNum,
          label: canvas.label ?? `Page ${pageNum}`,
          ...imageUrls,
        });
      }
    }

    return {
      manifestUrl,
      title,
      description,
      totalPages: canvases.length,
      images,
    };
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private escapeQuery(query: string): string {
    const trimmed = query.trim();
    // Escape special characters - backslash is included in the character class
    // This single-pass approach handles all Solr special characters including backslash
    const solrSpecialChars = /[\\+\-!(){}[\]^"~*?:/]/g;
    const escaped = trimmed.replace(solrSpecialChars, '\\$&');
    // Wrap multi-word queries in quotes
    if (trimmed.includes(' ')) {
      return `"${escaped}"`;
    }
    return escaped;
  }

  private parseSearchResponse(
    data: PROVSolrResponse,
    start: number,
    rows: number,
    includeFacets?: boolean
  ): PROVSearchResult {
    const response = data.response ?? {};
    const docs = response.docs ?? [];

    const result: PROVSearchResult = {
      totalResults: response.numFound ?? 0,
      start,
      rows,
      records: docs.map((doc) => this.parseRecordDoc(doc)),
    };

    // Parse Solr facets if requested
    if (includeFacets && data.facet_counts?.facet_fields) {
      result.facets = this.parseSolrFacets(data.facet_counts.facet_fields);
    }

    return result;
  }

  /**
   * Parse Solr facet_fields format (alternating value/count arrays)
   */
  private parseSolrFacets(facetFields: Record<string, unknown[]>): PROVFacet[] {
    const facets: PROVFacet[] = [];

    for (const [fieldName, values] of Object.entries(facetFields)) {
      if (!Array.isArray(values) || values.length === 0) continue;

      const facetValues: { value: string; count: number }[] = [];

      // Solr returns alternating [value, count, value, count, ...]
      for (let i = 0; i < values.length; i += 2) {
        const value = String(values[i]);
        const rawCount = values[i + 1];
        const count: number = typeof rawCount === 'number' ? rawCount : parseInt(String(rawCount), 10);

        if (count > 0) {
          facetValues.push({ value, count });
        }
      }

      if (facetValues.length > 0) {
        facets.push({
          name: fieldName as PROVFacetField,
          displayName: PROV_FACET_DISPLAY_NAMES[fieldName as PROVFacetField] ?? fieldName,
          values: facetValues,
        });
      }
    }

    return facets;
  }

  private parseRecordDoc(doc: PROVSolrDoc): PROVRecord {
    const getFirst = <T>(val: T | T[] | undefined): T | undefined =>
      Array.isArray(val) ? val[0] : val;

    return {
      id: doc._id ?? doc.id ?? '',
      title: doc.title ?? doc.name ?? 'Untitled',
      description: doc.presentation_text ?? doc['description.aggregate'] ?? undefined,
      series: doc.series_id ? `VPRS ${doc.series_id}` : undefined,
      seriesTitle: getFirst(doc['is_part_of_series.title']),
      agency: getFirst(doc['agencies.ids']),
      agencyTitle: getFirst(doc['agencies.titles']),
      recordForm: getFirst(doc.record_form),
      startDate: doc.start_dt,
      endDate: doc.end_dt,
      iiifManifest: doc['iiif-manifest'],
      digitised: !!doc['iiif-manifest'],
      url: this.buildRecordUrl(doc),
    };
  }

  private parseSeriesDoc(doc: PROVSolrDoc): PROVSeries {
    const getFirst = <T>(val: T | T[] | undefined): T | undefined =>
      Array.isArray(val) ? val[0] : val;

    // Extract description from function_content or other fields
    const description = getFirst(doc.function_content) ?? doc.description ?? doc.scope_content;

    return {
      id: doc['identifier.PROV_ACM.id'] ?? `VPRS ${doc.series_id ?? doc.id}`,
      title: doc.title ?? doc.name ?? 'Untitled',
      description,
      agency: getFirst(doc.resp_agency_id) ? `VA ${getFirst(doc.resp_agency_id)}` : undefined,
      agencyTitle: getFirst(doc.resp_agency_title),
      dateRange: this.formatDateRange(doc.start_dt, doc.end_dt),
      accessStatus: getFirst(doc.rights_status),
      itemCount: doc.item_count,
    };
  }

  private parseAgencyDoc(doc: PROVSolrDoc): PROVAgency {
    return {
      id: doc['identifier.PROV_ACM.id'] ?? doc.citation ?? `VA ${doc.VA}`,
      title: doc.title ?? doc.name ?? 'Untitled',
      description: doc.description ?? doc.history ?? doc.scope_content,
      dateRange: this.formatDateRange(doc.start_dt, doc.end_dt),
      status: doc.status,
      seriesCount: doc.series_count,
    };
  }

  private buildRecordUrl(doc: PROVSolrDoc): string {
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

  private extractManifestTitle(manifest: IIIFManifest): string {
    const label = manifest.label;
    if (typeof label === 'string') return label;
    if (Array.isArray(label)) {
      const first = label[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object' && first !== null && '@value' in first) {
        return (first as { '@value': string })['@value'];
      }
      return 'Untitled';
    }
    if (typeof label === 'object' && label !== null) {
      const values = Object.values(label)[0] as string[] | undefined;
      return values?.[0] ?? 'Untitled';
    }
    return 'Untitled';
  }

  private extractManifestDescription(manifest: IIIFManifest): string | undefined {
    const desc = manifest.description ?? manifest.summary;
    if (typeof desc === 'string') return desc;
    if (Array.isArray(desc)) {
      const first = desc[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object' && first !== null && '@value' in first) {
        return (first as { '@value': string })['@value'];
      }
      return undefined;
    }
    if (typeof desc === 'object' && desc !== null) {
      const values = Object.values(desc)[0] as string[] | undefined;
      return values?.[0];
    }
    return undefined;
  }

  private parsePageFilter(pages?: number[], pageRange?: string): Set<number> | null {
    if (!pages && !pageRange) return null;

    const filter = new Set<number>();

    if (pages) {
      pages.forEach(p => filter.add(p));
    }

    if (pageRange) {
      const parts = pageRange.split(',').map(s => s.trim());
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(s => parseInt(s.trim(), 10));
          for (let i = start; i <= end; i++) {
            filter.add(i);
          }
        } else {
          filter.add(parseInt(part, 10));
        }
      }
    }

    return filter.size > 0 ? filter : null;
  }

  private extractImageUrls(canvas: IIIFCanvas): { thumbnail: string; medium: string; full: string } | null {
    let serviceUrl: string | undefined;

    // Try IIIF v2 structure
    const images = canvas.images ?? [];
    if (images.length > 0) {
      const resource = images[0].resource;
      if (resource?.service) {
        const service: IIIFService | undefined = Array.isArray(resource.service)
          ? resource.service[0]
          : resource.service;
        serviceUrl = service?.['@id'] ?? service?.id;
      }
      if (!serviceUrl && resource?.['@id']) {
        const resourceId = resource['@id'];
        if (resourceId.includes('/full/')) {
          serviceUrl = resourceId.split('/full/')[0];
        }
      }
    }

    // Try IIIF v3 structure
    if (!serviceUrl && canvas.items) {
      const annotationPage = canvas.items[0];
      const annotation = annotationPage?.items?.[0];
      const body = annotation?.body;
      if (body?.service) {
        const service: IIIFService | undefined = Array.isArray(body.service)
          ? body.service[0]
          : body.service;
        serviceUrl = service?.['@id'] ?? service?.id;
      }
    }

    if (!serviceUrl) {
      return null;
    }

    return {
      thumbnail: `${serviceUrl}/full/!200,200/0/default.jpg`,
      medium: `${serviceUrl}/full/!800,800/0/default.jpg`,
      full: `${serviceUrl}/full/full/0/default.jpg`,
    };
  }
}

// Export singleton instance
export const provClient = new PROVClient();
