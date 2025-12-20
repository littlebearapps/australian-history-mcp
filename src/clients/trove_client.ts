/**
 * Trove (National Library of Australia) API Client
 *
 * The Trove API v3 provides access to the National Library's digitised
 * collections including newspapers, books, images, maps, and more.
 *
 * API Documentation: https://trove.nla.gov.au/about/create-something/using-api/v3/api-technical-guide
 * API Console: https://troveconsole.herokuapp.com/
 */

import type {
  TroveSearchParams,
  TroveSearchResult,
  TroveArticle,
  TroveWork,
  TroveNewspaperTitle,
  TroveTitleDetail,
  TroveCategory,
  TroveState,
} from '../types.js';

const TROVE_API_BASE = 'https://api.trove.nla.gov.au/v3';

export class TroveClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.TROVE_API_KEY ?? '';
    this.baseUrl = TROVE_API_BASE;

    if (!this.apiKey) {
      console.warn('TROVE_API_KEY not set - Trove API calls will fail');
    }
  }

  /**
   * Search across Trove categories
   */
  async search(params: TroveSearchParams): Promise<TroveSearchResult> {
    const categories = Array.isArray(params.category)
      ? params.category
      : [params.category ?? 'all'];

    const urlParams = new URLSearchParams({
      q: params.query,
      encoding: 'json',
      n: (params.limit ?? 20).toString(),
    });

    // Add categories
    categories.forEach(cat => urlParams.append('category', cat));

    // Pagination
    if (params.start) {
      urlParams.set('s', params.start);
    }

    // Bulk harvest mode (stable sorting by ID)
    if (params.bulkHarvest) {
      urlParams.set('bulkHarvest', 'true');
    }

    // Date range
    if (params.dateFrom || params.dateTo) {
      const from = params.dateFrom ?? '*';
      const to = params.dateTo ?? '*';
      urlParams.set('q', `${params.query} date:[${from} TO ${to}]`);
    }

    // State filter (for newspapers)
    if (params.state) {
      urlParams.set('l-state', params.state);
    }

    // Format filter
    if (params.format) {
      urlParams.set('l-format', params.format);
    }

    // Include full text for newspapers
    if (params.includeFullText) {
      urlParams.append('include', 'articletext');
    }

    // Request facets
    if (params.facets) {
      params.facets.forEach(f => urlParams.append('facet', f));
    }

    const url = `${this.baseUrl}/result?${urlParams.toString()}`;

    try {
      const response = await this.fetchWithAuth(url);
      return this.parseSearchResponse(response, params.query);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Trove search failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get a newspaper article by ID
   */
  async getNewspaperArticle(
    articleId: string,
    includeText = false
  ): Promise<TroveArticle | null> {
    const urlParams = new URLSearchParams({
      encoding: 'json',
      reclevel: 'full',
    });

    if (includeText) {
      urlParams.append('include', 'articletext');
    }

    const url = `${this.baseUrl}/newspaper/${articleId}?${urlParams.toString()}`;

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseArticle(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get a gazette article by ID
   */
  async getGazetteArticle(
    articleId: string,
    includeText = false
  ): Promise<TroveArticle | null> {
    const urlParams = new URLSearchParams({
      encoding: 'json',
      reclevel: 'full',
    });

    if (includeText) {
      urlParams.append('include', 'articletext');
    }

    const url = `${this.baseUrl}/gazette/${articleId}?${urlParams.toString()}`;

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseArticle(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List newspaper titles
   */
  async listNewspaperTitles(state?: TroveState): Promise<TroveNewspaperTitle[]> {
    const urlParams = new URLSearchParams({
      encoding: 'json',
    });

    if (state) {
      urlParams.set('state', state);
    }

    const url = `${this.baseUrl}/newspaper/titles?${urlParams.toString()}`;

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseNewspaperTitles(data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Trove listNewspaperTitles failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * List gazette titles
   */
  async listGazetteTitles(state?: string): Promise<TroveNewspaperTitle[]> {
    const urlParams = new URLSearchParams({
      encoding: 'json',
    });

    if (state) {
      urlParams.set('state', state);
    }

    const url = `${this.baseUrl}/gazette/titles?${urlParams.toString()}`;

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseNewspaperTitles(data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Trove listGazetteTitles failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get details of a specific newspaper/gazette title
   */
  async getTitleDetails(
    titleId: string,
    options?: {
      includeYears?: boolean;
      dateRange?: { from: string; to: string };
      type?: 'newspaper' | 'gazette';
    }
  ): Promise<TroveTitleDetail | null> {
    const type = options?.type ?? 'newspaper';
    const urlParams = new URLSearchParams({
      encoding: 'json',
    });

    if (options?.includeYears) {
      urlParams.append('include', 'years');
    }

    if (options?.dateRange) {
      const { from, to } = options.dateRange;
      urlParams.set('range', `${from}-${to}`);
    }

    const url = `${this.baseUrl}/${type}/title/${titleId}?${urlParams.toString()}`;

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseTitleDetail(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Search for images and maps
   */
  async searchImages(query: string, options?: {
    format?: 'Photograph' | 'Map' | string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<TroveSearchResult> {
    return this.search({
      query,
      category: 'image',
      format: options?.format,
      dateFrom: options?.dateFrom,
      dateTo: options?.dateTo,
      limit: options?.limit,
    });
  }

  /**
   * Search newspapers with Victorian focus
   */
  async searchVictorianNewspapers(query: string, options?: {
    dateFrom?: string;
    dateTo?: string;
    includeFullText?: boolean;
    limit?: number;
  }): Promise<TroveSearchResult> {
    return this.search({
      query,
      category: 'newspaper',
      state: 'vic',
      dateFrom: options?.dateFrom,
      dateTo: options?.dateTo,
      includeFullText: options?.includeFullText,
      limit: options?.limit,
    });
  }

  /**
   * Check if API key is configured
   */
  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private async fetchWithAuth(url: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('TROVE_API_KEY not configured');
    }

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Trove API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private parseSearchResponse(data: any, query: string): TroveSearchResult {
    // Trove v3 returns results grouped by category
    const categories = data.category ?? [];

    // Combine results from all categories
    let totalResults = 0;
    let nextStart: string | undefined;
    const records: (TroveArticle | TroveWork)[] = [];

    for (const cat of categories) {
      const catRecords = cat.records ?? {};
      totalResults += catRecords.total ?? 0;
      nextStart = catRecords.nextStart ?? nextStart;

      const items = catRecords.article ?? catRecords.work ?? [];
      for (const item of items) {
        if (cat.code === 'newspaper' || cat.code === 'gazette') {
          records.push(this.parseArticle(item));
        } else {
          records.push(this.parseWork(item));
        }
      }
    }

    return {
      query,
      category: categories.map((c: any) => c.code).join(','),
      totalResults,
      nextStart,
      records,
    };
  }

  private parseArticle(data: any): TroveArticle {
    return {
      id: data.id?.toString() ?? '',
      heading: data.heading ?? 'Untitled',
      title: data.title ?? '',
      titleId: data.title?.id?.toString() ?? '',
      date: data.date ?? '',
      page: data.page ?? '',
      category: data.category ?? 'Article',
      snippet: data.snippet ?? undefined,
      fullText: data.articleText ?? undefined,
      troveUrl: data.troveUrl ?? `https://trove.nla.gov.au/newspaper/article/${data.id}`,
      pdfUrl: data.pdf ?? undefined,
      wordCount: data.wordCount ?? undefined,
      correctionCount: data.correctionCount ?? undefined,
      illustrated: data.illustrated === 'Y',
    };
  }

  private parseWork(data: any): TroveWork {
    const types = Array.isArray(data.type) ? data.type : [data.type].filter(Boolean);

    return {
      id: data.id?.toString() ?? '',
      title: data.title ?? 'Untitled',
      contributor: data.contributor ?? undefined,
      issued: data.issued ?? undefined,
      type: types,
      holdingsCount: data.holdingsCount ?? undefined,
      versionCount: data.versionCount ?? undefined,
      troveUrl: data.troveUrl ?? `https://trove.nla.gov.au/work/${data.id}`,
      thumbnailUrl: this.extractThumbnail(data),
      abstract: data.abstract ?? undefined,
      subjects: data.subject ?? undefined,
    };
  }

  private parseNewspaperTitles(data: any): TroveNewspaperTitle[] {
    const titles = data.newspaper ?? data.gazette ?? [];
    return titles.map((t: any) => ({
      id: t.id?.toString() ?? '',
      title: t.title ?? 'Untitled',
      state: t.state ?? '',
      issn: t.issn ?? undefined,
      startDate: t.startDate ?? '',
      endDate: t.endDate ?? '',
      troveUrl: t.troveUrl ?? `https://trove.nla.gov.au/newspaper/title/${t.id}`,
    }));
  }

  private parseTitleDetail(data: any): TroveTitleDetail {
    const base = data.newspaper ?? data.gazette ?? data;

    const result: TroveTitleDetail = {
      id: base.id?.toString() ?? '',
      title: base.title ?? 'Untitled',
      state: base.state ?? '',
      issn: base.issn ?? undefined,
      startDate: base.startDate ?? '',
      endDate: base.endDate ?? '',
      troveUrl: base.troveUrl ?? '',
    };

    // Parse years if included
    if (base.year) {
      result.years = base.year.map((y: any) => ({
        year: y.date ?? y.toString(),
        issueCount: y.issuecount ?? 0,
      }));

      // Parse issues within years
      const issues: TroveTitleDetail['issues'] = [];
      for (const year of base.year) {
        if (year.issue) {
          for (const iss of year.issue) {
            issues.push({
              id: iss.id?.toString() ?? '',
              date: iss.date ?? '',
              url: iss.url ?? '',
            });
          }
        }
      }
      if (issues.length > 0) {
        result.issues = issues;
      }
    }

    return result;
  }

  private extractThumbnail(data: any): string | undefined {
    if (data.identifier) {
      const identifiers = Array.isArray(data.identifier)
        ? data.identifier
        : [data.identifier];

      for (const id of identifiers) {
        if (id.linktype === 'thumbnail' && id.value) {
          return id.value;
        }
      }
    }
    return undefined;
  }
}

// Export factory function (allows lazy initialization with API key)
export function createTroveClient(apiKey?: string): TroveClient {
  return new TroveClient(apiKey);
}
