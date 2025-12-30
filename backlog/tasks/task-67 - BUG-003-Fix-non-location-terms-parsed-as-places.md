---
id: task-67
title: "[BUG-003] Fix non-location terms incorrectly parsed as places"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - plan_search
  - v1.0.1
  - medium-priority
dependencies: []
priority: medium
---

## Description

Several common terms are being matched to GHAP placenames when they should be recognized as keywords:
- "Platypus" → matched to "Platypus, QLD" (should be species)
- "Aerial" → matched to "Aerial Cove, TAS" (should be photography type)
- "Heritage" → matched to "Heritage, NSW" (should be keyword)
- "Photographs" → matched as location (should be content type)

## Impact

searchPlan uses incorrect location terms, state filters are wrong

## Suggested Fix

Filter GHAP lookups to exclude common English words. Maintain a stoplist of non-geographic terms:
- Species names: platypus, koala, kangaroo, wombat, etc.
- Content types: photographs, documents, records, archives
- Research terms: heritage, historical, colonial, aboriginal
- Photography terms: aerial, panorama, portrait

## Acceptance Criteria

- [ ] Common English words not matched as locations
- [ ] Stoplist implemented and configurable
- [ ] Actual placenames with common names still work (e.g., "Platypus Creek" should work)
- [ ] Add unit tests for stoplist filtering

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.1
