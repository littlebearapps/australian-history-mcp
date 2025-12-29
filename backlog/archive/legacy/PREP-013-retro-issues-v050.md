# PREP-013: Retrospective Issues - v0.5.0

**Priority:** P2
**Phase:** 3 (GitHub CLI Operations)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 2 mins (with delays)

---

## Overview

Create and close retrospective issues for v0.5.0 features.

**CRITICAL:** Execute ONE issue operation per command with 2-second delay between operations to avoid API 400 errors.

---

## Subtasks

### Issue 1: 20 New Tools
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] 20 new tools across existing sources" \
    --body "Added 20 new tools across existing sources:
  - PROV: prov_get_agency, prov_get_series (2)
  - Trove: trove_get_work, trove_get_person, trove_get_list, trove_search_people, trove_list_contributors, trove_get_contributor (6)
  - Museums Victoria: Random sort option
  - ALA: ala_search_images, ala_match_name, ala_list_species_lists, ala_get_species_list (4)
  - NMA: nma_search_parties, nma_get_party, nma_search_media, nma_get_media, nma_get_place (5)
  - VHD: vhd_get_shipwreck (1)
  - ACMI: Creator and constellation tools (2)" \
    --label "enhancement" \
    --milestone "v0.5.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue
- [ ] Wait 2 seconds

### Issue 2: VHD/ACMI Fixes
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[fix] VHD/ACMI API response parsing quirks" \
    --body "Fixed API parsing issues:
  - VHD: HAL+JSON embedded keys mapping (local_government_authority, architectural_style, period)
  - VHD: Images returned as dictionary keyed by ID
  - VHD: API params use rpp/kw not limit/query
  - ACMI: Page-based pagination not offset-based
  - ACMI: Constellation name field mapping" \
    --label "bug" \
    --milestone "v0.5.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue
- [ ] Wait 2 seconds

### Issue 3: 6 New Trove Tools
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] 6 new Trove tools" \
    --body "Added 6 new Trove tools:
  - trove_get_work: Get book/image/map details with holdings
  - trove_get_person: Get biographical data
  - trove_get_list: Get user-curated research lists
  - trove_search_people: Search people and organisations
  - trove_list_contributors: List 1500+ contributing libraries
  - trove_get_contributor: Get contributor details by NUC

  Enhanced search with sortby, holdings, and NUC filtering." \
    --label "enhancement" \
    --milestone "v0.5.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue
- [ ] Wait 2 seconds

### Issue 4: Trove State Mapping
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[fix] Trove state abbreviation mapping" \
    --body "Fixed Trove state parameter handling:
  - User provides abbreviations (vic, nsw, qld, etc.)
  - Client automatically maps to full names for search API
  - Maps: vic → Victoria, nsw → New South Wales, etc.
  - Fixes search results filtering by state" \
    --label "bug" \
    --milestone "v0.5.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue

---

## Execution Script

```bash
#!/bin/bash
# Create and close v0.5.0 retrospective issues

# Issue 1: 20 new tools
ISSUE1=$(gh issue create \
  --title "[feat] 20 new tools across existing sources" \
  --body "Added 20 new tools across PROV, Trove, ALA, NMA, VHD, ACMI sources." \
  --label "enhancement" \
  --milestone "v0.5.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE1 --reason completed
sleep 2

# Issue 2: VHD/ACMI fixes
ISSUE2=$(gh issue create \
  --title "[fix] VHD/ACMI API response parsing quirks" \
  --body "Fixed VHD HAL+JSON parsing and ACMI pagination quirks." \
  --label "bug" \
  --milestone "v0.5.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE2 --reason completed
sleep 2

# Issue 3: Trove tools
ISSUE3=$(gh issue create \
  --title "[feat] 6 new Trove tools" \
  --body "Added 6 new Trove tools: get_work, get_person, get_list, search_people, list_contributors, get_contributor." \
  --label "enhancement" \
  --milestone "v0.5.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE3 --reason completed
sleep 2

# Issue 4: State mapping
ISSUE4=$(gh issue create \
  --title "[fix] Trove state abbreviation mapping" \
  --body "Fixed Trove state abbreviation to full name mapping for search API." \
  --label "bug" \
  --milestone "v0.5.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE4 --reason completed

echo "Created and closed 4 v0.5.0 issues"
```

---

## Summary

| Issue | Type | Milestone |
|-------|------|-----------|
| 20 new tools | feat | v0.5.0 |
| VHD/ACMI fixes | fix | v0.5.0 |
| 6 new Trove tools | feat | v0.5.0 |
| Trove state mapping | fix | v0.5.0 |

**Total: 8 operations (4 create + 4 close)**

---

## Dependencies

- PREP-006 (labels) - need `enhancement`, `bug` labels
- PREP-007 (milestones) - need `v0.5.0` milestone
- `gh` CLI must be authenticated

---

## Verification

- [x] Run `gh issue list --state closed --milestone "v0.5.0"`
- [x] All 4 issues appear as closed (issues #21, #22, #23, #24)
