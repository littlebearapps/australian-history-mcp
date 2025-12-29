# PREP-003: GitHub Discussion Templates

**Priority:** P2
**Phase:** 1 (File Creation)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 15 mins

---

## Overview

Create GitHub Discussion templates to enable community Q&A, ideas, and showcases.

**Note:** Discussions must be enabled in GitHub UI before these templates work.

---

## Subtasks

### 1. Q&A Template
- [x] Create `.github/DISCUSSION_TEMPLATE/q-a.yml`
- [ ] Purpose: Help and support questions
- [ ] Fields:
  - Question summary
  - What have you tried?
  - Environment (Node.js version, MCP client)

**Est. Lines:** 30

### 2. Ideas Template
- [x] Create `.github/DISCUSSION_TEMPLATE/ideas.yml`
- [ ] Purpose: Feature ideas, new source requests
- [ ] Fields:
  - Idea title
  - Description
  - Use case
  - API link (if new source)

**Est. Lines:** 30

### 3. Show & Tell Template
- [x] Create `.github/DISCUSSION_TEMPLATE/show-and-tell.yml`
- [ ] Purpose: Share projects, usage examples
- [ ] Fields:
  - Project description
  - What sources/tools used
  - Links / screenshots

**Est. Lines:** 25

---

## Files to Create

| File | Est. Lines |
|------|------------|
| `.github/DISCUSSION_TEMPLATE/q-a.yml` | 30 |
| `.github/DISCUSSION_TEMPLATE/ideas.yml` | 30 |
| `.github/DISCUSSION_TEMPLATE/show-and-tell.yml` | 25 |

---

## Directory Structure

```
.github/
└── DISCUSSION_TEMPLATE/
    ├── q-a.yml
    ├── ideas.yml
    └── show-and-tell.yml
```

---

## Content Filter Note

**Risk Level:** Low

Discussion templates are project-specific YAML files with custom content. They are unlikely to trigger the Claude Code content filter (API Error 400).

If filter issues occur, see PREP-001 for the curl workaround documentation.

---

## Dependencies

- **PREP-014** (GitHub Settings) must enable Discussions first
- Templates won't appear until Discussions enabled

---

## Verification

- [x] All 3 template files created
- [x] YAML syntax is valid
- [ ] Templates appear in GitHub Discussions UI after Discussions enabled
