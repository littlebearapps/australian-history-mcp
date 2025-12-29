# SEARCH-004: Faceted Search - PROV Implementation

**Priority:** P1
**Phase:** 1 - Core Search Enhancements
**Status:** ✅ Completed
**Completed:** 2025-12-28
**Estimated Effort:** 0.5 days
**Dependencies:** SEARCH-002 (Facet Infrastructure)

---

## Outcome

**Status: Complete** - PROV Solr-based faceted search implemented and working.

### Implementation Summary

PROV uses a Solr-based search backend which supports native faceting. Added facet parameters to search and parsing of Solr facet response format.

**PROV Facets Available:**
- `recordForm` - Record type (Photograph, Map, File, etc.)
- `category` - Category (agency, series, item, function, image)
- `series` - VPRS series
- `agency` - VA agency

### Files Modified

| File | Change |
|------|--------|
| `src/sources/prov/tools/search.ts` | Added `includeFacets`, `facetFields`, `facetLimit` parameters |
| `src/sources/prov/client.ts` | Added Solr facet query params (`facet=true`, `facet.field=*`) |
| `src/sources/prov/types.ts` | Added PROVFacetResponse types |

### Solr Facet Format

Solr returns facets as alternating value/count arrays:
```json
{
  "facet_counts": {
    "facet_fields": {
      "record_form": ["Photograph", 45, "Map", 23, "File", 12]
    }
  }
}
```

Client parses this into standard Facet format.

### Usage Example

```
prov_search: query="railway", includeFacets=true, facetFields=["recordForm", "category"]
```

---

## Acceptance Criteria

- [x] `includeFacets` parameter added to prov_search
- [x] Solr facet parameters correctly added to query
- [x] Solr alternating array format parsed correctly
- [x] Facet response matches common format
- [x] No breaking changes to existing search
