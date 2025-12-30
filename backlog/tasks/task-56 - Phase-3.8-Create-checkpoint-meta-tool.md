---
id: task-56
title: 'Phase 3.8: Create checkpoint meta-tool'
status: Done
assignee: []
created_date: '2025-12-30 03:37'
updated_date: '2025-12-30 05:14'
labels:
  - phase-3
  - context-compression
  - meta-tool
dependencies:
  - task-56
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/meta-tools/checkpoint.ts` - tool to save and restore compressed state.

**Purpose:** Persist compressed results for later resumption.

**Input Schema:**
```typescript
{
  action: 'save' | 'load' | 'list' | 'delete';
  
  // For save:
  name?: string;                   // Checkpoint name
  records?: CompressedRecord[];    // Data to save
  
  // For load/delete:
  id?: string;                     // Checkpoint ID or name
  
  // For list:
  limit?: number;                  // Default: 10
}
```

**Output (save):**
```typescript
{
  status: 'saved';
  checkpoint: {
    id: string;
    name: string;
    created: string;
    recordCount: number;
  };
  message: string;
}
```

**Output (load):**
```typescript
{
  status: 'loaded';
  checkpoint: {
    id: string;
    name: string;
    created: string;
  };
  records: CompressedRecord[];
  recordCount: number;
}
```

**Output (list):**
```typescript
{
  status: 'listed';
  checkpoints: Array<{
    id: string;
    name: string;
    created: string;
    recordCount: number;
  }>;
  total: number;
}
```

**Use Cases:**
1. Save before context window nears limit
2. Resume next day without re-searching
3. Share checkpoint with another session

**Dependencies:** Requires task-56 (checkpoint store)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tool registered in meta-tools registry with correct schema
- [ ] #2 Save action persists to disk
- [ ] #3 Load action restores records correctly
- [ ] #4 List action shows all checkpoints
- [ ] #5 Delete action removes checkpoint
- [ ] #6 Handles missing checkpoints gracefully
- [ ] #7 Links to active session when available
<!-- AC:END -->
