# SEARCH-005: Faceted Search - ALA Implementation

**Priority:** P1
**Phase:** 1 - Core Search Enhancements
**Status:** ✅ Completed
**Completed:** 2025-12-28
**Estimated Effort:** 0.5 days
**Dependencies:** SEARCH-002 (Facet Infrastructure)

---

## Outcome

**Status: Complete** - ALA biocache faceted search implemented and working.

### Implementation Summary

ALA biocache API supports native faceting via the `facets` parameter. Added facet parameters to occurrence search and parsing of ALA facet response.

**ALA Facets Available:**
- `kingdom` - Taxonomic kingdom (Animalia, Plantae, etc.)
- `stateProvince` - Australian state/territory
- `basisOfRecord` - Record type (specimen, observation, etc.)
- `year` - Observation year
- `dataResourceName` - Contributing dataset

### Files Modified

| File | Change |
|------|--------|
| `src/sources/ala/tools/search-occurrences.ts` | Added `includeFacets`, `facetFields`, `facetLimit` parameters |
| `src/sources/ala/client.ts` | Added facet request params (`facets=*`, `flimit=*`) |
| `src/sources/ala/types.ts` | Added ALAFacet, ALAFacetValue types |

### Usage Example

```
ala_search_occurrences: scientificName="Phascolarctos cinereus", includeFacets=true, facetFields=["stateProvince", "year"]
```

Returns:
```json
{
  "records": [...],
  "facets": [
    {"name": "stateProvince", "displayName": "State", "values": [{"value": "Victoria", "count": 1234}, ...]},
    {"name": "year", "displayName": "Year", "values": [{"value": "2023", "count": 567}, ...]}
  ]
}
```

---

## Acceptance Criteria

- [x] `includeFacets` parameter added to ala_search_occurrences
- [x] Native API facets (`facets` param) correctly used
- [x] ALA facet response format parsed correctly
- [x] Facet response matches common format
- [x] No breaking changes to existing search
