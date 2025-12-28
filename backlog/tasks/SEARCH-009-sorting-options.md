# SEARCH-009: Sorting Options - Multi-Source

**Priority:** P2
**Phase:** 1 - Core Search Enhancements
**Status:** Not Started
**Estimated Effort:** 1 day
**Dependencies:** None

---

## Overview

Add explicit `sortby` parameter to search tools across multiple sources. Currently only Trove has sorting exposed.

**Goal:** Consistent sorting interface across sources where APIs support it.

---

## Sources & Sorting Support

| Source | Current | API Support | Proposed Options |
|--------|---------|-------------|------------------|
| Trove | ✅ Has sortby | Yes | relevance, dateasc, datedesc |
| PROV | ❌ None | Likely (Solr) | relevance, date_asc, date_desc |
| Museums Vic | ✅ Has random | Yes | relevance, date, alphabetical, random |
| ALA | ❌ None | Yes | relevance, date, scientificName |
| NMA | ❌ None | Check | relevance, date |
| VHD | ❌ None | Check | relevance, name, date |
| ACMI | ❌ None | Check | relevance, year |
| GHAP | ❌ None | Unlikely | N/A (client-side only) |
| GA HAP | ❌ None | Yes (ArcGIS) | year_asc, year_desc |

---

## Subtasks

### 1. Research API Sorting Capabilities

#### PROV
- [ ] Test Solr `sort` parameter on PROV API
- [ ] Identify sortable fields (date, title, relevance)
- [ ] Document sort syntax

#### ALA
- [ ] Test biocache `sort` parameter
- [ ] Identify sortable fields
- [ ] Document sort options

#### NMA
- [ ] Test NMA API sort parameter
- [ ] Document available options

#### VHD
- [ ] Test VHD API sort parameter
- [ ] Document available options

#### ACMI
- [ ] Test ACMI API sort parameter
- [ ] Document available options

#### GA HAP
- [ ] Test ArcGIS `orderByFields` parameter
- [ ] Document sortable fields (YEAR_START, YEAR_END, etc.)

---

### 2. Implement PROV Sorting
- [ ] Add `sortby` to `PROVSearchInput`:
  ```typescript
  sortby?: 'relevance' | 'date_asc' | 'date_desc';
  ```
- [ ] Update `client.ts` to add sort parameter
- [ ] Update search tool schema
- [ ] Test sorting works correctly

### 3. Implement Museums Victoria Sorting
- [ ] Already has `random` option
- [ ] Add additional options if API supports:
  ```typescript
  sortby?: 'relevance' | 'date' | 'alphabetical' | 'random';
  ```
- [ ] Update client and tool

### 4. Implement ALA Sorting
- [ ] Add `sortby` to `ALASearchInput`:
  ```typescript
  sortby?: 'relevance' | 'date' | 'scientificName';
  ```
- [ ] Map to biocache sort parameter
- [ ] Update search tool schema

### 5. Implement NMA Sorting
- [ ] Add `sortby` if API supports
- [ ] Update client and tool

### 6. Implement VHD Sorting
- [ ] Add `sortby` if API supports
- [ ] Update client and tool

### 7. Implement ACMI Sorting
- [ ] Add `sortby` if API supports:
  ```typescript
  sortby?: 'relevance' | 'year_asc' | 'year_desc';
  ```
- [ ] Update client and tool

### 8. Implement GA HAP Sorting
- [ ] Add `sortby` using ArcGIS orderByFields:
  ```typescript
  sortby?: 'year_asc' | 'year_desc';
  ```
- [ ] Map to: `orderByFields=YEAR_START ASC` or `DESC`
- [ ] Update search tool

---

### 9. Standardize Sort Options

Define common sort option names across sources:
```typescript
type CommonSortOption =
  | 'relevance'      // Default, API's relevance scoring
  | 'date_asc'       // Oldest first
  | 'date_desc'      // Newest first
  | 'alphabetical'   // A-Z by title/name
  | 'random';        // Random order
```

Map source-specific options to common names where possible.

---

### 10. Update Federated Search
- [ ] Add `sortby` parameter to federated search
- [ ] Map common sort options to source-specific options
- [ ] Document which sources support which options

---

### 11. Testing
- [ ] Test each source with each sort option
- [ ] Verify results are correctly ordered
- [ ] Test default behavior (no sortby)
- [ ] Test invalid sort options

### 12. Documentation
- [ ] Update each source's API quickref with sort options
- [ ] Add sorting examples to CLAUDE.md
- [ ] Document which sources support which options

---

## Example Queries

```
# PROV - oldest records first
prov_search: query="railway", sortby="date_asc"

# ALA - by scientific name
ala_search_occurrences: scientificName="Eucalyptus", sortby="scientificName"

# GA HAP - newest aerial photos first
ga_hap_search: state="VIC", yearFrom=1950, sortby="year_desc"

# Federated search with sort
search: query="gold rush", sortby="date_asc"
```

---

## Acceptance Criteria

- [ ] At least 5 sources support explicit `sortby` parameter
- [ ] Sort options are documented for each source
- [ ] Results are correctly ordered
- [ ] Invalid sort options handled gracefully
- [ ] Federated search supports sorting

---

## Notes

- Not all sources will support all sort options
- Client-side sorting is possible but expensive for large result sets
- Default to relevance when sortby not specified
- GHAP may not support sorting at all (GeoJSON format)
