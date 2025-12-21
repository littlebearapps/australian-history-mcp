/**
 * Museums Victoria Collections API Type Definitions
 */

// ============================================================================
// Search Parameter Types
// ============================================================================

export type MuseumRecordType = 'article' | 'item' | 'species' | 'specimen';

export type MuseumCategory =
  | 'natural sciences'
  | 'first peoples'
  | 'history & technology';

export type MuseumImageLicence =
  | 'public domain'
  | 'cc by'
  | 'cc by-nc'
  | 'cc by-sa'
  | 'cc by-nc-sa';

export interface MuseumSearchParams {
  query?: string;
  recordType?: MuseumRecordType;
  category?: MuseumCategory;
  hasImages?: boolean;
  onDisplay?: boolean;
  imageLicence?: MuseumImageLicence;
  locality?: string;
  taxon?: string;
  collectingArea?: string;
  perPage?: number;
  page?: number;
}

// ============================================================================
// Media Types
// ============================================================================

export interface MuseumMedia {
  id: string;
  type: 'image' | 'video' | 'audio' | '3d';
  caption?: string;
  creators?: string[];
  sources?: string[];
  credit?: string;
  rightsStatement?: string;
  licence?: {
    name: string;
    shortName: string;
    uri: string;
  };
  small?: { uri: string; width: number; height: number };
  medium?: { uri: string; width: number; height: number };
  large?: { uri: string; width: number; height: number };
}

// ============================================================================
// Record Types
// ============================================================================

export interface MuseumArticle {
  id: string;
  displayTitle: string;
  contentSummary?: string;
  content?: string;
  keywords?: string[];
  media?: MuseumMedia[];
  dateModified: string;
  recordType: 'article';
}

export interface MuseumItem {
  id: string;
  displayTitle: string;
  objectSummary?: string;
  objectName?: string;
  physicalDescription?: string;
  inscription?: string;
  associations?: string[];
  category?: string;
  discipline?: string;
  type?: string;
  registrationNumber: string;
  collectionNames?: string[];
  media?: MuseumMedia[];
  licence?: {
    name: string;
    shortName: string;
    uri: string;
  };
  dateModified: string;
  recordType: 'item';
}

export interface MuseumSpecies {
  id: string;
  displayTitle: string;
  taxonomy?: {
    kingdom?: string;
    phylum?: string;
    subphylum?: string;
    superclass?: string;
    class?: string;
    subclass?: string;
    superorder?: string;
    order?: string;
    suborder?: string;
    infraorder?: string;
    superfamily?: string;
    family?: string;
    subfamily?: string;
    genus?: string;
    species?: string;
    subspecies?: string;
    author?: string;
    commonName?: string;
  };
  overview?: string;
  biology?: string;
  habitat?: string;
  distribution?: string;
  diet?: string;
  localBiodiversity?: string;
  media?: MuseumMedia[];
  dateModified: string;
  recordType: 'species';
}

export interface MuseumSpecimen {
  id: string;
  displayTitle: string;
  objectSummary?: string;
  registrationNumber: string;
  collectionNames?: string[];
  category?: string;
  discipline?: string;
  type?: string;
  taxonomy?: MuseumSpecies['taxonomy'];
  collectionEvent?: {
    locality?: string;
    site?: string;
    state?: string;
    country?: string;
    dateVisitedFrom?: string;
    dateVisitedTo?: string;
    collectors?: string[];
  };
  storageLocation?: string;
  media?: MuseumMedia[];
  licence?: {
    name: string;
    shortName: string;
    uri: string;
  };
  dateModified: string;
  recordType: 'specimen';
}

export type MuseumRecord = MuseumArticle | MuseumItem | MuseumSpecies | MuseumSpecimen;

// ============================================================================
// Search Result Types
// ============================================================================

export interface MuseumSearchResult {
  totalResults: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  records: MuseumRecord[];
  nextPage?: number;
}
