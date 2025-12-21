/**
 * Museums Victoria Record Tools - Get individual records by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { museumsVictoriaClient } from '../client.js';

/**
 * Get an article by ID
 */
export const museumsvicGetArticleTool: SourceTool = {
  schema: {
    name: 'museumsvic_get_article',
    description: 'Get an educational article by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The article ID (from search results)',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id: string };

    try {
      const article = await museumsVictoriaClient.getArticle(input.id);

      if (!article) {
        return errorResponse(`Article "${input.id}" not found`);
      }

      return successResponse({
        source: 'museumsvic',
        article: {
          id: article.id,
          title: article.displayTitle,
          contentSummary: article.contentSummary,
          content: article.content,
          keywords: article.keywords,
          media: article.media?.map(m => ({
            id: m.id,
            type: m.type,
            caption: m.caption,
            thumbnailUrl: m.small?.uri,
            imageUrl: m.large?.uri ?? m.medium?.uri,
            licence: m.licence?.shortName,
          })),
          dateModified: article.dateModified,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Get an item (object) by ID
 */
export const museumsvicGetItemTool: SourceTool = {
  schema: {
    name: 'museumsvic_get_item',
    description: 'Get a museum object (photograph, artefact, technology) by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The item ID (from search results)',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id: string };

    try {
      const item = await museumsVictoriaClient.getItem(input.id);

      if (!item) {
        return errorResponse(`Item "${input.id}" not found`);
      }

      return successResponse({
        source: 'museumsvic',
        item: {
          id: item.id,
          title: item.displayTitle,
          registrationNumber: item.registrationNumber,
          objectName: item.objectName,
          objectSummary: item.objectSummary,
          physicalDescription: item.physicalDescription,
          inscription: item.inscription,
          associations: item.associations,
          category: item.category,
          discipline: item.discipline,
          type: item.type,
          collectionNames: item.collectionNames,
          licence: item.licence,
          media: item.media?.map(m => ({
            id: m.id,
            type: m.type,
            caption: m.caption,
            thumbnailUrl: m.small?.uri,
            imageUrl: m.large?.uri ?? m.medium?.uri,
            licence: m.licence?.shortName,
          })),
          dateModified: item.dateModified,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Get a species by ID
 */
export const museumsvicGetSpeciesTool: SourceTool = {
  schema: {
    name: 'museumsvic_get_species',
    description: 'Get species info (taxonomy, biology, habitat, distribution) by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The species ID (from search results)',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id: string };

    try {
      const species = await museumsVictoriaClient.getSpecies(input.id);

      if (!species) {
        return errorResponse(`Species "${input.id}" not found`);
      }

      return successResponse({
        source: 'museumsvic',
        species: {
          id: species.id,
          title: species.displayTitle,
          taxonomy: species.taxonomy,
          overview: species.overview,
          biology: species.biology,
          habitat: species.habitat,
          distribution: species.distribution,
          diet: species.diet,
          localBiodiversity: species.localBiodiversity,
          media: species.media?.map(m => ({
            id: m.id,
            type: m.type,
            caption: m.caption,
            thumbnailUrl: m.small?.uri,
            imageUrl: m.large?.uri ?? m.medium?.uri,
            licence: m.licence?.shortName,
          })),
          dateModified: species.dateModified,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Get a specimen by ID
 */
export const museumsvicGetSpecimenTool: SourceTool = {
  schema: {
    name: 'museumsvic_get_specimen',
    description: 'Get a natural science specimen with taxonomy and collection info.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The specimen ID (from search results)',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id: string };

    try {
      const specimen = await museumsVictoriaClient.getSpecimen(input.id);

      if (!specimen) {
        return errorResponse(`Specimen "${input.id}" not found`);
      }

      return successResponse({
        source: 'museumsvic',
        specimen: {
          id: specimen.id,
          title: specimen.displayTitle,
          registrationNumber: specimen.registrationNumber,
          objectSummary: specimen.objectSummary,
          category: specimen.category,
          discipline: specimen.discipline,
          type: specimen.type,
          collectionNames: specimen.collectionNames,
          taxonomy: specimen.taxonomy,
          collectionEvent: specimen.collectionEvent,
          storageLocation: specimen.storageLocation,
          licence: specimen.licence,
          media: specimen.media?.map(m => ({
            id: m.id,
            type: m.type,
            caption: m.caption,
            thumbnailUrl: m.small?.uri,
            imageUrl: m.large?.uri ?? m.medium?.uri,
            licence: m.licence?.shortName,
          })),
          dateModified: specimen.dateModified,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
