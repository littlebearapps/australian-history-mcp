/**
 * Consolidated Enums for MCP Tools
 *
 * DESIGN GOAL: Reduce duplication and token usage by centralising common enums.
 *
 * USAGE: Import and use in tool schema definitions:
 *   import { AU_STATES_ABBREV, SORT_ORDERS } from '../../../core/enums.js';
 */

// ============================================================================
// Australian States - Abbreviations (used by Trove, GHAP, GA HAP, etc.)
// ============================================================================

export const AU_STATES_ABBREV = [
  'vic',
  'nsw',
  'qld',
  'sa',
  'wa',
  'tas',
  'nt',
  'act',
] as const;

export const AU_STATES_WITH_NATIONAL = [
  ...AU_STATES_ABBREV,
  'national',
] as const;

export type AUStateAbbrev = (typeof AU_STATES_ABBREV)[number];
export type AUStateWithNational = (typeof AU_STATES_WITH_NATIONAL)[number];

// ============================================================================
// Australian States - Full Names (used by ALA, GA HAP)
// ============================================================================

export const AU_STATES_FULL = [
  'New South Wales',
  'Victoria',
  'Queensland',
  'Western Australia',
  'South Australia',
  'Tasmania',
  'Northern Territory',
  'Australian Capital Territory',
] as const;

export type AUStateFull = (typeof AU_STATES_FULL)[number];

// ============================================================================
// State Code Mapping (abbreviation → full name)
// ============================================================================

export const STATE_ABBREV_TO_FULL: Record<AUStateAbbrev, AUStateFull> = {
  'vic': 'Victoria',
  'nsw': 'New South Wales',
  'qld': 'Queensland',
  'sa': 'South Australia',
  'wa': 'Western Australia',
  'tas': 'Tasmania',
  'nt': 'Northern Territory',
  'act': 'Australian Capital Territory',
};

export const STATE_FULL_TO_ABBREV: Record<AUStateFull, AUStateAbbrev> = {
  'Victoria': 'vic',
  'New South Wales': 'nsw',
  'Queensland': 'qld',
  'South Australia': 'sa',
  'Western Australia': 'wa',
  'Tasmania': 'tas',
  'Northern Territory': 'nt',
  'Australian Capital Territory': 'act',
};

// GA HAP uses uppercase abbreviations
export const AU_STATES_UPPER = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'] as const;
export type AUStateUpper = (typeof AU_STATES_UPPER)[number];

// Alias for backwards compatibility
export const AU_STATES = AU_STATES_UPPER;

// ============================================================================
// Sort Orders
// ============================================================================

export const SORT_ORDERS_DATE = ['relevance', 'datedesc', 'dateasc'] as const;
export type SortOrderDate = (typeof SORT_ORDERS_DATE)[number];

export const SORT_ORDERS_ASC_DESC = ['asc', 'desc'] as const;
export type SortOrderAscDesc = (typeof SORT_ORDERS_ASC_DESC)[number];

// ============================================================================
// Trove Categories
// ============================================================================

export const TROVE_CATEGORIES = [
  'all',
  'newspaper',
  'gazette',
  'magazine',
  'image',
  'research',
  'book',
  'diary',
  'music',
] as const;

export type TroveCategory = (typeof TROVE_CATEGORIES)[number];

// ============================================================================
// Trove Availability
// ============================================================================

export const TROVE_AVAILABILITY = ['online', 'free', 'restricted', 'subscription'] as const;
export type TroveAvailabilityType = (typeof TROVE_AVAILABILITY)[number];

// ============================================================================
// Trove Include Options
// ============================================================================

export const TROVE_INCLUDE_OPTIONS = [
  'holdings',
  'links',
  'workversions',
  'subscribinglibs',
] as const;

export type TroveIncludeOption = (typeof TROVE_INCLUDE_OPTIONS)[number];

// ============================================================================
// PROV Record Forms
// ============================================================================

export const PROV_RECORD_FORMS = [
  'Photograph or Image',
  'Map, Plan, or Drawing',
  'File',
  'Volume',
  'Document',
  'Card',
  'Object',
  'Moving Image',
  'Sound Recording',
] as const;

export type PROVRecordForm = (typeof PROV_RECORD_FORMS)[number];

// ============================================================================
// PROV Document Categories
// ============================================================================

export const PROV_DOCUMENT_CATEGORIES = [
  'agency',
  'function',
  'series',
  'consignment',
  'item',
  'image',
] as const;

export type PROVDocumentCategory = (typeof PROV_DOCUMENT_CATEGORIES)[number];

// ============================================================================
// Museums Victoria Record Types
// ============================================================================

export const MV_RECORD_TYPES = ['article', 'item', 'species', 'specimen'] as const;
export type MVRecordType = (typeof MV_RECORD_TYPES)[number];

// ============================================================================
// Museums Victoria Categories
// ============================================================================

export const MV_CATEGORIES = [
  'natural sciences',
  'first peoples',
  'history & technology',
] as const;

export type MVCategory = (typeof MV_CATEGORIES)[number];

// ============================================================================
// Museums Victoria Image Licences
// ============================================================================

export const MV_LICENCES = [
  'public domain',
  'cc by',
  'cc by-nc',
  'cc by-sa',
  'cc by-nc-sa',
] as const;

export type MVLicence = (typeof MV_LICENCES)[number];

// ============================================================================
// ALA Kingdoms
// ============================================================================

export const ALA_KINGDOMS = [
  'Animalia',
  'Plantae',
  'Fungi',
  'Chromista',
  'Protozoa',
  'Bacteria',
  'Archaea',
  'Viruses',
] as const;

export type ALAKingdom = (typeof ALA_KINGDOMS)[number];

// ============================================================================
// IIIF Image API Options
// ============================================================================

export const IIIF_FORMATS = ['jpg', 'png', 'gif', 'webp', 'tif'] as const;
export type IIIFFormat = (typeof IIIF_FORMATS)[number];

export const IIIF_QUALITIES = ['default', 'color', 'gray', 'bitonal'] as const;
export type IIIFQuality = (typeof IIIF_QUALITIES)[number];

// ============================================================================
// Image Size Options
// ============================================================================

export const IMAGE_SIZES = ['thumbnail', 'medium', 'full', 'all'] as const;
export type ImageSize = (typeof IMAGE_SIZES)[number];

// ============================================================================
// Illustration Type (Trove)
// ============================================================================

export const ILLUSTRATION_TYPES = ['Illustrated', 'Not Illustrated'] as const;
export type IllustrationType = (typeof ILLUSTRATION_TYPES)[number];

// ============================================================================
// Record Detail Levels
// ============================================================================

export const REC_LEVELS = ['brief', 'full'] as const;
export type RecLevel = (typeof REC_LEVELS)[number];

// ============================================================================
// Publication Types
// ============================================================================

export const PUBLICATION_TYPES = ['newspaper', 'gazette'] as const;
export type PublicationType = (typeof PUBLICATION_TYPES)[number];

// ============================================================================
// Trove Person Types
// ============================================================================

export const PERSON_TYPES = ['Person', 'Organisation', 'Family'] as const;
export type PersonType = (typeof PERSON_TYPES)[number];
