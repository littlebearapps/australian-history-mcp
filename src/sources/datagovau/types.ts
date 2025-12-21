/**
 * data.gov.au (CKAN) Type Definitions
 */

// ============================================================================
// Search Parameter Types
// ============================================================================

export interface DataGovAUSearchParams {
  query?: string;
  organization?: string;
  groups?: string[];
  tags?: string[];
  format?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}

// ============================================================================
// Resource Types
// ============================================================================

export interface DataGovAUResource {
  id: string;
  name: string;
  description?: string;
  format: string;
  url: string;
  size?: number;
  lastModified?: string;
  datastoreActive?: boolean;
}

// ============================================================================
// Dataset Types
// ============================================================================

export interface DataGovAUDataset {
  id: string;
  name: string;
  title: string;
  notes?: string;
  organization?: {
    name: string;
    title: string;
    description?: string;
  };
  resources: DataGovAUResource[];
  tags: string[];
  metadataCreated: string;
  metadataModified: string;
  licenseId?: string;
  licenseTitle?: string;
  author?: string;
  maintainer?: string;
  url?: string;
}

export interface DataGovAUSearchResult {
  count: number;
  datasets: DataGovAUDataset[];
}

// ============================================================================
// Organization Types
// ============================================================================

export interface DataGovAUOrganization {
  id: string;
  name: string;
  title: string;
  description?: string;
  packageCount: number;
  imageUrl?: string;
  created?: string;
}

// ============================================================================
// Group Types
// ============================================================================

export interface DataGovAUGroup {
  id: string;
  name: string;
  title: string;
  description?: string;
  packageCount: number;
  imageUrl?: string;
}

// ============================================================================
// Datastore Types
// ============================================================================

export interface DataGovAUDatastoreParams {
  resourceId: string;
  query?: string;
  filters?: Record<string, string | string[]>;
  limit?: number;
  offset?: number;
}

export interface DataGovAUDatastoreResult {
  resourceId: string;
  fields: Array<{ id: string; type: string }>;
  records: Record<string, unknown>[];
  total: number;
}
