/**
 * Regex patterns for query syntax extraction
 * @module core/query/patterns
 */

/**
 * Pattern definitions for extracting structured data from queries
 */
export const PATTERNS = {
  /**
   * Date range: 1920-1930, 1920–1930, 1920..1930
   * Captures: [full match, from year, to year]
   */
  dateRange: /(\d{4})\s*[-–.]+\s*(\d{4})/,

  /**
   * Decade: 1920s, 1890s
   * Captures: [full match, decade start year]
   */
  decade: /(\d{4})s\b/,

  /**
   * Century: 19th century, 20th century
   * Captures: [full match, century number]
   */
  century: /(\d{1,2})(?:st|nd|rd|th)\s+century/i,

  /**
   * Field:value syntax - field:word or field:"quoted phrase"
   * Captures: [full match, field name, value (may include quotes)]
   */
  fieldValue: /(\w+):([^\s"]+|"[^"]+")/g,

  /**
   * Quoted phrase: "Melbourne railway station"
   * Captures: [full match, phrase content without quotes]
   */
  phrase: /"([^"]+)"/g,

  /**
   * Exclusion: -advertisement, -classified
   * Captures: [full match, excluded term]
   */
  exclusion: /(?:^|\s)-(\w+)/g,

  /**
   * Wildcard: colonial*, rail*
   * Tests for presence of wildcard pattern
   */
  wildcard: /\w+\*/,
} as const;

/**
 * Named era mappings to date ranges
 */
export const ERA_MAPPINGS: Record<string, [number, number]> = {
  'colonial': [1788, 1901],
  'colonial era': [1788, 1901],
  'federation': [1901, 1914],
  'edwardian': [1901, 1910],
  'great war': [1914, 1918],
  'world war i': [1914, 1918],
  'world war 1': [1914, 1918],
  'wwi': [1914, 1918],
  'ww1': [1914, 1918],
  'interwar': [1918, 1939],
  'roaring twenties': [1920, 1929],
  'depression': [1929, 1939],
  'great depression': [1929, 1939],
  'world war ii': [1939, 1945],
  'world war 2': [1939, 1945],
  'wwii': [1939, 1945],
  'ww2': [1939, 1945],
  'post-war': [1945, 1970],
  'postwar': [1945, 1970],
  'gold rush': [1851, 1869],
  'victorian era': [1837, 1901],
  'marvellous melbourne': [1880, 1893],
};

/**
 * Valid field names across all sources
 * Used for validation and help messages
 */
export const KNOWN_FIELDS: Record<string, string[]> = {
  trove: ['creator', 'author', 'subject', 'title', 'isbn', 'issn', 'nuc'],
  prov: ['series', 'agency', 'category', 'form'],
  ala: ['species', 'common', 'kingdom', 'family', 'genus', 'state'],
};

/**
 * Get all valid field names across all sources
 */
export function getAllValidFields(): string[] {
  const allFields = new Set<string>();
  for (const fields of Object.values(KNOWN_FIELDS)) {
    for (const field of fields) {
      allFields.add(field);
    }
  }
  return Array.from(allFields);
}
