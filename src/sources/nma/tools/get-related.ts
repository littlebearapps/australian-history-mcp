/**
 * NMA Get Related Tool - Fetch related records for a museum object
 *
 * SEARCH-017: Related Records Discovery
 *
 * Returns related entities extracted from an object:
 * - collection: The collection this object belongs to
 * - places: Related spatial locations
 * - periods: Related temporal periods
 * - media: Related media items (images, etc.)
 * - otherObjects: Other objects in the same collection (searched)
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { nmaClient } from '../client.js';

interface RelatedPlace {
  id: string;
  title: string;
  role?: string;
  coordinates?: string;
}

interface RelatedPeriod {
  id?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
}

interface RelatedMedia {
  id: string;
  format?: string;
  identifier?: string;
  url: string;
}

interface RelatedCollection {
  id: string;
  title: string;
  url: string;
}

interface NMARelatedResult {
  objectId: string;
  objectTitle: string;
  totalRelated: number;
  collection: RelatedCollection | null;
  places: RelatedPlace[];
  periods: RelatedPeriod[];
  media: RelatedMedia[];
  otherObjectsInCollection: Array<{
    id: string;
    title: string;
    url: string;
  }>;
}

export const nmaGetRelatedTool: SourceTool = {
  schema: {
    name: 'nma_get_related',
    description: 'Get related records for an NMA object (collection, places, periods, media, other objects).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'NMA object ID',
        },
        includeCollectionObjects: {
          type: 'boolean',
          description: 'Search for other objects in the same collection (default: true)',
          default: true,
        },
        collectionLimit: {
          type: 'number',
          description: 'Maximum number of other collection objects to return (default: 5)',
          default: 5,
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const id = args.id as string;
    const includeCollectionObjects = args.includeCollectionObjects !== false;
    const collectionLimit = (args.collectionLimit as number) ?? 5;

    if (!id || typeof id !== 'string') {
      return errorResponse('Object ID is required');
    }

    try {
      const obj = await nmaClient.getObject(id);

      if (!obj) {
        return errorResponse(`Object not found: ${id}`);
      }

      // Extract collection
      const collection: RelatedCollection | null = obj.collection
        ? {
            id: obj.collection.id,
            title: obj.collection.title,
            url: `https://collectionsearch.nma.gov.au/collection/${obj.collection.id}`,
          }
        : null;

      // Extract places
      const places: RelatedPlace[] = (obj.spatial ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        role: p.roleName,
        coordinates: p.geo,
      }));

      // Extract periods
      const periods: RelatedPeriod[] = (obj.temporal ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        startDate: t.startDate,
        endDate: t.endDate,
      }));

      // Extract media
      const media: RelatedMedia[] = (obj.hasVersion ?? []).map((v) => ({
        id: v.id,
        format: v.format,
        identifier: v.identifier,
        url: `https://data.nma.gov.au/media/${v.id}`,
      }));

      // Search for other objects in the same collection
      let otherObjectsInCollection: Array<{ id: string; title: string; url: string }> = [];

      if (includeCollectionObjects && collection) {
        try {
          const collectionSearch = await nmaClient.searchObjects({
            collection: collection.id,
            limit: collectionLimit + 1, // Get one extra to exclude current object
          });

          otherObjectsInCollection = collectionSearch.data
            .filter((o) => o.id !== id) // Exclude current object
            .slice(0, collectionLimit)
            .map((o) => ({
              id: o.id,
              title: o.title,
              url: `https://collectionsearch.nma.gov.au/object/${o.id}`,
            }));
        } catch {
          // Collection search failed - continue without it
        }
      }

      const totalRelated =
        (collection ? 1 : 0) +
        places.length +
        periods.length +
        media.length +
        otherObjectsInCollection.length;

      const result: NMARelatedResult = {
        objectId: obj.id,
        objectTitle: obj.title,
        totalRelated,
        collection,
        places,
        periods,
        media,
        otherObjectsInCollection,
      };

      return successResponse({
        source: 'nma',
        ...result,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
