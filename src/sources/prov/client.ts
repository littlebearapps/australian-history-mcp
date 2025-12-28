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
    const data = await this.fetchJSON<any>(url);
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

    const data = await this.fetchJSON<{ response?: { docs?: any[] } }>(url);
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

    const data = await this.fetchJSON<{ response?: { docs?: any[] } }>(url);
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
    const manifest = await this.fetchJSON<any>(manifestUrl, { skipAcceptHeader: true });

    const title = this.extractManifestTitle(manifest);
    const description = this.extractManifestDescription(manifest);
    const canvases = manifest.sequences?.[0]?.canvases ?? manifest.items ?? [];

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
    if (trimmed.includes(' ')) {
      return `"${trimmed.replace(/"/g, '\\"')}"`;
    }
    return trimmed.replace(/([+\-!(){}[\]^"~*?:\\/])/g, '\\$1');
  }

  private parseSearchResponse(
    data: any,
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
      records: docs.map((doc: any) => this.parseRecordDoc(doc)),
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

  private parseRecordDoc(doc: any): PROVRecord {
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
    const getFirst = (val: any) => Array.isArray(val) ? val[0] : val;

    // Extract description from function_content or other fields
    const description = getFirst(doc.function_content) ?? doc.description ?? doc.scope_content ?? undefined;

    return {
      id: doc['identifier.PROV_ACM.id'] ?? `VPRS ${doc.series_id ?? doc.id}`,
      title: doc.title ?? doc.name ?? 'Untitled',
      description: description,
      agency: getFirst(doc.resp_agency_id) ? `VA ${getFirst(doc.resp_agency_id)}` : undefined,
      agencyTitle: getFirst(doc.resp_agency_title) ?? undefined,
      dateRange: this.formatDateRange(doc.start_dt, doc.end_dt),
      accessStatus: getFirst(doc.rights_status) ?? undefined,
      itemCount: doc.item_count ?? undefined,
    };
  }

  private parseAgencyDoc(doc: any): PROVAgency {
    const _getFirst = (val: any) => Array.isArray(val) ? val[0] : val;

    return {
      id: doc['identifier.PROV_ACM.id'] ?? doc.citation ?? `VA ${doc.VA}`,
      title: doc.title ?? doc.name ?? 'Untitled',
      description: doc.description ?? doc.history ?? doc.scope_content ?? undefined,
      dateRange: this.formatDateRange(doc.start_dt, doc.end_dt),
      status: doc.status ?? undefined,
      seriesCount: doc.series_count ?? undefined,
    };
  }

  private buildRecordUrl(doc: any): string {
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

  private extractManifestTitle(manifest: any): string {
    const label = manifest.label;
    if (typeof label === 'string') return label;
    if (Array.isArray(label)) return label[0]?.['@value'] ?? label[0] ?? 'Untitled';
    if (typeof label === 'object') {
      const values = Object.values(label)[0] as string[] | undefined;
      return values?.[0] ?? 'Untitled';
    }
    return 'Untitled';
  }

  private extractManifestDescription(manifest: any): string | undefined {
    const desc = manifest.description ?? manifest.summary;
    if (typeof desc === 'string') return desc;
    if (Array.isArray(desc)) return desc[0]?.['@value'] ?? desc[0];
    if (typeof desc === 'object') {
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

  private extractImageUrls(canvas: any): { thumbnail: string; medium: string; full: string } | null {
    let serviceUrl: string | undefined;

    // Try IIIF v2 structure
    const images = canvas.images ?? [];
    if (images.length > 0) {
      const resource = images[0].resource;
      if (resource?.service) {
        const service = Array.isArray(resource.service) ? resource.service[0] : resource.service;
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
        const service = Array.isArray(body.service) ? body.service[0] : body.service;
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
