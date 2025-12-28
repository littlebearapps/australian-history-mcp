# SEARCH-011: NMA Filter Expansion

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** Not Started
**Estimated Effort:** 1 day
**Dependencies:** None

---

## Overview

Expand NMA (National Museum of Australia) search filters from 4 parameters to 8+ parameters. NMA currently has minimal filtering compared to other sources.

**Current Parameters (4):**
- `query` - Text search
- `type` - Object type
- `collection` - Collection name
- `limit` - Max results

**Target Parameters (8+):**
- All current parameters, plus:
- `dateFrom` / `dateTo` - Date range
- `material` - Material/medium
- `subject` - Subject/theme
- `place` - Geographic association
- `creator` - Creator/maker

---

## Files to Modify

| File | Change |
|------|--------|
| `src/sources/nma/tools/search-objects.ts` | Add new parameters |
| `src/sources/nma/client.ts` | Support new query params |
| `src/sources/nma/types.ts` | Update input types |
| `docs/quickrefs/nma-api.md` | Document new filters |

---

## Subtasks

### 1. Research NMA API Capabilities
- [ ] Review NMA data.nma.gov.au API documentation
- [ ] Test available query parameters:
  - [ ] Date filtering options
  - [ ] Material/medium filtering
  - [ ] Subject/theme filtering
  - [ ] Geographic filtering
  - [ ] Creator filtering
- [ ] Document response structure for each filter
- [ ] Note any limitations or quirks

### 2. Update Types
- [ ] Expand `NMASearchInput`:
  ```typescript
  interface NMASearchInput {
    query?: string;
    type?: string;
    collection?: string;

    // New filters
    dateFrom?: string;      // YYYY or YYYY-MM-DD
    dateTo?: string;
    material?: string;      // e.g., "wood", "paper", "metal"
    subject?: string;       // e.g., "gold rush", "indigenous"
    place?: string;         // e.g., "Victoria", "Melbourne"
    creator?: string;       // Creator/maker name

    limit?: number;
    offset?: number;
  }
  ```

### 3. Update Client
- [ ] Modify `searchObjects()` in `client.ts`
- [ ] Add new query parameter construction:
  ```typescript
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  if (material) params.append('material', material);
  if (subject) params.append('subject', subject);
  if (place) params.append('place', place);
  if (creator) params.append('creator', creator);
  ```
- [ ] Handle API-specific parameter names

### 4. Update Search Tool
- [ ] Add new parameters to tool schema
- [ ] Add parameter descriptions
- [ ] Handle parameter validation

### 5. Update Federated Search Mapping
- [ ] Map common federated params to NMA params:
  ```typescript
  // In federated search
  if (source === 'nma') {
    return {
      query: input.query,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      // ... other mappings
    };
  }
  ```

### 6. Testing
- [ ] Test each new filter individually
- [ ] Test filter combinations
- [ ] Test with federated search
- [ ] Verify results match filter criteria
- [ ] Test edge cases (empty results, invalid values)

### 7. Documentation
- [ ] Update `docs/quickrefs/nma-api.md` with new filters
- [ ] Add examples to CLAUDE.md
- [ ] Document which filters can be combined

---

## Example Queries

```
# Filter by date range
nma_search_objects: query="gold", dateFrom="1850", dateTo="1900"

# Filter by material
nma_search_objects: query="boomerang", material="wood"

# Filter by place
nma_search_objects: query="colonial", place="Victoria"

# Filter by creator
nma_search_objects: query="artwork", creator="Aboriginal"

# Combined filters
nma_search_objects: query="photograph", dateFrom="1900", dateTo="1950", place="Melbourne"
```

---

## Acceptance Criteria

- [ ] At least 4 new filter parameters added
- [ ] All filters work correctly with API
- [ ] Filters can be combined
- [ ] Federated search maps to new parameters
- [ ] Documentation updated
- [ ] No breaking changes to existing behavior

---

## Notes

- NMA API may not support all proposed filters
- Some filters may need to be client-side if API doesn't support
- Prioritize most useful filters if API is limited
- Creator filtering may need fuzzy matching
