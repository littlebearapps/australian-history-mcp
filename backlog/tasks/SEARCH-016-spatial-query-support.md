# SEARCH-016: Spatial Query Support

**Priority:** P3
**Phase:** 3 - Future Enhancements
**Status:** Not Started
**Estimated Effort:** 2-3 days
**Dependencies:** None

---

## Overview

Add point+radius spatial queries as an alternative to bounding box (bbox) filtering. Currently only `bbox` is supported for spatial queries.

**Current State:**
- GHAP, GA HAP support `bbox` (bounding box)
- ALA supports `stateProvince` only
- Others have no spatial filtering

**Goal:**
- Add `location` parameter with point+radius support
- Works across sources that support spatial queries
- Consistent interface for location-based searches

---

## Files to Create

| File | Description |
|------|-------------|
| `src/core/spatial/types.ts` | Spatial query types |
| `src/core/spatial/geometry.ts` | Geometry utilities |
| `src/core/spatial/index.ts` | Module exports |

## Files to Modify

| File | Change |
|------|--------|
| `src/sources/ala/client.ts` | Add WKT circle support |
| `src/sources/ga-hap/client.ts` | Add point buffer support |
| `src/sources/ghap/client.ts` | Add point+radius support |

---

## Subtasks

### 1. Define Spatial Types
- [ ] Create `src/core/spatial/types.ts`:
  ```typescript
  interface PointLocation {
    lat: number;      // Latitude (WGS84)
    lon: number;      // Longitude (WGS84)
    radiusKm: number; // Search radius in kilometers
  }

  interface BoundingBox {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
  }

  type SpatialQuery = PointLocation | BoundingBox;

  interface SpatialInput {
    location?: PointLocation;
    bbox?: string;  // "minLon,minLat,maxLon,maxLat"
  }
  ```

### 2. Create Geometry Utilities
- [ ] Create `src/core/spatial/geometry.ts`:
  ```typescript
  // Convert point+radius to bounding box
  function pointToBbox(point: PointLocation): BoundingBox;

  // Convert point+radius to WKT circle
  function pointToWktCircle(point: PointLocation): string;

  // Convert point+radius to ArcGIS buffer
  function pointToArcGisBuffer(point: PointLocation): object;

  // Parse bbox string to BoundingBox
  function parseBbox(bbox: string): BoundingBox;

  // Calculate approximate bbox from point+radius
  function calculateBbox(lat: number, lon: number, radiusKm: number): BoundingBox;
  ```

### 3. Implement ALA Spatial Query
- [ ] ALA biocache supports WKT geometry
- [ ] Convert point+radius to WKT CIRCLE or POLYGON
- [ ] Add to search query as `wkt` parameter:
  ```typescript
  if (location) {
    const wkt = pointToWktCircle(location);
    params.append('wkt', wkt);
  }
  ```

### 4. Implement GA HAP Spatial Query
- [ ] ArcGIS supports geometry + spatialRel
- [ ] Convert point+radius to buffer geometry:
  ```typescript
  if (location) {
    const buffer = pointToArcGisBuffer(location);
    params.append('geometry', JSON.stringify(buffer));
    params.append('geometryType', 'esriGeometryPoint');
    params.append('distance', location.radiusKm * 1000); // meters
    params.append('units', 'esriSRUnit_Meter');
  }
  ```

### 5. Implement GHAP Spatial Query
- [ ] Check if TLCMap supports point+radius
- [ ] If not, convert to bbox approximation:
  ```typescript
  if (location) {
    const bbox = calculateBbox(location.lat, location.lon, location.radiusKm);
    // Use existing bbox parameter
  }
  ```

### 6. Update Search Tool Schemas
- [ ] Add `location` parameter to:
  - `ala_search_occurrences`
  - `ga_hap_search`
  - `ghap_search`
- [ ] Parameter schema:
  ```typescript
  location: {
    type: 'object',
    properties: {
      lat: { type: 'number', minimum: -90, maximum: 90 },
      lon: { type: 'number', minimum: -180, maximum: 180 },
      radiusKm: { type: 'number', minimum: 0.1, maximum: 500 }
    },
    required: ['lat', 'lon', 'radiusKm']
  }
  ```

### 7. Update Federated Search
- [ ] Add `location` parameter to federated search
- [ ] Pass location to sources that support it
- [ ] Skip location for sources without spatial support

### 8. Coordinate System Handling
- [ ] Ensure consistent WGS84 (EPSG:4326) input
- [ ] Convert to Web Mercator (EPSG:3857) for ArcGIS
- [ ] Handle coordinate precision

### 9. Testing
- [ ] Test point+radius queries on each source
- [ ] Test with various radius values
- [ ] Test edge cases (antimeridian, poles)
- [ ] Compare results with bbox for same area
- [ ] Test invalid coordinates handling

### 10. Documentation
- [ ] Document `location` parameter
- [ ] Add examples for each source
- [ ] Explain radius units and limits

---

## Example Queries

```
# Search near Melbourne CBD (10km radius)
ala_search_occurrences: scientificName="Trichosurus vulpecula", location={"lat": -37.8136, "lon": 144.9631, "radiusKm": 10}

# Aerial photos near Ballarat
ga_hap_search: state="VIC", yearFrom=1950, location={"lat": -37.5622, "lon": 143.8503, "radiusKm": 20}

# Historical placenames near Bendigo
ghap_search: query="creek", location={"lat": -36.7570, "lon": 144.2794, "radiusKm": 30}

# Federated search with location
search: query="gold mining", location={"lat": -37.5622, "lon": 143.8503, "radiusKm": 50}
```

---

## Common Locations Reference

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Melbourne CBD | -37.8136 | 144.9631 |
| Sydney CBD | -33.8688 | 151.2093 |
| Brisbane CBD | -27.4698 | 153.0251 |
| Ballarat | -37.5622 | 143.8503 |
| Bendigo | -36.7570 | 144.2794 |
| Geelong | -38.1499 | 144.3617 |

---

## Acceptance Criteria

- [ ] `location` parameter works on at least 2 sources
- [ ] Point+radius correctly converted to source-specific format
- [ ] Results are within specified radius
- [ ] Federated search passes location parameter
- [ ] Documentation includes location examples

---

## Notes

- WKT CIRCLE may not be universally supported - use polygon approximation
- Radius limit (500km) prevents overly broad queries
- Consider adding named locations (e.g., "Melbourne") with geocoding
- Coordinate validation prevents invalid lat/lon
- Edge cases at antimeridian (-180/180) need special handling
