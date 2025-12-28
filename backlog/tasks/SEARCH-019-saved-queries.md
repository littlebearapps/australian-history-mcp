# SEARCH-019: Search History & Saved Queries

**Priority:** P3
**Phase:** 3 - Future Enhancements
**Status:** Not Started
**Estimated Effort:** 1 day
**Dependencies:** None

---

## Overview

Add meta-tools for saving, listing, and replaying complex searches. This enables users to build up a library of useful research queries without re-entering parameters.

**Goal:** Allow users to save named query configurations and execute them later.

---

## Files to Create

| File | Description |
|------|-------------|
| `src/core/meta-tools/save-query.ts` | Save named query tool |
| `src/core/meta-tools/list-queries.ts` | List saved queries tool |
| `src/core/meta-tools/run-query.ts` | Execute saved query tool |
| `src/core/storage/query-store.ts` | Local JSON storage for queries |

## Files to Modify

| File | Change |
|------|--------|
| `src/index.ts` | Register new meta-tools |
| `docs/quickrefs/tools-reference.md` | Document new tools |
| `CLAUDE.md` | Update meta-tools section |

---

## Subtasks

### 1. Define Query Storage Schema
- [ ] Create `src/core/storage/query-store.ts`:
  ```typescript
  interface SavedQuery {
    name: string;           // Unique identifier
    description?: string;   // Optional description
    source: string;         // Target source (trove, prov, etc.) or 'federated'
    tool: string;           // Tool name (e.g., trove_search, search)
    parameters: Record<string, unknown>;  // Tool parameters
    createdAt: string;      // ISO timestamp
    lastUsed?: string;      // ISO timestamp of last execution
    useCount: number;       // Execution count
  }

  interface QueryStore {
    queries: SavedQuery[];
    version: string;
  }
  ```

### 2. Implement Query Store
- [ ] Determine storage location:
  ```typescript
  const storePath = path.join(
    os.homedir(),
    '.local/share/australian-history-mcp/saved-queries.json'
  );
  ```
- [ ] Implement CRUD operations:
  - `saveQuery(query: SavedQuery): void`
  - `getQuery(name: string): SavedQuery | null`
  - `listQueries(): SavedQuery[]`
  - `deleteQuery(name: string): boolean`
  - `updateLastUsed(name: string): void`
- [ ] Create directory if not exists
- [ ] Handle permissions errors gracefully
- [ ] Validate query data on load

### 3. Create save_query Tool
- [ ] Create `src/core/meta-tools/save-query.ts`:
  ```typescript
  interface SaveQueryInput {
    name: string;           // Query name (unique, alphanumeric + hyphens)
    description?: string;   // Optional description
    source: string;         // Source or 'federated'
    tool: string;           // Tool name to execute
    parameters: Record<string, unknown>;  // Parameters to save
    overwrite?: boolean;    // Overwrite if exists (default false)
  }
  ```
- [ ] Validate name format (alphanumeric, hyphens, underscores)
- [ ] Check for duplicate names (error unless overwrite=true)
- [ ] Validate tool name exists
- [ ] Return confirmation with query details

### 4. Create list_queries Tool
- [ ] Create `src/core/meta-tools/list-queries.ts`:
  ```typescript
  interface ListQueriesInput {
    source?: string;        // Filter by source
    sortBy?: 'name' | 'created' | 'lastUsed' | 'useCount';
    limit?: number;         // Max results (default all)
  }
  ```
- [ ] Return list with name, description, source, tool, useCount
- [ ] Support filtering and sorting
- [ ] Show parameters in summary format

### 5. Create run_query Tool
- [ ] Create `src/core/meta-tools/run-query.ts`:
  ```typescript
  interface RunQueryInput {
    name: string;           // Query name to execute
    overrides?: Record<string, unknown>;  // Override saved parameters
  }
  ```
- [ ] Load query by name
- [ ] Merge overrides with saved parameters
- [ ] Execute the target tool
- [ ] Update lastUsed and useCount
- [ ] Return tool results

### 6. Add delete_query Tool
- [ ] Create `src/core/meta-tools/delete-query.ts`:
  ```typescript
  interface DeleteQueryInput {
    name: string;           // Query to delete
    confirm?: boolean;      // Require confirmation (default true)
  }
  ```
- [ ] Return deleted query details or error if not found

### 7. Register Tools
- [ ] Add tools to `src/index.ts`
- [ ] Add to meta-tools list in dynamic mode
- [ ] Verify tool schemas are correct

### 8. Testing
- [ ] Test save query with valid parameters
- [ ] Test name validation (reject invalid names)
- [ ] Test duplicate detection
- [ ] Test overwrite functionality
- [ ] Test list queries with filters
- [ ] Test run query execution
- [ ] Test parameter overrides
- [ ] Test delete query
- [ ] Test storage persistence across restarts

### 9. Documentation
- [ ] Document each new tool
- [ ] Add usage examples
- [ ] Document storage location
- [ ] Note that queries are local (not synced)

---

## Example Usage

```
# Save a complex Trove search
save_query: name="gold-rush-vic", description="Gold rush newspaper articles in Victoria",
            source="trove", tool="trove_search",
            parameters={query:"gold rush", category:"newspaper", state:"vic", dateFrom:"1850", dateTo:"1870"}

# List all saved queries
list_queries: sortBy="lastUsed"
→ [
    { name: "gold-rush-vic", source: "trove", useCount: 5, lastUsed: "2024-01-15" },
    { name: "melbourne-heritage", source: "vhd", useCount: 3, lastUsed: "2024-01-14" }
  ]

# Run a saved query
run_query: name="gold-rush-vic"
→ Executes trove_search with saved parameters, returns results

# Run with parameter overrides
run_query: name="gold-rush-vic", overrides={state:"nsw"}
→ Executes with NSW instead of VIC

# Delete a query
delete_query: name="gold-rush-vic"
→ Query deleted
```

---

## Use Case: Building Research Workflows

```
# Step 1: Develop a search
trove_search: query="federation australia 1901", category="newspaper", state="vic"
→ 1,234 results

# Step 2: Refine and save
save_query: name="federation-1901", description="Newspaper articles about Australian Federation",
            source="trove", tool="trove_search",
            parameters={query:"federation australia", category:"newspaper", dateFrom:"1900", dateTo:"1902"}

# Step 3: Re-run later
run_query: name="federation-1901"
→ Same search, instant execution

# Step 4: Adapt for different regions
run_query: name="federation-1901", overrides={state:"nsw"}
→ Same search, NSW articles only
```

---

## Acceptance Criteria

- [ ] save_query creates persistent query records
- [ ] list_queries returns all saved queries
- [ ] run_query executes saved queries correctly
- [ ] Parameter overrides work in run_query
- [ ] Queries persist across MCP server restarts
- [ ] Invalid names are rejected with helpful errors
- [ ] Documentation includes examples

---

## Notes

- Queries are stored locally, not synced
- Storage uses XDG-compliant paths
- Consider future: export/import queries as JSON
- Consider future: share queries via gist/URL
- Keep storage format simple for manual editing
