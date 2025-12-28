/**
 * PROV Query Builder - Solr syntax
 * @module core/query/builders/prov
 */

import type { ParsedQuery, TransformedQuery, CommonSearchArgs, QueryBuilder } from '../types.js';
import { KNOWN_FIELDS } from '../patterns.js';

/**
 * Solr special characters that need escaping
 */
const SOLR_SPECIAL_CHARS = /[+\-&|!(){}[\]^"~*?:\\\/]/g;

/**
 * PROV field mappings (user-friendly -> API field)
 */
const PROV_FIELD_MAPPINGS: Record<string, string> = {
  series: 'is_part_of_series.identifier',
  agency: 'is_controlled_by_agency.identifier',
  category: 'category',
  form: 'form',
};

/**
 * Build PROV/Solr queries from parsed query data
 */
export const provBuilder: QueryBuilder = {
  source: 'prov',

  /**
   * Transform parsed query to PROV Solr syntax
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

    // Add date range filter (Solr date syntax)
    // PROV uses start_dt and end_dt fields
    if (appliedDateRange) {
      const from = appliedDateRange.from;
      const to = appliedDateRange.to;
      // Search for records that overlap with the date range
      // end_dt >= from AND start_dt <= to
      if (from !== '*') {
        query = `${query} end_dt:[${from}-01-01T00:00:00Z TO *]`;
      }
      if (to !== '*') {
        query = `${query} start_dt:[* TO ${to}-12-31T23:59:59Z]`;
      }
      appliedFields['date'] = `${from}-${to}`;
    }

    // Apply field:value filters from parsed query
    const validFields = this.getValidFields();
    for (const [field, value] of Object.entries(parsed.fields)) {
      if (validFields.includes(field)) {
        const provField = PROV_FIELD_MAPPINGS[field] || field;
        const escapedValue = value.includes(' ') ? `"${value}"` : this.escape(value);
        query = `${query} ${provField}:(${escapedValue})`;
        appliedFields[field] = value;
      } else {
        warnings.push(`Unknown field "${field}" for PROV (valid: ${validFields.join(', ')})`);
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
   * Get valid field names for PROV
   */
  getValidFields(): string[] {
    return KNOWN_FIELDS.prov;
  },
};
