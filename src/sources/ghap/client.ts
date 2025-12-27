/**
 * GHAP (Gazetteer of Historical Australian Placenames) API Client
 *
 * The TLCMap WSAPI provides access to historical placenames from the Australian
 * National Placename Survey (ANPS) and community-contributed layers.
 *
 * API Documentation: https://docs.tlcmap.org/help/developers
 * No API key required.
 */

import { BaseClient } from '../../core/base-client.js';
import type {
  GHAPSearchParams,
  GHAPSearchResult,
  GHAPPlace,
  GHAPLayer,
  GHAPLayerResult,
} from './types.js';

const TLCMAP_BASE = 'https://tlcmap.org';

export class GHAPClient extends BaseClient {
  constructor() {
    super(TLCMAP_BASE, { userAgent: 'australian-history-mcp/0.6.1' });
  }

  /**
   * Search the GHAP gazetteer for placenames
   */
  async search(params: GHAPSearchParams): Promise<GHAPSearchResult> {
    const queryParams: Record<string, string | number | boolean> = {
      searchausgaz: 'on', // Enable Australian Gazetteer
      format: 'json',
      paging: params.limit ?? 20,
    };

    // Add name search (fuzzy, contains, or exact)
    if (params.fuzzyname) {
      queryParams.fuzzyname = params.fuzzyname;
    } else if (params.containsname) {
      queryParams.containsname = params.containsname;
    } else if (params.name) {
      queryParams.name = params.name;
    }

    // Add filters
    if (params.state) {
      queryParams.state = params.state;
    }
    if (params.lga) {
      queryParams.lga = params.lga;
    }
    if (params.bbox) {
      queryParams.bbox = params.bbox;
    }

    // Note: searchpublicdatasets=on causes max paging redirect errors on TLCMap
    // The Australian National Gazetteer (searchausgaz=on) is sufficient for most queries

    const url = this.buildUrl('/places', queryParams);
    const data = await this.fetchJSON<GeoJSONFeatureCollection>(url);

    return this.parseSearchResponse(data);
  }

  /**
   * Get a specific place by its TLCMap ID
   */
  async getPlace(id: string): Promise<GHAPPlace | null> {
    const url = this.buildUrl('/search', {
      id,
      format: 'json',
    });

    try {
      const data = await this.fetchJSON<GeoJSONFeatureCollection>(url);
      const features = data.features ?? [];

      if (features.length === 0) {
        return null;
      }

      return this.parseFeature(features[0]);
    } catch {
      return null;
    }
  }

  /**
   * List all available data layers
   */
  async listLayers(): Promise<GHAPLayer[]> {
    const url = this.buildUrl('/layers/json');
    const data = await this.fetchJSON<LayerListResponse[]>(url);

    return data.map((layer) => ({
      id: layer.layerid,
      name: layer.name ?? 'Untitled',
      description: layer.description ?? undefined,
      creator: layer.creator ?? undefined,
      url: layer.ghap_url ?? `${TLCMAP_BASE}/publicdatasets/${layer.layerid}`,
    }));
  }

  /**
   * Get places from a specific layer
   */
  async getLayer(layerId: number): Promise<GHAPLayerResult> {
    const url = this.buildUrl(`/layers/${layerId}/json`);
    const data = await this.fetchJSON<GeoJSONFeatureCollection>(url);

    const metadata = data.metadata ?? {};

    return {
      layer: {
        id: metadata.layerid ?? layerId,
        name: metadata.name ?? 'Untitled',
        description: metadata.description ?? undefined,
        url: metadata.ghap_url ?? `${TLCMAP_BASE}/publicdatasets/${layerId}`,
      },
      places: (data.features ?? []).map((f) => this.parseFeature(f)),
    };
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private parseSearchResponse(data: GeoJSONFeatureCollection): GHAPSearchResult {
    const features = data.features ?? [];

    return {
      totalResults: features.length,
      returned: features.length,
      places: features.map((f) => this.parseFeature(f)),
    };
  }

  private parseFeature(feature: GeoJSONFeature): GHAPPlace {
    const props = feature.properties ?? {};
    const coords = feature.geometry?.coordinates;

    const getString = (val: unknown): string | undefined => {
      return typeof val === 'string' ? val : undefined;
    };

    const id = getString(props.id) ?? '';
    const latStr = getString(props.latitude);
    const lonStr = getString(props.longitude);

    return {
      id,
      anpsId: getString(props.anps_id),
      name: getString(props.name) ?? getString(props.placename) ?? 'Unnamed',
      state: getString(props.state),
      lga: getString(props.lga),
      latitude: coords?.[1] ?? (latStr ? parseFloat(latStr) : undefined),
      longitude: coords?.[0] ?? (lonStr ? parseFloat(lonStr) : undefined),
      featureType: getString(props.feature_term),
      description: getString(props.description) ?? getString(props.Description),
      source: getString(props.source) ?? getString(props.original_data_source),
      dateRange: this.formatDateRange(getString(props['Start Date']), getString(props['End Date'])),
      url: getString(props.TLCMapLinkBack) ?? `${TLCMAP_BASE}/search?id=${id}`,
    };
  }

  private formatDateRange(start?: string, end?: string): string | undefined {
    if (!start && !end) return undefined;
    if (start === end) return start;
    if (start && end) return `${start} - ${end}`;
    return start ?? end;
  }
}

// =========================================================================
// GeoJSON Types (internal)
// =========================================================================

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  metadata?: {
    name?: string;
    description?: string;
    layerid?: number;
    ghap_url?: string;
    warning?: string;
    linkback?: string;
  };
  features?: GeoJSONFeature[];
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry?: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties?: Record<string, unknown>;
}

interface LayerListResponse {
  layerid: number;
  name?: string;
  description?: string;
  creator?: string;
  publisher?: string;
  ghap_url?: string;
  temporal_from?: string;
  temporal_to?: string;
}

// Export singleton instance
export const ghapClient = new GHAPClient();
