# API-005: PM Transcripts Integration

**Priority:** High
**Phase:** 2 (Straightforward)
**Status:** Not Started
**Estimated Tools:** 3

---

## Overview

Integrate the PM Transcripts API to provide access to speeches, media releases, and interviews from Australian Prime Ministers from the 1940s to present.

**URL:** https://pmtranscripts.pmc.gov.au
**Auth Required:** None
**License:** CC-BY 3.0 Australia
**Format:** XML download API
**Content:** 26,000+ transcripts

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| Website | https://pmtranscripts.pmc.gov.au |
| Search Interface | https://pmtranscripts.pmc.gov.au/search/advanced |
| About/Help | https://pmtranscripts.pmc.gov.au/about |
| GLAM Workbench | https://glam-workbench.net/pm-transcripts/ |

---

## Content Available

- Prime Minister speeches
- Media releases
- Press conferences
- Interviews
- Parliamentary statements
- Coverage from 1940s to present

---

## Subtasks

### 1. Research & Documentation
- [ ] Explore PM Transcripts website at https://pmtranscripts.pmc.gov.au
- [ ] Check GLAM Workbench for existing tools at https://glam-workbench.net/pm-transcripts/
- [ ] **Investigate endpoint: Search API** - Document search params, result format
- [ ] **Investigate endpoint: Transcript XML download** - Document XML structure
- [ ] **Investigate endpoint: Transcript metadata** - Document available fields
- [ ] **Investigate endpoint: Browse by PM** - Document PM filtering
- [ ] **Investigate endpoint: Browse by date** - Document date range queries
- [ ] **Investigate endpoint: Browse by type** - Document transcript types
- [ ] Document XML API format and download methods
- [ ] Identify search parameters (PM, date range, type)
- [ ] Note any rate limits or access restrictions
- [ ] Create `docs/quickrefs/pm-transcripts-api.md` reference document

### 2. Create Source Module Structure
- [ ] Create `src/sources/pm-transcripts/` directory
- [ ] Create `src/sources/pm-transcripts/types.ts` with transcript types
- [ ] Create `src/sources/pm-transcripts/client.ts` extending BaseClient
- [ ] Add XML parsing utilities (or use existing library)
- [ ] Create `src/sources/pm-transcripts/index.ts` using defineSource()

### 3. Implement Core Tools
- [ ] **pm_transcripts_search** - Search transcripts by PM, date, keyword, type
- [ ] **pm_transcripts_get** - Get full transcript text by ID
- [ ] **pm_transcripts_harvest** - Bulk download transcripts with pagination

### 4. Testing
- [ ] Test each tool manually via MCP protocol
- [ ] Verify XML parsing works correctly
- [ ] Test date range filtering
- [ ] Test PM-specific searches
- [ ] Test pagination in harvest tool
- [ ] Document example queries in quickref

### 5. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update `CLAUDE.md` with new tools table
- [ ] Update `README.md` with PM Transcripts section
- [ ] Build and verify with `npm run build`

---

## API Endpoints to Implement

| Endpoint | Tool | Description |
|----------|------|-------------|
| Search endpoint | pm_transcripts_search | Search transcripts |
| Download endpoint | pm_transcripts_get | Get full transcript |
| Paginated search | pm_transcripts_harvest | Bulk download |

---

## Example Queries

```
# Find Bob Hawke speeches about economics
pm_transcripts_search: pm="Hawke", query="economy"

# Find all press conferences from 2020
pm_transcripts_search: type="press conference", yearFrom="2020", yearTo="2020"

# Get a specific transcript
pm_transcripts_get: id="12345"
```

---

## Prime Ministers Covered

- John Curtin (1941-1945)
- Ben Chifley (1945-1949)
- Robert Menzies (1949-1966)
- Harold Holt (1966-1967)
- John Gorton (1968-1971)
- William McMahon (1971-1972)
- Gough Whitlam (1972-1975)
- Malcolm Fraser (1975-1983)
- Bob Hawke (1983-1991)
- Paul Keating (1991-1996)
- John Howard (1996-2007)
- Kevin Rudd (2007-2010, 2013)
- Julia Gillard (2010-2013)
- Tony Abbott (2013-2015)
- Malcolm Turnbull (2015-2018)
- Scott Morrison (2018-2022)
- Anthony Albanese (2022-present)

---

## Notes

- CC-BY 3.0 Australia license allows reuse with attribution
- XML format may need special handling
- Unique historical political archive
- Consider adding keyword extraction/topic analysis in future
