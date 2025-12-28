/**
 * Search Meta-Tool
 *
 * Executes federated search across multiple Australian history sources in parallel.
 * Reduces typical multi-source research from 6-10 tool calls to 1-2.
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { registry } from '../../registry.js';
import {
  selectSources,
  mapArgsToSource,
  SOURCE_DISPLAY,
  getValidSources,
  type ContentType,
  type SourceRoute,
} from '../source-router.js';
import { parseQuery, type ParsedQuery } from '../query/index.js';
import {
  classifyIntent,
  filterByDateCoverage,
  findNameSuggestions,
  type IntentResult,
  type NameSuggestion,
} from '../search/index.js';

// ============================================================================
// Types
// ============================================================================

interface SearchInput {
  query: string;
  sources?: string[];
  type?: ContentType;
  dateFrom?: string;
  dateTo?: string;
  state?: string;
  limit?: number;
  parseAdvancedSyntax?: boolean;
  smart?: boolean;
  explain?: boolean;
}

interface SourceResult {
  source: string;
  sourceDisplay: string;
  count: number;
  records: unknown[];
}

interface SourceError {
  source: string;
  error: string;
}

interface SearchResponse {
  query: string;
  parsedQuery?: ParsedQuery;
  sourcesSearched: string[];
  totalResults: number;
  results: SourceResult[];
  errors: SourceError[];
  _timing: {
    total_ms: number;
    sources: Record<string, number>;
  };
  _routing?: RoutingExplanation;
  _suggestions?: NameSuggestion[];
}

interface RoutingExplanation {
  detectedIntent: string;
  intentConfidence: number;
  matchedKeywords: string[];
  dateRange?: { from: string; to: string };
  sourcesSelected: string[];
  sourcesExcluded?: Record<string, string>;
}

// ============================================================================
// Meta-Tool Definition
// ============================================================================

export const searchMetaTool: SourceTool = {
  schema: {
    name: 'search',
    description: 'Search across multiple Australian history sources in parallel.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search terms',
        },
        sources: {
          type: 'array',
          items: { type: 'string' },
          description: `Sources to search (omit for auto-select based on query). Valid: ${getValidSources().join(', ')}`,
        },
        type: {
          type: 'string',
          enum: ['image', 'newspaper', 'document', 'species', 'heritage', 'film'],
          description: 'Content type filter',
        },
        dateFrom: {
          type: 'string',
          description: 'Start date (YYYY)',
        },
        dateTo: {
          type: 'string',
          description: 'End date (YYYY)',
        },
        state: {
          type: 'string',
          description: 'Australian state filter (vic, nsw, qld, sa, wa, tas, nt, act)',
        },
        limit: {
          type: 'number',
          description: 'Max results per source (default: 10)',
        },
        parseAdvancedSyntax: {
          type: 'boolean',
          description: 'Parse advanced query syntax (date ranges like 1920-1930, field:value, "phrases", -exclusions). Default: false',
          default: false,
        },
        smart: {
          type: 'boolean',
          description: 'Enable intelligent source selection based on query intent and date filtering. Default: false',
          default: false,
        },
        explain: {
          type: 'boolean',
          description: 'Include routing decisions and suggestions in response. Default: false',
          default: false,
        },
      },
      required: ['query'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const startTime = Date.now();

    // Validate query
    const query = args.query;
    if (typeof query !== 'string' || query.trim() === '') {
      return errorResponse('Search query is required', 'search');
    }

    // Build typed input
    const input: SearchInput = {
      query,
      sources: Array.isArray(args.sources) ? args.sources as string[] : undefined,
      type: typeof args.type === 'string' ? args.type as ContentType : undefined,
      dateFrom: typeof args.dateFrom === 'string' ? args.dateFrom : undefined,
      dateTo: typeof args.dateTo === 'string' ? args.dateTo : undefined,
      state: typeof args.state === 'string' ? args.state : undefined,
      limit: typeof args.limit === 'number' ? args.limit : undefined,
      parseAdvancedSyntax: typeof args.parseAdvancedSyntax === 'boolean' ? args.parseAdvancedSyntax : false,
      smart: typeof args.smart === 'boolean' ? args.smart : false,
      explain: typeof args.explain === 'boolean' ? args.explain : false,
    };

    // Parse query if advanced syntax is enabled
    let parsed: ParsedQuery | undefined;
    if (input.parseAdvancedSyntax) {
      parsed = parseQuery(input.query);
      // Apply parsed date range if not explicitly provided
      if (parsed.dateRange && !input.dateFrom && !input.dateTo) {
        input.dateFrom = parsed.dateRange.from;
        input.dateTo = parsed.dateRange.to;
      }
    }

    // Smart source selection using intent classification
    let intentResult: IntentResult | undefined;
    let excludedSources: Record<string, string> = {};

    if (input.smart && !input.sources) {
      // Classify query intent
      intentResult = classifyIntent(input.query);

      // Start with intent-recommended sources
      input.sources = intentResult.recommendedSources;

      // Apply date filtering if date range specified
      if (input.dateFrom || input.dateTo) {
        const dateRange = {
          from: input.dateFrom ?? '*',
          to: input.dateTo ?? '*',
        };
        const filtered = filterByDateCoverage(input.sources, dateRange);
        input.sources = filtered.includedSources;
        excludedSources = filtered.excludedSources;
      }
    }

    // Select sources (uses explicit sources if provided, or falls back to keyword matching)
    const routes = selectSources(
      input.query,
      input.type,
      input.sources
    );

    if (routes.length === 0) {
      return errorResponse(
        `No matching sources found. Valid sources: ${getValidSources().join(', ')}`,
        'search'
      );
    }

    // Check Trove API key if Trove is selected
    const troveSelected = routes.some((r) => r.source === 'trove');
    const troveApiKey = process.env.TROVE_API_KEY;
    const filteredRoutes = routes.filter((r) => {
      if (r.source === 'trove' && !troveApiKey) {
        return false; // Skip Trove if no API key
      }
      return true;
    });

    // Build search promises
    const searchPromises = filteredRoutes.map((route) =>
      executeSourceSearch(route, input, parsed)
    );

    // Execute in parallel
    const results = await Promise.all(searchPromises);

    // Aggregate results
    const successResults: SourceResult[] = [];
    const errors: SourceError[] = [];
    const timings: Record<string, number> = {};

    for (const result of results) {
      timings[result.source] = result.timing;

      if (result.error) {
        errors.push({
          source: result.source,
          error: result.error,
        });
      } else {
        successResults.push({
          source: result.source,
          sourceDisplay: SOURCE_DISPLAY[result.source] ?? result.source,
          count: result.count,
          records: result.records,
        });
      }
    }

    // Add Trove skip notice to errors if applicable
    if (troveSelected && !troveApiKey) {
      errors.push({
        source: 'trove',
        error: 'Skipped: TROVE_API_KEY not configured',
      });
    }

    // Calculate totals
    const totalResults = successResults.reduce((sum, r) => sum + r.count, 0);
    const endTime = Date.now();

    const response: SearchResponse = {
      query: input.query,
      ...(parsed && { parsedQuery: parsed }),
      sourcesSearched: filteredRoutes.map((r) => r.source),
      totalResults,
      results: successResults,
      errors,
      _timing: {
        total_ms: endTime - startTime,
        sources: timings,
      },
    };

    // Add routing explanation if explain mode enabled
    if (input.explain) {
      response._routing = {
        detectedIntent: intentResult?.intent ?? 'general',
        intentConfidence: intentResult?.confidence ?? 0.5,
        matchedKeywords: intentResult?.matchedKeywords ?? [],
        sourcesSelected: filteredRoutes.map((r) => r.source),
        ...(input.dateFrom || input.dateTo ? {
          dateRange: { from: input.dateFrom ?? '*', to: input.dateTo ?? '*' },
        } : {}),
        ...(Object.keys(excludedSources).length > 0 ? {
          sourcesExcluded: excludedSources,
        } : {}),
      };

      // Add historical name suggestions
      const suggestions = findNameSuggestions(input.query);
      if (suggestions.length > 0) {
        response._suggestions = suggestions;
      }
    }

    return successResponse(response);
  },
};

// ============================================================================
// Helpers
// ============================================================================

interface SourceSearchResult {
  source: string;
  count: number;
  records: unknown[];
  timing: number;
  error?: string;
}

/**
 * Execute search for a single source with timing and error handling.
 */
async function executeSourceSearch(
  route: SourceRoute,
  input: SearchInput,
  parsed?: ParsedQuery
): Promise<SourceSearchResult> {
  const startTime = Date.now();
  const source = route.source;

  try {
    // Map common args to source-specific params (with optional parsed query for builders)
    const sourceArgs = mapArgsToSource(source, {
      query: input.query,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      state: input.state,
      limit: input.limit ?? 10,
    }, parsed);

    // Execute via registry
    const result = await registry.executeTool(route.tool, sourceArgs);
    const timing = Date.now() - startTime;

    // Parse result
    if (result.isError) {
      const text = result.content[0]?.text ?? 'Unknown error';
      let errorMessage: string;
      try {
        const parsed = JSON.parse(text);
        errorMessage = parsed.error ?? text;
      } catch {
        errorMessage = text;
      }
      return { source, count: 0, records: [], timing, error: errorMessage };
    }

    // Extract records from response
    const text = result.content[0]?.text ?? '{}';
    const data = JSON.parse(text);

    // Handle different response formats
    const records = extractRecords(data);
    const count = data.totalResults ?? data.total ?? records.length;

    return { source, count, records, timing };
  } catch (error) {
    const timing = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    return { source, count: 0, records: [], timing, error: message };
  }
}

/**
 * Extract records array from various response formats.
 */
function extractRecords(data: unknown): unknown[] {
  if (!data || typeof data !== 'object') {
    return [];
  }

  const obj = data as Record<string, unknown>;

  // Try common field names
  if (Array.isArray(obj.records)) return obj.records;
  if (Array.isArray(obj.results)) return obj.results;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.works)) return obj.works;
  if (Array.isArray(obj.occurrences)) return obj.occurrences;
  if (Array.isArray(obj.places)) return obj.places;
  if (Array.isArray(obj.objects)) return obj.objects; // NMA format
  if (Array.isArray(obj.features)) {
    // GeoJSON format (GHAP)
    return obj.features;
  }

  return [];
}
