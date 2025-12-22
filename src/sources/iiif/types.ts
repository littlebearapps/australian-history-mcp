/**
 * IIIF (International Image Interoperability Framework) Type Definitions
 *
 * Supports IIIF Presentation API v2.x manifests and Image API v2.x
 */

// ============================================================================
// IIIF Presentation API Types (v2.x)
// ============================================================================

export interface IIIFManifest {
  '@context': string;
  '@id': string;
  '@type': 'sc:Manifest';
  label: string;
  description?: string;
  attribution?: string;
  license?: string;
  logo?: string;
  thumbnail?: string | IIIFThumbnail;
  metadata?: IIIFMetadata[];
  sequences: IIIFSequence[];
  structures?: IIIFRange[];
}

export interface IIIFThumbnail {
  '@id': string;
  '@type'?: string;
  service?: IIIFImageService;
}

export interface IIIFMetadata {
  label: string;
  value: string | string[];
}

export interface IIIFSequence {
  '@id': string;
  '@type': 'sc:Sequence';
  label?: string;
  viewingDirection?: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
  viewingHint?: string;
  canvases: IIIFCanvas[];
}

export interface IIIFCanvas {
  '@id': string;
  '@type': 'sc:Canvas';
  label: string;
  height: number;
  width: number;
  thumbnail?: string | IIIFThumbnail;
  images: IIIFAnnotation[];
}

export interface IIIFAnnotation {
  '@id': string;
  '@type': 'oa:Annotation';
  motivation: string;
  resource: IIIFResource;
  on: string;
}

export interface IIIFResource {
  '@id': string;
  '@type': string;
  format: string;
  height: number;
  width: number;
  service?: IIIFImageService;
}

export interface IIIFImageService {
  '@context': string;
  '@id': string;
  profile: string;
}

export interface IIIFRange {
  '@id': string;
  '@type': 'sc:Range';
  label: string;
  canvases?: string[];
  ranges?: string[];
}

// ============================================================================
// IIIF Image API Types (v2.x)
// ============================================================================

export type IIIFRegion = 'full' | 'square' | `${number},${number},${number},${number}` | `pct:${number},${number},${number},${number}`;
export type IIIFSize = 'full' | 'max' | `${number},` | `,${number}` | `pct:${number}` | `${number},${number}` | `!${number},${number}`;
export type IIIFRotation = '0' | '90' | '180' | '270' | `!${number}` | `${number}`;
export type IIIFQuality = 'default' | 'color' | 'gray' | 'bitonal';
export type IIIFFormat = 'jpg' | 'png' | 'gif' | 'webp' | 'tif';

export interface IIIFImageParams {
  baseUrl: string;       // The @id from the image service
  region?: IIIFRegion;   // default: 'full'
  size?: IIIFSize;       // default: 'max'
  rotation?: IIIFRotation; // default: '0'
  quality?: IIIFQuality;  // default: 'default'
  format?: IIIFFormat;    // default: 'jpg'
}

// ============================================================================
// Parsed/Simplified Types for MCP responses
// ============================================================================

export interface ParsedManifest {
  id: string;
  label: string;
  description?: string;
  attribution?: string;
  license?: string;
  thumbnailUrl?: string;
  metadata: Record<string, string | string[]>;
  totalCanvases: number;
  canvases: ParsedCanvas[];
}

export interface ParsedCanvas {
  id: string;
  label: string;
  width: number;
  height: number;
  thumbnailUrl?: string;
  imageServiceUrl?: string;
  imageUrl?: string;
}

// ============================================================================
// Known IIIF Providers (for documentation)
// ============================================================================

export const KNOWN_IIIF_PROVIDERS = {
  slv: {
    name: 'State Library Victoria',
    manifestPattern: 'https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/{id}/manifest',
    imagePattern: 'https://rosetta.slv.vic.gov.au:2083/iiif/2/{id}/{region}/{size}/{rotation}/{quality}.{format}',
  },
  nla: {
    name: 'National Library of Australia',
    manifestPattern: 'https://nla.gov.au/nla.obj-{id}/manifest',
    imagePattern: 'https://nla.gov.au/nla.obj-{id}/image',
  },
  bodleian: {
    name: 'Bodleian Libraries, Oxford',
    manifestPattern: 'https://iiif.bodleian.ox.ac.uk/iiif/manifest/{id}.json',
    imagePattern: 'https://iiif.bodleian.ox.ac.uk/iiif/image/{id}',
  },
} as const;
