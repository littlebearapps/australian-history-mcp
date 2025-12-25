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
| FILM_TYPE | String | Film type (1 = B&W, 2 = Colour, 3 = IR) |
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
