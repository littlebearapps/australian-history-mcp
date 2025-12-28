/**
 * PM Transcripts Indexer
 *
 * SEARCH-018: Indexing logic for building the FTS5 search index
 *
 * Fetches transcripts from the PM Transcripts API and indexes them
 * into the local SQLite database for fast full-text search.
 */

import { pmTranscriptsClient } from '../client.js';
import { PMTranscriptsStore, pmTranscriptsStore } from './sqlite-store.js';
import type { BuildOptions, BuildProgress, StoredTranscript } from './types.js';
import type { PMTranscript } from '../types.js';

// Approximate ID ranges for different Prime Ministers
// Used for estimation - actual IDs may vary
const PM_ID_RANGES: Record<string, { start: number; end: number }> = {
  'John Curtin': { start: 1, end: 500 },
  'Ben Chifley': { start: 500, end: 1000 },
  'Robert Menzies': { start: 1000, end: 4000 },
  'Harold Holt': { start: 4000, end: 4500 },
  'John McEwen': { start: 4500, end: 4600 },
  'John Gorton': { start: 4600, end: 5000 },
  'William McMahon': { start: 5000, end: 5500 },
  'Gough Whitlam': { start: 5500, end: 7000 },
  'Malcolm Fraser': { start: 7000, end: 9000 },
  'Bob Hawke': { start: 9000, end: 13000 },
  'Paul Keating': { start: 13000, end: 15000 },
  'John Howard': { start: 15000, end: 22000 },
  'Kevin Rudd': { start: 22000, end: 24000 },
  'Julia Gillard': { start: 24000, end: 26000 },
  'Tony Abbott': { start: 26000, end: 28000 },
  'Malcolm Turnbull': { start: 28000, end: 30000 },
  'Scott Morrison': { start: 30000, end: 35000 },
  'Anthony Albanese': { start: 35000, end: 40000 },
};

// Highest known transcript ID (approximate)
const MAX_KNOWN_ID = 40000;

/**
 * Convert PMTranscript to StoredTranscript format
 */
function toStoredTranscript(t: PMTranscript): StoredTranscript {
  // Parse release date from DD/MM/YYYY to YYYY-MM-DD
  let releaseDateIso = '';
  const dateMatch = t.releaseDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    releaseDateIso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return {
    transcriptId: t.transcriptId,
    title: t.title,
    primeMinister: t.primeMinister,
    releaseType: t.releaseType,
    releaseDateIso,
    subjects: t.subjects.join(', '),
    content: t.content,
    documentUrl: t.documentUrl,
    contentHash: PMTranscriptsStore.contentHash(t.content),
  };
}

/**
 * Build the PM Transcripts search index
 */
export async function buildIndex(options: BuildOptions): Promise<BuildProgress> {
  const { mode, idRange, onProgress, batchSize = 10 } = options;

  const store = pmTranscriptsStore;

  try {
    store.open();

    // Handle rebuild mode
    if (mode === 'rebuild') {
      store.dropAllTables();
      store.close();
      store.open(); // Reinitialize schema
    }

    // Determine ID range
    let startId = idRange?.start ?? 1;
    let endId = idRange?.end ?? MAX_KNOWN_ID;

    // For update mode, start from the highest indexed ID
    if (mode === 'update') {
      const maxIndexed = store.getMaxTranscriptId();
      if (maxIndexed > 0) {
        startId = maxIndexed + 1;
      }
    }

    const total = endId - startId + 1;
    let processed = 0;
    let indexed = 0;
    let skipped = 0;
    const startTime = Date.now();

    // Report initial progress
    if (onProgress) {
      onProgress({
        phase: 'fetching',
        currentId: startId,
        total,
        processed: 0,
        indexed: 0,
        skipped: 0,
      });
    }

    // Process in batches
    const batch: StoredTranscript[] = [];

    for (let id = startId; id <= endId; id++) {
      try {
        const transcript = await pmTranscriptsClient.getTranscript(id);

        if (transcript) {
          const stored = toStoredTranscript(transcript);

          // Check if already indexed with same content (for update mode)
          if (mode === 'update' && store.isIndexed(stored.transcriptId, stored.contentHash)) {
            skipped++;
          } else {
            batch.push(stored);
            indexed++;
          }
        } else {
          skipped++;
        }

        processed++;

        // Batch insert
        if (batch.length >= batchSize) {
          store.indexTranscriptBatch(batch);
          batch.length = 0;
        }

        // Report progress periodically
        if (onProgress && processed % 10 === 0) {
          const elapsed = (Date.now() - startTime) / 1000;
          const rate = processed / elapsed;
          const remaining = total - processed;
          const estimatedSecondsRemaining = remaining / rate;

          onProgress({
            phase: 'indexing',
            currentId: id,
            total,
            processed,
            indexed,
            skipped,
            estimatedSecondsRemaining: Math.round(estimatedSecondsRemaining),
          });
        }

        // Small delay to be respectful to the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch {
        skipped++;
        processed++;
      }
    }

    // Insert remaining batch
    if (batch.length > 0) {
      store.indexTranscriptBatch(batch);
    }

    // Optimize the index
    if (onProgress) {
      onProgress({
        phase: 'optimizing',
        total,
        processed,
        indexed,
        skipped,
      });
    }

    store.optimize();

    const result: BuildProgress = {
      phase: 'complete',
      total,
      processed,
      indexed,
      skipped,
    };

    if (onProgress) {
      onProgress(result);
    }

    return result;
  } catch (error) {
    const errorResult: BuildProgress = {
      phase: 'error',
      error: error instanceof Error ? error.message : String(error),
    };

    if (onProgress) {
      onProgress(errorResult);
    }

    return errorResult;
  } finally {
    store.close();
  }
}

/**
 * Get PM ID range estimate
 */
export function getPmIdRange(primeMinister: string): { start: number; end: number } | null {
  // Find matching PM (case-insensitive partial match)
  const pmLower = primeMinister.toLowerCase();
  for (const [pm, range] of Object.entries(PM_ID_RANGES)) {
    if (pm.toLowerCase().includes(pmLower)) {
      return range;
    }
  }
  return null;
}

/**
 * Get all known PM names
 */
export function getKnownPrimeMinisters(): string[] {
  return Object.keys(PM_ID_RANGES);
}
