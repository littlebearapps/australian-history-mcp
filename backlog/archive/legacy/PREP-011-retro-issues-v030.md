# PREP-011: Retrospective Issues - v0.3.0

**Priority:** P2
**Phase:** 3 (GitHub CLI Operations)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 3 mins (with delays)

---

## Overview

Create and close retrospective issues for v0.3.0 features.

**CRITICAL:** Execute ONE issue operation per command with 2-second delay between operations to avoid API 400 errors.

---

## Subtasks

### Issue 1: ALA Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] Atlas of Living Australia (ALA) - 8 biodiversity tools" \
    --body "Implemented ALA source with 8 tools:
  - ala_search_occurrences, ala_search_species
  - ala_get_species, ala_harvest
  - ala_search_images, ala_match_name
  - ala_list_species_lists, ala_get_species_list

  100M+ species occurrence records. No API key required." \
    --label "enhancement" \
    --milestone "v0.3.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue
- [ ] Wait 2 seconds

### Issue 2: NMA Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] National Museum of Australia (NMA) - 9 collection tools" \
    --body "Implemented NMA source with 9 tools:
  - nma_search_objects, nma_get_object
  - nma_search_places, nma_get_place
  - nma_search_parties, nma_get_party
  - nma_search_media, nma_get_media
  - nma_harvest

  National cultural heritage collection. No API key required." \
    --label "enhancement" \
    --milestone "v0.3.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue
- [ ] Wait 2 seconds

### Issue 3: VHD Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] Victorian Heritage Database (VHD) - 9 heritage tools" \
    --body "Implemented VHD source with 9 tools:
  - vhd_search_places, vhd_get_place
  - vhd_search_shipwrecks, vhd_get_shipwreck
  - vhd_list_municipalities, vhd_list_architectural_styles
  - vhd_list_themes, vhd_list_periods
  - vhd_harvest

  Heritage places and shipwrecks. No API key required." \
    --label "enhancement" \
    --milestone "v0.3.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue
- [ ] Wait 2 seconds

### Issue 4: ACMI Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] ACMI - 7 moving image collection tools" \
    --body "Implemented ACMI source with 7 tools:
  - acmi_search_works, acmi_get_work
  - acmi_list_creators, acmi_get_creator
  - acmi_list_constellations, acmi_get_constellation
  - acmi_harvest

  Films, TV, videogames, digital art. No API key required." \
    --label "enhancement" \
    --milestone "v0.3.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue
- [ ] Wait 2 seconds

### Issue 5: PM Transcripts Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] PM Transcripts - 2 Prime Ministerial speech tools" \
    --body "Implemented PM Transcripts source with 2 tools:
  - pm_transcripts_get_transcript
  - pm_transcripts_harvest

  26,000+ Prime Ministerial speeches and media releases (1945-present).
  No API key required." \
    --label "enhancement" \
    --milestone "v0.3.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue

---

## Execution Script

```bash
#!/bin/bash
# Create and close v0.3.0 retrospective issues

# Issue 1: ALA
ISSUE1=$(gh issue create \
  --title "[feat] Atlas of Living Australia (ALA) - 8 biodiversity tools" \
  --body "Implemented ALA source with 8 tools for biodiversity data." \
  --label "enhancement" \
  --milestone "v0.3.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE1 --reason completed
sleep 2

# Issue 2: NMA
ISSUE2=$(gh issue create \
  --title "[feat] National Museum of Australia (NMA) - 9 collection tools" \
  --body "Implemented NMA source with 9 tools for museum collections." \
  --label "enhancement" \
  --milestone "v0.3.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE2 --reason completed
sleep 2

# Issue 3: VHD
ISSUE3=$(gh issue create \
  --title "[feat] Victorian Heritage Database (VHD) - 9 heritage tools" \
  --body "Implemented VHD source with 9 tools for heritage sites." \
  --label "enhancement" \
  --milestone "v0.3.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE3 --reason completed
sleep 2

# Issue 4: ACMI
ISSUE4=$(gh issue create \
  --title "[feat] ACMI - 7 moving image collection tools" \
  --body "Implemented ACMI source with 7 tools for films/TV/games." \
  --label "enhancement" \
  --milestone "v0.3.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE4 --reason completed
sleep 2

# Issue 5: PM Transcripts
ISSUE5=$(gh issue create \
  --title "[feat] PM Transcripts - 2 Prime Ministerial speech tools" \
  --body "Implemented PM Transcripts source with 2 tools." \
  --label "enhancement" \
  --milestone "v0.3.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE5 --reason completed

echo "Created and closed 5 v0.3.0 issues"
```

---

## Summary

| Issue | Type | Milestone |
|-------|------|-----------|
| ALA source | feat | v0.3.0 |
| NMA source | feat | v0.3.0 |
| VHD source | feat | v0.3.0 |
| ACMI source | feat | v0.3.0 |
| PM Transcripts source | feat | v0.3.0 |

**Total: 10 operations (5 create + 5 close)**

---

## Dependencies

- PREP-006 (labels) - need `enhancement` label
- PREP-007 (milestones) - need `v0.3.0` milestone
- `gh` CLI must be authenticated

---

## Verification

- [x] Run `gh issue list --state closed --milestone "v0.3.0"`
- [x] All 5 issues appear as closed (issues #13, #14, #15, #16, #17)
