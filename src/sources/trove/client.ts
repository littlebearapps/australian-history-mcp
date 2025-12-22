/**
 * Trove (National Library of Australia) API Client
 *
 * The Trove API v3 provides access to the National Library's digitised
 * collections including newspapers, books, images, maps, and more.
 *
 * API Documentation: https://trove.nla.gov.au/about/create-something/using-api/v3/api-technical-guide
 * API Console: https://troveconsole.herokuapp.com/
 */

import { BaseClient } from '../../core/base-client.js';
import type {
  TroveSearchParams,
  TroveSearchResult,
  TroveArticle,
  TroveWork,
  TroveNewspaperTitle,
  TroveTitleDetail,
  TroveArticleDetail,
  TroveState,
  TroveContributor,
  TroveMagazineTitle,
} from './types.js';

const TROVE_API_BASE = 'https://api.trove.nla.gov.au/v3';

export class TroveClient extends BaseClient {
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    super(TROVE_API_BASE, { userAgent: 'australian-archives-mcp/0.5.0' });
    this.apiKey = apiKey ?? process.env.TROVE_API_KEY ?? '';

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

    const urlParams: Record<string, string | string[]> = {
      q: params.query,
      encoding: 'json',
      n: (params.limit ?? 20).toString(),
    };

    // Add categories
    urlParams.category = categories;

    // Pagination
    if (params.start) {
      urlParams.s = params.start;
    }

    // Bulk harvest mode (stable sorting by ID)
    if (params.bulkHarvest) {
      urlParams.bulkHarvest = 'true';
    }

    // Date range - modify query
    let query = params.query;
    if (params.dateFrom || params.dateTo) {
      const from = params.dateFrom ?? '*';
      const to = params.dateTo ?? '*';
      query = `${params.query} date:[${from} TO ${to}]`;
      urlParams.q = query;
    }

    // State filter (for newspapers)
    if (params.state) {
      urlParams['l-state'] = params.state;
    }

    // Format filter
    if (params.format) {
      urlParams['l-format'] = params.format;
    }

    // NUC code filter (contributor/partner)
    // Common codes: ANL (NLA), VSL (SLV), SLNSW (State Library NSW)
    if (params.nuc) {
      urlParams['l-partnerNuc'] = params.nuc;
    }

    // Illustrated filter (for newspapers)
    if (params.illustrated) {
      urlParams['l-illustrated'] = params.illustrated;
    }

    // Include full text for newspapers
    if (params.includeFullText) {
      urlParams.include = 'articletext';
    }

    // Request facets
    if (params.facets) {
      urlParams.facet = params.facets;
    }

    const url = this.buildUrl('/result', urlParams);

    const response = await this.fetchWithAuth(url);
    return this.parseSearchResponse(response, params.query);
  }

  /**
   * Get a newspaper article by ID
   */
  async getNewspaperArticle(
    articleId: string,
    includeText = true
  ): Promise<TroveArticleDetail | null> {
    const urlParams: Record<string, string | string[]> = {
      encoding: 'json',
      reclevel: 'full',
    };

    if (includeText) {
      urlParams.include = 'articletext';
    }

    const url = this.buildUrl(`/newspaper/${articleId}`, urlParams);

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseArticleDetail(data);
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
    includeText = true
  ): Promise<TroveArticleDetail | null> {
    const urlParams: Record<string, string | string[]> = {
      encoding: 'json',
      reclevel: 'full',
    };

    if (includeText) {
      urlParams.include = 'articletext';
    }

    const url = this.buildUrl(`/gazette/${articleId}`, urlParams);

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseArticleDetail(data);
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
    const urlParams: Record<string, string> = {
      encoding: 'json',
    };

    if (state) {
      urlParams.state = state;
    }

    const url = this.buildUrl('/newspaper/titles', urlParams);

    const data = await this.fetchWithAuth(url);
    return this.parseNewspaperTitles(data);
  }

  /**
   * List gazette titles
   */
  async listGazetteTitles(state?: string): Promise<TroveNewspaperTitle[]> {
    const urlParams: Record<string, string> = {
      encoding: 'json',
    };

    if (state) {
      urlParams.state = state;
    }

    const url = this.buildUrl('/gazette/titles', urlParams);

    const data = await this.fetchWithAuth(url);
    return this.parseNewspaperTitles(data);
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
    const urlParams: Record<string, string | string[]> = {
      encoding: 'json',
    };

    if (options?.includeYears) {
      urlParams.include = 'years';
    }

    if (options?.dateRange) {
      const { from, to } = options.dateRange;
      urlParams.range = `${from}-${to}`;
    }

    const url = this.buildUrl(`/${type}/title/${titleId}`, urlParams);

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
   * Check if API key is configured
   */
  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get contributor (library/archive) details by NUC code
   */
  async getContributor(nuc: string): Promise<TroveContributor | null> {
    const url = this.buildUrl(`/contributor/${nuc}`, {
      encoding: 'json',
    });

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseContributor(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List magazine titles
   */
  async listMagazineTitles(): Promise<TroveMagazineTitle[]> {
    const url = this.buildUrl('/magazine/titles', {
      encoding: 'json',
    });

    const data = await this.fetchWithAuth(url);
    return this.parseMagazineTitles(data);
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private async fetchWithAuth(url: string): Promise<unknown> {
    if (!this.apiKey) {
      throw new Error('TROVE_API_KEY not configured');
    }

    return this.fetchJSON(url, {
      headers: {
        'X-API-KEY': this.apiKey,
        'Accept': 'application/json',
      },
    });
  }

  private parseSearchResponse(data: unknown, query: string): TroveSearchResult {
    const typedData = data as { category?: Array<{ code: string; records?: { total?: number; nextStart?: string; article?: unknown[]; work?: unknown[] } }> };
    const categories = typedData.category ?? [];

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
      category: categories.map((c) => c.code).join(','),
      totalResults,
      nextStart,
      records,
    };
  }

  private parseArticle(data: unknown): TroveArticle {
    const d = data as Record<string, unknown>;
    const id = String(d.id ?? '');
    return {
      id,
      heading: String(d.heading ?? 'Untitled'),
      title: String(d.title ?? ''),
      titleId: String((d.title as Record<string, unknown>)?.id ?? ''),
      date: String(d.date ?? ''),
      page: String(d.page ?? ''),
      category: String(d.category ?? 'Article'),
      snippet: d.snippet ? String(d.snippet) : undefined,
      fullText: d.articleText ? String(d.articleText) : undefined,
      troveUrl: d.troveUrl ? String(d.troveUrl) : `https://trove.nla.gov.au/newspaper/article/${id}`,
      pdfUrl: d.pdf ? String(d.pdf) : undefined,
      wordCount: typeof d.wordCount === 'number' ? d.wordCount : undefined,
      correctionCount: typeof d.correctionCount === 'number' ? d.correctionCount : undefined,
      illustrated: d.illustrated === 'Y',
    };
  }

  private parseArticleDetail(data: unknown): TroveArticleDetail {
    const d = data as Record<string, unknown>;
    const article = (d.article ?? d) as Record<string, unknown>;
    const id = String(article.id ?? '');
    return {
      id,
      heading: String(article.heading ?? 'Untitled'),
      title: String(article.title ?? ''),
      titleId: String((article.title as Record<string, unknown>)?.id ?? ''),
      date: String(article.date ?? ''),
      page: String(article.page ?? ''),
      pageSequence: typeof article.pageSequence === 'number' ? article.pageSequence : undefined,
      category: String(article.category ?? 'Article'),
      troveUrl: article.troveUrl ? String(article.troveUrl) : `https://trove.nla.gov.au/newspaper/article/${id}`,
      pdfUrl: article.pdf ? String(article.pdf) : undefined,
      fullText: article.articleText ? String(article.articleText) : undefined,
      wordCount: typeof article.wordCount === 'number' ? article.wordCount : undefined,
      correctionCount: typeof article.correctionCount === 'number' ? article.correctionCount : undefined,
      tagCount: typeof article.tagCount === 'number' ? article.tagCount : undefined,
      commentCount: typeof article.commentCount === 'number' ? article.commentCount : undefined,
      illustrated: article.illustrated === 'Y',
      lastCorrected: article.lastCorrected ? String(article.lastCorrected) : undefined,
    };
  }

  private parseWork(data: unknown): TroveWork {
    const d = data as Record<string, unknown>;
    const types = Array.isArray(d.type) ? d.type.map(String) : [String(d.type)].filter(Boolean);
    const id = String(d.id ?? '');

    return {
      id,
      title: String(d.title ?? 'Untitled'),
      contributor: d.contributor ? String(d.contributor) : undefined,
      issued: d.issued ? String(d.issued) : undefined,
      type: types,
      holdingsCount: typeof d.holdingsCount === 'number' ? d.holdingsCount : undefined,
      versionCount: typeof d.versionCount === 'number' ? d.versionCount : undefined,
      troveUrl: d.troveUrl ? String(d.troveUrl) : `https://trove.nla.gov.au/work/${id}`,
      thumbnailUrl: this.extractThumbnail(d),
      abstract: d.abstract ? String(d.abstract) : undefined,
      subjects: Array.isArray(d.subject) ? d.subject.map(String) : undefined,
    };
  }

  private parseNewspaperTitles(data: unknown): TroveNewspaperTitle[] {
    const d = data as Record<string, unknown>;
    const titles = (d.newspaper ?? d.gazette ?? []) as Array<Record<string, unknown>>;
    return titles.map((t) => ({
      id: String(t.id ?? ''),
      title: String(t.title ?? 'Untitled'),
      state: String(t.state ?? ''),
      issn: t.issn ? String(t.issn) : undefined,
      startDate: String(t.startDate ?? ''),
      endDate: String(t.endDate ?? ''),
      troveUrl: t.troveUrl ? String(t.troveUrl) : `https://trove.nla.gov.au/newspaper/title/${t.id}`,
    }));
  }

  private parseTitleDetail(data: unknown): TroveTitleDetail {
    const d = data as Record<string, unknown>;
    const base = (d.newspaper ?? d.gazette ?? d) as Record<string, unknown>;

    const result: TroveTitleDetail = {
      id: String(base.id ?? ''),
      title: String(base.title ?? 'Untitled'),
      state: String(base.state ?? ''),
      issn: base.issn ? String(base.issn) : undefined,
      startDate: String(base.startDate ?? ''),
      endDate: String(base.endDate ?? ''),
      troveUrl: String(base.troveUrl ?? ''),
    };

    // Parse years if included
    if (Array.isArray(base.year)) {
      result.years = base.year.map((y: Record<string, unknown>) => ({
        year: String(y.date ?? y),
        issueCount: typeof y.issuecount === 'number' ? y.issuecount : 0,
      }));

      // Parse issues within years
      const issues: TroveTitleDetail['issues'] = [];
      for (const year of base.year as Array<Record<string, unknown>>) {
        if (Array.isArray(year.issue)) {
          for (const iss of year.issue as Array<Record<string, unknown>>) {
            issues.push({
              id: String(iss.id ?? ''),
              date: String(iss.date ?? ''),
              url: String(iss.url ?? ''),
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

  private extractThumbnail(data: Record<string, unknown>): string | undefined {
    if (data.identifier) {
      const identifiers = Array.isArray(data.identifier)
        ? data.identifier
        : [data.identifier];

      for (const id of identifiers as Array<Record<string, unknown>>) {
        if (id.linktype === 'thumbnail' && id.value) {
          return String(id.value);
        }
      }
    }
    return undefined;
  }

  private parseContributor(data: unknown): TroveContributor {
    const d = data as Record<string, unknown>;
    const contrib = (d.contributor ?? d) as Record<string, unknown>;
    return {
      nuc: String(contrib.nuc ?? contrib.id ?? ''),
      name: String(contrib.name ?? 'Unknown'),
      shortname: contrib.shortname ? String(contrib.shortname) : undefined,
      url: contrib.url ? String(contrib.url) : undefined,
      address: contrib.address ? String(contrib.address) : undefined,
      email: contrib.email ? String(contrib.email) : undefined,
      phone: contrib.phone ? String(contrib.phone) : undefined,
      fax: contrib.fax ? String(contrib.fax) : undefined,
      catalogue: contrib.catalogue ? String(contrib.catalogue) : undefined,
      totalHoldings: typeof contrib.totalHoldings === 'number' ? contrib.totalHoldings : undefined,
    };
  }

  private parseMagazineTitles(data: unknown): TroveMagazineTitle[] {
    const d = data as Record<string, unknown>;
    const titles = (d.magazine ?? []) as Array<Record<string, unknown>>;
    return titles.map((t) => ({
      id: String(t.id ?? ''),
      title: String(t.title ?? 'Untitled'),
      publisher: t.publisher ? String(t.publisher) : undefined,
      startDate: t.startDate ? String(t.startDate) : undefined,
      endDate: t.endDate ? String(t.endDate) : undefined,
      issn: t.issn ? String(t.issn) : undefined,
      troveUrl: t.troveUrl ? String(t.troveUrl) : `https://trove.nla.gov.au/magazine/title/${t.id}`,
    }));
  }
}

// Export singleton instance
export const troveClient = new TroveClient();
