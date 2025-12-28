# SEARCH-013: GA HAP Technical Filters

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** Not Started
**Estimated Effort:** 1 day
**Dependencies:** None

---

## Overview

Add technical/specialized filters to GA HAP (Geoscience Australia Historical Aerial Photography) for professional/research users.

**Current Parameters (6):**
- `state` - Australian state
- `yearFrom` / `yearTo` - Year range
- `scannedOnly` - Scanned photos only
- `bbox` - Bounding box
- `filmNumber` - Film identifier

**Target Parameters (10+):**
- All current parameters, plus:
- `filmType` - Black & White, Colour, Infrared
- `cameraType` - Camera equipment
- `scaleRange` - Photo scale filtering (min/max)
- `flightHeight` - Altitude range
- `resolution` - Scan resolution
- `hasPreview` - Has preview image

---

## Files to Modify

| File | Change |
|------|--------|
| `src/sources/ga-hap/tools/search.ts` | Add new parameters |
| `src/sources/ga-hap/client.ts` | Support ArcGIS filter syntax |
| `src/sources/ga-hap/types.ts` | Update input types |
| `docs/quickrefs/ga-hap-api.md` | Document new filters |

---

## Subtasks

### 1. Research ArcGIS Fields
- [ ] Query ArcGIS feature layer for available fields
- [ ] Document field names and types:
  ```
  Expected fields:
  - FILM_TYPE (string) - "Black & White", "Colour", etc.
  - CAMERA (string) - Camera model
  - AVE_SCALE (number) - Average scale denominator
  - AVE_HEIGHT (number) - Flight height in feet/meters
  - FOCAL_LENG (number) - Focal length in mm
  - SCAN_RES (number) - Scan resolution DPI
  ```
- [ ] Test which fields are filterable via WHERE clause
- [ ] Note valid values for enum fields

### 2. Update Types
- [ ] Expand `GAHAPSearchInput`:
  ```typescript
  interface GAHAPSearchInput {
    // Existing params
    state?: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';
    yearFrom?: number;
    yearTo?: number;
    scannedOnly?: boolean;
    bbox?: string;
    filmNumber?: string;

    // New technical filters
    filmType?: 'bw' | 'colour' | 'infrared';
    cameraType?: string;
    scaleMin?: number;      // Minimum scale denominator (e.g., 10000)
    scaleMax?: number;      // Maximum scale denominator (e.g., 50000)
    flightHeightMin?: number;  // Minimum altitude
    flightHeightMax?: number;  // Maximum altitude
    focalLength?: number;   // Focal length in mm
    scanResolution?: number; // Minimum scan DPI
    hasPreview?: boolean;   // Has preview image URL

    maxRecords?: number;
    startOffset?: number;
  }
  ```

### 3. Update Client WHERE Clause Builder
- [ ] Modify `buildWhereClause()` in `client.ts`:
  ```typescript
  function buildWhereClause(input: GAHAPSearchInput): string {
    const conditions: string[] = [];

    // Existing conditions
    if (input.state) conditions.push(`STATE='${stateCode}'`);
    if (input.yearFrom) conditions.push(`YEAR_END>=${input.yearFrom}`);
    if (input.yearTo) conditions.push(`YEAR_START<=${input.yearTo}`);

    // New technical conditions
    if (input.filmType) {
      const filmTypeMap = {
        'bw': 'Black & White',
        'colour': 'Colour',
        'infrared': 'Infrared',
      };
      conditions.push(`FILM_TYPE='${filmTypeMap[input.filmType]}'`);
    }

    if (input.cameraType) {
      conditions.push(`CAMERA LIKE '%${input.cameraType}%'`);
    }

    if (input.scaleMin) {
      conditions.push(`AVE_SCALE>=${input.scaleMin}`);
    }
    if (input.scaleMax) {
      conditions.push(`AVE_SCALE<=${input.scaleMax}`);
    }

    if (input.flightHeightMin) {
      conditions.push(`AVE_HEIGHT>=${input.flightHeightMin}`);
    }
    if (input.flightHeightMax) {
      conditions.push(`AVE_HEIGHT<=${input.flightHeightMax}`);
    }

    if (input.hasPreview) {
      conditions.push(`PREVIEW_URL IS NOT NULL`);
    }

    return conditions.join(' AND ') || '1=1';
  }
  ```

### 4. Update Search Tool
- [ ] Add new parameters to tool schema
- [ ] Add parameter descriptions with valid values
- [ ] Add examples for technical users

### 5. Add Film Type Reference Data
- [ ] Create helper to list valid film types
- [ ] Consider adding `ga_hap_list_film_types` tool
- [ ] Document common camera types

### 6. Testing
- [ ] Test film type filtering
- [ ] Test scale range filtering
- [ ] Test flight height filtering
- [ ] Test camera type partial matching
- [ ] Test combinations of technical filters
- [ ] Verify WHERE clause syntax is correct

### 7. Documentation
- [ ] Update `docs/quickrefs/ga-hap-api.md` with new filters
- [ ] Add technical filter examples to CLAUDE.md
- [ ] Document use cases for each filter

---

## Example Queries

```
# Find colour aerial photos
ga_hap_search: state="VIC", yearFrom=1960, filmType="colour"

# Find large-scale (detailed) photos
ga_hap_search: state="NSW", scaleMin=5000, scaleMax=15000

# Find high-altitude photos
ga_hap_search: state="QLD", flightHeightMin=20000

# Find high-resolution scans
ga_hap_search: state="VIC", scannedOnly=true, scanResolution=600

# Combined technical query
ga_hap_search: state="VIC", yearFrom=1950, yearTo=1960, filmType="bw", scaleMax=25000
```

---

## Scale Reference

Common aerial photography scales:
- **1:5,000** - Very detailed, individual buildings visible
- **1:10,000** - Detailed, street-level features
- **1:25,000** - Medium, suburb/rural area
- **1:50,000** - Overview, regional coverage
- **1:100,000** - Wide area, state-level coverage

Lower denominator = larger scale = more detail

---

## Acceptance Criteria

- [ ] Film type filtering works (B&W, Colour, Infrared)
- [ ] Scale range filtering works
- [ ] At least 2 additional technical filters added
- [ ] WHERE clause syntax is valid ArcGIS SQL
- [ ] Documentation includes technical filter examples
- [ ] No breaking changes to existing search

---

## Notes

- ArcGIS REST API uses SQL-like WHERE clause
- Some fields may have NULL values - handle gracefully
- Scale filtering may need validation (min < max)
- Camera types may vary - use partial matching
- Consider adding outFields parameter to control returned fields
- Technical filters mainly for professional/research users
