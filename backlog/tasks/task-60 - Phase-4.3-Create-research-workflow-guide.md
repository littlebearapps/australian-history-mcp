---
id: task-60
title: 'Phase 4.3: Create research workflow guide'
status: Done
assignee: []
created_date: '2025-12-30 03:38'
updated_date: '2025-12-30 05:35'
labels:
  - phase-4
  - documentation
dependencies:
  - task-58
  - task-59
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `docs/quickrefs/research-workflow.md` - a comprehensive guide for AI agents on using the new planning and session tools.

**Document Structure:**

```markdown
# Research Workflow Guide

## Overview
How to conduct efficient research using plan_search, sessions, and compression.

## Workflow Stages

### Stage 1: Planning
1. Use `plan_search` to analyse topic
2. Review search strategy
3. Note historical name suggestions
4. Understand coverage matrix

### Stage 2: Session Management  
1. Start session with `session_start`
2. Execute searches (auto-logged)
3. Check progress with `session_status`
4. Add notes with `session_note`

### Stage 3: Result Management
1. Compress results with `compress`
2. Deduplicate if needed with `dedupe`
3. Extract URLs with `urls`
4. Checkpoint progress with `checkpoint`

### Stage 4: Completion
1. End session with `session_end`
2. Export findings with `session_export`

## Complete Example Session
Full walkthrough with actual tool calls and outputs.

## Tips and Best Practices
- When to compress
- Optimal session naming
- Checkpoint frequency
- Recovery from context reset
```

**Dependencies:** Phase 4.1 and 4.2 completed
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Covers all workflow stages
- [x] #2 Includes complete example session
- [x] #3 Best practices are actionable
- [x] #4 Links to tools-reference.md for details
- [x] #5 Suitable for AI agent consumption
<!-- AC:END -->
