/**
 * Trove (National Library of Australia) Type Definitions
 */

// ============================================================================
// Search Parameter Types
// ============================================================================

export type TroveCategory =
  | 'all'
  | 'newspaper'
  | 'gazette'
  | 'magazine'
  | 'image'
  | 'research'
  | 'book'
  | 'diary'
  | 'music'
  | 'people'
  | 'list';

export type TroveState =
  | 'vic'
  | 'nsw'
  | 'qld'
  | 'sa'
  | 'wa'
  | 'tas'
  | 'nt'
  | 'act'
  | 'national';

export const TROVE_CATEGORIES: TroveCategory[] = [
  'all',
  'newspaper',
  'gazette',
  'magazine',
  'image',
  'research',
  'book',
  'diary',
  'music',
];

export const TROVE_STATES: TroveState[] = [
  'vic',
  'nsw',
  'qld',
  'sa',
  'wa',
  'tas',
  'nt',
  'act',
  'national',
];

// Map abbreviations to full names for search API l-state parameter
export const STATE_TO_FULL_NAME: Record<TroveState, string> = {
  'vic': 'Victoria',
  'nsw': 'New South Wales',
  'qld': 'Queensland',
  'sa': 'South Australia',
  'wa': 'Western Australia',
  'tas': 'Tasmania',
  'nt': 'Northern Territory',
  'act': 'ACT',
  'national': 'National',
};

export type TroveSortBy = 'relevance' | 'datedesc' | 'dateasc';

export type TroveAvailability = 'y' | 'y/f' | 'y/r' | 'y/s';

export type TroveRecLevel = 'brief' | 'full';

export type TroveIncludeOption =
  | 'holdings'
  | 'links'
  | 'workversions'
  | 'subscribinglibs'
  | 'articletext'
  | 'listitems'
  | 'years';

export interface TroveSearchParams {
  query: string;
  category?: TroveCategory | TroveCategory[];
  state?: TroveState;
  dateFrom?: string;    // YYYY or YYYY-MM-DD
  dateTo?: string;
  limit?: number;       // max 100
  start?: string;       // cursor for pagination
  bulkHarvest?: boolean;
  includeFullText?: boolean;
  format?: string;      // Photograph, Map, Book, etc.
  facets?: string[];
  nuc?: string;         // NUC code to filter by contributor (e.g., "ANL" for NLA, "VSL" for SLV)
  illustrated?: 'Y' | 'N';  // Filter by illustration (Y = illustrated, N = not illustrated)

  // Sorting
  sortby?: TroveSortBy;

  // Advanced filters (facets)
  decade?: string;          // e.g., "199" for 1990s
  language?: string;
  availability?: TroveAvailability;  // online, free, restricted, subscription
  australian?: boolean;
  wordCount?: string;       // for newspapers
  artType?: string;         // images: 'Images and artefacts' | 'Maps'
  geocoverage?: string;
  contribcollection?: string;
  firstAustralians?: boolean;
  austlanguage?: string;    // Austlang code

  // Search indexes (added to query string)
  creator?: string;
  subject?: string;
  isbn?: string;
  issn?: string;
  identifier?: string;
  anbdid?: string;
  lastupdated?: string;     // ISO date range [YYYY-MM-DDTHH:MM:SSZ TO *]
  rights?: string;
  placeOfPublication?: string;
  geographicCoverage?: string;
  fullTextInd?: boolean;
  imageInd?: boolean;

  // Include options
  includeHoldings?: boolean;
  includeLinks?: boolean;
}

// ============================================================================
// Article and Work Types
// ============================================================================

export interface TroveArticle {
  id: string;
  heading: string;
  title: string;        // newspaper title
  titleId: string;
  date: string;
  page: string;
  category: string;     // Article, Advertising, etc.
  snippet?: string;
  fullText?: string;
  troveUrl: string;
  pdfUrl?: string;
  wordCount?: number;
  correctionCount?: number;
  illustrated?: boolean;
}

export interface TroveWork {
  id: string;
  title: string;
  contributor?: string;
  issued?: string;
  type: string[];
  holdingsCount?: number;
  versionCount?: number;
  troveUrl: string;
  thumbnailUrl?: string;
  abstract?: string;
  subjects?: string[];
}

export interface TroveSearchResult {
  query: string;
  category: string;
  totalResults: number;
  nextStart?: string;   // cursor for next page
  records: (TroveArticle | TroveWork)[];
}

// ============================================================================
// Newspaper Title Types
// ============================================================================

export interface TroveNewspaperTitle {
  id: string;
  title: string;
  state: string;
  issn?: string;
  startDate: string;
  endDate: string;
  troveUrl: string;
}

export interface TroveTitleDetail extends TroveNewspaperTitle {
  years?: {
    year: string;
    issueCount: number;
  }[];
  issues?: {
    id: string;
    date: string;
    url: string;
  }[];
}

// ============================================================================
// Full Article Detail
// ============================================================================

export interface TroveArticleDetail {
  id: string;
  heading: string;
  title: string;
  titleId: string;
  date: string;
  page: string;
  pageSequence?: number;
  category: string;
  troveUrl: string;
  pdfUrl?: string;
  fullText?: string;
  wordCount?: number;
  correctionCount?: number;
  tagCount?: number;
  commentCount?: number;
  illustrated?: boolean;
  lastCorrected?: string;
}

// ============================================================================
// Contributor Types
// ============================================================================

export interface TroveContributor {
  nuc: string;
  name: string;
  shortname?: string;
  url?: string;
  address?: string;
  email?: string;
  phone?: string;
  fax?: string;
  catalogue?: string;
  totalHoldings?: number;
}

// ============================================================================
// Magazine Title Types
// ============================================================================

export interface TroveMagazineTitle {
  id: string;
  title: string;
  publisher?: string;
  startDate?: string;
  endDate?: string;
  issn?: string;
  troveUrl: string;
}

// ============================================================================
// Holdings, Links, and Version Types
// ============================================================================

export type TroveLinkType =
  | 'fulltext'
  | 'restricted'
  | 'subscription'
  | 'unknown'
  | 'notonline'
  | 'thumbnail'
  | 'viewcopy';

export interface TroveHolding {
  nuc: string;
  name?: string;
  url?: string;
  callNumber?: string;
  localIdentifier?: string;
}

export interface TroveLink {
  url: string;
  linktype: TroveLinkType;
  linktext?: string;
}

export interface TroveVersion {
  id: string;
  type: string[];
  issued?: string;
  holdingsCount: number;
  holdings?: TroveHolding[];
  links?: TroveLink[];
}

// ============================================================================
// Full Work Detail (with holdings, links, versions)
// ============================================================================

export interface TroveWorkDetail {
  id: string;
  title: string;
  contributor?: string;
  issued?: string;
  type: string[];
  subjects?: string[];
  abstract?: string;
  tableOfContents?: string;
  language?: string;
  wikipedia?: string;
  holdingsCount: number;
  versionCount: number;
  troveUrl: string;
  thumbnailUrl?: string;
  identifier?: string;
  // With include=holdings
  holdings?: TroveHolding[];
  // With include=links
  links?: TroveLink[];
  // With include=workversions
  versions?: TroveVersion[];
}

// ============================================================================
// Person and Organisation Types
// ============================================================================

export type TrovePersonType = 'Person' | 'Organisation' | 'Family';

export interface TrovePerson {
  id: string;
  type: TrovePersonType;
  primaryName: string;
  primaryDisplayName?: string;
  alternateName?: string[];
  alternateDisplayName?: string[];
  title?: string;
  occupation?: string[];
  biography?: string;
  contributor?: string;
  thumbnailUrl?: string;
  troveUrl: string;
}

export interface TrovePersonSearchResult {
  query: string;
  totalResults: number;
  nextStart?: string;
  records: TrovePerson[];
}

// ============================================================================
// List Types (User-Curated Research Lists)
// ============================================================================

export interface TroveListItem {
  note?: string;
  work?: TroveWork;
  article?: TroveArticle;
  people?: {
    id: string;
    troveUrl: string;
  };
  externalWebsite?: {
    title: string;
    url: string;
  };
}

export interface TroveList {
  id: string;
  title: string;
  creator: string;
  description?: string;
  listItemCount: number;
  thumbnailUrl?: string;
  dateCreated?: string;
  dateLastUpdated?: string;
  troveUrl: string;
  // With include=listitems
  items?: TroveListItem[];
}

// ============================================================================
// Magazine Title Detail (with years/issues)
// ============================================================================

export interface TroveMagazineIssue {
  id: string;
  date: string;
  url: string;
}

export interface TroveMagazineYear {
  year: string;
  issueCount: number;
  issues?: TroveMagazineIssue[];
}

export interface TroveMagazineTitleDetail {
  id: string;
  title: string;
  publisher?: string;
  place?: string;
  issn?: string;
  startDate?: string;
  endDate?: string;
  troveUrl: string;
  // With include=years
  years?: TroveMagazineYear[];
}
