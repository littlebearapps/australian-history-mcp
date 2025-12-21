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

export const pmTranscriptsHarvestTool: SourceTool = {
  schema: {
    name: 'pm_transcripts_harvest',
    description:
      'Bulk download Prime Ministerial transcripts. Fetches sequentially by ID with optional filters. ' +
      'When filtering by PM name, uses sitemap for faster lookups. ' +
      'PM era approximate ID ranges: Curtin ~1-2000, Menzies ~2000-4000, Hawke ~5000-8000, ' +
      'Keating ~8000-10000, Howard ~10000-18000, Rudd/Gillard ~18000-22000, Abbott+ ~22000+.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        primeMinister: {
          type: 'string',
          description: 'Filter by PM name (partial match, e.g., "Hawke", "Keating")',
        },
        dateFrom: {
          type: 'string',
          description: 'Filter from date (YYYY-MM-DD)',
        },
        dateTo: {
          type: 'string',
          description: 'Filter to date (YYYY-MM-DD)',
        },
        startFrom: {
          type: 'number',
          description:
            'Starting transcript ID (default: 1). For faster PM filtering, use approximate era: ' +
            'Hawke ~5000, Keating ~8000, Howard ~10000, Rudd ~18000, Abbott ~22000',
          default: 1,
        },
        maxRecords: {
          type: 'number',
          description: 'Maximum records to harvest (1-500, default: 100)',
          default: 100,
        },
        useSitemap: {
          type: 'boolean',
          description:
            'Use sitemap for faster PM-filtered harvesting (default: true when primeMinister filter used). ' +
            'Sitemap fetches all ~26,000 transcript IDs at once, then filters locally.',
          default: true,
        },
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
