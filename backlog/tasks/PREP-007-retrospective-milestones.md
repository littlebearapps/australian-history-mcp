# PREP-007: Retrospective Milestones (Closed)

**Priority:** P2
**Phase:** 3 (GitHub CLI Operations)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 2 mins (with delays)

---

## Overview

Create closed milestones to document project version history.

**CRITICAL:** Execute ONE milestone creation per command with 2-second delay between operations to avoid API 400 errors.

---

## Subtasks

### Milestone: v0.1.0
- [ ] Create milestone:
  ```bash
  gh api repos/littlebearapps/australian-archives-mcp/milestones \
    -f title="v0.1.0" \
    -f description="Initial release - PROV and Trove sources" \
    -f state="closed" \
    -f due_on="2024-12-01T00:00:00Z"
  ```
- [ ] Wait 2 seconds

### Milestone: v0.2.0
- [ ] Create milestone:
  ```bash
  gh api repos/littlebearapps/australian-archives-mcp/milestones \
    -f title="v0.2.0" \
    -f description="data.gov.au and Museums Victoria sources" \
    -f state="closed" \
    -f due_on="2024-12-08T00:00:00Z"
  ```
- [ ] Wait 2 seconds

### Milestone: v0.3.0
- [ ] Create milestone:
  ```bash
  gh api repos/littlebearapps/australian-archives-mcp/milestones \
    -f title="v0.3.0" \
    -f description="ALA, NMA, VHD sources" \
    -f state="closed" \
    -f due_on="2024-12-15T00:00:00Z"
  ```
- [ ] Wait 2 seconds

### Milestone: v0.4.0
- [ ] Create milestone:
  ```bash
  gh api repos/littlebearapps/australian-archives-mcp/milestones \
    -f title="v0.4.0" \
    -f description="ACMI, PM Transcripts, GA HAP, IIIF sources" \
    -f state="closed" \
    -f due_on="2024-12-20T00:00:00Z"
  ```
- [ ] Wait 2 seconds

### Milestone: v0.5.0
- [ ] Create milestone:
  ```bash
  gh api repos/littlebearapps/australian-archives-mcp/milestones \
    -f title="v0.5.0" \
    -f description="20 new tools, VHD/ACMI fixes, Trove enhancements" \
    -f state="closed" \
    -f due_on="2024-12-23T00:00:00Z"
  ```

---

## Execution Script

```bash
#!/bin/bash
# Create retrospective milestones with delays

gh api repos/littlebearapps/australian-archives-mcp/milestones \
  -f title="v0.1.0" \
  -f description="Initial release - PROV and Trove sources" \
  -f state="closed" \
  -f due_on="2024-12-01T00:00:00Z" && sleep 2

gh api repos/littlebearapps/australian-archives-mcp/milestones \
  -f title="v0.2.0" \
  -f description="data.gov.au and Museums Victoria sources" \
  -f state="closed" \
  -f due_on="2024-12-08T00:00:00Z" && sleep 2

gh api repos/littlebearapps/australian-archives-mcp/milestones \
  -f title="v0.3.0" \
  -f description="ALA, NMA, VHD sources" \
  -f state="closed" \
  -f due_on="2024-12-15T00:00:00Z" && sleep 2

gh api repos/littlebearapps/australian-archives-mcp/milestones \
  -f title="v0.4.0" \
  -f description="ACMI, PM Transcripts, GA HAP, IIIF sources" \
  -f state="closed" \
  -f due_on="2024-12-20T00:00:00Z" && sleep 2

gh api repos/littlebearapps/australian-archives-mcp/milestones \
  -f title="v0.5.0" \
  -f description="20 new tools, VHD/ACMI fixes, Trove enhancements" \
  -f state="closed" \
  -f due_on="2024-12-23T00:00:00Z"

echo "Created 5 retrospective milestones"
```

---

## Summary

| Milestone | Description | State |
|-----------|-------------|-------|
| v0.1.0 | PROV and Trove | Closed |
| v0.2.0 | data.gov.au, Museums Victoria | Closed |
| v0.3.0 | ALA, NMA, VHD | Closed |
| v0.4.0 | ACMI, PM Transcripts, GA HAP, IIIF | Closed |
| v0.5.0 | 20 new tools, fixes | Closed |

---

## Dependencies

- Repository must exist on GitHub
- PREP-006 (labels) should be done first
- `gh` CLI must be authenticated

---

## Verification

- [ ] Run `gh api repos/littlebearapps/australian-archives-mcp/milestones?state=closed`
- [ ] All 5 milestones show as closed
