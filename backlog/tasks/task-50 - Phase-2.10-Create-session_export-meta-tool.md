---
id: task-50
title: 'Phase 2.10: Create session_export meta-tool'
status: Done
assignee: []
created_date: '2025-12-30 03:35'
updated_date: '2025-12-30 04:51'
labels:
  - phase-2
  - session-management
  - meta-tool
dependencies:
  - task-46
  - task-47
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/meta-tools/session-export.ts` - tool to export session data.

**Purpose:** Export session queries, results, and coverage to various formats.

**Input Schema:**
```typescript
{
  id?: string;                   // Session ID (defaults to active)
  format: 'json' | 'markdown' | 'csv';
  include?: ('queries' | 'results' | 'coverage' | 'all')[];  // Default: ['all']
  path?: string;                 // Output file path
}
```

**Output:**
```typescript
{
  status: 'exported';
  format: string;
  path?: string;                 // If saved to file
  content?: string;              // If not saved (for inline viewing)
  size: number;                  // Characters/bytes
}
```

**Export Formats:**

**JSON:** Full session object
**Markdown:** Formatted report with tables
**CSV:** Queries log or results list

**Behaviour:**
- Returns content inline if no path specified
- Writes to file if path provided
- Supports partial exports (queries only, coverage only)

**Dependencies:** Requires task-46, task-47 (types and store)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tool registered in meta-tools registry with correct schema
- [ ] #2 Exports to JSON, Markdown, and CSV formats
- [ ] #3 Writes to file when path provided
- [ ] #4 Returns content inline when no path
- [ ] #5 Supports partial exports
- [ ] #6 CSV format is valid and parseable
- [ ] #7 Markdown includes proper tables
<!-- AC:END -->
