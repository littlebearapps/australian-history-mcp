# GHAP (Gazetteer of Historical Australian Placenames) API Reference

> [!NOTE]
> This is a third-party API. Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

## Overview

**Provider:** TLCMap / University of Newcastle
**Coverage:** 330,000+ historical placenames with coordinates
**License:** CC-BY 4.0 (data contributed to TLCMap)
**Auth Required:** None

## API Endpoint

```
https://tlcmap.org/
```

## Data Sources

| Source | Description |
|--------|-------------|
| Australian Gazetteer | ANPS official gazetteer (feature types, LGAs) |
| Public Datasets | 1990+ community-contributed layers |

## Query Parameters

### Search Endpoint (`/`)

| Parameter | Description |
|-----------|-------------|
| `name` | Exact placename match |
| `containsname` | Partial match (contains) |
| `fuzzyname` | Fuzzy matching (handles typos) |
| `state` | Filter by state (VIC, NSW, QLD, SA, WA, TAS, NT, ACT) |
| `lga` | Filter by Local Government Area |
| `bbox` | Bounding box: minLon,minLat,maxLon,maxLat |
| `lat` | Centre latitude for point+radius search ⭐ NEW |
| `lon` | Centre longitude for point+radius search ⭐ NEW |
| `radiusKm` | Search radius in kilometres (requires lat/lon) ⭐ NEW |
| `paging` | Results per page (default 20) |
| `format` | Response format (`json`) |
| `searchausgaz` | Enable Australian Gazetteer (`on`) |
| `searchpublicdatasets` | Enable community datasets (`on`) |

### Get Place (`/search`)

| Parameter | Description |
|-----------|-------------|
| `id` | TLCMap place ID (e.g., `a1b4b8`, `t3408`) |
| `format` | Response format (`json`) |

### Layers (`/layers/json`, `/layers/{id}/json`)

No parameters required. Returns GeoJSON FeatureCollection.

## Response Format

All responses use GeoJSON FeatureCollection format:

```json
{
  "type": "FeatureCollection",
  "metadata": { "name": "...", "description": "..." },
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [144.96, -37.81] },
      "properties": { "id": "a1b4b8", "name": "Melbourne", ... }
    }
  ]
}
```

## Field Reference

| Field | Description |
|-------|-------------|
| `id` | TLCMap ID (e.g., `a1b4b8`, `t3408`) |
| `anps_id` | ANPS gazetteer ID (if from official gazetteer) |
| `name` / `placename` | Place name |
| `state` | Australian state |
| `lga` | Local Government Area |
| `feature_term` | Feature type (e.g., parish, railway station) |
| `latitude` / `longitude` | WGS84 coordinates |
| `source` / `original_data_source` | Data source |
| `description` | Place description |
| `Start Date` / `End Date` | Temporal range |
| `TLCMapLinkBack` | URL to TLCMap record |

## ID Prefixes

| Prefix | Source |
|--------|--------|
| `a` | Australian Gazetteer (ANPS) |
| `t` | Trove-derived placenames |
| Other | Community layer contributions |

## Example Queries

### Search Melbourne places in Victoria

```
/?containsname=Melbourne&state=VIC&format=json&paging=20&searchausgaz=on&searchpublicdatasets=on
```

### Get place by ID

```
/search?id=a1b4b8&format=json
```

### List all layers

```
/layers/json
```

### Get layer contents

```
/layers/395/json
```

## Search Modes

| Mode | Parameter | Use Case |
|------|-----------|----------|
| Exact | `name=Melbourne` | Known exact name |
| Contains | `containsname=creek` | Partial matches |
| Fuzzy | `fuzzyname=Melborne` | Handles typos |

## External Resources

- [TLCMap](https://tlcmap.org/)
- [TLCMap API Docs](https://docs.tlcmap.org/help/developers)
- [ANPS (Australian National Placename Survey)](https://www.anps.org.au/)
