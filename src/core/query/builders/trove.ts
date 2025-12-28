/**
 * Trove Query Builder - Lucene syntax
 * @module core/query/builders/trove
 */

import type { ParsedQuery, TransformedQuery, CommonSearchArgs, QueryBuilder } from '../types.js';
import { KNOWN_FIELDS } from '../patterns.js';

/**
 * Lucene special characters that need escaping
 */
const LUCENE_SPECIAL_CHARS = /[+\-&|!(){}[\]^"~*?:\\]/g;

/**
 * Build Trove/Lucene queries from parsed query data
 */
export const troveBuilder: QueryBuilder = {
  source: 'trove',

  /**
   * Transform parsed query to Trove Lucene syntax
   */
  build(parsed: ParsedQuery, args: CommonSearchArgs): TransformedQuery {
    const warnings: string[] = [];
    const appliedFields: Record<string, string> = {};
    let query = parsed.cleanedQuery;
    let appliedDateRange = parsed.dateRange;

    // Apply date range from args (overrides parsed)
    if (args.dateFrom || args.dateTo) {
      appliedDateRange = {
        from: args.dateFrom ?? '*',
        to: args.dateTo ?? '*',
      };
    }

    // Add date range filter (Lucene date syntax)
    if (appliedDateRange) {
      const from = appliedDateRange.from;
      const to = appliedDateRange.to;
      query = `${query} date:[${from} TO ${to}]`;
      appliedFields['date'] = `${from}-${to}`;
    }

    // Apply field:value filters from parsed query
    const validFields = this.getValidFields();
    for (const [field, value] of Object.entries(parsed.fields)) {
      if (validFields.includes(field)) {
        // Map author to creator for Trove
        const troveField = field === 'author' ? 'creator' : field;
        const escapedValue = value.includes(' ') ? `"${value}"` : this.escape(value);
        query = `${query} ${troveField}:(${escapedValue})`;
        appliedFields[troveField] = value;
      } else {
        warnings.push(`Unknown field "${field}" for Trove (valid: ${validFields.join(', ')})`);
      }
    }

    // Apply exclusions (Lucene NOT syntax)
    for (const exclusion of parsed.exclusions) {
      query = `${query} -${this.escape(exclusion)}`;
    }

    // Wildcards are passed through as-is (Lucene supports them)

    return {
      original: parsed.original,
      transformed: query.trim(),
      appliedFields,
      appliedDateRange,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  },

  /**
   * Escape Lucene special characters
   */
  escape(value: string): string {
    return value.replace(LUCENE_SPECIAL_CHARS, '\\$&');
  },

  /**
   * Get valid field names for Trove
   */
  getValidFields(): string[] {
    return KNOWN_FIELDS.trove;
  },
};
