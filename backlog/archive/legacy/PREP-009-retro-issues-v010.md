# PREP-009: Retrospective Issues - v0.1.0

**Priority:** P2
**Phase:** 3 (GitHub CLI Operations)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 2 mins (with delays)

---

## Overview

Create and close retrospective issues for v0.1.0 features.

**CRITICAL:** Execute ONE issue operation per command with 2-second delay between operations to avoid API 400 errors.

---

## Subtasks

### Issue 1: PROV Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] PROV source - Victorian state archives search and harvest" \
    --body "Implemented PROV (Public Record Office Victoria) source with 3 tools:
  - prov_search: Search Victorian state archives
  - prov_get_images: Extract image URLs from digitised records
  - prov_harvest: Bulk download PROV records

  No API key required." \
    --label "enhancement" \
    --milestone "v0.1.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue: `gh issue close <issue-number> --reason completed`
- [ ] Wait 2 seconds

### Issue 2: Trove Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] Trove source - National Library digitised collections" \
    --body "Implemented Trove (National Library of Australia) source with 5 tools:
  - trove_search: Search newspapers, images, books
  - trove_harvest: Bulk download Trove records
  - trove_newspaper_article: Get full article text
  - trove_list_titles: List newspaper/gazette titles
  - trove_title_details: Get title info with dates

  Requires Trove API key." \
    --label "enhancement" \
    --milestone "v0.1.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue: `gh issue close <issue-number> --reason completed`
- [ ] Wait 2 seconds

### Issue 3: MCP Architecture
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] Initial MCP server architecture with registry pattern" \
    --body "Established core architecture:
  - Tool registry with Map-based dispatch
  - BaseClient for shared fetch helpers
  - BaseSource interface for modular sources
  - HarvestRunner for pagination logic
  - TypeScript with strict types" \
    --label "enhancement" \
    --milestone "v0.1.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue: `gh issue close <issue-number> --reason completed`

---

## Execution Script

```bash
#!/bin/bash
# Create and close v0.1.0 retrospective issues

# Issue 1: PROV
ISSUE1=$(gh issue create \
  --title "[feat] PROV source - Victorian state archives search and harvest" \
  --body "Implemented PROV source with 3 tools: prov_search, prov_get_images, prov_harvest. No API key required." \
  --label "enhancement" \
  --milestone "v0.1.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE1 --reason completed
sleep 2

# Issue 2: Trove
ISSUE2=$(gh issue create \
  --title "[feat] Trove source - National Library digitised collections" \
  --body "Implemented Trove source with 5 tools. Requires API key." \
  --label "enhancement" \
  --milestone "v0.1.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE2 --reason completed
sleep 2

# Issue 3: Architecture
ISSUE3=$(gh issue create \
  --title "[feat] Initial MCP server architecture with registry pattern" \
  --body "Established core architecture: registry, BaseClient, BaseSource, HarvestRunner." \
  --label "enhancement" \
  --milestone "v0.1.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE3 --reason completed

echo "Created and closed 3 v0.1.0 issues"
```

---

## Summary

| Issue | Type | Milestone |
|-------|------|-----------|
| PROV source | feat | v0.1.0 |
| Trove source | feat | v0.1.0 |
| MCP architecture | feat | v0.1.0 |

**Total: 6 operations (3 create + 3 close)**

---

## Dependencies

- PREP-006 (labels) - need `enhancement` label
- PREP-007 (milestones) - need `v0.1.0` milestone
- `gh` CLI must be authenticated

---

## Verification

- [x] Run `gh issue list --state closed --milestone "v0.1.0"`
- [x] All 3 issues appear as closed (issues #7, #8, #9)
