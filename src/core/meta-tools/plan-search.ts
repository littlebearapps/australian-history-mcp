/**
 * Plan Search Meta-Tool
 *
 * Analyses a research topic and generates a structured search strategy
 * with historical name suggestions, temporal coverage analysis, and source prioritisation.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';
import type { SourceTool } from '../base-source.js';
import { analyzeIntent, type IntentAnalysis } from '../search/intent.js';
import { getHistoricalNameInfo, type NameSuggestions } from '../search/names.js';
import { analyzeTemporalCoverage, type TemporalAnalysis } from '../search/temporal.js';
import { routeSources, type SourcePrioritisation, type ContentType } from '../source-router.js';

// ============================================================================
// Types
// ============================================================================

interface SearchStep {
  step: number;
  phase: 'discovery' | 'refinement' | 'deep-dive';
  action: string;
  query: string;
  source: string;
  filters: Record<string, unknown>;
  rationale: string;
}

interface CoverageAspect {
  aspect: string;
  status: string;
  sources: string[];
}

interface PlanSearchResult {
  topic: string;
  sessionId: string;
  createdAt: string;
  analysis: IntentAnalysis;
  historicalNames: NameSuggestions[];
  temporalCoverage: TemporalAnalysis;
  sourcePriority: SourcePrioritisation;
  searchPlan: SearchStep[];
  coverageMatrix: CoverageAspect[];
  estimatedResults: { min: number; max: number };
  planFile?: string;
}

// ============================================================================
// Plan Generation
// ============================================================================

/**
 * Generate search steps from the analysis results.
 */
function generateSearchPlan(
  topic: string,
  intent: IntentAnalysis,
  names: NameSuggestions[],
  sourcePriority: SourcePrioritisation,
  maxSearches: number
): SearchStep[] {
  const steps: SearchStep[] = [];
  let stepNum = 1;

  // Collect all search terms
  const searchTerms = new Set<string>();
  searchTerms.add(topic);
  for (const name of names) {
    for (const term of name.searchTerms.slice(0, 3)) {
      searchTerms.add(term);
    }
  }
  const terms = Array.from(searchTerms).slice(0, 5);

  // Phase 1: Discovery with high-relevance sources
  const highRelevance = sourcePriority.prioritised.filter((p) => p.relevance === 'high');
  for (const source of highRelevance.slice(0, 3)) {
    if (stepNum > maxSearches) break;
    steps.push({
      step: stepNum++,
      phase: 'discovery',
      action: source.tool,
      query: topic,
      source: source.source,
      filters: source.suggestedFilters,
      rationale: `High relevance: ${source.reason}`,
    });
  }

  // Phase 2: Refinement with alternative search terms
  const mediumRelevance = sourcePriority.prioritised.filter((p) => p.relevance === 'medium');
  for (const source of mediumRelevance.slice(0, 2)) {
    if (stepNum > maxSearches) break;
    for (const term of terms.slice(1, 3)) {
      if (stepNum > maxSearches) break;
      if (term !== topic) {
        steps.push({
          step: stepNum++,
          phase: 'refinement',
          action: source.tool,
          query: term,
          source: source.source,
          filters: source.suggestedFilters,
          rationale: `Alternative term: "${term}" via ${source.source}`,
        });
      }
    }
  }

  // Phase 3: Deep-dive with specialised sources
  const specialised = sourcePriority.prioritised.filter(
    (p) => p.suggestedTools.length > 1 && p.relevance !== 'low'
  );
  for (const source of specialised.slice(0, 2)) {
    if (stepNum > maxSearches) break;
    // Use a detail-oriented tool if available
    const detailTool = source.suggestedTools.find((t) => t.includes('get_') || t.includes('harvest'));
    if (detailTool && detailTool !== source.tool) {
      steps.push({
        step: stepNum++,
        phase: 'deep-dive',
        action: detailTool,
        query: topic,
        source: source.source,
        filters: source.suggestedFilters,
        rationale: `Deep-dive: ${detailTool} for detailed records`,
      });
    }
  }

  return steps;
}

/**
 * Generate coverage matrix for the plan summary.
 */
function generateCoverageAspects(
  temporal: TemporalAnalysis,
  sourcePriority: SourcePrioritisation
): CoverageAspect[] {
  const aspects: CoverageAspect[] = [];

  // Temporal coverage
  const fullCoverage = Object.entries(temporal.coverageMatrix)
    .filter(([, a]) => a.coverage === 'full')
    .map(([s]) => s);
  const partialCoverage = Object.entries(temporal.coverageMatrix)
    .filter(([, a]) => a.coverage === 'partial')
    .map(([s]) => s);

  if (fullCoverage.length > 0) {
    aspects.push({
      aspect: 'Full date coverage',
      status: 'covered',
      sources: fullCoverage,
    });
  }
  if (partialCoverage.length > 0) {
    aspects.push({
      aspect: 'Partial date coverage',
      status: 'partial',
      sources: partialCoverage,
    });
  }

  // Content type coverage
  const contentTypes = new Set<string>();
  for (const source of sourcePriority.prioritised) {
    for (const ct of source.suggestedFilters['category'] ? ['newspaper'] : []) {
      contentTypes.add(ct);
    }
  }

  // Source relevance summary
  const highSources = sourcePriority.prioritised
    .filter((p) => p.relevance === 'high')
    .map((p) => p.source);
  if (highSources.length > 0) {
    aspects.push({
      aspect: 'High relevance sources',
      status: 'recommended',
      sources: highSources,
    });
  }

  return aspects;
}

/**
 * Estimate result counts based on source coverage.
 */
function estimateResults(sourcePriority: SourcePrioritisation): { min: number; max: number } {
  const highCount = sourcePriority.prioritised.filter((p) => p.relevance === 'high').length;
  const mediumCount = sourcePriority.prioritised.filter((p) => p.relevance === 'medium').length;

  // Rough estimates based on source coverage
  const min = highCount * 5 + mediumCount * 2;
  const max = highCount * 100 + mediumCount * 50;

  return { min, max };
}

// ============================================================================
// Markdown Generation
// ============================================================================

/**
 * Generate plan.md content from the search plan result.
 */
function generatePlanMarkdown(result: PlanSearchResult): string {
  const lines: string[] = [];

  lines.push(`# Research Plan: ${result.topic}`);
  lines.push('');
  lines.push(`**Session:** ${result.sessionId}`);
  lines.push(`**Created:** ${result.createdAt}`);
  lines.push(`**Status:** Planning`);
  lines.push('');

  // Objectives
  lines.push('## Objectives');
  lines.push(`- [ ] Research "${result.topic}"`);
  if (result.analysis.themes.length > 0) {
    lines.push(`- [ ] Explore themes: ${result.analysis.themes.join(', ')}`);
  }
  lines.push('');

  // Historical Context
  lines.push('## Historical Context');
  if (result.historicalNames.length > 0) {
    for (const name of result.historicalNames) {
      if (name.historicalNames.length > 0) {
        const variants = name.historicalNames.map((h) => `"${h.name}" (${h.period.from}-${h.period.to})`);
        lines.push(`- **${name.canonical}:** ${variants.join(', ')}`);
      }
    }
  } else {
    lines.push('- No historical name variants detected');
  }
  if (result.analysis.dateRange) {
    lines.push(`- **Time period:** ${result.analysis.dateRange.from ?? '*'} to ${result.analysis.dateRange.to ?? '*'}`);
  }
  if (result.analysis.locations.length > 0) {
    const locs = result.analysis.locations.map((l) => l.state ? `${l.name} (${l.state})` : l.name);
    lines.push(`- **Key locations:** ${locs.join(', ')}`);
  }
  lines.push('');

  // Search Strategy
  lines.push('## Search Strategy');
  lines.push('');

  // Group steps by phase
  const phases = ['discovery', 'refinement', 'deep-dive'] as const;
  for (const phase of phases) {
    const phaseSteps = result.searchPlan.filter((s) => s.phase === phase);
    if (phaseSteps.length === 0) continue;

    const phaseTitle = phase.charAt(0).toUpperCase() + phase.slice(1);
    lines.push(`### Phase: ${phaseTitle} (${phaseSteps.length} searches)`);
    lines.push('');

    for (const step of phaseSteps) {
      lines.push(`- [ ] **Step ${step.step}:** ${step.action} via ${step.source}`);
      lines.push(`  - Query: \`${step.query}\``);
      if (Object.keys(step.filters).length > 0) {
        lines.push(`  - Filters: ${JSON.stringify(step.filters)}`);
      }
      lines.push(`  - Rationale: ${step.rationale}`);
      lines.push('');
    }
  }

  // Coverage Matrix
  lines.push('## Coverage Matrix');
  lines.push('');
  lines.push('| Aspect | Status | Sources |');
  lines.push('|--------|--------|---------|');
  for (const aspect of result.coverageMatrix) {
    lines.push(`| ${aspect.aspect} | ${aspect.status} | ${aspect.sources.join(', ')} |`);
  }
  lines.push('');

  // Gaps & Recommendations
  if (result.temporalCoverage.gaps.length > 0 || result.temporalCoverage.recommendations.length > 0) {
    lines.push('## Gaps & Recommendations');
    lines.push('');
    for (const gap of result.temporalCoverage.gaps) {
      lines.push(`- ⚠️ ${gap}`);
    }
    for (const rec of result.temporalCoverage.recommendations) {
      lines.push(`- 💡 ${rec}`);
    }
    lines.push('');
  }

  // Session Stats
  lines.push('## Session Stats');
  lines.push(`- Queries: 0/${result.searchPlan.length} completed`);
  lines.push(`- Estimated results: ${result.estimatedResults.min}-${result.estimatedResults.max}`);
  lines.push(`- Last updated: ${result.createdAt}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Get the plans directory path, creating if needed.
 */
async function getPlansDir(): Promise<string> {
  const dataDir = path.join(os.homedir(), '.local', 'share', 'australian-history-mcp', 'plans');
  await fs.mkdir(dataDir, { recursive: true });
  return dataDir;
}

/**
 * Generate a slug from the topic for filename.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/**
 * Save plan to file(s).
 */
async function savePlanFile(
  markdown: string,
  topic: string,
  customPath?: string
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const slug = slugify(topic);
  const filename = `${slug}-${timestamp}.md`;

  // Always save to central directory
  const plansDir = await getPlansDir();
  const centralPath = path.join(plansDir, filename);
  await fs.writeFile(centralPath, markdown, 'utf-8');

  // Also save to custom path if provided
  if (customPath) {
    const customDir = path.dirname(customPath);
    await fs.mkdir(customDir, { recursive: true });
    await fs.writeFile(customPath, markdown, 'utf-8');
    return customPath; // Return custom path as primary
  }

  return centralPath;
}

// ============================================================================
// Meta-Tool Definition
// ============================================================================

export const planSearchMetaTool: SourceTool = {
  schema: {
    name: 'plan_search',
    description:
      'Analyse a research topic and generate a structured search strategy with historical name suggestions, temporal coverage analysis, and source prioritisation.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        topic: {
          type: 'string',
          description: 'Research topic to analyse (e.g., "History of Arden Street Oval in the 1920s")',
        },
        questions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific research questions to answer (optional)',
        },
        period: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'Start year (e.g., "1920")' },
            to: { type: 'string', description: 'End year (e.g., "1930")' },
          },
          description: 'Override date range detection (optional)',
        },
        preferredTypes: {
          type: 'array',
          items: { type: 'string', enum: ['image', 'newspaper', 'document', 'species', 'heritage', 'film'] },
          description: 'Preferred content types (optional)',
        },
        maxSearches: {
          type: 'number',
          description: 'Maximum number of search steps to generate (default: 10)',
          default: 10,
        },
        format: {
          type: 'string',
          enum: ['json', 'markdown', 'both'],
          description: 'Output format (default: both)',
          default: 'both',
        },
        planPath: {
          type: 'string',
          description: 'Custom path to save plan.md (optional, always also saved to ~/.local/share/australian-history-mcp/plans/)',
        },
      },
      required: ['topic'],
    },
  },

  async execute(args: Record<string, unknown>) {
    const input = args as {
      topic: string;
      questions?: string[];
      period?: { from?: string; to?: string };
      preferredTypes?: ContentType[];
      maxSearches?: number;
      format?: 'json' | 'markdown' | 'both';
      planPath?: string;
    };

    const topic = input.topic;
    const maxSearches = input.maxSearches ?? 10;
    const format = input.format ?? 'both';

    // 1. Analyse intent
    const intent = await analyzeIntent(topic);

    // Override date range if explicitly provided
    if (input.period) {
      if (input.period.from || input.period.to) {
        intent.dateRange = {
          from: input.period.from,
          to: input.period.to,
          original: `${input.period.from ?? '*'}-${input.period.to ?? '*'}`,
          confidence: 1.0,
        };
      }
    }

    // 2. Get historical name info for detected locations
    const historicalNames: NameSuggestions[] = [];
    for (const location of intent.locations.slice(0, 5)) {
      const nameInfo = await getHistoricalNameInfo(location.name, 'place', {
        from: intent.dateRange?.from ? parseInt(intent.dateRange.from, 10) : undefined,
        to: intent.dateRange?.to ? parseInt(intent.dateRange.to, 10) : undefined,
      });
      if (nameInfo.historicalNames.length > 0 || nameInfo.alternativeSpellings.length > 0) {
        historicalNames.push(nameInfo);
      }
    }

    // 3. Analyse temporal coverage
    const dateRange = {
      from: intent.dateRange?.from ?? '*',
      to: intent.dateRange?.to ?? '*',
    };
    const temporalCoverage = analyzeTemporalCoverage(dateRange);

    // 4. Route sources with prioritisation
    const sourcePriority = routeSources(intent, input.preferredTypes);

    // 5. Generate search plan
    const searchPlan = generateSearchPlan(topic, intent, historicalNames, sourcePriority, maxSearches);

    // 6. Generate coverage matrix and estimates
    const coverageMatrix = generateCoverageAspects(temporalCoverage, sourcePriority);
    const estimatedResults = estimateResults(sourcePriority);

    // Build result
    const sessionId = randomUUID();
    const createdAt = new Date().toISOString();
    const result: PlanSearchResult = {
      topic,
      sessionId,
      createdAt,
      analysis: intent,
      historicalNames,
      temporalCoverage,
      sourcePriority,
      searchPlan,
      coverageMatrix,
      estimatedResults,
    };

    // 7. Generate and save markdown if requested
    if (format === 'markdown' || format === 'both') {
      const markdown = generatePlanMarkdown(result);
      result.planFile = await savePlanFile(markdown, topic, input.planPath);
    }

    // Return response based on format
    if (format === 'markdown') {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                sessionId,
                planFile: result.planFile,
                searchSteps: searchPlan.length,
                message: `Plan saved to ${result.planFile}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};
