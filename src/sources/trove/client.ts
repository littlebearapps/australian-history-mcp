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
  TroveWorkDetail,
  TroveHolding,
  TroveLink,
  TroveVersion,
  TrovePerson,
  TrovePersonSearchResult,
  TroveList,
  TroveListItem,
  TroveMagazineTitleDetail,
  TroveMagazineYear,
  TroveRecLevel,
  TroveIncludeOption,
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

    // Sorting (relevance, datedesc, dateasc)
    if (params.sortby && params.sortby !== 'relevance') {
      urlParams.sortby = params.sortby;
    }

    // Bulk harvest mode (stable sorting by ID)
    if (params.bulkHarvest) {
      urlParams.bulkHarvest = 'true';
    }

    // Build query with date range and search indexes
    let query = params.query;

    // Date range - modify query
    if (params.dateFrom || params.dateTo) {
      const from = params.dateFrom ?? '*';
      const to = params.dateTo ?? '*';
      query = `${query} date:[${from} TO ${to}]`;
    }

    // Search indexes - add to query string
    if (params.creator) {
      query = `${query} creator:(${params.creator})`;
    }
    if (params.subject) {
      query = `${query} subject:(${params.subject})`;
    }
    if (params.isbn) {
      query = `${query} isbn:${params.isbn}`;
    }
    if (params.issn) {
      query = `${query} issn:${params.issn}`;
    }
    if (params.identifier) {
      query = `${query} identifier:${params.identifier}`;
    }
    if (params.anbdid) {
      query = `${query} anbdid:${params.anbdid}`;
    }
    if (params.lastupdated) {
      query = `${query} lastupdated:${params.lastupdated}`;
    }
    if (params.rights) {
      query = `${query} rights:"${params.rights}"`;
    }
    if (params.placeOfPublication) {
      query = `${query} placeOfPublication:"${params.placeOfPublication}"`;
    }
    if (params.geographicCoverage) {
      query = `${query} geographicCoverage:"${params.geographicCoverage}"`;
    }
    if (params.fullTextInd) {
      query = `${query} fullTextInd:y`;
    }
    if (params.imageInd) {
      query = `${query} imageInd:thumbnail`;
    }

    urlParams.q = query;

    // State filter (for newspapers)
    if (params.state) {
      urlParams['l-state'] = params.state;
    }

    // Format filter
    if (params.format) {
      urlParams['l-format'] = params.format;
    }

    // NUC code filter (contributor/partner)
    if (params.nuc) {
      urlParams['l-partnerNuc'] = params.nuc;
    }

    // Illustrated filter (for newspapers)
    if (params.illustrated) {
      urlParams['l-illustrated'] = params.illustrated;
    }

    // Advanced facet filters
    if (params.decade) {
      urlParams['l-decade'] = params.decade;
    }
    if (params.language) {
      urlParams['l-language'] = params.language;
    }
    if (params.availability) {
      urlParams['l-availability'] = params.availability;
    }
    if (params.australian) {
      urlParams['l-australian'] = 'y';
    }
    if (params.wordCount) {
      urlParams['l-wordCount'] = params.wordCount;
    }
    if (params.artType) {
      urlParams['l-artType'] = params.artType;
    }
    if (params.geocoverage) {
      urlParams['l-geocoverage'] = params.geocoverage;
    }
    if (params.contribcollection) {
      urlParams['l-contribcollection'] = params.contribcollection;
    }
    if (params.firstAustralians) {
      urlParams['l-firstAustralians'] = 'y';
    }
    if (params.austlanguage) {
      urlParams['l-austlanguage'] = params.austlanguage;
    }

    // Build include options
    const includes: string[] = [];
    if (params.includeFullText) {
      includes.push('articletext');
    }
    if (params.includeHoldings) {
      includes.push('holdings');
    }
    if (params.includeLinks) {
      includes.push('links');
    }
    if (includes.length > 0) {
      urlParams.include = includes.join(',');
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

  /**
   * Get a work by ID (books, images, maps, music, archives)
   */
  async getWork(
    workId: string,
    options?: {
      reclevel?: TroveRecLevel;
      include?: TroveIncludeOption[];
    }
  ): Promise<TroveWorkDetail | null> {
    const urlParams: Record<string, string> = {
      encoding: 'json',
    };

    if (options?.reclevel) {
      urlParams.reclevel = options.reclevel;
    }

    if (options?.include && options.include.length > 0) {
      urlParams.include = options.include.join(',');
    }

    const url = this.buildUrl(`/work/${workId}`, urlParams);

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseWorkDetail(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get a user-curated list by ID
   */
  async getList(
    listId: string,
    options?: {
      include?: ('listitems')[];
    }
  ): Promise<TroveList | null> {
    const urlParams: Record<string, string> = {
      encoding: 'json',
    };

    if (options?.include && options.include.length > 0) {
      urlParams.include = options.include.join(',');
    }

    const url = this.buildUrl(`/list/${listId}`, urlParams);

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseList(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get a person or organisation by ID
   */
  async getPerson(
    personId: string,
    options?: {
      reclevel?: TroveRecLevel;
    }
  ): Promise<TrovePerson | null> {
    const urlParams: Record<string, string> = {
      encoding: 'json',
    };

    if (options?.reclevel) {
      urlParams.reclevel = options.reclevel;
    }

    const url = this.buildUrl(`/people/${personId}`, urlParams);

    try {
      const data = await this.fetchWithAuth(url);
      return this.parsePerson(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List or search contributors (libraries, archives, institutions)
   */
  async listContributors(options?: {
    query?: string;
    reclevel?: TroveRecLevel;
  }): Promise<TroveContributor[]> {
    const urlParams: Record<string, string> = {
      encoding: 'json',
    };

    if (options?.query) {
      urlParams.q = options.query;
    }

    if (options?.reclevel) {
      urlParams.reclevel = options.reclevel;
    }

    const url = this.buildUrl('/contributor', urlParams);

    const data = await this.fetchWithAuth(url);
    return this.parseContributorList(data);
  }

  /**
   * Get magazine title details with years/issues
   */
  async getMagazineTitle(
    titleId: string,
    options?: {
      includeYears?: boolean;
      dateRange?: string;  // YYYYMMDD-YYYYMMDD
    }
  ): Promise<TroveMagazineTitleDetail | null> {
    const urlParams: Record<string, string> = {
      encoding: 'json',
    };

    if (options?.includeYears) {
      urlParams.include = 'years';
    }

    if (options?.dateRange) {
      urlParams.range = options.dateRange;
    }

    const url = this.buildUrl(`/magazine/title/${titleId}`, urlParams);

    try {
      const data = await this.fetchWithAuth(url);
      return this.parseMagazineTitleDetail(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Search for people and organisations
   */
  async searchPeople(
    query: string,
    options?: {
      limit?: number;
      start?: string;
      type?: 'Person' | 'Organisation' | 'Family';
    }
  ): Promise<TrovePersonSearchResult> {
    const urlParams: Record<string, string | string[]> = {
      q: query,
      encoding: 'json',
      category: 'people',
      n: (options?.limit ?? 20).toString(),
    };

    if (options?.start) {
      urlParams.s = options.start;
    }

    // Filter by type using artType facet (maps to type in people category)
    if (options?.type) {
      urlParams['l-artType'] = options.type;
    }

    const url = this.buildUrl('/result', urlParams);
    const data = await this.fetchWithAuth(url);

    return this.parsePersonSearchResponse(data, query);
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
    // title can be an object {id, title} or a string
    const titleObj = d.title as Record<string, unknown> | string | undefined;
    const titleStr = typeof titleObj === 'object' && titleObj !== null
      ? String(titleObj.title ?? '')
      : String(titleObj ?? '');
    const titleId = typeof titleObj === 'object' && titleObj !== null
      ? String(titleObj.id ?? '')
      : '';
    return {
      id,
      heading: String(d.heading ?? 'Untitled'),
      title: titleStr,
      titleId,
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
    // title can be an object {id, title} or a string
    const titleObj = article.title as Record<string, unknown> | string | undefined;
    const titleStr = typeof titleObj === 'object' && titleObj !== null
      ? String(titleObj.title ?? '')
      : String(titleObj ?? '');
    const titleId = typeof titleObj === 'object' && titleObj !== null
      ? String(titleObj.id ?? '')
      : '';
    return {
      id,
      heading: String(article.heading ?? 'Untitled'),
      title: titleStr,
      titleId,
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

  private parseWorkDetail(data: unknown): TroveWorkDetail {
    const d = data as Record<string, unknown>;
    const work = (d.work ?? d) as Record<string, unknown>;
    const id = String(work.id ?? '');
    const types = Array.isArray(work.type) ? work.type.map(String) : [String(work.type)].filter(Boolean);

    const result: TroveWorkDetail = {
      id,
      title: String(work.title ?? 'Untitled'),
      contributor: work.contributor ? String(work.contributor) : undefined,
      issued: work.issued ? String(work.issued) : undefined,
      type: types,
      subjects: Array.isArray(work.subject) ? work.subject.map(String) : undefined,
      abstract: work.abstract ? String(work.abstract) : undefined,
      tableOfContents: work.tableOfContents ? String(work.tableOfContents) : undefined,
      language: this.extractLanguage(work.language),
      wikipedia: work.wikipedia ? String(work.wikipedia) : undefined,
      holdingsCount: typeof work.holdingsCount === 'number' ? work.holdingsCount : 0,
      versionCount: typeof work.versionCount === 'number' ? work.versionCount : 0,
      troveUrl: work.troveUrl ? String(work.troveUrl) : `https://trove.nla.gov.au/work/${id}`,
      thumbnailUrl: this.extractThumbnail(work),
      identifier: this.extractIdentifier(work),
    };

    // Parse holdings if included
    if (Array.isArray(work.holding)) {
      result.holdings = this.parseHoldings(work.holding);
    }

    // Parse links if included (from identifier array with linktype)
    if (work.identifier) {
      result.links = this.parseLinks(work.identifier);
    }

    // Parse versions if included
    if (Array.isArray(work.version)) {
      result.versions = this.parseVersions(work.version);
    }

    return result;
  }

  private parseHoldings(data: unknown[]): TroveHolding[] {
    return data.map((h) => {
      const holding = h as Record<string, unknown>;
      return {
        nuc: String(holding.nuc ?? holding.name ?? ''),
        name: holding.name ? String(holding.name) : undefined,
        url: this.extractHoldingUrl(holding),
        callNumber: this.extractCallNumber(holding.callNumber),
        localIdentifier: holding.localIdentifier ? String(holding.localIdentifier) : undefined,
      };
    });
  }

  private extractHoldingUrl(holding: Record<string, unknown>): string | undefined {
    // URL can be in url field directly or nested in url array
    if (typeof holding.url === 'string') {
      return holding.url;
    }
    if (Array.isArray(holding.url) && holding.url.length > 0) {
      const first = holding.url[0] as Record<string, unknown>;
      if (first.value) {
        return String(first.value);
      }
    }
    return undefined;
  }

  private extractCallNumber(data: unknown): string | undefined {
    if (!data) return undefined;

    // callNumber can be a string, object {value}, or array of objects
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      // Extract value from each object and join
      const values = data
        .map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>;
            return obj.value ? String(obj.value) : undefined;
          }
          return undefined;
        })
        .filter(Boolean);
      return values.length > 0 ? values.join(', ') : undefined;
    }

    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      return obj.value ? String(obj.value) : undefined;
    }

    return undefined;
  }

  private extractLanguage(data: unknown): string | undefined {
    if (!data) return undefined;

    // language can be a string, object {value}, or array
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      // Extract value from each item and join
      const values = data
        .map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>;
            return obj.value ? String(obj.value) : undefined;
          }
          return undefined;
        })
        .filter(Boolean);
      return values.length > 0 ? values.join(', ') : undefined;
    }

    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      return obj.value ? String(obj.value) : undefined;
    }

    return undefined;
  }

  private extractBiography(data: unknown): string | undefined {
    if (!data) return undefined;

    // biography can be a string, object {value}, or array of objects
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      // Extract value from each object and join with newlines
      const values = data
        .map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>;
            return obj.value ? String(obj.value) : undefined;
          }
          return undefined;
        })
        .filter(Boolean);
      return values.length > 0 ? values.join('\n\n') : undefined;
    }

    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      return obj.value ? String(obj.value) : undefined;
    }

    return undefined;
  }

  private extractContributorList(data: unknown): string | undefined {
    if (!data) return undefined;

    // contributor can be a string, object {name/nuc}, or array of objects
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      // Extract name or nuc from each object and join
      const values = data
        .map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>;
            return obj.name ? String(obj.name) : (obj.nuc ? String(obj.nuc) : undefined);
          }
          return undefined;
        })
        .filter(Boolean);
      return values.length > 0 ? values.join('; ') : undefined;
    }

    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      return obj.name ? String(obj.name) : (obj.nuc ? String(obj.nuc) : undefined);
    }

    return undefined;
  }

  private parseLinks(identifiers: unknown): TroveLink[] {
    const ids = Array.isArray(identifiers) ? identifiers : [identifiers];
    const links: TroveLink[] = [];

    for (const id of ids as Array<Record<string, unknown>>) {
      if (id.linktype && id.value) {
        links.push({
          url: String(id.value),
          linktype: String(id.linktype) as TroveLink['linktype'],
          linktext: id.linktext ? String(id.linktext) : undefined,
        });
      }
    }

    return links;
  }

  private parseVersions(data: unknown[]): TroveVersion[] {
    return data.map((v) => {
      const version = v as Record<string, unknown>;
      const types = Array.isArray(version.type)
        ? version.type.map(String)
        : [String(version.type)].filter(Boolean);

      const result: TroveVersion = {
        id: String(version.id ?? ''),
        type: types,
        issued: version.issued ? String(version.issued) : undefined,
        holdingsCount: typeof version.holdingsCount === 'number' ? version.holdingsCount : 0,
      };

      if (Array.isArray(version.holding)) {
        result.holdings = this.parseHoldings(version.holding);
      }

      if (version.identifier) {
        result.links = this.parseLinks(version.identifier);
      }

      return result;
    });
  }

  private extractIdentifier(data: Record<string, unknown>): string | undefined {
    if (data.identifier) {
      const identifiers = Array.isArray(data.identifier)
        ? data.identifier
        : [data.identifier];

      for (const id of identifiers as Array<Record<string, unknown>>) {
        // Return first non-thumbnail URL as main identifier
        if (id.value && id.linktype !== 'thumbnail') {
          return String(id.value);
        }
      }
    }
    return undefined;
  }

  private parseList(data: unknown): TroveList {
    const d = data as Record<string, unknown>;
    const list = (d.list ?? d) as Record<string, unknown>;
    const id = String(list.id ?? '');

    const result: TroveList = {
      id,
      title: String(list.title ?? 'Untitled'),
      creator: String(list.creator ?? 'Unknown'),
      description: list.description ? String(list.description) : undefined,
      listItemCount: typeof list.listItemCount === 'number' ? list.listItemCount : 0,
      thumbnailUrl: this.extractThumbnail(list),
      dateCreated: list.date ? this.extractListDate(list.date, 'created') : undefined,
      dateLastUpdated: list.date ? this.extractListDate(list.date, 'lastupdated') : undefined,
      troveUrl: list.troveUrl ? String(list.troveUrl) : `https://trove.nla.gov.au/list?id=${id}`,
    };

    // Parse list items if included
    if (Array.isArray(list.listItem)) {
      result.items = this.parseListItems(list.listItem);
    }

    return result;
  }

  private extractListDate(dateData: unknown, type: 'created' | 'lastupdated'): string | undefined {
    if (typeof dateData === 'object' && dateData !== null) {
      const d = dateData as Record<string, unknown>;
      return d[type] ? String(d[type]) : undefined;
    }
    return undefined;
  }

  private parseListItems(items: unknown[]): TroveListItem[] {
    return items.map((item) => {
      const i = item as Record<string, unknown>;
      const result: TroveListItem = {};

      if (i.note) {
        result.note = String(i.note);
      }

      if (i.work) {
        result.work = this.parseWork(i.work);
      }

      if (i.article) {
        result.article = this.parseArticle(i.article);
      }

      if (i.people) {
        const p = i.people as Record<string, unknown>;
        result.people = {
          id: String(p.id ?? ''),
          troveUrl: p.troveUrl ? String(p.troveUrl) : `https://trove.nla.gov.au/people/${p.id}`,
        };
      }

      if (i.externalWebsite) {
        const e = i.externalWebsite as Record<string, unknown>;
        result.externalWebsite = {
          title: String(e.title ?? 'External Link'),
          url: String((e.identifier as Record<string, unknown>)?.value ?? e.url ?? ''),
        };
      }

      return result;
    });
  }

  private parsePerson(data: unknown): TrovePerson {
    const d = data as Record<string, unknown>;
    const person = (d.people ?? d) as Record<string, unknown>;
    const id = String(person.id ?? '');

    return {
      id,
      type: (String(person.type ?? 'Person') as TrovePerson['type']),
      primaryName: String(person.primaryName ?? 'Unknown'),
      primaryDisplayName: person.primaryDisplayName ? String(person.primaryDisplayName) : undefined,
      alternateName: Array.isArray(person.alternateName) ? person.alternateName.map(String) : undefined,
      alternateDisplayName: Array.isArray(person.alternateDisplayName) ? person.alternateDisplayName.map(String) : undefined,
      title: person.title ? String(person.title) : undefined,
      occupation: Array.isArray(person.occupation) ? person.occupation.map(String) : undefined,
      biography: this.extractBiography(person.biography),
      contributor: this.extractContributorList(person.contributor),
      thumbnailUrl: this.extractThumbnail(person),
      troveUrl: person.troveUrl ? String(person.troveUrl) : `https://trove.nla.gov.au/people/${id}`,
    };
  }

  private parseContributorList(data: unknown): TroveContributor[] {
    const d = data as Record<string, unknown>;
    const contributors = (d.contributor ?? []) as Array<Record<string, unknown>>;
    return contributors.map((c) => this.parseContributor(c));
  }

  private parseMagazineTitleDetail(data: unknown): TroveMagazineTitleDetail {
    const d = data as Record<string, unknown>;
    const mag = (d.magazine ?? d) as Record<string, unknown>;
    const id = String(mag.id ?? '');

    const result: TroveMagazineTitleDetail = {
      id,
      title: String(mag.title ?? 'Untitled'),
      publisher: mag.publisher ? String(mag.publisher) : undefined,
      place: mag.place ? String(mag.place) : undefined,
      issn: mag.issn ? String(mag.issn) : undefined,
      startDate: mag.startDate ? String(mag.startDate) : undefined,
      endDate: mag.endDate ? String(mag.endDate) : undefined,
      troveUrl: mag.troveUrl ? String(mag.troveUrl) : `https://trove.nla.gov.au/magazine/title/${id}`,
    };

    // Parse years if included
    if (Array.isArray(mag.year)) {
      result.years = mag.year.map((y: Record<string, unknown>) => {
        const year: TroveMagazineYear = {
          year: String(y.date ?? ''),
          issueCount: typeof y.issuecount === 'number' ? y.issuecount : 0,
        };

        // Parse issues within year if present
        if (Array.isArray(y.issue)) {
          year.issues = y.issue.map((iss: Record<string, unknown>) => ({
            id: String(iss.id ?? ''),
            date: String(iss.date ?? ''),
            url: String(iss.url ?? ''),
          }));
        }

        return year;
      });
    }

    return result;
  }

  private parsePersonSearchResponse(data: unknown, query: string): TrovePersonSearchResult {
    const typedData = data as { category?: Array<{ code: string; records?: { total?: number; nextStart?: string; people?: unknown[] } }> };
    const categories = typedData.category ?? [];

    let totalResults = 0;
    let nextStart: string | undefined;
    const records: TrovePerson[] = [];

    for (const cat of categories) {
      if (cat.code === 'people') {
        const catRecords = cat.records ?? {};
        totalResults = catRecords.total ?? 0;
        nextStart = catRecords.nextStart;

        const people = catRecords.people ?? [];
        for (const person of people) {
          records.push(this.parsePerson(person));
        }
      }
    }

    return {
      query,
      totalResults,
      nextStart,
      records,
    };
  }
}

// Export singleton instance
export const troveClient = new TroveClient();
