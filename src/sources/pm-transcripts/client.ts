/**
 * Prime Ministerial Transcripts API Client
 *
 * Provides access to transcripts of Australian Prime Ministers' speeches,
 * media releases, and interviews.
 *
 * API Documentation: https://pmtranscripts.pmc.gov.au/developers
 * No API key required.
 */

import { BaseClient } from '../../core/base-client.js';
import type { PMTranscript, PMTranscriptRef } from './types.js';

const PM_TRANSCRIPTS_BASE = 'https://pmtranscripts.pmc.gov.au';

/**
 * Simple XML text extractor - gets content between tags
 */
function extractXmlText(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Extract multiple values from repeated tags
 */
function extractXmlArray(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'gi');
  const matches = [...xml.matchAll(regex)];
  return matches.map((m) => m[1].trim()).filter((s) => s.length > 0);
}

/**
 * Parse a transcript XML response into PMTranscript object
 * API returns: <response><item key="0">...fields...</item></response>
 */
function parseTranscriptXml(xml: string): PMTranscript | null {
  // Find the item element (API returns <response><item key="0">...</item></response>)
  const itemMatch = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/i);
  if (!itemMatch) {
    return null;
  }

  const itemXml = itemMatch[1];

  const transcriptId = parseInt(extractXmlText(itemXml, 'transcript-id'), 10);
  if (isNaN(transcriptId)) {
    return null;
  }

  // Handle content which may be in CDATA
  let content = extractXmlText(itemXml, 'content');
  // Extract from CDATA if present
  const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdataMatch) {
    content = cdataMatch[1];
  }

  // API uses field_date instead of release-date
  const releaseDate = extractXmlText(itemXml, 'field_date') || extractXmlText(itemXml, 'release-date');

  return {
    transcriptId,
    title: extractXmlText(itemXml, 'title'),
    primeMinister: extractXmlText(itemXml, 'prime-minister'),
    periodOfService: extractXmlText(itemXml, 'period-of-service'),
    releaseDate,
    releaseType: extractXmlText(itemXml, 'release-type'),
    documentUrl: extractXmlText(itemXml, 'document') || null,
    subjects: extractXmlArray(itemXml, 'subject'),
    content,
  };
}

/**
 * Parse sitemap XML to extract transcript references
 */
function parseSitemapXml(xml: string): PMTranscriptRef[] {
  const refs: PMTranscriptRef[] = [];

  // Extract all <url> elements
  const urlMatches = xml.matchAll(/<url>([\s\S]*?)<\/url>/gi);

  for (const match of urlMatches) {
    const urlXml = match[1];
    const loc = extractXmlText(urlXml, 'loc');

    // Extract ID from URL like /release/transcript-12345
    const idMatch = loc.match(/transcript-(\d+)/i);
    if (idMatch) {
      refs.push({
        id: parseInt(idMatch[1], 10),
        url: loc,
      });
    }
  }

  return refs;
}

export class PMTranscriptsClient extends BaseClient {
  constructor() {
    super(PM_TRANSCRIPTS_BASE, { userAgent: 'australian-history-mcp/0.6.0' });
  }

  /**
   * Get a single transcript by ID
   */
  async getTranscript(id: number): Promise<PMTranscript | null> {
    const url = this.buildUrl('/query', { transcript: id.toString() });

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/xml, text/xml',
          'User-Agent': 'australian-history-mcp/0.6.0',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xml = await response.text();
      return parseTranscriptXml(xml);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all transcript IDs from sitemap
   * Note: This is a large request (~26,000 entries)
   */
  async getSitemapIds(): Promise<PMTranscriptRef[]> {
    const url = `${PM_TRANSCRIPTS_BASE}/transcripts.xml`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/xml, text/xml',
        'User-Agent': 'australian-history-mcp/0.6.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();
    return parseSitemapXml(xml);
  }

  /**
   * Get a range of transcripts by ID
   * Fetches sequentially to avoid overwhelming the server
   */
  async getTranscriptRange(
    startId: number,
    endId: number,
    options?: {
      primeMinister?: string;
      dateFrom?: string;
      dateTo?: string;
      onProgress?: (current: number, total: number) => void;
    }
  ): Promise<PMTranscript[]> {
    const transcripts: PMTranscript[] = [];
    const total = endId - startId + 1;

    for (let id = startId; id <= endId; id++) {
      try {
        const transcript = await this.getTranscript(id);

        if (transcript) {
          // Apply filters
          if (options?.primeMinister) {
            const pmFilter = options.primeMinister.toLowerCase();
            if (!transcript.primeMinister.toLowerCase().includes(pmFilter)) {
              continue;
            }
          }

          if (options?.dateFrom || options?.dateTo) {
            const releaseDate = this.parseReleaseDate(transcript.releaseDate);
            if (releaseDate) {
              if (options.dateFrom && releaseDate < options.dateFrom) {
                continue;
              }
              if (options.dateTo && releaseDate > options.dateTo) {
                continue;
              }
            }
          }

          transcripts.push(transcript);
        }

        if (options?.onProgress) {
          options.onProgress(id - startId + 1, total);
        }

        // Small delay to be respectful to the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch {
        // Skip failed transcripts silently
        continue;
      }
    }

    return transcripts;
  }

  /**
   * Parse release date from DD/MM/YYYY to YYYY-MM-DD
   */
  private parseReleaseDate(dateStr: string): string | null {
    const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) return null;

    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}

// Export singleton instance
export const pmTranscriptsClient = new PMTranscriptsClient();
