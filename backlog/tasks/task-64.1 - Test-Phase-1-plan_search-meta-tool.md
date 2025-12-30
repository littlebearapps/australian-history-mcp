---
id: task-64.1
title: 'Test Phase 1: plan_search meta-tool'
status: To Do
assignee: []
created_date: '2025-12-30 06:02'
labels:
  - testing
  - v1.0.0
  - plan_search
dependencies: []
parent_task_id: task-64
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test the research planning meta-tool with various topics.

## Test Cases
1. **Simple topic**: `plan_search(topic="Melbourne Olympics")`
2. **Topic with dates**: `plan_search(topic="Melbourne floods 1930-1940")`
3. **Location-specific**: `plan_search(topic="History of Carlton, Melbourne")`
4. **Content type hint**: `plan_search(topic="Photographs of Melbourne trams")`
5. **Complex multi-faceted**: `plan_search(topic="History of North Melbourne FC at Arden Street from 1900 to 1930")`
6. **Biodiversity topic**: `plan_search(topic="Platypus sightings in Victoria")`
7. **Heritage topic**: `plan_search(topic="Heritage buildings in Carlton")`
8. **Aerial photography**: `plan_search(topic="Aerial photographs of Melbourne 1950s")`

## Verify
- [ ] themes extracted correctly
- [ ] historicalNames suggested (where applicable)
- [ ] sourcePriority reflects topic type
- [ ] searchStrategies generated
- [ ] coverageMatrix created
- [ ] planPath points to valid plan.md file
- [ ] dateRange extracted (when specified)
<!-- SECTION:DESCRIPTION:END -->
