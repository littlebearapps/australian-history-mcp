/**
 * PM Transcripts Harvest Tool - Bulk download transcripts
 *
 * When filtering by PM name, uses sitemap for faster lookups instead of
 * sequential scanning. This reduces harvest time from minutes to seconds.
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { pmTranscriptsClient } from '../client.js';
import type { PMTranscript } from '../types.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const pmTranscriptsHarvestTool: SourceTool = {
  schema: {
    name: 'pm_transcripts_harvest',
    description: 'Bulk download PM transcripts with filters.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        primeMinister: { type: 'string', description: PARAMS.PRIME_MINISTER },
        dateFrom: { type: 'string', description: PARAMS.DATE_FROM },
        dateTo: { type: 'string', description: PARAMS.DATE_TO },
        startFrom: { type: 'number', description: PARAMS.START_FROM, default: 1 },
        maxRecords: { type: 'number', description: PARAMS.MAX_RECORDS, default: 100 },
        useSitemap: { type: 'boolean', description: PARAMS.USE_SITEMAP, default: true },
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
      useSitemap?: boolean;
    };

    try {
      const startFrom = input.startFrom ?? 1;
      const maxRecords = Math.min(input.maxRecords ?? 100, 500);
      const useSitemap = input.useSitemap !== false; // Default true

      const transcripts: PMTranscript[] = [];

      // Use sitemap-based harvesting when PM filter is provided (much faster)
      if (input.primeMinister && useSitemap) {
        // Fetch sitemap once - contains all ~26,000 transcript IDs
        const allRefs = await pmTranscriptsClient.getSitemapIds();

        // Filter to IDs >= startFrom and sort
        const candidateIds = allRefs
          .map((ref) => ref.id)
          .filter((id) => id >= startFrom)
          .sort((a, b) => a - b);

        let lastId = startFrom;

        // Iterate through candidate IDs (much faster than sequential scan)
        for (const id of candidateIds) {
          if (transcripts.length >= maxRecords) break;

          try {
            const transcript = await pmTranscriptsClient.getTranscript(id);
            lastId = id;

            if (transcript) {
              // Apply PM filter
              const pmFilter = input.primeMinister.toLowerCase();
              if (!transcript.primeMinister.toLowerCase().includes(pmFilter)) {
                continue;
              }

              // Apply date filters
              if (input.dateFrom || input.dateTo) {
                const releaseDate = parseReleaseDate(transcript.releaseDate);
                if (releaseDate) {
                  if (input.dateFrom && releaseDate < input.dateFrom) continue;
                  if (input.dateTo && releaseDate > input.dateTo) continue;
                }
              }

              transcripts.push(transcript);
            }

            // Small delay to be respectful to the server
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch {
            // Skip failed transcripts
            continue;
          }
        }

        return successResponse({
          source: 'pm-transcripts',
          mode: 'sitemap',
          harvested: transcripts.length,
          startedAt: startFrom,
          endedAt: lastId,
          totalIdsInSitemap: allRefs.length,
          hasMore: transcripts.length >= maxRecords,
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
      }

      // Sequential harvesting (original behavior for non-PM-filtered harvests)
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
