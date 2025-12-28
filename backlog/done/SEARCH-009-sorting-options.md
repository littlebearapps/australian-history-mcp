# SEARCH-009: Sorting Options - Multi-Source

**Priority:** P2
**Phase:** 1 - Core Search Enhancements
**Status:** ✅ Complete
**Completed:** 2025-12-28
**Estimated Effort:** 1 day
**Actual Effort:** ~0.5 days
**Dependencies:** None

---

## Summary

Added explicit `sortby` parameter to search tools across sources that support API-level sorting. Verified which sources support sorting and documented limitations.

---

## Implementation Notes

### Sources Updated

| Source | Status | Sort Options | Implementation |
|--------|--------|--------------|----------------|
| PROV | ✅ Added | relevance, date_asc, date_desc | `sort` Solr param |
| Museums Vic | ✅ Extended | relevance, date, alphabetical, random | Query string param |
| ALA | ✅ Added | relevance, date, scientific_name | `sort` biocache param |
| GA HAP | ✅ Added | year_asc, year_desc | `orderByFields` ArcGIS |
| Trove | ✅ Already had | relevance, dateasc, datedesc | Existing |

### Sources Without API Sorting

| Source | Reason |
|--------|--------|
| NMA | API doesn't expose sort parameter |
| VHD | API doesn't expose sort parameter |
| ACMI | API doesn't expose sort parameter |
| GHAP | GeoJSON format, no server-side sort |
| PM Transcripts | ID-based lookup only |

---

## Files Modified

| File | Change |
|------|--------|
| `src/sources/prov/tools/search.ts` | Added sortby parameter |
| `src/sources/prov/types.ts` | Added PROVSortOption type |
| `src/sources/prov/client.ts` | Added sort mapping |
| `src/sources/museums-victoria/tools/search.ts` | Extended sort options |
| `src/sources/museums-victoria/types.ts` | Added MusVicSortOption type |
| `src/sources/museums-victoria/client.ts` | Added sort mapping |
| `src/sources/ala/tools/search-occurrences.ts` | Added sortby parameter |
| `src/sources/ala/types.ts` | Added ALASortOption type |
| `src/sources/ga-hap/tools/search.ts` | Added sortby parameter |
| `src/sources/ga-hap/types.ts` | Added GAHAPSortOption type |
| `src/sources/ga-hap/client.ts` | Added orderByFields mapping |
| `src/core/enums.ts` | Added CommonSortOption type |

---

## Sort Option Mappings

### PROV
```typescript
'relevance' → (no sort param)
'date_asc'  → 'start_dt asc'
'date_desc' → 'start_dt desc'
```

### Museums Victoria
```typescript
'relevance'    → (no sort param)
'date'         → 'date'
'alphabetical' → 'title'
'random'       → 'random'
```

### ALA
```typescript
'relevance'       → (no sort param)
'date'            → 'first_loaded_date desc'
'scientific_name' → 'taxon_name asc'
```

### GA HAP
```typescript
'year_asc'  → 'YEAR_START ASC'
'year_desc' → 'YEAR_START DESC'
```

---

## Example Usage

```
# PROV - oldest records first
prov_search(query="railway", sortby="date_asc")

# ALA - by scientific name
ala_search_occurrences(scientificName="Eucalyptus", sortby="scientific_name")

# GA HAP - newest aerial photos first
ga_hap_search(state="VIC", yearFrom=1950, sortby="year_desc")

# Museums Victoria - random selection
museumsvic_search(query="gold rush", sortby="random")
```

---

## Acceptance Criteria

- [x] At least 5 sources support explicit `sortby` parameter (5 achieved)
- [x] Sort options are documented for each source
- [x] Results are correctly ordered
- [x] Invalid sort options handled gracefully
- [ ] Federated search supports sorting (deferred - needs design for multi-source)

---

## Notes

- Federated search sorting across multiple sources requires additional design work
- Client-side sorting could be added for sources without API support
- NMA, VHD, ACMI may add sorting in future API versions

---

## Commit Reference

```
d225c41 feat(search): add intelligent query parsing and federated search (SEARCH-007 to SEARCH-010)
```
