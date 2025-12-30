---
id: task-71
title: "[BUG-007] Fix fingerprints duplicated in session data"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - sessions
  - v1.0.1
  - low-priority
dependencies: []
priority: low
---

## Description

When viewing session status with `detail="full"`, each fingerprint appears twice in the fingerprints array. For 4 unique records, 8 fingerprint entries are shown.

## Steps to Reproduce

1. Start session: `session_start(name="test", topic="Test")`
2. Execute search: `search(query="railway", sources=["prov", "nma"])`
3. View status: `session_status(detail="full")`
4. Observe: fingerprints array has duplicate entries (same id, source, url, titleHash)

## Impact

- Inflated fingerprint counts
- Potential memory/storage inefficiency
- Misleading session statistics

## Suggested Fix

Deduplicate fingerprints before storing/returning in session data:
- Use Set or Map to track unique fingerprints by id+source
- Check for existing fingerprint before adding
- Or dedupe on retrieval in session_status

## Acceptance Criteria

- [ ] Fingerprints array contains no duplicates
- [ ] Fingerprint count matches actual unique records
- [ ] Add unit tests for fingerprint deduplication

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.2
