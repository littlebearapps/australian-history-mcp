/**
 * Prime Ministerial Transcripts Source Module
 *
 * Provides access to transcripts of Australian Prime Ministers' speeches,
 * media releases, and interviews from 1945 onwards.
 * No API key required.
 *
 * API Documentation: https://pmtranscripts.pmc.gov.au/developers
 */

import { defineSource } from '../../core/base-source.js';
import { pmTranscriptsGetTranscriptTool } from './tools/get-transcript.js';
import { pmTranscriptsHarvestTool } from './tools/harvest.js';
// SEARCH-018: FTS5 full-text search tools
import { pmTranscriptsSearchTool } from './tools/search-fulltext.js';
import { pmTranscriptsBuildIndexTool } from './tools/build-index.js';
import { pmTranscriptsIndexStatsTool } from './tools/index-stats.js';

export const pmTranscriptsSource = defineSource({
  name: 'pm-transcripts',
  displayName: 'Prime Ministerial Transcripts',
  description:
    'Australian Prime Ministerial transcripts including speeches, media releases, and interviews.',
  requiresAuth: false,
  tools: [
    pmTranscriptsGetTranscriptTool,
    pmTranscriptsHarvestTool,
    // SEARCH-018: FTS5 full-text search tools
    pmTranscriptsSearchTool,
    pmTranscriptsBuildIndexTool,
    pmTranscriptsIndexStatsTool,
  ],
});

// Re-export types and client for external use
export * from './types.js';
export { pmTranscriptsClient } from './client.js';
