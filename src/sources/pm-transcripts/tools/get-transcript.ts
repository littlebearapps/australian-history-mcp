/**
 * PM Transcripts Get Transcript Tool - Get a transcript by ID
 */

import type { SourceTool } from '../../../core/base-source.js';
import { successResponse, errorResponse } from '../../../core/types.js';
import { pmTranscriptsClient } from '../client.js';
import { PARAMS } from '../../../core/param-descriptions.js';

export const pmTranscriptsGetTranscriptTool: SourceTool = {
  schema: {
    name: 'pm_transcripts_get_transcript',
    description: 'Get Prime Ministerial transcript by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: PARAMS.ID },
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
      const transcript = await pmTranscriptsClient.getTranscript(input.id);

      if (!transcript) {
        return errorResponse(`Transcript ${input.id} not found`);
      }

      return successResponse({
        source: 'pm-transcripts',
        transcript: {
          id: transcript.transcriptId,
          title: transcript.title,
          primeMinister: transcript.primeMinister,
          periodOfService: transcript.periodOfService,
          releaseDate: transcript.releaseDate,
          releaseType: transcript.releaseType,
          documentUrl: transcript.documentUrl,
          subjects: transcript.subjects,
          content: transcript.content,
          webUrl: `https://pmtranscripts.pmc.gov.au/release/transcript-${transcript.transcriptId}`,
        },
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
