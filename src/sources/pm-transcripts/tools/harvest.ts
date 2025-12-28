/**
 * PM Transcripts Harvest Tool - Bulk download transcripts
 *
 * Note: The PM Transcripts API only supports lookup by transcript ID.
 * There is no search endpoint. The sitemap at /transcripts.xml is now
 * a batch process and no longer directly accessible.
 *
 * Harvesting uses sequential ID scanning with filters applied client-side.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { pmTranscriptsClient } from '../client.js';
import type { PMTranscript } from '../types.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const pmTranscriptsHarvestTool: SourceTool = {
  schema: {
    name: 'pm_transcripts_harvest',
    description: 'Bulk download PM transcripts with filters. Uses sequential ID scanning (no search API available).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        primeMinister: { type: 'string', description: PARAMS.PRIME_MINISTER },
        dateFrom: { type: 'string', description: PARAMS.DATE_FROM },
        dateTo: { type: 'string', description: PARAMS.DATE_TO },
        startFrom: { type: 'number', description: PARAMS.START_FROM, default: 1 },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
      },
      required: [],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      primeMinister?: string;
      dateFrom?: string;
      dateTo?: string;
      startFrom?: number;
      maxRecords?: number;
    };

    try {
      const startFrom = input.startFrom ?? 1;
      const maxRecords = Math.min(input.maxRecords ?? 100, 500);

      const transcripts: PMTranscript[] = [];

      // Sequential harvesting - the only method available since sitemap is broken
      let currentId = startFrom;
      let consecutiveNotFound = 0;
      const maxConsecutiveNotFound = 50; // Stop if 50 in a row not found (gap detection)

      while (transcripts.length < maxRecords && consecutiveNotFound < maxConsecutiveNotFound) {
        try {
          const transcript = await pmTranscriptsClient.getTranscript(currentId);

          if (transcript) {
            consecutiveNotFound = 0;

            // Apply filters
            let include = true;

            if (input.primeMinister) {
              const pmFilter = input.primeMinister.toLowerCase();
              if (!transcript.primeMinister.toLowerCase().includes(pmFilter)) {
                include = false;
              }
            }

            if (include && (input.dateFrom || input.dateTo)) {
              const releaseDate = parseReleaseDate(transcript.releaseDate);
              if (releaseDate) {
                if (input.dateFrom && releaseDate < input.dateFrom) {
                  include = false;
                }
                if (input.dateTo && releaseDate > input.dateTo) {
                  include = false;
                }
              }
            }

            if (include) {
              transcripts.push(transcript);
            }
          } else {
            consecutiveNotFound++;
          }
        } catch {
          consecutiveNotFound++;
        }

        currentId++;

        // Small delay to be respectful to the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const hasMore = consecutiveNotFound < maxConsecutiveNotFound;

      return successResponse({
        source: 'pm-transcripts',
        mode: 'sequential',
        harvested: transcripts.length,
        startedAt: startFrom,
        endedAt: currentId - 1,
        hasMore,
        nextId: hasMore ? currentId : null,
        filters: {
          primeMinister: input.primeMinister || null,
          dateFrom: input.dateFrom || null,
          dateTo: input.dateTo || null,
        },
        records: transcripts.map((t) => ({
          id: t.transcriptId,
          title: t.title,
          primeMinister: t.primeMinister,
          releaseDate: t.releaseDate,
          releaseType: t.releaseType,
          documentUrl: t.documentUrl,
          subjects: t.subjects,
          contentPreview: t.content.substring(0, 500),
          webUrl: `https://pmtranscripts.pmc.gov.au/release/transcript-${t.transcriptId}`,
        })),
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Parse release date from DD/MM/YYYY to YYYY-MM-DD
 */
function parseReleaseDate(dateStr: string): string | null {
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
