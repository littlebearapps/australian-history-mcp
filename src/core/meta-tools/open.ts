/**
 * Open Meta-Tool
 *
 * Opens a URL in the default browser.
 * Uses platform-specific commands via execFile (safer than shell execution).
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { SourceTool } from '../base-source.js';
import { successResponse, errorResponse } from '../types.js';

const execFileAsync = promisify(execFile);

/**
 * Get platform-specific command for opening URLs
 */
function getOpenCommand(): { command: string; args: (url: string) => string[] } {
  const platform = process.platform;

  switch (platform) {
    case 'darwin':
      return { command: 'open', args: (url) => [url] };
    case 'win32':
      return { command: 'cmd', args: (url) => ['/c', 'start', '', url] };
    default:
      // Linux and others
      return { command: 'xdg-open', args: (url) => [url] };
  }
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export const openMetaTool: SourceTool = {
  schema: {
    name: 'open',
    description: 'Open a URL in the default browser.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'URL to open (http or https)' },
      },
      required: ['url'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as { url: string };

    if (!input.url) {
      return errorResponse('URL is required', 'open');
    }

    if (!isValidUrl(input.url)) {
      return errorResponse(
        'Invalid URL. Must be a valid http or https URL.',
        'open'
      );
    }

    try {
      const { command, args: getArgs } = getOpenCommand();
      await execFileAsync(command, getArgs(input.url));

      return successResponse({
        status: 'opened',
        url: input.url,
        message: 'URL opened in default browser',
      });
    } catch (_error) {
      // Don't expose internal error details
      return errorResponse(
        `Failed to open URL: ${input.url}. Browser may not be available.`,
        'open'
      );
    }
  },
};
