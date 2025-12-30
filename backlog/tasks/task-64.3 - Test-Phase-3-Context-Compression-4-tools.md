---
id: task-64.3
title: 'Test Phase 3: Context Compression (4 tools)'
status: To Do
assignee: []
created_date: '2025-12-30 06:02'
labels:
  - testing
  - v1.0.0
  - compression
dependencies: []
parent_task_id: task-64
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 4 context compression meta-tools.

## Prerequisites
First run a search to get sample records for compression tests.

## Test Cases

### 3.1 compress
- [ ] `compress(records=[...], level="minimal")` - minimal compression
- [ ] `compress(records=[...], level="standard")` - standard compression (default)
- [ ] `compress(records=[...], level="full")` - full compression
- [ ] Verify stats.savingsPercent > 0
- [ ] Verify compressed records have correct fields per level:
  - minimal: id, url, source
  - standard: + title, year
  - full: + type, creator

### 3.2 urls
- [ ] `urls(records=[...])` - extract URLs
- [ ] `urls(records=[...], includeTitle=true)` - with titles
- [ ] `urls(records=[...], dedupeFirst=true)` - dedupe first
- [ ] Verify returns minimal token output

### 3.3 dedupe
- [ ] `dedupe(records=[...], strategy="url")` - URL matching only
- [ ] `dedupe(records=[...], strategy="title")` - title similarity only
- [ ] `dedupe(records=[...], strategy="both")` - both strategies (default)
- [ ] `dedupe(records=[...], preferSource=["trove", "prov"])` - source priority
- [ ] Verify duplicateCount in stats

### 3.4 checkpoint
- [ ] `checkpoint(action="save", name="test-checkpoint", records=[...])`
- [ ] `checkpoint(action="list")` - list checkpoints
- [ ] `checkpoint(action="load", id="checkpoint-xxx")` - load by ID
- [ ] `checkpoint(action="load", id="test-checkpoint")` - load by name
- [ ] `checkpoint(action="delete", id="checkpoint-xxx")` - delete
- [ ] Verify persistence across "sessions"
<!-- SECTION:DESCRIPTION:END -->
