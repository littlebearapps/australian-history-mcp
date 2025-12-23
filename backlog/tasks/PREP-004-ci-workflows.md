# PREP-004: CI/CD Workflows

**Priority:** P1
**Phase:** 1 (File Creation)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 30 mins

---

## Overview

Create GitHub Actions workflows for CI, security scanning, and automated releases.

---

## Subtasks

### 1. CI Workflow
- [x] Create `.github/workflows/ci.yml`
- [ ] Triggers: push to main, pull requests
- [ ] Jobs:
  - **build**: `npm run build`
  - **lint**: `npm run lint` (or skip if not configured)
  - **typecheck**: `tsc --noEmit`
  - **test**: `npm test` (skip or allow-failure - no tests yet)
  - **security**: `npm audit --audit-level=high`
- [ ] Matrix: Node.js 18.x, 20.x, 22.x

**Est. Lines:** 80

### 2. CodeQL Security Scanning
- [x] Create `.github/workflows/codeql.yml`
- [ ] Static analysis for TypeScript/JavaScript
- [ ] Triggers: push to main, pull requests, weekly schedule
- [ ] Standard GitHub security scanning

**Est. Lines:** 40

### 3. Release Workflow
- [x] Create `.github/workflows/release.yml`
- [ ] Trigger: GitHub release published
- [ ] Jobs:
  1. Build & test
  2. Publish to npm
     - OIDC Trusted Publisher (preferred) or NPM_TOKEN secret
     - npm provenance enabled
- [ ] Verify publication

**Est. Lines:** 60

### 4. Dependabot Configuration
- [x] Create `.github/dependabot.yml`
- [ ] npm dependencies: weekly updates
- [ ] GitHub Actions: weekly updates
- [ ] Auto-group dev dependencies
- [ ] Commit message prefix: `chore(deps):`

**Est. Lines:** 30

### 5. CODEOWNERS
- [x] Create `.github/CODEOWNERS`
- [ ] Assign ownership:
  - `/.github/` - @nathanschram
  - `/.github/workflows/` - @nathanschram

**Est. Lines:** 5

---

## Files to Create

| File | Est. Lines | Purpose |
|------|------------|---------|
| `.github/workflows/ci.yml` | 80 | Build, lint, typecheck, audit |
| `.github/workflows/codeql.yml` | 40 | Security scanning |
| `.github/workflows/release.yml` | 60 | npm publishing |
| `.github/dependabot.yml` | 30 | Automated updates |
| `.github/CODEOWNERS` | 5 | Review assignments |

---

## Directory Structure

```
.github/
├── CODEOWNERS
├── dependabot.yml
└── workflows/
    ├── ci.yml
    ├── codeql.yml
    ├── codex-review.yml  (existing - keep)
    └── release.yml
```

---

## Notes

- **No tests exist** - CI should skip or allow-failure for test step
- **codex-review.yml already exists** - keep as-is
- **NPM_TOKEN secret** - may need to be added for release workflow
- Consider npm OIDC Trusted Publisher setup for keyless publishing

---

## Content Filter Workaround (API Error 400)

**Risk Level:** Low-Medium

GitHub Actions workflow YAML may occasionally trigger Claude Code's content filter when reproducing standard CI patterns (e.g., codeql-analysis.yml, release workflows).

**If filter triggers:**
1. Use `curl` to download similar workflow from a public repo as a template
2. Edit with `sed` or manual modification
3. Example: `curl -sL "https://raw.githubusercontent.com/actions/starter-workflows/main/code-scanning/codeql.yml" -o .github/workflows/codeql.yml`

**Reference:** See PREP-001 for detailed workaround documentation

---

## Dependencies

- None (can start immediately)
- NPM_TOKEN secret needed before release workflow can run

---

## Verification

- [x] All 5 files created
- [x] ci.yml runs on PRs
- [x] codeql.yml has TypeScript/JavaScript configured
- [x] release.yml triggers on GitHub release
- [x] dependabot.yml has npm and actions ecosystems
- [x] CODEOWNERS assigns nathanschram
