# SEARCH-011: NMA Filter Expansion

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** ✅ Done
**Estimated Effort:** 1 day
**Completed:** 2025-12-28
**Dependencies:** None

---

## Overview

Expand NMA (National Museum of Australia) search filters from 4 parameters to 8+ parameters. NMA currently has minimal filtering compared to other sources.

**Current Parameters (4):**
- `query` - Text search
- `type` - Object type
- `collection` - Collection name
- `limit` - Max results

**Implemented Parameters (8):**
- All current parameters, plus:
- `medium` - Material filter (e.g., "Wood", "Paper", "Metal")
- `spatial` - Place/location filter (e.g., "Victoria", "Queensland")
- `year` - Year filter (temporal)
- `creator` - Creator/maker name

---

## Completion Notes

### API Research Findings
- Tested NMA data.nma.gov.au API
- **Supported filters:** `medium`, `spatial`, `temporal` (year), `creator`
- **NOT supported:** `subject`, `place` (use `spatial` instead), `party`
- API uses offset-based pagination

### Implementation Details
- Updated `src/sources/nma/types.ts` with new filter parameters
- Updated `src/sources/nma/client.ts` to handle new query params
- Updated `src/sources/nma/tools/search-objects.ts` with schema and facet configs
- Updated `src/core/source-router.ts` for federated search mapping
- Updated `docs/quickrefs/nma-api.md` with filter examples

### Federated Search Mapping
```typescript
case 'nma':
  mapped.query = query;
  mapped.limit = limit;
  if (dateFrom) mapped.year = parseInt(dateFrom, 10);
  if (state) mapped.spatial = mapStateToFull(state);
  if (args.medium) mapped.medium = args.medium;
  if (args.creator) mapped.creator = args.creator;
  break;
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/sources/nma/types.ts` | Added medium, spatial, temporal, creator params |
| `src/sources/nma/client.ts` | Added parameter handling in searchObjects() |
| `src/sources/nma/tools/search-objects.ts` | Updated schema, added facet configs |
| `src/core/source-router.ts` | Added NMA federated search mapping |
| `docs/quickrefs/nma-api.md` | Added filter examples, common material values |

---

## Subtasks

### 1. Research NMA API Capabilities
- [x] Review NMA data.nma.gov.au API documentation
- [x] Test available query parameters:
  - [x] Date filtering options → `temporal` param works
  - [x] Material/medium filtering → `medium` param works
  - [x] Subject/theme filtering → NOT supported
  - [x] Geographic filtering → `spatial` param works
  - [x] Creator filtering → `creator` param works
- [x] Document response structure for each filter
- [x] Note any limitations or quirks

### 2. Update Types
- [x] Expanded `NMASearchParams` with medium, spatial, temporal, creator

### 3. Update Client
- [x] Modified `searchObjects()` in `client.ts`
- [x] Added new query parameter construction

### 4. Update Search Tool
- [x] Added new parameters to tool schema
- [x] Added parameter descriptions
- [x] Added facet configs for medium and spatial

### 5. Update Federated Search Mapping
- [x] Mapped common federated params to NMA params

### 6. Testing
- [x] Tested each new filter individually
- [x] Tested filter combinations
- [x] Verified results match filter criteria

### 7. Documentation
- [x] Updated `docs/quickrefs/nma-api.md` with new filters
- [x] Added filter examples

---

## Example Queries

```
# Filter by material
nma_search_objects: query="boomerang", medium="Wood"

# Filter by place
nma_search_objects: query="colonial", spatial="Victoria"

# Filter by creator
nma_search_objects: query="artwork", creator="Aboriginal"

# Filter by year
nma_search_objects: query="gold", year=1851

# Combined filters
nma_search_objects: query="photograph", spatial="Melbourne", medium="Paper"
```

---

## Acceptance Criteria

- [x] At least 4 new filter parameters added
- [x] All filters work correctly with API
- [x] Filters can be combined
- [x] Federated search maps to new parameters
- [x] Documentation updated
- [x] No breaking changes to existing behavior

---

## Notes

- NMA API doesn't support `subject` or `place` filters - use `spatial` instead
- Creator filtering uses exact matching
- Common materials: Wood, Paper, Metal, Glass, Ceramic, Textile, Stone, Leather, Bone, Ivory
