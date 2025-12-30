---
id: task-43
title: 'Phase 1.4: Create source router / prioritisation module'
status: Done
assignee: []
created_date: '2025-12-30 03:32'
updated_date: '2025-12-30 04:14'
labels:
  - phase-1
  - research-planning
  - core-module
dependencies:
  - task-40
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/source-router.ts` module that maps research topics to the most relevant data sources.

**Purpose:** Recommend which sources to search first based on topic, intent, and content type.

**Source Strengths:**
- **PROV:** Government records, council minutes, immigration, courts
- **Trove:** Newspapers, magazines, images, books, government gazettes
- **Museums Victoria:** Objects, specimens, species, technology history
- **ALA:** Biodiversity, species occurrences, historical specimens
- **NMA:** National collection, Indigenous heritage, social history
- **VHD:** Heritage places, buildings, shipwrecks, architectural history
- **ACMI:** Film, television, videogames, digital art
- **PM Transcripts:** Political speeches, government policy
- **GHAP:** Historical placenames, geographic history
- **GA HAP:** Aerial photography, urban development, landscape change

**Input:** IntentAnalysis from intent.ts, preferred content types

**Output:**
```typescript
{
  prioritised: Array<{
    source: string;
    relevance: 'high' | 'medium' | 'low';
    reason: string;
    suggestedTools: string[];
    suggestedFilters: Record<string, any>;
  }>;
  excluded: Array<{ source: string, reason: string }>;
  searchOrder: string[];  // Recommended execution order
}
```

**Dependencies:** Requires task-40 (intent.ts)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Module exports routeSources(intent: IntentAnalysis, contentTypes?: string[]): SourcePrioritisation
- [ ] #2 Correctly maps themes to source strengths
- [ ] #3 Provides reasoning for each source recommendation
- [ ] #4 Suggests specific tools and filters per source
- [ ] #5 Handles multi-theme topics with weighted prioritisation
- [ ] #6 Excludes irrelevant sources with explanations
- [ ] #7 Includes unit tests for source routing
<!-- AC:END -->
