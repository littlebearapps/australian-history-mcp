---
id: task-76
title: "[QUIRK-001] Handle GHAP/TLCMap API HTML error responses"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - api-quirk
  - ghap
  - v1.0.1
  - medium-priority
dependencies: []
priority: medium
---

## Description

The GHAP (TLCMap) API sometimes returns HTML error pages instead of JSON for certain query combinations. Observed with:
- `ghap_search(query="creek", state="VIC")` → HTML error page
- `ghap_harvest(state="VIC")` → HTML error page

Meanwhile `ghap_search(query="Melbourne", state="VIC")` works correctly.

## Impact

JSON parse error appears: "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"

This is an upstream API issue, not a bug in our code, but we should handle it gracefully.

## Suggested Fix

Add HTML detection in GHAP client error handling:
1. Check if response starts with `<!DOCTYPE` or `<html`
2. If HTML detected, return proper error message instead of parse error
3. Suggest user try different query parameters

Example error message:
```
"GHAP API returned HTML error page instead of JSON. This sometimes occurs with certain query combinations. Try:
- Using a more specific search term
- Removing state filter
- Using different keywords"
```

## Acceptance Criteria

- [ ] HTML responses detected before JSON parse
- [ ] User-friendly error message returned
- [ ] Suggestions for alternative queries included
- [ ] Add to CLAUDE.md Known Quirks section
- [ ] Add unit tests for HTML response handling

## Documentation Update

Add to CLAUDE.md Known Quirks:
```
- **GHAP/TLCMap API:** Sometimes returns HTML error pages for certain query+state combinations.
  Our client detects this and returns a helpful error message suggesting alternative queries.
```

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.10
