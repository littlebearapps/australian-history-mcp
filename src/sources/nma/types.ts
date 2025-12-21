/**
 * National Museum of Australia API Types
 */

// ============================================================================
// Search Parameters
// ============================================================================

export interface NMASearchParams {
  /** Full-text search query */
  text?: string;
  /** Object type filter */
  type?: string;
  /** Collection filter */
  collection?: string;
  /** Maximum results per page */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface NMASearchResult<T> {
  data: T[];
  meta: {
    results: number;
  };
  links?: {
    next?: string;
  };
}

// ============================================================================
// Object Types
// ============================================================================

export interface NMAObject {
  id: string;
  type: 'object';
  additionalType?: string[];
  title: string;
  collection?: {
    id: string;
    type: string;
    title: string;
  };
  identifier?: string;
  medium?: Array<{
    type: string;
    title: string;
  }>;
  extent?: {
    type: string;
    length?: number;
    height?: number;
    width?: number;
    depth?: number;
    weight?: number;
    unitText?: string;
  };
  physicalDescription?: string;
  significanceStatement?: string;
  spatial?: Array<{
    id: string;
    type: string;
    title: string;
    roleName?: string;
    geo?: string;
  }>;
  temporal?: Array<{
    id?: string;
    type: string;
    title?: string;
    startDate?: string;
    endDate?: string;
  }>;
  _meta?: {
    modified?: string;
    issued?: string;
    hasFormat?: string;
    copyright?: string;
    licence?: string;
  };
  hasVersion?: Array<{
    id: string;
    type: string;
    identifier?: string;
    format?: string;
  }>;
}

// ============================================================================
// Party Types (People/Organisations)
// ============================================================================

export interface NMAParty {
  id: string;
  type: 'party';
  name: string;
  title?: string;
  description?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: {
    id: string;
    type: string;
    title: string;
  };
  deathPlace?: {
    id: string;
    type: string;
    title: string;
  };
  nationality?: string;
  gender?: string;
  _meta?: {
    modified?: string;
    issued?: string;
    hasFormat?: string;
  };
}

// ============================================================================
// Place Types
// ============================================================================

export interface NMAPlace {
  id: string;
  type: 'place';
  title: string;
  geo?: string;
  description?: string;
  _meta?: {
    modified?: string;
    issued?: string;
  };
}

// ============================================================================
// Media Types
// ============================================================================

export interface NMAMedia {
  id: string;
  type: 'media';
  title?: string;
  identifier?: string;
  format?: string;
  extent?: {
    width?: number;
    height?: number;
    unitText?: string;
  };
  creator?: string;
  rights?: string;
  licence?: string;
  _meta?: {
    modified?: string;
    hasFormat?: string;
  };
}
