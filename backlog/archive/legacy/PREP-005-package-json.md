# PREP-005: Package.json Enhancements

**Priority:** P3
**Phase:** 1 (File Creation / Edit)
**Status:** Completed
**Completed:** 2025-12-23
**Estimated Time:** 5 mins

---

## Overview

Add repository metadata fields to package.json for npm discoverability and linking.

---

## Subtasks

### 1. Add homepage field
- [ ] Add `homepage` field to package.json
- [ ] Value: `"https://github.com/littlebearapps/australian-history-mcp#readme"`

### 2. Add bugs field
- [ ] Add `bugs` object to package.json
- [ ] Value:
  ```json
  "bugs": {
    "url": "https://github.com/littlebearapps/australian-history-mcp/issues"
  }
  ```

---

## Changes to Make

**File:** `package.json`

**Add fields:**
```json
{
  "homepage": "https://github.com/littlebearapps/australian-history-mcp#readme",
  "bugs": {
    "url": "https://github.com/littlebearapps/australian-history-mcp/issues"
  }
}
```

**Note:** No funding links per user decision.

---

## Current package.json Status

Check existing fields:
- [ ] Verify `repository` field exists (should already have)
- [ ] Verify `author` field exists
- [ ] Verify `license` field is "MIT"

---

## Content Filter Note

**Risk Level:** None

Package.json edits are simple JSON modifications. They do not trigger the Claude Code content filter (API Error 400).

---

## Dependencies

- None (can start immediately)

---

## Verification

- [ ] `homepage` field added
- [ ] `bugs.url` field added
- [ ] `npm run build` still works
- [ ] Fields appear on npmjs.com after next publish
