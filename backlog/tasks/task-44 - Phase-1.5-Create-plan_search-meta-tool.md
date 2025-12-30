---
id: task-44
title: 'Phase 1.5: Create plan_search meta-tool'
status: Done
assignee: []
created_date: '2025-12-30 03:32'
updated_date: '2025-12-30 04:14'
labels:
  - phase-1
  - research-planning
  - meta-tool
dependencies:
  - task-40
  - task-41
  - task-42
  - task-43
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/meta-tools/plan-search.ts` - the main research planning meta-tool that orchestrates all planning modules.

**Purpose:** Analyse a research topic and generate a structured search strategy.

**Input Schema:**
```typescript
{
  topic: string;              // "History of Arden Street Oval"
  questions?: string[];       // Specific research questions
  period?: { from?: string, to?: string };
  preferredTypes?: string[];  // image, newspaper, document, etc.
  maxSearches?: number;       // Limit generated searches (default: 10)
  format?: 'json' | 'markdown' | 'both';
  planPath?: string;          // Path for plan.md (default: ./research-plan.md)
}
```

**Output:**
```typescript
{
  topic: string;
  analysis: IntentAnalysis;
  historicalNames: NameSuggestions[];
  temporalCoverage: TemporalAnalysis;
  sourcePriority: SourcePrioritisation;
  searchPlan: Array<{
    step: number;
    phase: 'discovery' | 'refinement' | 'deep-dive';
    action: string;           // Tool name
    query: string;
    source: string;
    filters: Record<string, any>;
    rationale: string;
  }>;
  coverageMatrix: { aspect: string, status: string, sources: string[] }[];
  estimatedResults: { min: number, max: number };
  planFile?: string;          // Path to generated plan.md
}
```

**Integration:**
- Uses intent.ts, names.ts, temporal.ts, source-router.ts
- Generates ordered search strategy (broad → narrow)
- Creates plan.md file if format includes 'markdown' or 'both'
- Limits to maxSearches parameter

**Dependencies:** Requires task-40, task-41, task-42, task-43 (all planning modules)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tool registered in meta-tools registry with correct schema
- [ ] #2 Correctly orchestrates all planning modules
- [ ] #3 Generates ordered search plan with phase progression
- [ ] #4 Creates plan.md file with checkboxes for tracking
- [ ] #5 Respects maxSearches parameter limit
- [ ] #6 Returns both JSON and markdown formats when requested
- [ ] #7 Includes rationale for each search step
- [ ] #8 Handles edge cases (no date range, unknown topics)
- [ ] #9 Integration tested with real research topics
<!-- AC:END -->
