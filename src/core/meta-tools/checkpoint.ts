/**
 * Checkpoint Meta-Tool
 *
 * Phase 3: Save and restore research checkpoints
 */

import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import {
  checkpointStore,
  isCompressedRecord,
} from '../compression/index.js';
import type { CompressedRecord } from '../compression/index.js';
import { sessionStore } from '../sessions/store.js';

export const checkpointMetaTool: SourceTool = {
  schema: {
    name: 'checkpoint',
    description:
      'Save and restore research checkpoints. Persists compressed records for later retrieval. Actions: save (create checkpoint), load (retrieve checkpoint), list (show checkpoints), delete (remove checkpoint).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          enum: ['save', 'load', 'list', 'delete'],
          description:
            'Action to perform: save (create), load (retrieve), list (show all), delete (remove)',
        },
        name: {
          type: 'string',
          description:
            'Checkpoint name for save action (letters, numbers, hyphens, underscores, max 64 chars)',
        },
        records: {
          type: 'array',
          items: { type: 'object' },
          description: 'Compressed records to save (for save action)',
        },
        fingerprints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional fingerprint IDs for tracking duplicates (for save action)',
        },
        coverage: {
          type: 'object',
          description: 'Optional source coverage state (for save action)',
        },
        id: {
          type: 'string',
          description: 'Checkpoint ID or name for load/delete actions',
        },
        limit: {
          type: 'number',
          description: 'Maximum checkpoints to list (default: 10, for list action)',
        },
        sessionId: {
          type: 'string',
          description: 'Filter by session ID (for list action)',
        },
      },
      required: ['action'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const action = args.action as string;

    if (!action || typeof action !== 'string') {
      return errorResponse('action is required');
    }

    try {
      switch (action) {
        case 'save':
          return handleSave(args);
        case 'load':
          return handleLoad(args);
        case 'list':
          return handleList(args);
        case 'delete':
          return handleDelete(args);
        default:
          return errorResponse(
            `Invalid action "${action}". Must be one of: save, load, list, delete`
          );
      }
    } catch (error) {
      return errorResponse(error);
    }
  },
};

/**
 * Handle save action
 */
function handleSave(args: Record<string, unknown>) {
  const name = args.name as string | undefined;
  const records = args.records as Record<string, unknown>[] | undefined;
  const fingerprints = args.fingerprints as string[] | undefined;
  const coverage = args.coverage as Record<string, unknown> | undefined;

  if (!name || typeof name !== 'string') {
    return errorResponse('name is required for save action');
  }

  if (!records || !Array.isArray(records)) {
    return errorResponse('records array is required for save action');
  }

  // Validate records are CompressedRecord format
  const validRecords: CompressedRecord[] = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!isCompressedRecord(record)) {
      return errorResponse(
        `Record at index ${i} is not a valid CompressedRecord. Use the compress tool first.`
      );
    }
    validRecords.push(record as CompressedRecord);
  }

  // Get active session ID if available
  const activeSession = sessionStore.getActive();
  const sessionId = activeSession?.id;

  const checkpoint = checkpointStore.create({
    name,
    records: validRecords,
    fingerprints,
    coverage,
    sessionId,
  });

  return successResponse({
    status: 'saved',
    checkpoint: {
      id: checkpoint.id,
      name: checkpoint.name,
      created: checkpoint.created,
      sessionId: checkpoint.sessionId,
      recordCount: checkpoint.data.records.length,
    },
    message: `Checkpoint '${name}' saved with ${validRecords.length} records.`,
  });
}

/**
 * Handle load action
 */
function handleLoad(args: Record<string, unknown>) {
  const id = args.id as string | undefined;

  if (!id || typeof id !== 'string') {
    return errorResponse('id (checkpoint ID or name) is required for load action');
  }

  const checkpoint = checkpointStore.getByIdOrName(id);

  if (!checkpoint) {
    return errorResponse(`Checkpoint '${id}' not found`);
  }

  return successResponse({
    status: 'loaded',
    checkpoint: {
      id: checkpoint.id,
      name: checkpoint.name,
      created: checkpoint.created,
      sessionId: checkpoint.sessionId,
    },
    records: checkpoint.data.records,
    recordCount: checkpoint.data.records.length,
    fingerprints: checkpoint.data.fingerprints,
    coverage: checkpoint.data.coverage,
  });
}

/**
 * Handle list action
 */
function handleList(args: Record<string, unknown>) {
  const limit = args.limit as number | undefined;
  const sessionId = args.sessionId as string | undefined;

  // Validate limit if provided
  if (limit !== undefined) {
    if (typeof limit !== 'number' || limit < 1) {
      return errorResponse('limit must be a positive number');
    }
  }

  const result = checkpointStore.list({
    limit: limit ?? 10,
    sessionId,
  });

  return successResponse({
    status: 'listed',
    checkpoints: result.checkpoints,
    total: result.total,
    hasMore: result.hasMore,
  });
}

/**
 * Handle delete action
 */
function handleDelete(args: Record<string, unknown>) {
  const id = args.id as string | undefined;

  if (!id || typeof id !== 'string') {
    return errorResponse('id (checkpoint ID or name) is required for delete action');
  }

  const deleted = checkpointStore.deleteByIdOrName(id);

  if (!deleted) {
    return errorResponse(`Checkpoint '${id}' not found`);
  }

  return successResponse({
    status: 'deleted',
    message: `Checkpoint '${id}' deleted.`,
  });
}
