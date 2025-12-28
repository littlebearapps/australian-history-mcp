/**
 * Query parsing and building module
 * @module core/query
 */

// Types
export type {
  ParsedQuery,
  DateRange,
  TransformedQuery,
  CommonSearchArgs,
  QueryBuilder,
} from './types.js';

// Patterns
export {
  PATTERNS,
  ERA_MAPPINGS,
  KNOWN_FIELDS,
  getAllValidFields,
} from './patterns.js';

// Parser
export {
  parseQuery,
  isSimpleQuery,
  getUnknownFields,
  formatParsedQuery,
} from './parser.js';

// Builders
export {
  getBuilder,
  hasBuilder,
  getSupportedSources,
  troveBuilder,
  provBuilder,
  alaBuilder,
} from './builders/index.js';
