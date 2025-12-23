# PREP-002: GitHub Issue & PR Templates

**Priority:** P1
**Phase:** 1 (File Creation)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 20 mins

---

## Overview

Create GitHub issue and pull request templates to standardise community contributions.

---

## Subtasks

### 1. Bug Report Template
- [x] Create `.github/ISSUE_TEMPLATE/bug_report.md`
- [x] Include fields:
  - Data source affected (PROV, Trove, etc.)
  - Node.js version
  - MCP client (Claude Code, etc.)
  - Steps to reproduce
  - Expected vs actual behaviour
  - Error messages / logs
- [x] Auto-labels: `bug`, `needs-triage`

**Est. Lines:** 50

### 2. Feature Request Template
- [x] Create `.github/ISSUE_TEMPLATE/feature_request.md`
- [x] Include fields:
  - Type (new source, new tool, enhancement)
  - Source/tool name
  - Use case description
  - Example queries
  - API documentation link (if new source)
- [x] Auto-labels: `enhancement`

**Est. Lines:** 40

### 3. Issue Template Config
- [x] Create `.github/ISSUE_TEMPLATE/config.yml`
- [x] Disable blank issues
- [x] Add links:
  - Discussions (for questions)
  - Documentation (README)

**Est. Lines:** 15

### 4. Pull Request Template
- [x] Create `.github/PULL_REQUEST_TEMPLATE.md`
- [x] Include sections:
  - Type of change (bug fix, new source, new tool, docs, refactor)
  - Source affected (if applicable)
  - Quality checklist:
    - [ ] Build passes (`npm run build`)
    - [ ] Type check passes (`tsc --noEmit`)
    - [ ] Lint passes (if configured)
    - [x] Tested manually via MCP
  - Related issues (Fixes #xxx)

**Est. Lines:** 40

---

## Note

These templates contain original content specific to this project. They do not trigger the Claude Code content filter (API Error 400) that affects reproduction of standard templates like licenses and codes of conduct.

---

## Files to Create

| File | Est. Lines |
|------|------------|
| `.github/ISSUE_TEMPLATE/bug_report.md` | 50 |
| `.github/ISSUE_TEMPLATE/feature_request.md` | 40 |
| `.github/ISSUE_TEMPLATE/config.yml` | 15 |
| `.github/PULL_REQUEST_TEMPLATE.md` | 40 |

---

## Directory Structure

```
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   ├── feature_request.md
│   └── config.yml
└── PULL_REQUEST_TEMPLATE.md
```

---

## Dependencies

- None (can start immediately)
- Ensure `.github/` directory exists

---

## Verification

- [x] All 4 files created
- [x] Bug report template has source dropdown
- [x] Feature request template has type dropdown
- [x] Config disables blank issues
- [x] PR template has quality checklist
