/**
 * IIIF API Client
 *
 * Handles fetching and parsing IIIF Presentation API manifests
 * and constructing IIIF Image API URLs.
 *
 * Works with any IIIF-compliant institution including:
 * - State Library Victoria (rosetta.slv.vic.gov.au)
 * - National Library of Australia (nla.gov.au)
 * - Bodleian Libraries (iiif.bodleian.ox.ac.uk)
 * - And many more worldwide
 */

import { BaseClient } from '../../core/base-client.js';
import type {
  IIIFManifest,
  IIIFImageParams,
  ParsedManifest,
  ParsedCanvas,
  IIIFCanvas,
  IIIFThumbnail,
} from './types.js';

export class IIIFClient extends BaseClient {
  constructor() {
    super('', { userAgent: 'australian-history-mcp/0.6.0' });
  }

  /**
   * Fetch and parse an IIIF manifest from any URL
   */
  async getManifest(manifestUrl: string): Promise<ParsedManifest> {
    const data = await this.fetchJSON(manifestUrl, {
      headers: {
        Accept: 'application/json, application/ld+json',
      },
    });

    return this.parseManifest(data as IIIFManifest);
  }

  /**
   * Construct a IIIF Image API URL
   */
  constructImageUrl(params: IIIFImageParams): string {
    const {
      baseUrl,
      region = 'full',
      size = 'max',
      rotation = '0',
      quality = 'default',
      format = 'jpg',
    } = params;

    // Remove trailing slash if present
    const base = baseUrl.replace(/\/$/, '');

    return `${base}/${region}/${size}/${rotation}/${quality}.${format}`;
  }

  /**
   * Get info.json for an IIIF image service
   */
  async getImageInfo(imageServiceUrl: string): Promise<unknown> {
    const url = imageServiceUrl.replace(/\/$/, '') + '/info.json';
    return this.fetchJSON(url, {
      headers: {
        Accept: 'application/json, application/ld+json',
      },
    });
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private parseManifest(manifest: IIIFManifest): ParsedManifest {
    const canvases: ParsedCanvas[] = [];

    // Extract canvases from all sequences
    for (const sequence of manifest.sequences ?? []) {
      for (const canvas of sequence.canvases ?? []) {
        canvases.push(this.parseCanvas(canvas));
      }
    }

    return {
      id: manifest['@id'],
      label: this.extractLabel(manifest.label),
      description: manifest.description ? this.extractLabel(manifest.description) : undefined,
      attribution: manifest.attribution,
      license: manifest.license,
      thumbnailUrl: this.extractThumbnailUrl(manifest.thumbnail),
      metadata: this.parseMetadata(manifest.metadata ?? []),
      totalCanvases: canvases.length,
      canvases,
    };
  }

  private parseCanvas(canvas: IIIFCanvas): ParsedCanvas {
    const image = canvas.images?.[0];
    const resource = image?.resource;
    const service = resource?.service;

    return {
      id: canvas['@id'],
      label: this.extractLabel(canvas.label),
      width: canvas.width,
      height: canvas.height,
      thumbnailUrl: this.extractThumbnailUrl(canvas.thumbnail),
      imageServiceUrl: service?.['@id'],
      imageUrl: resource?.['@id'],
    };
  }

  private extractLabel(label: unknown): string {
    if (typeof label === 'string') return label;
    if (Array.isArray(label)) {
      // IIIF v3 style: [{ '@value': 'text', '@language': 'en' }]
      const first = label[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && '@value' in first) {
        return String(first['@value']);
      }
    }
    if (label && typeof label === 'object' && '@value' in (label as Record<string, unknown>)) {
      return String((label as Record<string, unknown>)['@value']);
    }
    return '';
  }

  private extractThumbnailUrl(thumbnail: string | IIIFThumbnail | undefined): string | undefined {
    if (!thumbnail) return undefined;
    if (typeof thumbnail === 'string') return thumbnail;
    return thumbnail['@id'];
  }

  private parseMetadata(metadata: Array<{ label: string | unknown; value: string | string[] | unknown }>): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};

    for (const item of metadata) {
      const label = this.extractLabel(item.label);
      const value = this.extractMetadataValue(item.value);
      if (label && value) {
        result[label] = value;
      }
    }

    return result;
  }

  private extractMetadataValue(value: unknown): string | string[] | undefined {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      const extracted = value.map((v) => {
        if (typeof v === 'string') return v;
        if (v && typeof v === 'object' && '@value' in v) return String(v['@value']);
        return String(v);
      });
      return extracted.length === 1 ? extracted[0] : extracted;
    }
    if (value && typeof value === 'object' && '@value' in (value as Record<string, unknown>)) {
      return String((value as Record<string, unknown>)['@value']);
    }
    return undefined;
  }
}

// Export singleton instance
export const iiifClient = new IIIFClient();
