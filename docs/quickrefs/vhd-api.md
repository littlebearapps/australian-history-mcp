# Victorian Heritage Database (VHD) API Quick Reference

## API Endpoint

`https://api.heritagecouncil.vic.gov.au/v1/`

## Authentication

None required for read-only access.

## Tools

### vhd_search_places
Search Victorian heritage places.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Keyword search (place name, location) |
| `municipality` | string | Municipality/suburb filter |
| `architecturalStyle` | string | Architectural style filter |
| `period` | string | Time period filter |
| `limit` | number | Max results (default 20, max 100) |

### vhd_get_place
Get detailed heritage place record.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Place ID from search results |

Returns: name, location, coordinates, summary, description, history, heritage authority, VHR number, overlays, images.

### vhd_search_shipwrecks
Search Victorian shipwrecks.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Keyword search (ship name, location) |
| `limit` | number | Max results (default 20, max 100) |

### vhd_harvest
Bulk download heritage records.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search filter |
| `municipality` | string | Municipality filter |
| `maxRecords` | number | Max records (1-1000, default 100) |
| `startPage` | number | Page to start from (1-based) |

## API Parameter Mapping

The VHD API uses different parameter names than typical REST APIs:

| Tool Parameter | VHD API Param | Description |
|----------------|---------------|-------------|
| `query` | `kw` | Keyword search |
| `limit` | `rpp` | Records per page (default 25) |
| `municipality` | `sub` | Suburb/municipality |
| `architecturalStyle` | `arcs` | Architectural style ID |
| `period` | `per` | Time period ID |

## Response Format

VHD uses HAL+JSON with `_embedded` and `_links`:

```json
{
  "_embedded": {
    "places": [
      {
        "id": 540,
        "name": "GEELONG RAILWAY STATION",
        "location": "1 RAILWAY TERRACE GEELONG",
        "vhr_number": "H1604",
        "heritage_authority_name": "Victorian Heritage Register"
      }
    ]
  },
  "_links": {
    "self": { "href": "/places?kw=railway" },
    "next": { "href": "/places?kw=railway&page=2" }
  }
}
```

## Key Quirks

- HAL+JSON response format with `_embedded` and `_links`
- Images returned as dictionary keyed by ID (e.g., `{"1_45692": {...}}`)
- Uses `rpp` (records per page) not `limit`
- Uses `kw` (keyword) not `query`
- Page-based pagination (1-indexed)
- Default page size is 25 records

## Additional Endpoints

The VHD API also provides reference data:
- `/themes` - Heritage themes and sub-themes
- `/municipalities` - Victorian municipalities
- `/architectural-styles` - Architectural style list
- `/periods` - Time periods (5-year ranges)
- `/heritage-authorities` - Heritage authorities
- `/ship-propulsions`, `/ship-rigs` - Shipwreck metadata

## Resources

- [VHD API Documentation](https://api.heritagecouncil.vic.gov.au/documentation/VHD-v1)
- [Victorian Heritage Database](https://vhd.heritagecouncil.vic.gov.au/)
- [data.vic.gov.au Dataset](https://discover.data.vic.gov.au/dataset/victorian-heritage-api)
