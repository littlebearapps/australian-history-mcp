/**
 * Run Meta-Tool
 *
 * Executes any data tool by name with provided arguments.
 * Dispatches to the underlying tool implementation via registry.
 *
 * Phase 2: Auto-logging integration
 * - Logs queries to active session if one exists
 * - Generates fingerprints for deduplication tracking
 * - Updates source coverage
 */

import { randomUUID } from 'crypto';
import type { SourceTool } from '../base-source.js';
import { errorResponse } from '../types.js';
import { registry } from '../../registry.js';
import { getToolEntry } from '../tool-index.js';
import { sessionStore } from '../sessions/store.js';
import { generateFingerprint, checkDuplicates } from '../sessions/fingerprint.js';
import type { SessionQuery } from '../sessions/types.js';

export const runMetaTool: SourceTool = {
  schema: {
    name: 'run',
    description: 'Execute any data tool by name with provided arguments.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tool: { type: 'string', description: 'Tool name to execute (e.g., prov_search)' },
        args: {
          type: 'object',
          description: 'Arguments for the tool (use schema(tool) to see available parameters)',
          additionalProperties: true,
        },
      },
      required: ['tool'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const startTime = Date.now();

    const input = args as {
      tool: string;
      args?: Record<string, unknown>;
    };

    if (!input.tool) {
      return errorResponse('Tool name is required', 'run');
    }

    // Validate tool exists
    const entry = getToolEntry(input.tool);
    if (!entry) {
      return errorResponse(
        `Unknown tool: ${input.tool}. Use tools() to discover available tools.`,
        'run'
      );
    }

    // Check if tool requires auth
    if (entry.authRequired && entry.source === 'trove') {
      if (!process.env.TROVE_API_KEY) {
        return errorResponse(
          `Tool ${input.tool} requires TROVE_API_KEY to be set.`,
          'run'
        );
      }
    }

    // Validate required parameters from tool schema
    const schema = registry.getToolSchema(input.tool);
    if (schema?.inputSchema) {
      const inputSchema = schema.inputSchema as { required?: string[] };
      const requiredParams = inputSchema.required ?? [];
      const providedArgs = input.args ?? {};
      const missingParams = requiredParams.filter(
        (param) => providedArgs[param] === undefined || providedArgs[param] === ''
      );

      if (missingParams.length > 0) {
        return errorResponse(
          `Missing required parameter(s): ${missingParams.join(', ')}. Use schema("${input.tool}") to see all parameters.`,
          'run'
        );
      }
    }

    // Dispatch to underlying tool
    const result = await registry.executeTool(input.tool, input.args ?? {});
    const endTime = Date.now();

    // =========================================================================
    // Phase 2: Auto-logging to active session
    // =========================================================================
    const activeSession = sessionStore.getActive();

    if (activeSession && !result.isError) {
      const queryId = randomUUID();
      const source = entry.source;

      // Extract query parameter from args (varies by tool)
      const toolArgs = input.args ?? {};
      const queryParam =
        (toolArgs.query as string) ??
        (toolArgs.searchQuery as string) ??
        (toolArgs.q as string) ??
        input.tool;

      try {
        // Parse the result to extract records
        const text = result.content[0]?.text ?? '{}';
        const data = JSON.parse(text);
        const records = extractRecordsFromResult(data);

        // Get existing fingerprints for duplicate checking
        const existingFingerprints = activeSession.fingerprints;

        // Build batch for deduplication check
        const batch = records.map((record) => ({
          result: record as Record<string, unknown>,
          source,
        }));

        // Check for duplicates
        const duplicateResults = checkDuplicates(batch, existingFingerprints);

        let uniqueCount = 0;
        let duplicatesRemoved = 0;

        // Add new fingerprints for unique results
        for (let i = 0; i < batch.length; i++) {
          const dupCheck = duplicateResults.get(i);
          if (dupCheck?.isDuplicate) {
            duplicatesRemoved++;
          } else {
            const fp = generateFingerprint(batch[i].result, source, queryId);
            sessionStore.addFingerprint(activeSession.id, fp);
            existingFingerprints.push(fp);
            uniqueCount++;
          }
        }

        // Update source coverage
        const resultCount = data.totalResults ?? data.total ?? records.length;
        sessionStore.updateCoverage(
          activeSession.id,
          source,
          resultCount > 0 ? 'searched' : 'searched'
        );

        // Log the query
        const sessionQuery: SessionQuery = {
          id: queryId,
          timestamp: new Date().toISOString(),
          tool: input.tool,
          sources: [source],
          query: queryParam,
          filters: toolArgs,
          resultCount: resultCount,
          uniqueCount,
          duplicatesRemoved,
          durationMs: endTime - startTime,
        };
        sessionStore.logQuery(activeSession.id, sessionQuery);
      } catch {
        // If parsing fails, still log the query without fingerprinting
        const sessionQuery: SessionQuery = {
          id: queryId,
          timestamp: new Date().toISOString(),
          tool: input.tool,
          sources: [source],
          query: queryParam,
          filters: toolArgs,
          resultCount: 0,
          uniqueCount: 0,
          duplicatesRemoved: 0,
          durationMs: endTime - startTime,
        };
        sessionStore.logQuery(activeSession.id, sessionQuery);
        sessionStore.updateCoverage(activeSession.id, source, 'searched');
      }
    } else if (activeSession && result.isError) {
      // Update coverage for failed searches
      sessionStore.updateCoverage(activeSession.id, entry.source, 'failed');
    }

    return result;
  },
};

/**
 * Extract records array from various response formats.
 */
function extractRecordsFromResult(data: unknown): unknown[] {
  if (!data || typeof data !== 'object') {
    return [];
  }

  const obj = data as Record<string, unknown>;

  // Try common field names
  if (Array.isArray(obj.records)) return obj.records;
  if (Array.isArray(obj.results)) return obj.results;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.works)) return obj.works;
  if (Array.isArray(obj.occurrences)) return obj.occurrences;
  if (Array.isArray(obj.places)) return obj.places;
  if (Array.isArray(obj.objects)) return obj.objects;
  if (Array.isArray(obj.features)) return obj.features; // GeoJSON format

  return [];
}
