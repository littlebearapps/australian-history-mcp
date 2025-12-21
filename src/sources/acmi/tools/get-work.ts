/**
 * ACMI Get Work Tool - Get detailed work information by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { acmiClient } from '../client.js';

export const acmiGetWorkTool: SourceTool = {
  schema: {
    name: 'acmi_get_work',
    description: 'Get detailed information about an ACMI collection work by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'number',
          description: 'Work ID (from search results)',
        },
      },
      required: ['id'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { id?: number };

    if (!input.id) {
      return errorResponse('id is required');
    }

    try {
      const work = await acmiClient.getWork(input.id);

      if (!work) {
        return errorResponse(`Work with ID ${input.id} not found`);
      }

      return successResponse({
        source: 'acmi',
        work: {
          id: work.id,
          acmiId: work.acmi_id,
          title: work.title,
          titleAnnotation: work.title_annotation,
          type: work.type,
          recordType: work.record_type,
          slug: work.slug,
          creatorCredit: work.creator_credit,
          creditLine: work.credit_line,
          headlineCredit: work.headline_credit,
          description: work.description,
          briefDescription: work.brief_description,
          materialDescription: work.material_description,
          // Production info
          productionDates: work.production_dates,
          productionPlaces: work.production_places?.map((p) => p.name),
          firstProductionDate: work.first_production_date,
          // Status
          isOnDisplay: work.is_on_display,
          lastOnDisplayPlace: work.last_on_display_place,
          lastOnDisplayDate: work.last_on_display_date,
          isIndigenousContext: work.is_context_indigenous,
          isPublicDomain: work.public_domain,
          isCommissioned: work.commissioned,
          // Creators
          primaryCreators: work.creators_primary?.map((c) => ({
            id: c.creator_id,
            name: c.name,
            role: c.role,
            wikidataId: c.creator_wikidata_id,
          })),
          otherCreators: work.creators_other?.map((c) => ({
            id: c.creator_id,
            name: c.name,
            role: c.role,
            wikidataId: c.creator_wikidata_id,
          })),
          // Details
          details: work.details?.map((d) => ({
            label: d.label,
            values: d.display_values,
          })),
          // Holdings
          holdings: work.holdings?.map((h) => ({
            name: h.name,
            identifier: h.identifier,
            description: h.description,
          })),
          // Video
          videoLinks: work.video_links?.map((v) => ({
            title: v.title,
            uri: v.uri,
          })),
          // Source
          source: work.source?.name,
          sourceIdentifier: work.source_identifier,
          // Media note
          mediaNote: work.media_note,
          // Web URL
          webUrl: `https://www.acmi.net.au/works/${work.id}--${work.slug}/`,
          apiUrl: `https://api.acmi.net.au/works/${work.id}/`,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
