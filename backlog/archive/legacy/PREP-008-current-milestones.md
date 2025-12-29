# PREP-008: Current Milestones (Open)

**Priority:** P2
**Phase:** 3 (GitHub CLI Operations)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 1 min (with delays)

---

## Overview

Create open milestones for current and upcoming releases.

**CRITICAL:** Execute ONE milestone creation per command with 2-second delay between operations to avoid API 400 errors.

---

## Subtasks

### Milestone: v0.5.0 Public Release
- [ ] Create milestone:
  ```bash
  gh api repos/littlebearapps/australian-history-mcp/milestones \
    -f title="v0.5.0 Public Release" \
    -f description="Documentation and GitHub setup for public release" \
    -f state="open"
  ```
- [ ] Wait 2 seconds

### Milestone: v0.6.0
- [ ] Create milestone:
  ```bash
  gh api repos/littlebearapps/australian-history-mcp/milestones \
    -f title="v0.6.0" \
    -f description="Next feature release" \
    -f state="open"
  ```

---

## Execution Script

```bash
#!/bin/bash
# Create current milestones with delays

gh api repos/littlebearapps/australian-history-mcp/milestones \
  -f title="v0.5.0 Public Release" \
  -f description="Documentation and GitHub setup for public release" \
  -f state="open" && sleep 2

gh api repos/littlebearapps/australian-history-mcp/milestones \
  -f title="v0.6.0" \
  -f description="Next feature release" \
  -f state="open"

echo "Created 2 current milestones"
```

---

## Summary

| Milestone | Description | State |
|-----------|-------------|-------|
| v0.5.0 Public Release | GitHub/docs setup | Open |
| v0.6.0 | Next features | Open |

---

## Dependencies

- Repository must exist on GitHub
- PREP-007 (retrospective milestones) should be done first
- `gh` CLI must be authenticated

---

## Verification

- [ ] Run `gh api repos/littlebearapps/australian-history-mcp/milestones?state=open`
- [ ] Both milestones show as open
