# Tools Reference

Complete parameter documentation for all Australian Archives MCP tools.

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
