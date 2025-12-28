# SEARCH-014: VHD Filter Expansion

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** ✅ Done
**Estimated Effort:** 0.5 days
**Completed:** 2025-12-28
**Dependencies:** None

---

## Overview

Expand VHD (Victorian Heritage Database) search filters to leverage existing reference data tools.

**Current Parameters (5):**
- `query` - Text search
- `municipality` - Municipality name
- `architecturalStyle` - Architectural style
- `period` - Historical period
- `limit` - Max results

**Implemented Parameters (8):**
- All current parameters, plus:
- `theme` - Heritage theme (from vhd_list_themes)
- `heritageAuthority` - Authority type (e.g., "Heritage Victoria")
- `hasImages` - Filter places with photographs

---

## Completion Notes

### Implementation Details
- Updated `src/sources/vhd/types.ts` with theme, heritageAuthority, hasImages
- Updated `src/sources/vhd/client.ts` to handle new query params
- Updated `src/sources/vhd/tools/search-places.ts` with schema
- Updated `src/core/source-router.ts` for federated search mapping
- Updated `docs/quickrefs/vhd-api.md` with filter examples

### API Quirks Discovered
- VHD uses HAL+JSON with `_embedded` structure
- Images returned as dictionary keyed by ID, not array
- API uses `rpp` (records per page) not `limit`
- API uses `kw` (keyword) not `query`
- Lookup embedded keys differ from endpoint paths:
  - `local_government_authority` not `municipalities`
  - `architectural_style` not `architectural-styles`
  - `period` not `periods`

---

## Files Modified

| File | Change |
|------|--------|
| `src/sources/vhd/types.ts` | Added theme, heritageAuthority, hasImages params |
| `src/sources/vhd/client.ts` | Added parameter handling |
| `src/sources/vhd/tools/search-places.ts` | Updated schema |
| `src/core/source-router.ts` | Added VHD federated search mapping |
| `docs/quickrefs/vhd-api.md` | Added filter examples |

---

## Subtasks

### 1. Research VHD API Capabilities
- [x] Review existing VHD list tools:
  - `vhd_list_municipalities`
  - `vhd_list_architectural_styles`
  - `vhd_list_themes`
  - `vhd_list_periods`
- [x] Test theme filtering on search endpoint
- [x] Test authority filtering
- [x] Test hasImages filtering
- [x] Document available filter combinations

### 2. Update Types
- [x] Expanded `VHDSearchInput` with theme, heritageAuthority, hasImages

### 3. Update Client
- [x] Modified `searchPlaces()` in `client.ts`
- [x] Added theme parameter
- [x] Added heritageAuthority filtering
- [x] Added hasImages filtering

### 4. Update Search Tool
- [x] Added new parameters to tool schema
- [x] Added descriptions with examples

### 5. Update Federated Search Mapping
- [x] Added hasImages passthrough in source-router.ts

### 6. Testing
- [x] Tested theme filtering
- [x] Tested filter combinations
- [x] Verified results match filter criteria
- [x] Build succeeded

### 7. Documentation
- [x] Updated `docs/quickrefs/vhd-api.md`
- [x] Added examples showing list → search workflow

---

## Example Queries

```
# Filter by heritage theme
vhd_search_places: query="railway", theme="Transport"

# Filter places with images
vhd_search_places: municipality="Melbourne", hasImages=true

# Combined filters
vhd_search_places: architecturalStyle="Victorian", period="1850-1899", theme="Commerce"

# Workflow: discover themes first
vhd_list_themes → ["Transport", "Commerce", "Residential", ...]
vhd_search_places: theme="Transport", municipality="Ballarat"
```

---

## Acceptance Criteria

- [x] Theme filtering works
- [x] At least 2 additional filters added (theme, heritageAuthority, hasImages)
- [x] Filters work with existing parameters
- [x] Documentation shows list → search workflow
- [x] No breaking changes

---

## Notes

- VHD has rich reference data via list tools
- Theme filtering most impactful new filter
- HAL+JSON response structure requires special handling
- VHD API uses different parameter names than expected (rpp vs limit, kw vs query)
