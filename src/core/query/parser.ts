/**
 * Pattern-based query parser
 * @module core/query/parser
 */

import { PATTERNS, ERA_MAPPINGS, getAllValidFields } from './patterns.js';
import type { ParsedQuery, DateRange } from './types.js';

/**
 * Parse a query string for advanced syntax patterns
 *
 * Extracts:
 * - Date ranges (1920-1930, 1920s, 19th century, named eras)
 * - Field:value pairs (creator:Lawson, subject:"gold rush")
 * - Quoted phrases ("Melbourne railway")
 * - Exclusions (-advertisement)
 * - Wildcards (colonial*)
 *
 * @param query - The search query string
 * @returns Parsed query with extracted components
 *
 * @example
 * ```typescript
 * const parsed = parseQuery('Melbourne railway 1920-1930 creator:Lawson -advertisement');
 * // {
 * //   original: 'Melbourne railway 1920-1930 creator:Lawson -advertisement',
 * //   cleanedQuery: 'Melbourne railway',
 * //   dateRange: { from: '1920', to: '1930' },
 * //   fields: { creator: 'Lawson' },
 * //   phrases: [],
 * //   exclusions: ['advertisement'],
 * //   hasWildcard: false
 * // }
 * ```
 */
export function parseQuery(query: string): ParsedQuery {
  let cleaned = query;
  const result: ParsedQuery = {
    original: query,
    cleanedQuery: '',
    fields: {},
    phrases: [],
    exclusions: [],
    hasWildcard: false,
  };

  // 1. Extract date range (1920-1930, 1920..1930)
  const dateRangeMatch = cleaned.match(PATTERNS.dateRange);
  if (dateRangeMatch) {
    result.dateRange = {
      from: dateRangeMatch[1],
      to: dateRangeMatch[2],
    };
    cleaned = cleaned.replace(dateRangeMatch[0], ' ').trim();
  }

  // 2. Extract decade (1920s) - only if no explicit range
  if (!result.dateRange) {
    const decadeMatch = cleaned.match(PATTERNS.decade);
    if (decadeMatch) {
      const decadeStart = parseInt(decadeMatch[1], 10);
      result.decade = decadeStart;
      result.dateRange = {
        from: decadeStart.toString(),
        to: (decadeStart + 9).toString(),
      };
      cleaned = cleaned.replace(decadeMatch[0], ' ').trim();
    }
  }

  // 3. Extract century (19th century) - only if no explicit range
  if (!result.dateRange) {
    const centuryMatch = cleaned.match(PATTERNS.century);
    if (centuryMatch) {
      const century = parseInt(centuryMatch[1], 10);
      const startYear = (century - 1) * 100;
      result.dateRange = {
        from: startYear.toString(),
        to: (startYear + 99).toString(),
      };
      cleaned = cleaned.replace(centuryMatch[0], ' ').trim();
    }
  }

  // 4. Extract named era - only if no explicit range
  if (!result.dateRange) {
    const queryLower = cleaned.toLowerCase();
    for (const [era, [from, to]] of Object.entries(ERA_MAPPINGS)) {
      if (queryLower.includes(era)) {
        result.dateRange = {
          from: from.toString(),
          to: to.toString(),
        };
        // Remove era from query (case-insensitive)
        const eraRegex = new RegExp(era.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        cleaned = cleaned.replace(eraRegex, ' ').trim();
        break;
      }
    }
  }

  // 5. Extract field:value pairs
  const fieldMatches = [...cleaned.matchAll(PATTERNS.fieldValue)];
  for (const match of fieldMatches) {
    const field = match[1].toLowerCase();
    let value = match[2];
    // Remove quotes from value if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    result.fields[field] = value;
    cleaned = cleaned.replace(match[0], ' ').trim();
  }

  // 6. Extract quoted phrases (must be done after field:value to avoid capturing field values)
  const phraseMatches = [...cleaned.matchAll(PATTERNS.phrase)];
  for (const match of phraseMatches) {
    result.phrases.push(match[1]);
    cleaned = cleaned.replace(match[0], ` "${match[1]}" `).trim(); // Keep phrase in cleaned query
  }

  // 7. Extract exclusions (-word)
  const exclusionMatches = [...cleaned.matchAll(PATTERNS.exclusion)];
  for (const match of exclusionMatches) {
    result.exclusions.push(match[1]);
    cleaned = cleaned.replace(match[0], ' ').trim();
  }

  // 8. Detect wildcards
  result.hasWildcard = PATTERNS.wildcard.test(cleaned);

  // 9. Clean up extra whitespace
  result.cleanedQuery = cleaned.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Check if a query is simple (no advanced syntax)
 *
 * @param query - The search query string
 * @returns true if query has no advanced syntax
 */
export function isSimpleQuery(query: string): boolean {
  const parsed = parseQuery(query);
  return (
    !parsed.dateRange &&
    Object.keys(parsed.fields).length === 0 &&
    parsed.exclusions.length === 0 &&
    !parsed.hasWildcard
  );
}

/**
 * Validate field names against known fields
 *
 * @param fields - Parsed field:value pairs
 * @returns Array of unknown field names
 */
export function getUnknownFields(fields: Record<string, string>): string[] {
  const validFields = getAllValidFields();
  return Object.keys(fields).filter((f) => !validFields.includes(f));
}

/**
 * Format a parsed query for display/debugging
 *
 * @param parsed - Parsed query result
 * @returns Human-readable summary
 */
export function formatParsedQuery(parsed: ParsedQuery): string {
  const parts: string[] = [];

  if (parsed.cleanedQuery) {
    parts.push(`Query: "${parsed.cleanedQuery}"`);
  }

  if (parsed.dateRange) {
    parts.push(`Dates: ${parsed.dateRange.from}-${parsed.dateRange.to}`);
  }

  if (Object.keys(parsed.fields).length > 0) {
    const fieldStrs = Object.entries(parsed.fields)
      .map(([k, v]) => `${k}:${v}`)
      .join(', ');
    parts.push(`Fields: ${fieldStrs}`);
  }

  if (parsed.exclusions.length > 0) {
    parts.push(`Exclude: ${parsed.exclusions.join(', ')}`);
  }

  if (parsed.hasWildcard) {
    parts.push('Has wildcards');
  }

  return parts.join(' | ');
}
