# ACMI (Australian Centre for the Moving Image) API Quick Reference

> [!NOTE]
> This is a third-party API. Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

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
| `field` | string | Limit search to field: "title" or "description" |
| `size` | number | Results per page (default 20, max 50) |
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

## Search Tips

| Use Case | Approach |
|----------|----------|
| Search by title only | `query: "Mad Max"`, `field: "title"` |
| Films from a year | `query: "Australian"`, `type: "Film"`, `year: 1979` |
| Find by director | Include director name in query (e.g., `query: "George Miller"`) |
| More results | Set `size: 50` for max results per page |

**Note:** The API does not support year ranges, creator filters, or genre filters directly. Include creator names in the query string for creator-based searches.

## Key Quirks

- Pagination is page-based (page 1, 2, 3...) not offset-based
- Collection contains 42,000+ works
- API returns HAL+JSON format with `_embedded` structure
- Creator information included in work details
- Some works have multiple associated media items
- **Constellations use `name` field** (not `title`) for the collection name
- No year range support (use single `year` filter)
- No creator/genre filters (include names in query instead)

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
