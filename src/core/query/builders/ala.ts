/**
 * ALA Query Builder - biocache Solr syntax
 * @module core/query/builders/ala
 */

import type { ParsedQuery, TransformedQuery, CommonSearchArgs, QueryBuilder } from '../types.js';
import { KNOWN_FIELDS } from '../patterns.js';

/**
 * Solr special characters that need escaping
 */
const SOLR_SPECIAL_CHARS = /[+\-&|!(){}[\]^"~*?:\\\/]/g;

/**
 * ALA field mappings (user-friendly -> biocache field)
 */
const ALA_FIELD_MAPPINGS: Record<string, string> = {
  species: 'taxon_name',
  common: 'common_name',
  kingdom: 'kingdom',
  family: 'family',
  genus: 'genus',
  state: 'state',
};

/**
 * Build ALA/biocache queries from parsed query data
 */
export const alaBuilder: QueryBuilder = {
  source: 'ala',

  /**
   * Transform parsed query to ALA biocache Solr syntax
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

    // Add date range filter (biocache uses year field)
    if (appliedDateRange) {
      const from = appliedDateRange.from;
      const to = appliedDateRange.to;
      // ALA uses year field for date filtering
      if (from !== '*' && to !== '*') {
        query = `${query} year:[${from} TO ${to}]`;
      } else if (from !== '*') {
        query = `${query} year:[${from} TO *]`;
      } else if (to !== '*') {
        query = `${query} year:[* TO ${to}]`;
      }
      appliedFields['year'] = `${from}-${to}`;
    }

    // Apply field:value filters from parsed query
    const validFields = this.getValidFields();
    for (const [field, value] of Object.entries(parsed.fields)) {
      if (validFields.includes(field)) {
        const alaField = ALA_FIELD_MAPPINGS[field] || field;
        const escapedValue = value.includes(' ') ? `"${value}"` : this.escape(value);
        query = `${query} ${alaField}:(${escapedValue})`;
        appliedFields[field] = value;
      } else {
        warnings.push(`Unknown field "${field}" for ALA (valid: ${validFields.join(', ')})`);
      }
    }

    // Apply exclusions (Solr NOT syntax)
    for (const exclusion of parsed.exclusions) {
      query = `${query} -${this.escape(exclusion)}`;
    }

    // Wildcards are passed through as-is (Solr supports them)

    return {
      original: parsed.original,
      transformed: query.trim(),
      appliedFields,
      appliedDateRange,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  },

  /**
   * Escape Solr special characters
   */
  escape(value: string): string {
    return value.replace(SOLR_SPECIAL_CHARS, '\\$&');
  },

  /**
   * Get valid field names for ALA
   */
  getValidFields(): string[] {
    return KNOWN_FIELDS.ala;
  },
};
