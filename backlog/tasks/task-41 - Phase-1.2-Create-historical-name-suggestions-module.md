---
id: task-41
title: 'Phase 1.2: Create historical name suggestions module'
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
Create `src/core/search/names.ts` module that suggests historical name variants for Australian places, organisations, and entities.

**Purpose:** Improve search coverage by suggesting alternative names used in historical records.

**Key Mappings:**
- **Melbourne suburbs:** Hotham → North Melbourne (pre-1887), Collingwood Flat → Abbotsford, etc.
- **Football clubs:** VFL names, pre-VFL names, ground names
- **Government entities:** Historical department names, pre-Federation colonies
- **Indigenous names:** Traditional names for places where appropriate

**Input:** Entity name, type (place | organisation | person), date range

**Output:**
```typescript
{
  canonical: string;           // Modern/standard name
  historicalNames: Array<{
    name: string;
    period: { from: string, to: string };
    context: string;           // Why this name was used
  }>;
  alternativeSpellings: string[];
  searchTerms: string[];       // All terms to use in queries
}
```

**Data Sources:**
- Hardcoded mapping tables for common Victorian/Australian names
- Date-aware suggestions (only suggest "Hotham" for pre-1887 searches)

**Dependencies:** None (foundation module)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Module exports getHistoricalNames(name: string, type: EntityType, dateRange?: DateRange): NameSuggestions
- [ ] #2 Includes mapping for Melbourne suburb historical names
- [ ] #3 Includes mapping for VFL/AFL club names across eras
- [ ] #4 Returns date-appropriate suggestions based on research period
- [ ] #5 Includes fallback for unknown names (returns original)
- [ ] #6 Includes unit tests for name mapping
<!-- AC:END -->
