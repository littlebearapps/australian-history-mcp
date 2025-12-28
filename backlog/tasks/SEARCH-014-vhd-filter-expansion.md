# SEARCH-014: VHD Filter Expansion

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** Not Started
**Estimated Effort:** 0.5 days
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

**Target Parameters (8+):**
- All current parameters, plus:
- `theme` - Heritage theme (leverage vhd_list_themes)
- `heritageAuthority` - Authority type
- `overlayType` - Heritage overlay classification
- `hasImages` - Has photographs

---

## Files to Modify

| File | Change |
|------|--------|
| `src/sources/vhd/tools/search-places.ts` | Add new parameters |
| `src/sources/vhd/client.ts` | Support new query params |
| `src/sources/vhd/types.ts` | Update input types |
| `docs/quickrefs/vhd-api.md` | Document new filters |

---

## Subtasks

### 1. Research VHD API Capabilities
- [ ] Review existing VHD list tools:
  - `vhd_list_municipalities`
  - `vhd_list_architectural_styles`
  - `vhd_list_themes`
  - `vhd_list_periods`
- [ ] Test theme filtering on search endpoint
- [ ] Test authority/overlay filtering
- [ ] Document available filter combinations

### 2. Update Types
- [ ] Expand `VHDSearchInput`:
  ```typescript
  interface VHDSearchInput {
    query?: string;
    municipality?: string;
    architecturalStyle?: string;
    period?: string;

    // New filters
    theme?: string;              // Heritage theme from list_themes
    heritageAuthority?: string;  // e.g., "Heritage Victoria"
    overlayType?: string;        // Heritage overlay type
    hasImages?: boolean;         // Has photographs

    limit?: number;
    page?: number;
  }
  ```

### 3. Update Client
- [ ] Modify `searchPlaces()` in `client.ts`
- [ ] Add theme parameter (use correct API param name)
- [ ] Add authority filtering
- [ ] Add overlay filtering
- [ ] Add image presence filtering

### 4. Leverage Existing List Tools
- [ ] Document workflow: use list tools for valid values
- [ ] Example: `vhd_list_themes` → use theme ID in search
- [ ] Consider adding theme names to search (not just IDs)

### 5. Update Search Tool
- [ ] Add new parameters to tool schema
- [ ] Add descriptions with examples
- [ ] Note relationship to list tools

### 6. Testing
- [ ] Test theme filtering
- [ ] Test filter combinations
- [ ] Verify results match filter criteria
- [ ] Test with federated search

### 7. Documentation
- [ ] Update `docs/quickrefs/vhd-api.md`
- [ ] Add examples showing list → search workflow
- [ ] Document common heritage themes

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

- [ ] Theme filtering works
- [ ] At least 2 additional filters added
- [ ] Filters work with existing parameters
- [ ] Documentation shows list → search workflow
- [ ] No breaking changes

---

## Notes

- VHD has rich reference data via list tools
- Theme filtering most impactful new filter
- Consider client-side filtering if API doesn't support
- HAL+JSON response structure may need special handling
