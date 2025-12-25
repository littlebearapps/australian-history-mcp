# Tools Reference

Complete parameter documentation for all 75 Australian History MCP tools.

---

## PROV Tools (No API Key Required)

### prov_search

Search the Public Record Office Victoria collection.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | One of query/series/agency | - | Search text (e.g., "Melbourne Town Hall") |
| `series` | string | One of query/series/agency | - | VPRS series number (e.g., "VPRS 515" or "515") |
| `agency` | string | One of query/series/agency | - | VA agency number (e.g., "VA 473" or "473") |
| `recordForm` | string | No | - | Type: `photograph`, `map`, `file`, `volume`, `plan`, `drawing`, `register` |
| `dateFrom` | string | No | - | Start date (YYYY-MM-DD or YYYY) |
| `dateTo` | string | No | - | End date (YYYY-MM-DD or YYYY) |
| `digitisedOnly` | boolean | No | false | Only return records with IIIF images |
| `limit` | number | No | 20 | Maximum results (1-100) |

**Response includes:**
- `id`, `title`, `description` (truncated)
- `series`, `seriesTitle`, `agency`
- `recordForm`, `dateRange`
- `digitised` (boolean), `url`, `iiifManifest`

**Example:**
```
Search PROV for "railway" photographs with digitised images only
```

---

### prov_get_images

Extract image URLs from a PROV digitised record's IIIF manifest.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `manifestUrl` | string | **Yes** | - | IIIF manifest URL from search results |
| `pages` | string | No | - | Page filter (e.g., "1-5", "1,3,7", "1-3,7,10-12") |
| `size` | string | No | `all` | `thumbnail`, `medium`, `full`, or `all` |

**Response includes:**
- `pages` - Array of page objects with URLs by size
- Each page has `thumbnail` (200px), `medium` (800px), `full` URLs

---

### prov_harvest

Bulk download PROV records with pagination.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | One of query/series | - | Search text |
| `series` | string | One of query/series | - | VPRS series number |
| `recordForm` | string | No | - | Filter by record type |
| `dateFrom` | string | No | - | Start date |
| `dateTo` | string | No | - | End date |
| `digitisedOnly` | boolean | No | false | Only digitised records |
| `maxRecords` | number | No | 100 | Maximum records to harvest (1-1000) |
| `offset` | string | No | - | Pagination offset from previous harvest |

**Response includes:**
- `totalAvailable` - Total matching records
- `harvested` - Number returned
- `hasMore` - Whether more records available
- `nextOffset` - Use for next harvest call
- `records` - Array of full record objects

---

## Trove Tools (API Key Required)

### trove_search

Search Trove for digitised Australian content.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | **Yes** | - | Search terms (e.g., "Melbourne flood 1934") |
| `category` | string | No | `all` | `all`, `newspaper`, `gazette`, `magazine`, `image`, `book`, `diary`, `music`, `research` |
| `state` | string | No | - | `vic`, `nsw`, `qld`, `sa`, `wa`, `tas`, `nt`, `act`, `national` |
| `dateFrom` | string | No | - | Start date (YYYY or YYYY-MM-DD) |
| `dateTo` | string | No | - | End date (YYYY or YYYY-MM-DD) |
| `format` | string | No | - | Format filter (e.g., "Photograph", "Map") |
| `includeFullText` | boolean | No | false | Include full article text (newspapers) |
| `limit` | number | No | 20 | Maximum results (1-100) |

**Response includes:**
- For articles: `id`, `heading`, `newspaper`, `date`, `page`, `snippet`, `fullText`, `url`
- For works: `id`, `title`, `contributor`, `issued`, `format`, `abstract`, `url`, `thumbnail`

---

### trove_newspaper_article

Get full details of a specific newspaper article.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `articleId` | string | **Yes** | - | Trove article ID (e.g., "123456789") |
| `includeFullText` | boolean | No | true | Include OCR text |

**Response includes:**
- `heading`, `newspaper`, `date`, `page`
- `fullText` - Complete OCR text
- `category` - Article/Advertising/etc.
- `wordCount`, `illustrated`
- `corrections` - User corrections count
- `troveUrl` - Link to Trove page

---

### trove_list_titles

List available newspaper and gazette titles.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `state` | string | No | - | Filter by state (`vic`, `nsw`, etc.) |
| `type` | string | No | `newspaper` | `newspaper` or `gazette` |
| `limit` | number | No | 50 | Maximum titles (1-100) |

**Response includes:**
- Array of titles with `id`, `title`, `state`, `startYear`, `endYear`

---

### trove_title_details

Get detailed information about a specific title.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `titleId` | string | **Yes** | - | Trove title ID |
| `includeYears` | boolean | No | true | Include available years |
| `dateFrom` | string | No | - | Filter issues from date |
| `dateTo` | string | No | - | Filter issues to date |

**Response includes:**
- `title`, `state`, `issn`, `publisher`
- `startYear`, `endYear`
- `years` - Array of available years with issue counts
- `totalIssues`

---

### trove_harvest

Bulk download Trove search results.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | **Yes** | - | Search terms |
| `category` | string | No | `newspaper` | Content category |
| `state` | string | No | - | Filter by state |
| `dateFrom` | string | No | - | Start date |
| `dateTo` | string | No | - | End date |
| `includeFullText` | boolean | No | false | Include article text |
| `maxRecords` | number | No | 100 | Maximum records (1-1000) |
| `cursor` | string | No | - | Pagination cursor from previous harvest |

**Response includes:**
- `totalAvailable` - Total matching records
- `harvested` - Number returned
- `hasMore` - Whether more available
- `nextCursor` - Use for pagination
- `records` - Array of results

**Note:** Uses `bulkHarvest=true` mode for stable pagination.

---

## GHAP Tools (No API Key Required)

### ghap_search

Search historical placenames from ANPS gazetteer and community datasets.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | No | - | Placename to search (partial match) |
| `state` | string | No | - | Filter by state (VIC, NSW, QLD, SA, WA, TAS, NT, ACT) |
| `lga` | string | No | - | Filter by Local Government Area |
| `bbox` | string | No | - | Bounding box: minLon,minLat,maxLon,maxLat |
| `fuzzy` | boolean | No | false | Use fuzzy matching (handles typos) |
| `limit` | number | No | 20 | Maximum results (1-100) |

---

### ghap_get_place

Get place details by TLCMap ID.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | **Yes** | - | TLCMap place ID (e.g., "a1b4b8", "t3408") |

---

### ghap_list_layers

List all available community data layers. Returns 1990+ layers.

No parameters required.

---

### ghap_get_layer

Get all places from a specific data layer.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `layerId` | number | **Yes** | - | Layer ID (from ghap_list_layers) |

---

### ghap_harvest

Bulk download placename records with filters.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | No | - | Placename to search |
| `state` | string | No | - | Filter by state |
| `lga` | string | No | - | Filter by Local Government Area |
| `bbox` | string | No | - | Bounding box filter |
| `maxRecords` | number | No | 100 | Maximum records (1-500) |

---

## Museums Victoria Tools (No API Key Required)

### museumsvic_search

Search Museums Victoria's collection.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | One required | - | Search terms (e.g., "platypus", "gold rush") |
| `recordType` | string | One required | - | `article`, `item`, `species`, `specimen` |
| `category` | string | One required | - | `natural sciences`, `first peoples`, `history & technology` |
| `hasImages` | boolean | No | - | Only records with images |
| `onDisplay` | boolean | No | - | Only items currently on display |
| `imageLicence` | string | No | - | `public domain`, `cc by`, `cc by-nc`, `cc by-sa`, `cc by-nc-sa` |
| `locality` | string | No | - | Geographic location filter |
| `taxon` | string | No | - | Taxonomic classification filter |
| `limit` | number | No | 20 | Maximum results (1-100) |

---

### museumsvic_get_article

Get educational article by ID.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | **Yes** | - | Article ID from search results |

---

### museumsvic_get_item

Get museum object by ID.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | **Yes** | - | Item ID from search results |

---

### museumsvic_get_species

Get species information by ID.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | **Yes** | - | Species ID from search results |

---

### museumsvic_get_specimen

Get natural science specimen by ID.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | string | **Yes** | - | Specimen ID from search results |

---

### museumsvic_harvest

Bulk download museum records.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | One required | - | Search terms |
| `recordType` | string | One required | - | `article`, `item`, `species`, `specimen` |
| `category` | string | One required | - | Collection category |
| `hasImages` | boolean | No | - | Only records with images |
| `imageLicence` | string | No | - | Image licence filter |
| `locality` | string | No | - | Geographic location |
| `taxon` | string | No | - | Taxonomic classification |
| `maxRecords` | number | No | 100 | Maximum records (1-1000) |
| `startPage` | number | No | 1 | Starting page for pagination |

---

## Error Responses

All tools return errors in this format:
```json
{
  "error": "Error message describing the issue"
}
```

Common errors:
- `TROVE_API_KEY not configured` - Trove tools require API key
- `At least one of query, series, or agency is required` - PROV search validation
- `Rate limit exceeded` - Trove 200/min limit hit
