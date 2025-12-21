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

export const pmTranscriptsSource = defineSource({
  name: 'pm-transcripts',
  displayName: 'Prime Ministerial Transcripts',
  description:
    'Australian Prime Ministerial transcripts including speeches, media releases, and interviews.',
  requiresAuth: false,
  tools: [pmTranscriptsGetTranscriptTool, pmTranscriptsHarvestTool],
});

// Re-export types and client for external use
export * from './types.js';
export { pmTranscriptsClient } from './client.js';
