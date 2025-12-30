---
id: task-40
title: 'Phase 1.1: Create core search intent classification module'
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
Create `src/core/search/intent.ts` module that analyses research topics and classifies intent.

**Purpose:** Parse user's research question into components (themes, location, date range, entity types).

**Input:** Research topic string (e.g., "History of Arden Street Oval in the 1920s")

**Output:**
- `themes`: string[] - identified themes (sports, architecture, history, etc.)
- `locations`: string[] - place names detected
- `dateRange`: { from?: string, to?: string } - temporal bounds
- `entityTypes`: string[] - what's being researched (person, place, event, object)
- `intent`: 'discovery' | 'verification' | 'deep-dive' | 'comparison'

**Implementation Notes:**
- Use keyword matching for theme detection (sports: football, cricket, oval, etc.)
- Extract years/decades using regex patterns
- Detect Australian place names and map to states
- Return confidence scores for each classification

**Dependencies:** None (foundation module)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Module exports classifyIntent(topic: string): IntentAnalysis function
- [ ] #2 Correctly identifies themes from topic strings
- [ ] #3 Extracts date ranges from various formats (1920s, 1920-1930, early twentieth century)
- [ ] #4 Detects Australian place names and maps to states
- [ ] #5 Returns confidence scores for each classification
- [ ] #6 Includes unit tests for intent classification
<!-- AC:END -->
