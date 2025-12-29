# SEARCH-006: Faceted Search - Remaining Sources (Client-Side)

**Priority:** P1
**Phase:** 1 - Core Search Enhancements
**Status:** ✅ Completed
**Completed:** 2025-12-28
**Estimated Effort:** 1.5 days
**Dependencies:** SEARCH-002 (Facet Infrastructure)

---

## Outcome

**Status: Complete** - Client-side faceted search implemented for all 6 remaining sources.

### Implementation Summary

Implemented client-side facet counting using the aggregator utility from SEARCH-002 for sources without native facet support.

### Sources Updated

| Source | Tool | Facets Implemented |
|--------|------|-------------------|
| Museums Victoria | `museumsvic_search` | recordType, category, imageLicence |
| NMA | `nma_search_objects` | type, collection |
| VHD | `vhd_search_places` | municipality, architecturalStyle, period, heritageAuthority |
| ACMI | `acmi_search_works` | type, productionPlace, decade |
| GHAP | `ghap_search` | state, lga, featureType, source |
| GA HAP | `ga_hap_search` | state, filmType, decade |

### Implementation Pattern

Each source follows the same pattern:

```typescript
import { countFacets, simpleFacetConfig, countByDecade } from '../../../core/facets/index.js';
import type { Facet } from '../../../core/facets/types.js';

const FACET_CONFIGS = [
  simpleFacetConfig('state', 'State', 'stateName'),
  simpleFacetConfig('type', 'Type', 'recordType'),
];

const FACET_FIELDS = ['state', 'type', 'decade'];

// In schema:
includeFacets: { type: 'boolean', description: PARAMS.INCLUDE_FACETS, default: false },
facetFields: { type: 'array', items: { type: 'string', enum: FACET_FIELDS }, description: PARAMS.FACET_FIELDS },
facetLimit: { type: 'number', description: PARAMS.FACET_LIMIT, default: 10 },

// In execute():
if (input.includeFacets && results.length > 0) {
  const facets: Facet[] = [];

  // Standard facets
  const facetResult = countFacets(results, {
    facetConfigs: FACET_CONFIGS,
    includeFacets: input.facetFields,
    limit: input.facetLimit ?? 10,
  });
  facets.push(...Object.values(facetResult.facets));

  // Decade facet (special handling)
  if (input.facetFields?.includes('decade')) {
    const decadeValues = countByDecade(results, 'yearField');
    facets.push({ name: 'decade', displayName: 'Decade', values: decadeValues, total: ... });
  }

  response.facets = facets;
}
```

### Files Modified

| Source | File |
|--------|------|
| Museums Vic | `src/sources/museums-victoria/tools/search.ts` |
| NMA | `src/sources/nma/tools/search-objects.ts` |
| VHD | `src/sources/vhd/tools/search-places.ts` |
| ACMI | `src/sources/acmi/tools/search-works.ts` |
| GHAP | `src/sources/ghap/tools/search.ts` |
| GA HAP | `src/sources/ga-hap/tools/search.ts` |

### Special Handling

- **ACMI & GA HAP**: Use `countByDecade()` for decade facets from year fields
- **VHD**: Maps HAL+JSON embedded keys (e.g., `local_government_authority`)
- **GHAP**: Counts from GeoJSON feature properties

---

## Acceptance Criteria

- [x] All 6 sources have `includeFacets` parameter
- [x] Client-side facet counting works correctly
- [x] Decade facets handled specially for ACMI and GA HAP
- [x] Facet response matches common format
- [x] No breaking changes to existing search
- [x] Build compiles without errors
