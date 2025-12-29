# SEARCH-012: ACMI Filter Expansion

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** ✅ Done
**Estimated Effort:** 1 day
**Completed:** 2025-12-28
**Dependencies:** None

---

## Overview

Expand ACMI (Australian Centre for the Moving Image) search filters from 4 parameters to 8+ parameters.

**Current Parameters (4):**
- `query` - Text search
- `type` - Work type (Film, Television, etc.)
- `year` - Single year filter
- `page` - Pagination

**Implemented Parameters (6):**
- All current parameters, plus:
- `field` - Limit search to specific field (title, description)
- `size` - Results per page (up to 50)

---

## Completion Notes

### API Research Findings
- Tested ACMI api.acmi.net.au API
- **Supported filters:** `query`, `type`, `year`, `field`, `size`, `page`
- **NOT supported:** Year ranges, creator filters, genre filters, language, country
- API uses page-based pagination (page 1, 2, 3...) not offset-based

### API Limitations Discovered
- No `yearFrom`/`yearTo` range support - only single `year`
- No direct creator/filmmaker filtering
- No genre filtering
- No language or country filtering
- **Workaround:** Include creator/filmmaker names in the query string

### Implementation Details
- Updated `src/sources/acmi/types.ts` with field and size params
- Updated `src/sources/acmi/client.ts` to handle new params
- Updated `src/sources/acmi/tools/search-works.ts` with schema
- Updated `docs/quickrefs/acmi-api.md` with search tips and limitations

---

## Files Modified

| File | Change |
|------|--------|
| `src/sources/acmi/types.ts` | Added field and size params |
| `src/sources/acmi/client.ts` | Added parameter handling with size max 50 |
| `src/sources/acmi/tools/search-works.ts` | Updated schema with field enum |
| `docs/quickrefs/acmi-api.md` | Added search tips, documented limitations |

---

## Subtasks

### 1. Research ACMI API Capabilities
- [x] Review ACMI api.acmi.net.au documentation
- [x] Test available query parameters:
  - [x] Year range filtering (from/to) → NOT SUPPORTED
  - [x] Decade filtering → NOT SUPPORTED
  - [x] Creator/filmmaker filtering → NOT SUPPORTED
  - [x] Genre filtering → NOT SUPPORTED
  - [x] Language filtering → NOT SUPPORTED
  - [x] Country of origin filtering → NOT SUPPORTED
  - [x] Field search (title, description) → SUPPORTED
  - [x] Page size → SUPPORTED (max 50)
- [x] Document which filters are supported
- [x] Note response structure changes

### 2. Update Types
- [x] Expanded `ACMISearchParams` with field and size

### 3. Update Client
- [x] Modified `searchWorks()` in `client.ts`
- [x] Added field parameter
- [x] Added size parameter with max 50 limit

### 4. Update Search Tool
- [x] Added new parameters to tool schema
- [x] Added field enum (title, description)

### 5. Testing
- [x] Tested field filtering
- [x] Tested size parameter
- [x] Verified results match filter criteria
- [x] Build succeeded

### 6. Documentation
- [x] Updated `docs/quickrefs/acmi-api.md` with new filters
- [x] Added search tips for limited API
- [x] Documented workarounds

---

## Example Queries

```
# Search by title only
acmi_search_works: query="Mad Max", field="title"

# Get more results per page
acmi_search_works: query="Australian cinema", size=50

# Find films from a year
acmi_search_works: query="Australian", type="Film", year=1979

# Workaround: Include director in query
acmi_search_works: query="George Miller Mad Max", type="Film"
```

---

## Search Tips (Documented)

| Use Case | Approach |
|----------|----------|
| Search by title only | `query: "Mad Max"`, `field: "title"` |
| Films from a year | `query: "Australian"`, `type: "Film"`, `year: 1979` |
| Find by director | Include director name in query (e.g., `query: "George Miller"`) |
| More results | Set `size: 50` for max results per page |

---

## Acceptance Criteria

- [x] At least 2 new filter parameters added (field, size)
- [x] Backwards compatible with existing parameters
- [x] API limitations documented
- [x] Workarounds documented
- [x] No breaking changes

---

## Notes

- ACMI API has limited filter support compared to other sources
- Year ranges not supported - use single `year` filter
- Creator filtering not supported - include creator names in query string
- Genre not supported - include genre keywords in query
- Page-based pagination (page 1, 2, 3...) not offset-based
- Constellations use `name` field not `title` for collection names
