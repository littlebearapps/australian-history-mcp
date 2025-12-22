# ACMI (Australian Centre for the Moving Image) API Quick Reference

## API Endpoint

- **Base URL:** `https://api.acmi.net.au/`

## Authentication

None required. Public read-only access.

## Tools

### acmi_search_works
Search ACMI collection for films, TV, videogames, and digital art.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search term (e.g., "Mad Max", "Australian cinema") |
| `type` | string | Work type filter (Film, Television, Videogame, Artwork, Object) |
| `year` | number | Production year filter |
| `page` | number | Page number (1-based, default 1) |

### acmi_get_work
Get detailed information about a specific work.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Work ID from search results |

Returns: title, type, year, description, creators, media, related works.

### acmi_harvest
Bulk download ACMI collection works.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Optional search filter |
| `type` | string | Work type filter |
| `maxRecords` | number | Max records (1-1000, default 100) |
| `startPage` | number | Starting page (1-based, default 1) |

### acmi_list_creators
List creators (directors, actors, studios) from the ACMI collection.

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (1-based, default 1) |

Returns: name, slug, wikidata_id, works_count.

### acmi_get_creator
Get detailed creator information.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Creator ID from list results |

Returns: name, biography, wikidata links, and work count.

### acmi_list_constellations
List curated thematic collections (constellations).

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (1-based, default 1) |

Returns: id, name, description for each constellation.

### acmi_get_constellation
Get detailed constellation information.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Constellation ID from list results |

Returns: name, description, authors, and key work.

## Work Types

- `Film` - Feature films, documentaries, shorts
- `Television` - TV programs and series
- `Videogame` - Video games and interactive media
- `Artwork` - Digital art and installations
- `Object` - Physical objects and artefacts

## Key Quirks

- Pagination is page-based (page 1, 2, 3...) not offset-based
- Collection contains 42,000+ works
- API returns HAL+JSON format with `_embedded` structure
- Creator information included in work details
- Some works have multiple associated media items
- **Constellations use `name` field** (not `title`) for the collection name

## Example Queries

```
# Search Australian films
query: "Australian" type: "Film"

# Find Mad Max franchise
query: "Mad Max"

# Get specific work
id: 12345
```

## Licensing

CC0 (public domain dedication for API data).

## Resources

- [ACMI Collection API](https://www.acmi.net.au/api/)
- [ACMI Collections](https://www.acmi.net.au/explore/)
