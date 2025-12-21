/**
 * Australian Centre for the Moving Image (ACMI) API Client
 *
 * Provides access to ACMI's collection of films, TV, videogames, and digital art.
 * No API key required.
 *
 * API Documentation: https://www.acmi.net.au/api
 */

import { BaseClient } from '../../core/base-client.js';
import type {
  ACMISearchParams,
  ACMIPaginatedResult,
  ACMIWork,
} from './types.js';

const ACMI_API_BASE = 'https://api.acmi.net.au';

export class ACMIClient extends BaseClient {
  constructor() {
    super(ACMI_API_BASE, { userAgent: 'australian-archives-mcp/0.4.0' });
  }

  // =========================================================================
  // Works
  // =========================================================================

  /**
   * Search for works using the search endpoint
   * Note: ACMI API requires no page param for page 1, use ?page=N for pages 2+
   */
  async searchWorks(params: ACMISearchParams): Promise<ACMIPaginatedResult<ACMIWork>> {
    const queryParams: Record<string, string> = {};

    if (params.query) {
      queryParams.query = params.query;
    }

    if (params.type) {
      queryParams.type = params.type;
    }

    if (params.year) {
      queryParams.year = params.year.toString();
    }

    // ACMI API quirk: page 1 should have no page param, pages 2+ need ?page=N
    if (params.page && params.page > 1) {
      queryParams.page = params.page.toString();
    }

    const url = this.buildUrl('/search/', queryParams);
    return this.fetchJSON<ACMIPaginatedResult<ACMIWork>>(url);
  }

  /**
   * List all works with pagination (for harvesting)
   * Note: ACMI API requires no page param for page 1, use ?page=N for pages 2+
   */
  async listWorks(page?: number): Promise<ACMIPaginatedResult<ACMIWork>> {
    const queryParams: Record<string, string> = {};

    // ACMI API quirk: page 1 should have no page param, pages 2+ need ?page=N
    if (page && page > 1) {
      queryParams.page = page.toString();
    }

    const url = this.buildUrl('/works/', queryParams);
    return this.fetchJSON<ACMIPaginatedResult<ACMIWork>>(url);
  }

  /**
   * Get a single work by ID
   */
  async getWork(id: number): Promise<ACMIWork | null> {
    const url = this.buildUrl(`/works/${id}/`, {});

    try {
      return await this.fetchJSON<ACMIWork>(url);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

}

// Export singleton instance
export const acmiClient = new ACMIClient();
