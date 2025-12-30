---
id: task-68
title: "[BUG-004] Fix ALA not prioritized for biodiversity topics"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - plan_search
  - ala
  - v1.0.1
  - medium-priority
dependencies: []
priority: medium
---

## Description

For query "Platypus sightings in Victoria", ALA (dedicated biodiversity source) had score 0 and low relevance. Theme was detected as "general" instead of "biodiversity".

## Steps to Reproduce

1. `plan_search(topic="Platypus sightings in Victoria")`
2. ALA priority: score 0, last position
3. Theme: "general" (should be "biodiversity" or "species")

## Impact

Biodiversity research won't be directed to the primary species data source (ALA has 165M+ occurrence records)

## Suggested Fix

Detect species/animal keywords and boost ALA priority:
- Common species: platypus, koala, kangaroo, wombat, echidna, possum
- Scientific terms: species, fauna, flora, wildlife, biodiversity
- Research terms: sightings, observations, occurrences, specimens
- Theme detection should recognize biodiversity queries

## Acceptance Criteria

- [ ] ALA ranks #1 or #2 for biodiversity queries
- [ ] Theme correctly detected as "biodiversity" for species queries
- [ ] Test with common and scientific species names
- [ ] Add unit tests for biodiversity keyword detection

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.1
