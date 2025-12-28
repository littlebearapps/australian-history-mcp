# National Museum of Australia (NMA) API Quick Reference

> [!NOTE]
> This is a third-party API. Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

## API Endpoint

`https://data.nma.gov.au/`

## Authentication

None required. Optional API key for higher rate limits.

## Tools

### nma_search_objects
Search museum collection objects.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search term (e.g., "boomerang", "gold rush") |
| `type` | string | Object type filter |
| `collection` | string | Collection name filter |
| `medium` | string | Material filter (e.g., "Wood", "Paper", "Metal") |
| `spatial` | string | Place/location filter (e.g., "Victoria", "Queensland") |
| `year` | number | Year filter (e.g., 1850) |
| `creator` | string | Creator/maker name filter |
| `limit` | number | Max results (default 20, max 100) |
| `offset` | number | Pagination offset |

### nma_get_object
Get detailed object record.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Object ID from search results |

Returns: title, types, collection, identifier, materials, dimensions, description, significance statement, places, metadata.

### nma_search_places
Search places of significance.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search term |
| `limit` | number | Max results (default 20) |

### nma_harvest
Bulk download collection records.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search filter |
| `type` | string | Object type filter |
| `maxRecords` | number | Max records (1-1000, default 100) |
| `startOffset` | number | Pagination offset |

## Response Format

```json
{
  "id": "154550",
  "title": "Painted boomerang...",
  "types": ["Boomerangs"],
  "collection": { "id": "3814", "title": "Scott Rainbow collection" },
  "identifier": "2008.0046.0023",
  "materials": ["Wood"],
  "dimensions": { "length": 570, "width": 135, "height": 15, "units": "mm" },
  "physicalDescription": "...",
  "significanceStatement": "...",
  "places": [{ "title": "Queensland, Australia", "role": "Associated place" }],
  "metadata": {
    "modified": "2025-02-23",
    "licence": "https://creativecommons.org/licenses/by-nc/4.0/"
  }
}
```

## Filter Examples

| Use Case | Parameters |
|----------|------------|
| Wooden artefacts from Victoria | `medium: "Wood"`, `spatial: "Victoria"` |
| Gold rush era objects | `query: "gold"`, `year: 1851` |
| Paper items from Queensland | `medium: "Paper"`, `spatial: "Queensland"` |

### Common Material Values

Wood, Paper, Metal, Glass, Ceramic, Textile, Stone, Leather, Bone, Ivory

## Key Quirks

- Uses offset-based pagination
- Objects have type-prefixed IDs
- Licence is CC-BY-NC (non-commercial use)
- Places returned as array with title and role
- Use `medium` for material, `spatial` for place (not `material` or `place`)

## Resources

- [NMA Data Portal](https://data.nma.gov.au/)
- [NMA Collection Search](https://collectionsearch.nma.gov.au/)
