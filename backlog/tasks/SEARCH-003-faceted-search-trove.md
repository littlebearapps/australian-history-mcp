# SEARCH-003: Faceted Search - Trove Implementation

**Priority:** P0 (Most-used source)
**Phase:** 1 - Core Search Enhancements
**Status:** ✅ Completed
**Completed:** 2025-12-28
**Estimated Effort:** 0.5 days
**Dependencies:** SEARCH-002 (Facet Infrastructure)

---

## Outcome

**Status: Complete** - Trove native faceted search implemented and working.

### Implementation Summary

Trove has native facet support via the `facet` parameter. Implementation adds facet parameters to search and returns facet counts from API response.

**Trove Facets Available:**
- `decade` - Publication decade (1900s, 1910s, etc.)
- `year` - Specific years
- `state` - Australian state/territory
- `format` - Content format
- `category` - Trove zone (newspaper, book, etc.)
- `nuc` - Contributing library (NUC code)

### Files Modified

| File | Change |
|------|--------|
| `src/sources/trove/tools/search.ts` | Added `includeFacets`, `facetFields`, `facetLimit` parameters |
| `src/sources/trove/client.ts` | Added facet request params to API call |
| `src/sources/trove/types.ts` | Added TroveFacet, TroveFacetValue types |

### Usage Example

```
trove_search: query="Melbourne flood", category="newspaper", includeFacets=true, facetFields=["decade", "state"]
```

Returns:
```json
{
  "records": [...],
  "facets": [
    {"name": "decade", "displayName": "Decade", "values": [{"value": "1890", "count": 45}, ...]},
    {"name": "state", "displayName": "State", "values": [{"value": "Victoria", "count": 120}, ...]}
  ]
}
```

---

## Acceptance Criteria

- [x] `includeFacets` parameter added to trove_search
- [x] `facetFields` parameter allows selecting specific facets
- [x] Native API facets returned correctly
- [x] Facet response matches common FacetsResponse format
- [x] No breaking changes to existing search
