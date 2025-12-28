/**
 * Australian Centre for the Moving Image (ACMI) API Types
 */

// ============================================================================
// Search Parameters
// ============================================================================

export interface ACMISearchParams {
  /** Search query text */
  query?: string;
  /** Work type filter (e.g., "Film", "Artwork", "Object") */
  type?: string;
  /** Production year filter */
  year?: number;
  /** Limit search to specific field (e.g., "title") */
  field?: string;
  /** Page size (default 20, max 50) */
  size?: number;
  /** Page number (1-based) */
  page?: number;
}

export interface ACMICreatorSearchParams {
  /** Search by name */
  name?: string;
  /** Page number (1-based) */
  page?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ACMIPaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// Work Types
// ============================================================================

export interface ACMICreatorRef {
  id: number;
  name: string;
  creator_id: number;
  creator_wikidata_id: string | null;
  role: string;
  role_id: number;
  is_primary: boolean;
}

export interface ACMIProductionDate {
  date: string;
  notes: string;
  to_year: string;
}

export interface ACMIProductionPlace {
  id: number;
  name: string;
  slug: string;
}

export interface ACMIDetail {
  label: string;
  display_values: string[];
}

export interface ACMIHolding {
  name: string;
  identifier: string;
  description: string;
}

export interface ACMIVideoLink {
  id: number;
  uri: string;
  title: string;
}

export interface ACMIWork {
  id: number;
  acmi_id: string;
  title: string;
  title_annotation: string;
  slug: string;
  creator_credit: string;
  credit_line: string;
  headline_credit: string;
  video_links: ACMIVideoLink[];
  record_type: 'work' | 'group';
  type: string;
  is_on_display: boolean;
  last_on_display_place: string | null;
  last_on_display_date: string | null;
  is_context_indigenous: boolean;
  material_description: string;
  unpublished: boolean;
  external: boolean;
  first_production_date: string | null;
  commissioned: boolean;
  public_domain: boolean;
  external_references: string[];
  brief_description: string;
  description: string;
  details: ACMIDetail[];
  stats: { tap_count: number };
  links: string[];
  creators_primary: ACMICreatorRef[];
  creators_other: ACMICreatorRef[];
  media_note: string | null;
  holdings: ACMIHolding[];
  production_places: ACMIProductionPlace[];
  production_dates: ACMIProductionDate[];
  source: { name: string; slug: string };
  source_identifier: string;
  constellations_primary: unknown[];
  constellations_other: unknown[];
  recommendations: unknown[];
  part_of: unknown;
  parts: unknown[];
  part_siblings: unknown[];
  group: unknown;
  group_works: unknown[];
  group_siblings: unknown[];
  labels: number[];
}

// ============================================================================
// Creator Types
// ============================================================================

export interface ACMIRoleInWork {
  id: number;
  title: string;
  work_id: number;
  role: string;
  role_id: number;
  is_primary: boolean;
}

export interface ACMICreator {
  id: number;
  name: string;
  also_known_as: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  genders: string[];
  languages: string[];
  places_of_operation: string[];
  biography: string;
  biography_author: string | null;
  date_of_biography: string | null;
  external_links: string[];
  uuid: string;
  source: { name: string; slug: string };
  source_identifier: string;
  external_references: Array<{
    id: number;
    source: { name: string; slug: string };
    source_identifier: string;
  }>;
  roles_in_work: ACMIRoleInWork[];
  date_modified: string;
}

// ============================================================================
// Constellation Types (Curated Collections)
// ============================================================================

export interface ACMIConstellation {
  id: number;
  name: string;
  slug?: string;
  description: string;
  works_count?: number;
  key_work?: ACMIWork;
  authors?: Array<{
    id: number;
    full_name: string;
    job_title?: string;
  }>;
}
