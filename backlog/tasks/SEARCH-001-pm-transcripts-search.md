# SEARCH-001: PM Transcripts Search Tool

**Priority:** P0 (Critical Gap)
**Phase:** 1 - Core Search Enhancements
**Status:** ❌ Cannot Implement - API Limitation
**Estimated Effort:** N/A
**Dependencies:** None

---

## Outcome

**Status: Not Implementable** - The PM Transcripts API does not support search functionality.

### API Investigation Results (2025-12-28)

1. **No search endpoint exists** - The API only supports lookup by transcript ID:
   - `GET /query?transcript=123` - Returns single transcript

2. **Sitemap is inaccessible** - The `/transcripts.xml` endpoint now redirects to a batch process:
   - Returns `302 Redirect` to `/batch?id=1091&op=start`
   - The sitemap generation is now a background job, not directly accessible

3. **No other endpoints discovered** - Testing various parameters (`keyword`, `prime_minister`, etc.) returns empty responses

### Current Capabilities

The PM Transcripts source has these tools:
- `pm_transcripts_get_transcript` - Lookup by ID (working)
- `pm_transcripts_harvest` - Sequential ID scanning with client-side filters (working)

### Workaround for Users

Use `pm_transcripts_harvest` with filters:
```
pm_transcripts_harvest: primeMinister="Hawke", dateFrom="1983", dateTo="1991", startFrom=5000
```

Approximate PM era ID ranges for faster scanning:
- Curtin ~1-2000
- Menzies ~2000-4000
- Hawke ~5000-8000
- Keating ~8000-10000
- Howard ~10000-18000

### Documentation Updates Made

1. Updated `CLAUDE.md` Known Quirks section to document the API limitation
2. Updated `pm_transcripts_harvest` tool to remove broken sitemap mode
3. Removed unused `USE_SITEMAP` parameter description

---

## Future Consideration (SEARCH-018)

A local full-text index could enable search, but would require:
1. Initial full harvest of all ~26,000 transcripts (slow, ~45 hours at 100ms delay)
2. Local SQLite/FTS5 database
3. Periodic sync mechanism

This is deferred as it requires significant infrastructure beyond the MCP server scope.

---

## Related Tasks

- SEARCH-018: PM Transcripts Full-Text Index (deferred)
