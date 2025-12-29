# PREP-012: Retrospective Issues - v0.4.0

**Priority:** P2
**Phase:** 3 (GitHub CLI Operations)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 2 mins (with delays)

---

## Overview

Create and close retrospective issues for v0.4.0 features.

**CRITICAL:** Execute ONE issue operation per command with 2-second delay between operations to avoid API 400 errors.

---

## Subtasks

### Issue 1: GA HAP Source
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] Geoscience Australia HAP - 3 aerial photography tools" \
    --body "Implemented Geoscience Australia Historical Aerial Photography source with 3 tools:
  - ga_hap_search: Search 1.2M+ aerial photos (1928-1996)
  - ga_hap_get_photo: Get photo details by ID or film/run/frame
  - ga_hap_harvest: Bulk download photo metadata

  CC-BY 4.0 licensed. No API key required." \
    --label "enhancement" \
    --milestone "v0.4.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue
- [ ] Wait 2 seconds

### Issue 2: IIIF Tools
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] IIIF generic tools - manifest and image URL construction" \
    --body "Implemented generic IIIF tools for any IIIF-compliant institution:
  - iiif_get_manifest: Fetch and parse IIIF manifests
  - iiif_get_image_url: Construct IIIF Image API URLs

  Works with SLV, NLA, Bodleian, and any IIIF server.
  No API key required." \
    --label "enhancement" \
    --milestone "v0.4.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue
- [ ] Wait 2 seconds

### Issue 3: Trove NUC Filtering
- [ ] Create issue:
  ```bash
  gh issue create \
    --title "[feat] Trove NUC filtering for contributor-specific searches" \
    --body "Added NUC (National Union Catalogue) filtering to Trove tools:
  - Filter search results by contributing library
  - Common codes: VSL (State Library Victoria), SLNSW, ANL, QSL
  - Enhanced trove_search and trove_harvest with nuc parameter
  - Added trove_get_contributor and trove_list_contributors tools" \
    --label "enhancement" \
    --milestone "v0.4.0"
  ```
- [ ] Wait 2 seconds
- [ ] Close issue

---

## Execution Script

```bash
#!/bin/bash
# Create and close v0.4.0 retrospective issues

# Issue 1: GA HAP
ISSUE1=$(gh issue create \
  --title "[feat] Geoscience Australia HAP - 3 aerial photography tools" \
  --body "Implemented GA HAP source with 3 tools for 1.2M+ aerial photos." \
  --label "enhancement" \
  --milestone "v0.4.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE1 --reason completed
sleep 2

# Issue 2: IIIF
ISSUE2=$(gh issue create \
  --title "[feat] IIIF generic tools - manifest and image URL construction" \
  --body "Implemented IIIF tools for any IIIF-compliant institution." \
  --label "enhancement" \
  --milestone "v0.4.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE2 --reason completed
sleep 2

# Issue 3: Trove NUC
ISSUE3=$(gh issue create \
  --title "[feat] Trove NUC filtering for contributor-specific searches" \
  --body "Added NUC filtering to filter Trove by contributing library." \
  --label "enhancement" \
  --milestone "v0.4.0" | grep -o '[0-9]*$')
sleep 2
gh issue close $ISSUE3 --reason completed

echo "Created and closed 3 v0.4.0 issues"
```

---

## Summary

| Issue | Type | Milestone |
|-------|------|-----------|
| GA HAP source | feat | v0.4.0 |
| IIIF tools | feat | v0.4.0 |
| Trove NUC filtering | feat | v0.4.0 |

**Total: 6 operations (3 create + 3 close)**

---

## Dependencies

- PREP-006 (labels) - need `enhancement` label
- PREP-007 (milestones) - need `v0.4.0` milestone
- `gh` CLI must be authenticated

---

## Verification

- [x] Run `gh issue list --state closed --milestone "v0.4.0"`
- [x] All 3 issues appear as closed (issues #18, #19, #20)
