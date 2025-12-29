# PREP-006: GitHub Labels

**Priority:** P2
**Phase:** 3 (GitHub CLI Operations)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 5 mins (with delays)

---

## Overview

Create GitHub labels for issue categorisation and filtering.

**CRITICAL:** Execute ONE label creation per command with 2-second delay between operations to avoid API 400 errors.

---

## Subtasks

### Type Labels (4)

Run each command separately with `sleep 2` between:

- [ ] `gh label create "bug" --description "Something isn't working" --color "d73a4a"`
- [ ] `gh label create "enhancement" --description "New feature or request" --color "a2eeef"`
- [ ] `gh label create "documentation" --description "Improvements or additions to documentation" --color "0075ca"`
- [ ] `gh label create "question" --description "Further information is requested" --color "d876e3"`

### Status Labels (3)

- [ ] `gh label create "needs-triage" --description "Needs initial review" --color "fbca04"`
- [ ] `gh label create "help-wanted" --description "Extra attention is needed" --color "008672"`
- [ ] `gh label create "good-first-issue" --description "Good for newcomers" --color "7057ff"`

### Source Labels (11)

- [ ] `gh label create "source:prov" --description "PROV Victoria" --color "0052CC"`
- [ ] `gh label create "source:trove" --description "Trove / NLA" --color "0052CC"`
- [ ] `gh label create "source:datagovau" --description "data.gov.au" --color "0052CC"`
- [ ] `gh label create "source:museumsvic" --description "Museums Victoria" --color "0052CC"`
- [ ] `gh label create "source:ala" --description "Atlas of Living Australia" --color "0052CC"`
- [ ] `gh label create "source:nma" --description "National Museum of Australia" --color "0052CC"`
- [ ] `gh label create "source:vhd" --description "Victorian Heritage Database" --color "0052CC"`
- [ ] `gh label create "source:acmi" --description "ACMI" --color "0052CC"`
- [ ] `gh label create "source:pm-transcripts" --description "PM Transcripts" --color "0052CC"`
- [ ] `gh label create "source:iiif" --description "IIIF tools" --color "0052CC"`
- [ ] `gh label create "source:ga-hap" --description "Geoscience Australia HAP" --color "0052CC"`

### Priority Labels (3)

- [ ] `gh label create "priority:critical" --description "Blocking issues" --color "b60205"`
- [ ] `gh label create "priority:high" --description "Important issues" --color "d93f0b"`
- [ ] `gh label create "priority:low" --description "Nice to have" --color "c5def5"`

---

## Execution Script

Run from repository root:

```bash
#!/bin/bash
# Create labels with delays to avoid API rate limits

# Type labels
gh label create "bug" --description "Something isn't working" --color "d73a4a" && sleep 2
gh label create "enhancement" --description "New feature or request" --color "a2eeef" && sleep 2
gh label create "documentation" --description "Improvements or additions to documentation" --color "0075ca" && sleep 2
gh label create "question" --description "Further information is requested" --color "d876e3" && sleep 2

# Status labels
gh label create "needs-triage" --description "Needs initial review" --color "fbca04" && sleep 2
gh label create "help-wanted" --description "Extra attention is needed" --color "008672" && sleep 2
gh label create "good-first-issue" --description "Good for newcomers" --color "7057ff" && sleep 2

# Source labels
gh label create "source:prov" --description "PROV Victoria" --color "0052CC" && sleep 2
gh label create "source:trove" --description "Trove / NLA" --color "0052CC" && sleep 2
gh label create "source:datagovau" --description "data.gov.au" --color "0052CC" && sleep 2
gh label create "source:museumsvic" --description "Museums Victoria" --color "0052CC" && sleep 2
gh label create "source:ala" --description "Atlas of Living Australia" --color "0052CC" && sleep 2
gh label create "source:nma" --description "National Museum of Australia" --color "0052CC" && sleep 2
gh label create "source:vhd" --description "Victorian Heritage Database" --color "0052CC" && sleep 2
gh label create "source:acmi" --description "ACMI" --color "0052CC" && sleep 2
gh label create "source:pm-transcripts" --description "PM Transcripts" --color "0052CC" && sleep 2
gh label create "source:iiif" --description "IIIF tools" --color "0052CC" && sleep 2
gh label create "source:ga-hap" --description "Geoscience Australia HAP" --color "0052CC" && sleep 2

# Priority labels
gh label create "priority:critical" --description "Blocking issues" --color "b60205" && sleep 2
gh label create "priority:high" --description "Important issues" --color "d93f0b" && sleep 2
gh label create "priority:low" --description "Nice to have" --color "c5def5"

echo "Created 21 labels"
```

---

## Summary

| Category | Count | Color |
|----------|-------|-------|
| Type | 4 | Various |
| Status | 3 | Various |
| Source | 11 | Blue (#0052CC) |
| Priority | 3 | Red shades |
| **Total** | **21** | - |

---

## Dependencies

- Repository must exist on GitHub
- `gh` CLI must be authenticated
- Files from PREP-001 to PREP-005 should be committed first

---

## Verification

- [ ] Run `gh label list` to confirm all 21 labels exist
- [ ] Labels appear in GitHub Issues UI
