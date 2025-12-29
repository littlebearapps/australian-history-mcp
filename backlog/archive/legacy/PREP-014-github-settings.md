# PREP-014: GitHub Repository Settings

**Priority:** P2
**Phase:** 4 (GitHub API)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 5 mins

---

## Overview

Configure GitHub repository settings. Completed via `gh api` CLI commands.

---

## Subtasks

### 1. Enable GitHub Discussions
- [x] `gh api repos/{owner}/{repo} -X PATCH -f has_discussions=true`

### 2. Verify Issues Enabled
- [x] Issues already enabled (verified via API)

### 3. Set Up Branch Protection
- [x] `gh api repos/{owner}/{repo}/branches/main/protection -X PUT` with:
  - Required PR reviews: 1 approval
  - Required status checks: `build`, `typecheck`
  - Strict mode enabled (up-to-date branches)

### 4. Enable Dependabot Alerts
- [x] `gh api repos/{owner}/{repo}/vulnerability-alerts -X PUT`
- [x] `gh api repos/{owner}/{repo}/automated-security-fixes -X PUT`

### 5. Enable Secret Scanning
- [x] `gh api repos/{owner}/{repo} -X PATCH` with security_and_analysis:
  - secret_scanning: enabled
  - secret_scanning_push_protection: enabled

### 6. (Optional) Enable Code Scanning
- [ ] CodeQL workflow added in PREP-004, will run on next PR

---

## Settings Summary

| Setting | Location | Status |
|---------|----------|--------|
| Discussions | Features | ✅ Enabled |
| Issues | Features | ✅ Verified |
| Branch protection | Branches | ✅ Configured |
| Dependabot alerts | Security | ✅ Enabled |
| Secret scanning | Security | ✅ Enabled |
| Code scanning | Security | ⏳ Pending PR |

---

## Dependencies

- Repository must exist on GitHub
- PREP-001 to PREP-005 should be committed and pushed
- PREP-004 CodeQL workflow should be merged

---

## Verification

- [x] Discussions tab visible in repository
- [x] Branch protection rules show on main branch (1 approval, build+typecheck checks)
- [x] Dependabot alerts enabled
- [x] Dependabot security updates enabled
- [x] Secret scanning enabled
- [x] Secret scanning push protection enabled
- [ ] CodeQL runs on PRs (requires PR to verify)

---

## Notes

- Branch protection may prevent direct pushes to main
- Ensure at least one admin can bypass protection if needed
- Consider adding "Require conversation resolution before merging" later
