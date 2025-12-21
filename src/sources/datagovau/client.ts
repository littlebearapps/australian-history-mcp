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

import { BaseClient } from '../../core/base-client.js';
import type {
  DataGovAUSearchParams,
  DataGovAUSearchResult,
  DataGovAUDataset,
  DataGovAUResource,
  DataGovAUOrganization,
  DataGovAUGroup,
  DataGovAUDatastoreParams,
  DataGovAUDatastoreResult,
} from './types.js';

const DATAGOVAU_API_BASE = 'https://data.gov.au/data/api/3/action';

export class DataGovAUClient extends BaseClient {
  constructor() {
    super(DATAGOVAU_API_BASE, { userAgent: 'australian-archives-mcp/0.2.0' });
  }

  // =========================================================================
  // Dataset/Package Operations
  // =========================================================================

  /**
   * Search datasets (packages) in data.gov.au
   */
  async search(params: DataGovAUSearchParams): Promise<DataGovAUSearchResult> {
    const queryParams: Record<string, string> = {};

    // Main query
    if (params.query) {
      queryParams.q = params.query;
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
      queryParams.fq = fqParts.join(' AND ');
    }

    // Pagination
    queryParams.rows = (params.limit ?? 20).toString();
    queryParams.start = (params.offset ?? 0).toString();

    // Sorting
    if (params.sort) {
      queryParams.sort = params.sort;
    }

    const url = this.buildUrl('/package_search', queryParams);
    const data = await this.fetchJSON<{
      success: boolean;
      result: { count: number; results: unknown[] };
      error?: { message: string };
    }>(url);

    if (!data.success) {
      throw new Error(`data.gov.au API error: ${data.error?.message ?? 'Unknown error'}`);
    }

    return {
      count: data.result.count,
      datasets: data.result.results.map(d => this.parseDataset(d)),
    };
  }

  /**
   * Get a specific dataset by ID or name
   */
  async getDataset(idOrName: string): Promise<DataGovAUDataset | null> {
    const url = this.buildUrl('/package_show', { id: idOrName });

    try {
      const data = await this.fetchJSON<{
        success: boolean;
        result: unknown;
        error?: { message: string };
      }>(url);

      if (!data.success) {
        return null;
      }

      return this.parseDataset(data.result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all dataset names (for discovery)
   */
  async listDatasets(limit?: number, offset?: number): Promise<string[]> {
    const queryParams: Record<string, string> = {};
    if (limit) queryParams.limit = limit.toString();
    if (offset) queryParams.offset = offset.toString();

    const url = this.buildUrl('/package_list', queryParams);
    const data = await this.fetchJSON<{ success: boolean; result: string[] }>(url);

    return data.result ?? [];
  }

  // =========================================================================
  // Resource Operations
  // =========================================================================

  /**
   * Get a specific resource by ID
   */
  async getResource(resourceId: string): Promise<DataGovAUResource | null> {
    const url = this.buildUrl('/resource_show', { id: resourceId });

    try {
      const data = await this.fetchJSON<{
        success: boolean;
        result: unknown;
      }>(url);

      if (!data.success) {
        return null;
      }

      return this.parseResource(data.result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Search the datastore (tabular data) for a resource
   */
  async datastoreSearch(params: DataGovAUDatastoreParams): Promise<DataGovAUDatastoreResult | null> {
    const queryParams: Record<string, string> = {
      resource_id: params.resourceId,
    };

    if (params.query) {
      queryParams.q = params.query;
    }

    if (params.filters) {
      queryParams.filters = JSON.stringify(params.filters);
    }

    if (params.limit) {
      queryParams.limit = params.limit.toString();
    }

    if (params.offset) {
      queryParams.offset = params.offset.toString();
    }

    const url = this.buildUrl('/datastore_search', queryParams);

    try {
      const data = await this.fetchJSON<{
        success: boolean;
        result: {
          resource_id: string;
          fields: Array<{ id: string; type: string }>;
          records: Record<string, unknown>[];
          total: number;
        };
      }>(url);

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
      if (error instanceof Error && error.message.includes('404')) {
        return null; // Datastore not enabled for this resource
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
    const queryParams: Record<string, string> = {
      all_fields: allFields.toString(),
    };
    if (limit) {
      queryParams.limit = limit.toString();
    }

    const url = this.buildUrl('/organization_list', queryParams);
    const data = await this.fetchJSON<{
      success: boolean;
      result: unknown[];
    }>(url);

    if (!allFields) {
      // Just names returned
      return (data.result ?? []).map((name) => ({
        id: String(name),
        name: String(name),
        title: String(name),
        packageCount: 0,
      }));
    }

    return (data.result ?? []).map(org => this.parseOrganization(org));
  }

  /**
   * Get organization details
   */
  async getOrganization(idOrName: string, includeDatasets = false): Promise<DataGovAUOrganization | null> {
    const url = this.buildUrl('/organization_show', {
      id: idOrName,
      include_datasets: includeDatasets.toString(),
    });

    try {
      const data = await this.fetchJSON<{
        success: boolean;
        result: unknown;
      }>(url);

      if (!data.success) {
        return null;
      }

      return this.parseOrganization(data.result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
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
    const url = this.buildUrl('/group_list', {
      all_fields: allFields.toString(),
    });

    const data = await this.fetchJSON<{
      success: boolean;
      result: unknown[];
    }>(url);

    if (!allFields) {
      return (data.result ?? []).map((name) => ({
        id: String(name),
        name: String(name),
        title: String(name),
        packageCount: 0,
      }));
    }

    return (data.result ?? []).map(g => this.parseGroup(g));
  }

  /**
   * Get group details
   */
  async getGroup(idOrName: string, includeDatasets = false): Promise<DataGovAUGroup | null> {
    const url = this.buildUrl('/group_show', {
      id: idOrName,
      include_datasets: includeDatasets.toString(),
    });

    try {
      const data = await this.fetchJSON<{
        success: boolean;
        result: unknown;
      }>(url);

      if (!data.success) {
        return null;
      }

      return this.parseGroup(data.result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
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
    const queryParams: Record<string, string> = {};
    if (query) {
      queryParams.query = query;
    }

    const url = this.buildUrl('/tag_list', queryParams);
    const data = await this.fetchJSON<{
      success: boolean;
      result: string[];
    }>(url);

    return data.result ?? [];
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private parseDataset(doc: unknown): DataGovAUDataset {
    const d = doc as Record<string, unknown>;
    const org = d.organization as Record<string, unknown> | undefined;
    const resources = (d.resources ?? []) as unknown[];
    const tags = (d.tags ?? []) as Array<string | { name: string }>;

    return {
      id: String(d.id ?? ''),
      name: String(d.name ?? ''),
      title: String(d.title ?? 'Untitled'),
      notes: d.notes ? String(d.notes) : undefined,
      organization: org ? {
        name: String(org.name ?? ''),
        title: String(org.title ?? ''),
        description: org.description ? String(org.description) : undefined,
      } : undefined,
      resources: resources.map((r) => this.parseResource(r)),
      tags: tags.map((t) => typeof t === 'string' ? t : t.name),
      metadataCreated: String(d.metadata_created ?? ''),
      metadataModified: String(d.metadata_modified ?? ''),
      licenseId: d.license_id ? String(d.license_id) : undefined,
      licenseTitle: d.license_title ? String(d.license_title) : undefined,
      author: d.author ? String(d.author) : undefined,
      maintainer: d.maintainer ? String(d.maintainer) : undefined,
      url: d.url ? String(d.url) : undefined,
    };
  }

  private parseResource(doc: unknown): DataGovAUResource {
    const d = doc as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      name: String(d.name ?? 'Unnamed'),
      description: d.description ? String(d.description) : undefined,
      format: String(d.format ?? 'Unknown'),
      url: String(d.url ?? ''),
      size: typeof d.size === 'number' ? d.size : undefined,
      lastModified: d.last_modified ? String(d.last_modified) : undefined,
      datastoreActive: !!d.datastore_active,
    };
  }

  private parseOrganization(doc: unknown): DataGovAUOrganization {
    const d = doc as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      name: String(d.name ?? ''),
      title: String(d.title ?? ''),
      description: d.description ? String(d.description) : undefined,
      packageCount: typeof d.package_count === 'number' ? d.package_count : 0,
      imageUrl: d.image_url ? String(d.image_url) : undefined,
      created: d.created ? String(d.created) : undefined,
    };
  }

  private parseGroup(doc: unknown): DataGovAUGroup {
    const d = doc as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      name: String(d.name ?? ''),
      title: String(d.title ?? ''),
      description: d.description ? String(d.description) : undefined,
      packageCount: typeof d.package_count === 'number' ? d.package_count : 0,
      imageUrl: d.image_url ? String(d.image_url) : undefined,
    };
  }
}

// Export singleton instance
export const dataGovAUClient = new DataGovAUClient();
