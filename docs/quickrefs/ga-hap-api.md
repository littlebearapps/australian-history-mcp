# Geoscience Australia Historical Aerial Photography (HAP) API Reference

> [!NOTE]
> This is a third-party API. Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

## Overview

**Provider:** Geoscience Australia (Commonwealth)
**Coverage:** 1.2 million+ aerial photos (1928-1996)
**License:** CC-BY 4.0 (attribution required)
**Auth Required:** None

## API Endpoint

```
https://services1.arcgis.com/wfNKYeHsOyaFyPw3/arcgis/rest/services/HistoricalAerialPhotography_AGOL_DIST_gdb/FeatureServer/
```

### Layers

| Layer | Name | Description |
|-------|------|-------------|
| 0 | HAP_Photo_Centres_AGOL | Photo centre points with metadata |
| 1 | HAP_Flight_Lines_AGOL | Flight line geometry |

## Query Parameters

Standard ArcGIS REST Feature Service query parameters:

| Parameter | Description |
|-----------|-------------|
| `where` | SQL WHERE clause (e.g., `STATE='2'`) |
| `outFields` | Comma-separated field list or `*` for all |
| `returnGeometry` | `true` to include coordinates |
| `resultRecordCount` | Max records per request (max 2000) |
| `resultOffset` | Skip N records for pagination |
| `geometry` | Spatial filter (JSON envelope) |
| `geometryType` | `esriGeometryEnvelope` for bounding box |
| `spatialRel` | `esriSpatialRelIntersects` |
| `f` | Response format (`json`) |

## Field Reference

### Photo Centres (Layer 0)

| Field | Type | Description |
|-------|------|-------------|
| OBJECTID | Integer | Unique record identifier |
| FILM_NUMBER | String | Film identifier (e.g., "MAP2080", "SVY1159") |
| RUN | String | Run identifier (e.g., "1", "COAST TIE 2") |
| FRAME | String | Frame identifier (e.g., "80", "5014") |
| DATE_START | String | Capture date range start |
| DATE_END | String | Capture date range end |
| YEAR_START | Integer | Start year |
| YEAR_END | Integer | End year |
| STATE | String | State code (see mapping below) |
| CAMERA | String | Camera type used |
| FOCAL_LENG | Number | Focal length in mm |
| AVE_HEIGHT | Number | Average flight height in metres |
| AVE_SCALE | Number | Average scale denominator (e.g., 80000 = 1:80,000) |
| FILM_TYPE | String | Film type code (see mapping below) |
| SCANNED | String | "1" if digitised, "0" if not |
| PREVIEW_URL | String | Preview JPG URL (HTML wrapped) |
| TIF_URL | String | Full resolution TIFF download URL (HTML wrapped) |
| FILESIZE | Number | File size in bytes |
| GlobalID | String | GUID |

### State Code Mapping

| Code | State |
|------|-------|
| 1 | New South Wales |
| 2 | Victoria |
| 3 | Queensland |
| 4 | South Australia |
| 5 | Western Australia |
| 6 | Tasmania |
| 7 | Northern Territory |
| 8 | Australian Capital Territory |

### Film Type Code Mapping

| Code | Type | Tool Value | Record Count |
|------|------|------------|--------------|
| 0 | Unknown | `unknown` | ~varies |
| 1 | Black/White | `bw` | ~967,000 |
| 2 | Colour | `colour` | ~127,000 |
| 3 | Black/White Infrared | `bw-infrared` | ~26,000 |
| 4 | Colour Infrared | `colour-infrared` | ~rare |
| 5 | Infrared | `infrared` | ~rare |
| 6 | Other | `other` | ~varies |

## Tools

### ga_hap_search
Search historical aerial photos with filters.

| Parameter | Type | Description |
|-----------|------|-------------|
| `state` | string | State filter (NSW, VIC, QLD, SA, WA, TAS, NT, ACT) |
| `yearFrom` | number | Start year filter (e.g., 1950) |
| `yearTo` | number | End year filter (e.g., 1970) |
| `scannedOnly` | boolean | Only return digitised images (default false) |
| `filmNumber` | string | Film number (e.g., "MAP2080") |
| `bbox` | string | Bounding box: minLon,minLat,maxLon,maxLat (WGS84) |
| `lat` | number | Centre latitude for point+radius search ⭐ NEW |
| `lon` | number | Centre longitude for point+radius search ⭐ NEW |
| `radiusKm` | number | Search radius in kilometres (requires lat/lon) ⭐ NEW |
| `filmType` | string | Film type: bw, colour, bw-infrared, colour-infrared, infrared |
| `camera` | string | Camera model filter (partial match, e.g., "Williamson") |
| `scaleMin` | number | Min scale denominator (e.g., 10000 for 1:10000 or more detailed) |
| `scaleMax` | number | Max scale denominator (e.g., 50000 for 1:50000 or less detailed) |
| `sortby` | string | Sort order: relevance, year_asc, year_desc |
| `limit` | number | Max results (default 20, max 100) |
| `offset` | number | Pagination offset |

**Spatial Query Example:**
```
# Find aerial photos within 25km of Geelong
ga_hap_search with:
  lat: -38.1499
  lon: 144.3617
  radiusKm: 25
  scannedOnly: true
```

### Filter Examples

| Use Case | Parameters |
|----------|------------|
| Colour photos in Victoria | `filmType: "colour"`, `state: "VIC"` |
| High-detail photos (large scale) | `scaleMin: 5000`, `scaleMax: 15000` |
| Wide-area photos (small scale) | `scaleMin: 50000`, `scaleMax: 100000` |
| Wild camera photos from 1960s | `camera: "Wild"`, `yearFrom: 1960`, `yearTo: 1969` |
| B&W infrared in NSW | `filmType: "bw-infrared"`, `state: "NSW"` |

### Scale Reference

| Scale | Denominator | Use Case |
|-------|-------------|----------|
| 1:5,000 | 5000 | Very detailed urban/site surveys |
| 1:10,000 | 10000 | Detailed urban mapping |
| 1:25,000 | 25000 | Topographic mapping |
| 1:50,000 | 50000 | Regional mapping |
| 1:80,000 | 80000 | Wide-area coverage |
| 1:100,000 | 100000 | Broad regional surveys |

Note: Lower denominator = more detail (larger scale). Higher denominator = less detail (smaller scale).

### Common Camera Types

| Camera | Description |
|--------|-------------|
| Wild RC9 | Swiss precision mapping camera |
| Williamson F24 | British reconnaissance camera |
| Zeiss RMK | German aerial survey camera |
| Fairchild | American aerial camera |

## Example Queries

### Search Victorian photos from 1950s

```
/0/query?where=STATE='2' AND YEAR_START>=1950 AND YEAR_END<=1959&outFields=*&returnGeometry=true&resultRecordCount=20&f=json
```

### Find scanned photos only

```
/0/query?where=SCANNED='1'&outFields=*&returnGeometry=true&resultRecordCount=20&f=json
```

### Search by film number

```
/0/query?where=FILM_NUMBER='MAP2080'&outFields=*&returnGeometry=true&f=json
```

### Search colour photos (SEARCH-013)

```
/0/query?where=FILM_TYPE='2'&outFields=*&returnGeometry=true&resultRecordCount=20&f=json
```

### Search detailed photos by scale range (SEARCH-013)

```
/0/query?where=AVE_SCALE>=10000 AND AVE_SCALE<=25000&outFields=*&returnGeometry=true&resultRecordCount=20&f=json
```

### Search by camera type (SEARCH-013)

```
/0/query?where=CAMERA LIKE '%Wild%'&outFields=*&returnGeometry=true&resultRecordCount=20&f=json
```

### Bounding box search (Melbourne area)

```
/0/query?where=1=1&geometry={"xmin":16087000,"ymin":-4580000,"xmax":16150000,"ymax":-4520000,"spatialReference":{"wkid":3857}}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&resultRecordCount=20&f=json
```

Note: Geometry uses Web Mercator (EPSG:3857). Convert WGS84 coordinates before querying.

## URL Format Quirk

The PREVIEW_URL and TIF_URL fields contain HTML anchor tags, not raw URLs:

```html
<a href="https://historicalaerialphotography.s3-ap-southeast-2.amazonaws.com/Scanned/MAP/MAP2080/MAP2080_frame17477.tif" target="_blank">MAP2080_frame17477</a>
```

Extract the URL from the `href` attribute. Our client handles this automatically.

## Pagination

- Maximum 2000 records per request
- Use `resultOffset` + `resultRecordCount` for pagination
- Check `exceededTransferLimit: true` in response to know if more records exist

## Coordinate System

- API returns coordinates in Web Mercator (EPSG:3857)
- Our tools convert to WGS84 (latitude/longitude) for convenience

## Image Storage

Preview and TIFF images are hosted on AWS S3:
```
https://historicalaerialphotography.s3-ap-southeast-2.amazonaws.com/
```

URL pattern:
- Preview: `.../Scanned/{PREFIX}/{FILM}/Preview/{FILM}_frame{FRAME}_preview.jpg`
- Full TIFF: `.../Scanned/{PREFIX}/{FILM}/{FILM}_frame{FRAME}.tif`

## Attribution

When using this data, include:
> Data source: Geoscience Australia Historical Aerial Photography Collection, licensed under CC-BY 4.0

## External Resources

- [GA HAP Hub](https://aerialphotography-geoscience-au.hub.arcgis.com/)
- [GA Official Page](https://www.ga.gov.au/scientific-topics/national-location-information/historical-aerial-photography)
- [ArcGIS REST API Reference](https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer/)
