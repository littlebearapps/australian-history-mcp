/**
 * Session Export Meta-Tool
 *
 * Phase 2: Export session data in multiple formats
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';
import { sessionStore } from '../sessions/store.js';
import type { Session } from '../sessions/types.js';

/**
 * Generate Markdown export
 */
function generateMarkdown(session: Session, include: string[]): string {
  const lines: string[] = [];

  lines.push(`# Research Session: ${session.name}`);
  lines.push('');
  lines.push(`## Topic`);
  lines.push(session.topic);
  lines.push('');

  lines.push(`## Overview`);
  lines.push(`- **Status:** ${session.status}`);
  lines.push(`- **Created:** ${session.created}`);
  lines.push(`- **Last Updated:** ${session.updated}`);
  if (session.planPath) {
    lines.push(`- **Plan:** ${session.planPath}`);
  }
  lines.push('');

  lines.push(`## Statistics`);
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Total Queries | ${session.stats.totalQueries} |`);
  lines.push(`| Total Results | ${session.stats.totalResults} |`);
  lines.push(`| Unique Results | ${session.stats.uniqueResults} |`);
  lines.push(`| Duplicates Removed | ${session.stats.duplicatesRemoved} |`);
  lines.push(`| Sources Searched | ${session.stats.sourcesSearched} |`);
  lines.push('');

  if (include.includes('coverage') || include.includes('all')) {
    lines.push(`## Source Coverage`);
    lines.push('| Source | Status | Queries | Results |');
    lines.push('|--------|--------|---------|---------|');
    for (const coverage of session.coverage) {
      lines.push(
        `| ${coverage.source} | ${coverage.status} | ${coverage.queriesExecuted} | ${coverage.resultsFound} |`
      );
    }
    lines.push('');
  }

  if (include.includes('queries') || include.includes('all')) {
    lines.push(`## Queries Log`);
    if (session.queries.length === 0) {
      lines.push('_No queries executed yet._');
    } else {
      lines.push('| # | Time | Tool | Sources | Query | Results | Duration |');
      lines.push('|---|------|------|---------|-------|---------|----------|');
      session.queries.forEach((q, i) => {
        const time = new Date(q.timestamp).toLocaleTimeString();
        const sources = q.sources.join(', ');
        const query = q.query.length > 30 ? q.query.slice(0, 27) + '...' : q.query;
        lines.push(
          `| ${i + 1} | ${time} | ${q.tool} | ${sources} | ${query} | ${q.uniqueCount}/${q.resultCount} | ${q.durationMs}ms |`
        );
      });
    }
    lines.push('');
  }

  if (session.notes.length > 0) {
    lines.push(`## Notes`);
    for (const note of session.notes) {
      lines.push(`- ${note}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push(`_Exported from Australian History MCP Server_`);

  return lines.join('\n');
}

/**
 * Generate CSV export for queries
 */
function generateCsv(session: Session, include: string[]): string {
  const lines: string[] = [];

  if (include.includes('queries') || include.includes('all')) {
    // Queries CSV
    lines.push('timestamp,tool,sources,query,result_count,unique_count,duplicates_removed,duration_ms');
    for (const q of session.queries) {
      const sources = q.sources.join(';');
      const query = q.query.replace(/"/g, '""'); // Escape quotes
      lines.push(
        `"${q.timestamp}","${q.tool}","${sources}","${query}",${q.resultCount},${q.uniqueCount},${q.duplicatesRemoved},${q.durationMs}`
      );
    }
  } else if (include.includes('coverage')) {
    // Coverage CSV
    lines.push('source,status,queries_executed,results_found,last_searched');
    for (const c of session.coverage) {
      lines.push(
        `"${c.source}","${c.status}",${c.queriesExecuted},${c.resultsFound},"${c.lastSearched ?? ''}"`
      );
    }
  }

  return lines.join('\n');
}

export const sessionExportMetaTool: SourceTool = {
  schema: {
    name: 'session_export',
    description:
      'Export session data in JSON, Markdown, or CSV format. Optionally save to a file.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'Session ID to export (defaults to active session)',
        },
        format: {
          type: 'string',
          enum: ['json', 'markdown', 'csv'],
          description: 'Export format: json (complete), markdown (readable report), csv (spreadsheet)',
        },
        include: {
          type: 'array',
          items: { type: 'string', enum: ['queries', 'results', 'coverage', 'all'] },
          description:
            'What to include: queries (log), results (fingerprints), coverage (sources), all. Default: all',
        },
        path: {
          type: 'string',
          description: 'File path to save export (returns content inline if not provided)',
        },
      },
      required: ['format'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const id = args.id as string | undefined;
    const format = args.format as 'json' | 'markdown' | 'csv';
    const include = (args.include as string[]) ?? ['all'];
    const path = args.path as string | undefined;

    if (!['json', 'markdown', 'csv'].includes(format)) {
      return errorResponse(`Invalid format '${format}'. Use: json, markdown, or csv`);
    }

    try {
      // Get session
      let session;
      if (id) {
        session = sessionStore.get(id);
        if (!session) {
          return errorResponse(`Session '${id}' not found`);
        }
      } else {
        session = sessionStore.getActive();
        if (!session) {
          return errorResponse('No active session. Provide session ID.');
        }
      }

      // Generate content
      let content: string;
      switch (format) {
        case 'json':
          content = JSON.stringify(session, null, 2);
          break;
        case 'markdown':
          content = generateMarkdown(session, include);
          break;
        case 'csv':
          content = generateCsv(session, include);
          break;
      }

      // Save to file if path provided
      if (path) {
        const dir = dirname(path);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        writeFileSync(path, content, 'utf-8');

        return successResponse({
          status: 'exported',
          format,
          path,
          size: content.length,
          message: `Session '${session.name}' exported to ${path}`,
        });
      }

      // Return content inline
      return successResponse({
        status: 'exported',
        format,
        content,
        size: content.length,
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
