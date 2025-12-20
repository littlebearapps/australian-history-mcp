/**
 * data.gov.au (CKAN) API Client
 *
 * data.gov.au is Australia's national open data portal, powered by CKAN.
 * It aggregates datasets from federal, state, and local government agencies.
 * No API key is required for read-only access.
 *
 * API Documentation: https://docs.ckan.org/en/latest/api/
 * Portal: https://data.gov.au/
 */

import type {
  DataGovAUSearchParams,
  DataGovAUSearchResult,
  DataGovAUDataset,
  DataGovAUResource,
  DataGovAUOrganization,
  DataGovAUGroup,
  DataGovAUDatastoreParams,
  DataGovAUDatastoreResult,
} from '../types.js';

const DATAGOVAU_API_BASE = 'https://data.gov.au/data/api/3/action';

export class DataGovAUClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = DATAGOVAU_API_BASE;
  }

  // =========================================================================
  // Dataset/Package Operations
  // =========================================================================

  /**
   * Search datasets (packages) in data.gov.au
   */
  async search(params: DataGovAUSearchParams): Promise<DataGovAUSearchResult> {
    const urlParams = new URLSearchParams();

    // Main query
    if (params.query) {
      urlParams.set('q', params.query);
    }

    // Filter queries
    const fqParts: string[] = [];

    if (params.organization) {
      fqParts.push(`organization:${params.organization}`);
    }

    if (params.groups && params.groups.length > 0) {
      params.groups.forEach(g => fqParts.push(`groups:${g}`));
    }

    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(t => fqParts.push(`tags:${t}`));
    }

    if (params.format) {
      fqParts.push(`res_format:${params.format}`);
    }

    if (fqParts.length > 0) {
      urlParams.set('fq', fqParts.join(' AND '));
    }

    // Pagination
    urlParams.set('rows', (params.limit ?? 20).toString());
    urlParams.set('start', (params.offset ?? 0).toString());

    // Sorting
    if (params.sort) {
      urlParams.set('sort', params.sort);
    }

    const url = `${this.baseUrl}/package_search?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`data.gov.au API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as {
        success: boolean;
        result: { count: number; results: any[] };
        error?: { message: string };
      };

      if (!data.success) {
        throw new Error(`data.gov.au API error: ${data.error?.message ?? 'Unknown error'}`);
      }

      return {
        count: data.result.count,
        datasets: data.result.results.map(d => this.parseDataset(d)),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au search failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get a specific dataset by ID or name
   */
  async getDataset(idOrName: string): Promise<DataGovAUDataset | null> {
    const url = `${this.baseUrl}/package_show?id=${encodeURIComponent(idOrName)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`data.gov.au API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        result: any;
        error?: { message: string };
      };

      if (!data.success) {
        return null;
      }

      return this.parseDataset(data.result);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au getDataset failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * List all dataset names (for discovery)
   */
  async listDatasets(limit?: number, offset?: number): Promise<string[]> {
    const urlParams = new URLSearchParams();
    if (limit) urlParams.set('limit', limit.toString());
    if (offset) urlParams.set('offset', offset.toString());

    const url = `${this.baseUrl}/package_list?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`data.gov.au API error: ${response.status}`);
      }

      const data = await response.json() as { success: boolean; result: string[] };
      return data.result ?? [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au listDatasets failed: ${error.message}`);
      }
      throw error;
    }
  }

  // =========================================================================
  // Resource Operations
  // =========================================================================

  /**
   * Get a specific resource by ID
   */
  async getResource(resourceId: string): Promise<DataGovAUResource | null> {
    const url = `${this.baseUrl}/resource_show?id=${encodeURIComponent(resourceId)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`data.gov.au API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        result: any;
      };

      if (!data.success) {
        return null;
      }

      return this.parseResource(data.result);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au getResource failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search the datastore (tabular data) for a resource
   */
  async datastoreSearch(params: DataGovAUDatastoreParams): Promise<DataGovAUDatastoreResult | null> {
    const urlParams = new URLSearchParams({
      resource_id: params.resourceId,
    });

    if (params.query) {
      urlParams.set('q', params.query);
    }

    if (params.filters) {
      urlParams.set('filters', JSON.stringify(params.filters));
    }

    if (params.limit) {
      urlParams.set('limit', params.limit.toString());
    }

    if (params.offset) {
      urlParams.set('offset', params.offset.toString());
    }

    const url = `${this.baseUrl}/datastore_search?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Datastore not enabled for this resource
        }
        throw new Error(`data.gov.au API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        result: {
          resource_id: string;
          fields: Array<{ id: string; type: string }>;
          records: Record<string, unknown>[];
          total: number;
        };
      };

      if (!data.success) {
        return null;
      }

      return {
        resourceId: data.result.resource_id,
        fields: data.result.fields,
        records: data.result.records,
        total: data.result.total,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au datastoreSearch failed: ${error.message}`);
      }
      throw error;
    }
  }

  // =========================================================================
  // Organization Operations
  // =========================================================================

  /**
   * List all organizations
   */
  async listOrganizations(allFields = true, limit?: number): Promise<DataGovAUOrganization[]> {
    const urlParams = new URLSearchParams({
      all_fields: allFields.toString(),
    });
    if (limit) {
      urlParams.set('limit', limit.toString());
    }

    const url = `${this.baseUrl}/organization_list?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`data.gov.au API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        result: any[];
      };

      if (!allFields) {
        // Just names returned
        return (data.result ?? []).map((name: string) => ({
          id: name,
          name,
          title: name,
          packageCount: 0,
        }));
      }

      return (data.result ?? []).map(org => this.parseOrganization(org));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au listOrganizations failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get organization details
   */
  async getOrganization(idOrName: string, includeDatasets = false): Promise<DataGovAUOrganization | null> {
    const urlParams = new URLSearchParams({
      id: idOrName,
      include_datasets: includeDatasets.toString(),
    });

    const url = `${this.baseUrl}/organization_show?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`data.gov.au API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        result: any;
      };

      if (!data.success) {
        return null;
      }

      return this.parseOrganization(data.result);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au getOrganization failed: ${error.message}`);
      }
      throw error;
    }
  }

  // =========================================================================
  // Group Operations
  // =========================================================================

  /**
   * List all groups (categories)
   */
  async listGroups(allFields = true): Promise<DataGovAUGroup[]> {
    const urlParams = new URLSearchParams({
      all_fields: allFields.toString(),
    });

    const url = `${this.baseUrl}/group_list?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`data.gov.au API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        result: any[];
      };

      if (!allFields) {
        return (data.result ?? []).map((name: string) => ({
          id: name,
          name,
          title: name,
          packageCount: 0,
        }));
      }

      return (data.result ?? []).map(g => this.parseGroup(g));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au listGroups failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get group details
   */
  async getGroup(idOrName: string, includeDatasets = false): Promise<DataGovAUGroup | null> {
    const urlParams = new URLSearchParams({
      id: idOrName,
      include_datasets: includeDatasets.toString(),
    });

    const url = `${this.baseUrl}/group_show?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`data.gov.au API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        result: any;
      };

      if (!data.success) {
        return null;
      }

      return this.parseGroup(data.result);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au getGroup failed: ${error.message}`);
      }
      throw error;
    }
  }

  // =========================================================================
  // Tag Operations
  // =========================================================================

  /**
   * List all tags
   */
  async listTags(query?: string): Promise<string[]> {
    const urlParams = new URLSearchParams();
    if (query) {
      urlParams.set('query', query);
    }

    const url = `${this.baseUrl}/tag_list?${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`data.gov.au API error: ${response.status}`);
      }

      const data = await response.json() as {
        success: boolean;
        result: string[];
      };

      return data.result ?? [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`data.gov.au listTags failed: ${error.message}`);
      }
      throw error;
    }
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private parseDataset(doc: any): DataGovAUDataset {
    return {
      id: doc.id ?? '',
      name: doc.name ?? '',
      title: doc.title ?? 'Untitled',
      notes: doc.notes ?? undefined,
      organization: doc.organization ? {
        name: doc.organization.name ?? '',
        title: doc.organization.title ?? '',
        description: doc.organization.description ?? undefined,
      } : undefined,
      resources: (doc.resources ?? []).map((r: any) => this.parseResource(r)),
      tags: (doc.tags ?? []).map((t: any) => typeof t === 'string' ? t : t.name),
      metadataCreated: doc.metadata_created ?? '',
      metadataModified: doc.metadata_modified ?? '',
      licenseId: doc.license_id ?? undefined,
      licenseTitle: doc.license_title ?? undefined,
      author: doc.author ?? undefined,
      maintainer: doc.maintainer ?? undefined,
      url: doc.url ?? undefined,
    };
  }

  private parseResource(doc: any): DataGovAUResource {
    return {
      id: doc.id ?? '',
      name: doc.name ?? 'Unnamed',
      description: doc.description ?? undefined,
      format: doc.format ?? 'Unknown',
      url: doc.url ?? '',
      size: doc.size ?? undefined,
      lastModified: doc.last_modified ?? undefined,
      datastoreActive: doc.datastore_active ?? false,
    };
  }

  private parseOrganization(doc: any): DataGovAUOrganization {
    return {
      id: doc.id ?? '',
      name: doc.name ?? '',
      title: doc.title ?? '',
      description: doc.description ?? undefined,
      packageCount: doc.package_count ?? 0,
      imageUrl: doc.image_url ?? undefined,
      created: doc.created ?? undefined,
    };
  }

  private parseGroup(doc: any): DataGovAUGroup {
    return {
      id: doc.id ?? '',
      name: doc.name ?? '',
      title: doc.title ?? '',
      description: doc.description ?? undefined,
      packageCount: doc.package_count ?? 0,
      imageUrl: doc.image_url ?? undefined,
    };
  }
}

// Export singleton instance
export const dataGovAUClient = new DataGovAUClient();
