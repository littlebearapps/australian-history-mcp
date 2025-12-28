# PM Transcripts API Quick Reference

> [!NOTE]
> This is a third-party API. Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

## API Endpoint

- **Base URL:** `https://pmtranscripts.pmc.gov.au/`
- **Query API:** `/query?transcript={id}`
- **Sitemap:** `/transcripts.xml` (~26,000 IDs)

## Authentication

None required. Public read-only access.

## Tools

### pm_transcripts_get_transcript
Get a Prime Ministerial transcript by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Transcript ID (1 to ~26,000) |

Returns: title, PM name, release date, release type, subjects, full content, PDF URL.

### pm_transcripts_harvest
Bulk download transcripts with optional filters.

| Parameter | Type | Description |
|-----------|------|-------------|
| `primeMinister` | string | Filter by PM name (partial match, e.g., "Hawke") |
| `dateFrom` | string | Filter from date (YYYY-MM-DD) |
| `dateTo` | string | Filter to date (YYYY-MM-DD) |
| `startFrom` | number | Starting transcript ID (default 1) |
| `maxRecords` | number | Max records (1-500, default 100) |
| `useSitemap` | boolean | Use sitemap for faster PM filtering (default true) |

### pm_transcripts_search ⭐ NEW
Full-text search across all indexed transcripts using SQLite FTS5.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | **Required.** Search query with FTS5 operators |
| `primeMinister` | string | Filter by PM name |
| `releaseType` | string | Filter by type: Speech, Media Release, Interview |
| `dateFrom` | string | Start date (YYYY-MM-DD) |
| `dateTo` | string | End date (YYYY-MM-DD) |
| `limit` | number | Max results (1-100, default 20) |
| `snippetLength` | number | Snippet character length (default 200) |

**FTS5 Query Operators:**
- `"exact phrase"` - Match exact phrase
- `term1 AND term2` - Both terms required
- `term1 OR term2` - Either term
- `term1 NOT term2` - Exclude term2
- `term*` - Prefix matching

**Requires local index.** Run `pm_transcripts_build_index` first.

### pm_transcripts_build_index ⭐ NEW
Build or update the local SQLite FTS5 search index.

| Parameter | Type | Description |
|-----------|------|-------------|
| `mode` | string | `full` (rebuild all) or `update` (add new only) |
| `startFrom` | number | Starting transcript ID |
| `maxRecords` | number | Limit records (for testing) |

**Build times:**
- Full index (~26,000 transcripts): ~43 minutes
- Update mode: Seconds (fetches only new IDs)

**Storage:** `~/.local/share/australian-history-mcp/pm-transcripts.db` (~50-100MB)

### pm_transcripts_index_stats ⭐ NEW
Get statistics about the local FTS5 index.

Returns: record count, database size, last updated, date range of indexed content.

## ⚠️ Harvest Limitations

**The PM Transcripts API has no search or bulk endpoint.** Harvesting works by:
1. Fetching the sitemap (all ~26,000 IDs) or scanning sequentially
2. Fetching each transcript individually
3. Filtering results locally

This can be slow. For faster results with PM filtering, use `startFrom` near the PM's era:

| PM Era | Approximate ID Range |
|--------|---------------------|
| Curtin/Chifley (1940s) | 1 - 2,000 |
| Menzies (1950s-60s) | 2,000 - 4,000 |
| Whitlam/Fraser (1970s-80s) | 4,000 - 5,000 |
| Hawke (1983-1991) | 5,000 - 8,000 |
| Keating (1991-1996) | 8,000 - 10,000 |
| Howard (1996-2007) | 10,000 - 18,000 |
| Rudd/Gillard (2007-2013) | 18,000 - 22,000 |
| Abbott/Turnbull/Morrison (2013-2022) | 22,000 - 26,000 |

**Recommended approach:** Use `pm_transcripts_get_transcript` for individual lookups, or use `startFrom` close to your target era when harvesting.

## Release Types

- Speech
- Media Release
- Interview
- Press Conference
- Joint Statement
- Doorstop

## Key Quirks

- API returns XML format, not JSON
- Uses `<response><item key="0">...</item></response>` structure
- Date format in response is DD/MM/YYYY
- Content may be wrapped in CDATA
- Some IDs are missing (gaps in sequence)
- 100ms delay between requests to be respectful

## Example Usage

```
# Get specific transcript
id: 12345

# Harvest Hawke era (fast - starts near his transcripts)
primeMinister: "Hawke"
startFrom: 5000
maxRecords: 50

# Harvest by date range
dateFrom: "1990-01-01"
dateTo: "1990-12-31"
startFrom: 7000
```

## Licensing

Australian Government (Crown copyright).

## Resources

- [PM Transcripts Portal](https://pmtranscripts.pmc.gov.au/)
- [Sitemap](https://pmtranscripts.pmc.gov.au/transcripts.xml)
