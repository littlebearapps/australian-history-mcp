# PREP-010: Retrospective Issues - v0.2.0

**Priority:** P2
**Phase:** 3 (GitHub CLI Operations)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 2 mins (with delays)

---

## Overview

Create and close retrospective issues for v0.2.0 features.

**CRITICAL:** Execute ONE issue operation per command with 2-second delay between operations to avoid API 400 errors.

---

## Subtasks

### Issue 1: data.gov.au Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] data.gov.au source - 11 CKAN API tools" \
    --body "Implemented data.gov.au source with 11 tools:
  - datagovau_search, datagovau_get_dataset, datagovau_get_resource
  - datagovau_datastore_search, datagovau_list_organizations
  - datagovau_get_organization, datagovau_list_groups
  - datagovau_get_group, datagovau_list_tags
  - datagovau_harvest, datagovau_autocomplete

  No API key required." \
    --label "enhancement" \
    --milestone "v0.2.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue: `gh issue close <issue-number> --reason completed`
- [ ] Wait 2 seconds

### Issue 2: Museums Victoria Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] Museums Victoria source - 6 collection tools" \
    --body "Implemented Museums Victoria source with 6 tools:
  - museumsvic_search, museumsvic_get_article
  - museumsvic_get_item, museumsvic_get_species
  - museumsvic_get_specimen, museumsvic_harvest

  No API key required." \
    --label "enhancement" \
    --milestone "v0.2.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue: `gh issue close <issue-number> --reason completed`
- [ ] Wait 2 seconds

### Issue 3: README Documentation
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[docs] Comprehensive README for npm package" \
    --body "Created comprehensive README.md with:
  - Installation instructions
  - Tool reference tables
  - Usage examples
  - API key setup guides
  - Licensing information" \
    --label "documentation" \
    --milestone "v0.2.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue: `gh issue close <issue-number> --reason completed`

---

## Execution Script

```bash
#!/bin/bash
# Create and close v0.2.0 retrospective issues

# Issue 1: data.gov.au
ISSUE1=$(gh issue create \
  --title "[feat] data.gov.au source - 11 CKAN API tools" \
  --body "Implemented data.gov.au source with 11 tools for Australian government open data." \
  --label "enhancement" \
  --milestone "v0.2.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE1 --reason completed
sleep 2

# Issue 2: Museums Victoria
ISSUE2=$(gh issue create \
  --title "[feat] Museums Victoria source - 6 collection tools" \
  --body "Implemented Museums Victoria source with 6 tools for museum collections." \
  --label "enhancement" \
  --milestone "v0.2.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE2 --reason completed
sleep 2

# Issue 3: README
ISSUE3=$(gh issue create \
  --title "[docs] Comprehensive README for npm package" \
  --body "Created comprehensive README with installation, tool reference, and usage examples." \
  --label "documentation" \
  --milestone "v0.2.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE3 --reason completed

echo "Created and closed 3 v0.2.0 issues"
```

---

## Summary

| Issue | Type | Milestone |
|-------|------|-----------|
| data.gov.au source | feat | v0.2.0 |
| Museums Victoria source | feat | v0.2.0 |
| README documentation | docs | v0.2.0 |

**Total: 6 operations (3 create + 3 close)**

---

## Dependencies

- PREP-006 (labels) - need `enhancement`, `documentation` labels
- PREP-007 (milestones) - need `v0.2.0` milestone
- `gh` CLI must be authenticated

---

## Verification

- [x] Run `gh issue list --state closed --milestone "v0.2.0"`
- [x] All 3 issues appear as closed (issues #10, #11, #12)
