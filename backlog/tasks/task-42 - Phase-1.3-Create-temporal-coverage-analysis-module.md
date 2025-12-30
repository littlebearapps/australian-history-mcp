---
id: task-42
title: 'Phase 1.3: Create temporal coverage analysis module'
status: Done
assignee: []
created_date: '2025-12-30 03:31'
updated_date: '2025-12-30 04:14'
labels:
  - phase-1
  - research-planning
  - core-module
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/search/temporal.ts` module that analyses date coverage across sources and suggests optimal date range strategies.

**Purpose:** Help plan searches that span the right time periods for each source.

**Source Date Coverage:**
- PROV: 1836-present (colonial records from 1851)
- Trove newspapers: 1803-1954 (main digitised range)
- Museums Victoria: 1854-present
- GA HAP: 1928-1996
- PM Transcripts: 1945-present
- VHD: All periods (heritage registration dates vs construction dates)

**Input:** Date range from intent analysis, target sources

**Output:**
```typescript
{
  coverageMatrix: {
    [source: string]: {
      coverage: 'full' | 'partial' | 'none';
      availableRange: { from: string, to: string };
      overlapWithQuery: { from: string, to: string };
      notes: string;
    }
  };
  recommendations: string[];  // e.g., "Trove coverage ends 1954; use PROV for 1955+"
  suggestedPhases: Array<{ period: string, sources: string[] }>;
}
```

**Dependencies:** None (foundation module)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Module exports analyzeTemporalCoverage(dateRange: DateRange, sources: string[]): TemporalAnalysis
- [ ] #2 Includes accurate date ranges for all 11 data sources
- [ ] #3 Calculates overlap between query range and source coverage
- [ ] #4 Generates actionable recommendations for gaps
- [ ] #5 Suggests phased search strategy for multi-period queries
- [ ] #6 Includes unit tests for temporal analysis
<!-- AC:END -->
