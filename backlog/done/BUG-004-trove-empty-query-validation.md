# BUG-004: trove_search accepts empty query without validation

**Priority:** Medium
**Severity:** Minor
**Status:** Open
**Found In:** v0.7.0 (TEST-001)
**Component:** Trove source / run meta-tool

---

## Description

The `trove_search` tool accepts an empty query `{}` without validation, returning 314M+ results (all Trove records). The schema correctly marks `query` as required, but the `run()` meta-tool doesn't validate required parameters before execution.

## Steps to Reproduce

1. Call trove_search via run meta-tool with empty args:
   ```
   run(tool="trove_search", args={})
   ```

## Expected Behaviour

Returns error: "query is a required parameter"

## Actual Behaviour

Returns 314,809,096 results - the entire Trove database. No validation error.

## Impact

- Unintended expensive API calls
- Poor user experience (unexpected massive results)
- Potential rate limiting issues

## Investigation Areas

- [ ] Determine where validation should occur (run meta-tool vs tool itself)
- [ ] Check if other tools have same issue with required params
- [ ] Review MCP SDK patterns for parameter validation

## Files to Investigate

- `src/core/meta-tools/run.ts` (or wherever run is defined)
- `src/sources/trove/tools/search.ts`
- `src/registry.ts`

## Fix Options

### Option A: Validate in run() meta-tool
Add validation in run() that checks tool schema for required params before execution.

### Option B: Validate in each tool
Add validation at the start of each tool handler for required params.

### Recommended: Option A
Centralised validation in run() covers all tools without code duplication.

## Fix Requirements

1. Add required parameter validation to run() meta-tool
2. Return clear error message listing missing required params
3. Test with multiple tools that have required params
4. Retest trove_search with empty query

## Related

- TEST-001 Issue #1
- Also affects: Any tool with required parameters
