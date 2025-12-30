---
id: task-62
title: 'Phase 4.6: Create manual testing checklist'
status: Done
assignee: []
created_date: '2025-12-30 03:38'
updated_date: '2025-12-30 05:36'
labels:
  - phase-4
  - testing
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `docs/dev-guides/manual-testing-checklist.md` for verifying all new functionality.

**Checklist Structure:**

```markdown
# Manual Testing Checklist

## Prerequisites
- [ ] Build passes: `npm run build`
- [ ] Type check passes: `npx tsc --noEmit`
- [ ] MCP server starts: `node dist/index.js`

## Research Planning

### plan_search
- [ ] Topic analysis extracts themes correctly
- [ ] Historical names suggested for Melbourne suburbs
- [ ] Source prioritisation matches topic
- [ ] plan.md file is created and formatted correctly
- [ ] Coverage matrix is generated

## Session Management

### session_start
- [ ] Creates new session
- [ ] Validates name format
- [ ] Rejects duplicate names
- [ ] Rejects if session already active

### session_status
- [ ] Returns quick status by default
- [ ] Full detail includes all queries
- [ ] Coverage tracking is accurate

### session_end
- [ ] Marks session completed
- [ ] Generates final report
- [ ] Clears active session
- [ ] Updates plan.md if linked

### session_resume
- [ ] Resumes by ID
- [ ] Resumes by name
- [ ] Returns previous progress

### Auto-logging
- [ ] Queries logged when session active
- [ ] Fingerprints generated
- [ ] Duplicates detected

## Context Compression

### compress
- [ ] Minimal level works
- [ ] Standard level works
- [ ] Full level works
- [ ] Token savings reported correctly

### urls
- [ ] Extracts URLs correctly
- [ ] Markdown format valid
- [ ] Handles missing URLs

### dedupe
- [ ] URL matching works
- [ ] Title similarity works
- [ ] Source priority respected

### checkpoint
- [ ] Save persists to disk
- [ ] Load restores correctly
- [ ] List shows all checkpoints
- [ ] Delete removes checkpoint

## End-to-End Workflow
- [ ] Complete research session works
- [ ] Results compress correctly
- [ ] Session resumes after restart
```

**Dependencies:** All implementation tasks completed
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Covers all new meta-tools
- [x] #2 Each tool has specific test cases
- [x] #3 End-to-end workflow included
- [x] #4 Prerequisites section is complete
- [x] #5 Checklist is actionable and verifiable
<!-- AC:END -->
