# SEARCH-012: ACMI Filter Expansion

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** Not Started
**Estimated Effort:** 1 day
**Dependencies:** None

---

## Overview

Expand ACMI (Australian Centre for the Moving Image) search filters from 4 parameters to 8+ parameters.

**Current Parameters (4):**
- `query` - Text search
- `type` - Work type (Film, Television, etc.)
- `year` - Single year filter
- `page` - Pagination

**Target Parameters (8+):**
- All current parameters, plus:
- `yearFrom` / `yearTo` - Year range (instead of single year)
- `decade` - Decade filter
- `creator` - Filter by director/actor/studio
- `genre` - Genre filter (if supported)
- `language` - Language filter
- `country` - Country of origin

---

## Files to Modify

| File | Change |
|------|--------|
| `src/sources/acmi/tools/search.ts` | Add new parameters |
| `src/sources/acmi/client.ts` | Support new query params |
| `src/sources/acmi/types.ts` | Update input types |
| `docs/quickrefs/acmi-api.md` | Document new filters |

---

## Subtasks

### 1. Research ACMI API Capabilities
- [ ] Review ACMI api.acmi.net.au documentation
- [ ] Test available query parameters:
  - [ ] Year range filtering (from/to)
  - [ ] Decade filtering
  - [ ] Creator/filmmaker filtering
  - [ ] Genre filtering
  - [ ] Language filtering
  - [ ] Country of origin filtering
- [ ] Document which filters are supported
- [ ] Note response structure changes

### 2. Update Types
- [ ] Expand `ACMISearchInput`:
  ```typescript
  interface ACMISearchInput {
    query?: string;
    type?: 'Film' | 'Television' | 'Videogame' | 'Artwork' | 'Object';

    // Enhanced date filtering
    year?: number;          // Keep for backwards compatibility
    yearFrom?: number;      // Start of year range
    yearTo?: number;        // End of year range
    decade?: number;        // e.g., 1980 for 1980s

    // New filters
    creator?: string;       // Director, actor, studio
    genre?: string;         // Genre classification
    language?: string;      // Content language
    country?: string;       // Country of origin

    page?: number;
    limit?: number;
  }
  ```

### 3. Update Client
- [ ] Modify `search()` in `client.ts`
- [ ] Add year range handling:
  ```typescript
  if (yearFrom && yearTo) {
    // API-specific range syntax
  } else if (decade) {
    yearFrom = decade;
    yearTo = decade + 9;
  } else if (year) {
    // Existing single year behavior
  }
  ```
- [ ] Add creator parameter
- [ ] Add genre parameter if supported
- [ ] Add language parameter if supported

### 4. Leverage Existing Creator Tools
- [ ] ACMI already has `acmi_list_creators` and `acmi_get_creator`
- [ ] Integrate creator filtering with search:
  ```typescript
  // If creator specified, could lookup creator ID first
  // Then filter by creator ID in search
  ```
- [ ] Consider adding creator ID parameter for direct filtering

### 5. Update Search Tool
- [ ] Add new parameters to tool schema
- [ ] Deprecate single `year` in favor of `yearFrom`/`yearTo` (keep for compatibility)
- [ ] Add parameter descriptions and examples

### 6. Update Federated Search Mapping
- [ ] Map common federated params to ACMI params:
  ```typescript
  // In federated search
  if (source === 'acmi') {
    return {
      query: input.query,
      yearFrom: input.dateFrom ? parseInt(input.dateFrom) : undefined,
      yearTo: input.dateTo ? parseInt(input.dateTo) : undefined,
      type: input.type,
    };
  }
  ```

### 7. Testing
- [ ] Test year range filtering
- [ ] Test decade filtering
- [ ] Test creator filtering
- [ ] Test filter combinations
- [ ] Test with federated search
- [ ] Verify backwards compatibility with `year` parameter

### 8. Documentation
- [ ] Update `docs/quickrefs/acmi-api.md` with new filters
- [ ] Add examples to CLAUDE.md
- [ ] Note which filters are most useful

---

## Example Queries

```
# Filter by year range
acmi_search_works: query="australian", yearFrom=1970, yearTo=1989

# Filter by decade
acmi_search_works: type="Film", decade=1980

# Filter by creator
acmi_search_works: query="mad max", creator="George Miller"

# Combined filters
acmi_search_works: type="Film", yearFrom=1990, yearTo=1999, country="Australia"

# Federated search mapping
search: query="australian film 1980s", type="media"
→ Routes to ACMI with yearFrom=1980, yearTo=1989
```

---

## Work Type Reference

ACMI work types for `type` parameter:
- `Film` - Feature films, shorts, documentaries
- `Television` - TV shows, series, specials
- `Videogame` - Video games
- `Artwork` - Digital art, installations
- `Object` - Physical objects, equipment

---

## Acceptance Criteria

- [ ] Year range filtering works (yearFrom/yearTo)
- [ ] Decade filtering works
- [ ] Creator filtering works (at least by name search)
- [ ] At least 2 additional filters added
- [ ] Backwards compatible with existing `year` parameter
- [ ] Federated search maps date parameters
- [ ] Documentation updated

---

## Notes

- ACMI API may have limited filter support
- Creator filtering may need to use search in query string
- Genre categories may not be standardized
- Consider adding constellation (curated collection) as filter
- Page-based pagination (page 1, 2, 3...) not offset-based
