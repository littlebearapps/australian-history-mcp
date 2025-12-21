# API-012: National Archives of Australia (NAA) Integration

**Priority:** Low
**Phase:** 4 (Limited API Access)
**Status:** Blocked
**Estimated Tools:** 0 (currently not viable)

---

## Overview

The National Archives of Australia (NAA) RecordSearch system was a key target but **NO PUBLIC API EXISTS** as of May 2025. Web scrapers were blocked in May 2025.

**URL:** https://recordsearch.naa.gov.au
**Auth Required:** N/A - No API
**Content:** 45M+ Commonwealth government records

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| NAA Website | https://www.naa.gov.au |
| RecordSearch | https://recordsearch.naa.gov.au |
| PhotoSearch | https://recordsearch.naa.gov.au/PhotoSearchNB/photo.aspx |
| NameSearch | https://recordsearch.naa.gov.au/NameSearch/Interface/NameSearch.aspx |
| GLAM Workbench (blocked) | https://glam-workbench.net/recordsearch/ |
| NAA on data.gov.au | https://data.gov.au/organization/nationalarchives |
| NAA News/Updates | https://www.naa.gov.au/about-us/news |
| API Advocacy Thread | https://github.com/GLAM-Workbench/recordsearch/issues |

---

## Content (Inaccessible via API)

- Commonwealth government records
- WWI/WWII service records
- Immigration and citizenship records
- Cabinet records
- Royal Commission records
- Court records

---

## Current Status

### What Happened
- RecordSearch has no official API
- Community-built scrapers (like those in GLAM Workbench) were blocked in May 2025
- NAA has not announced plans for an official API

### Alternatives
- [ ] Some NAA data is indexed in **Trove** (already implemented)
- [ ] Some datasets available via **data.gov.au** (already implemented)
- [ ] Monitor NAA for API announcements

---

## Subtasks (Monitoring Only)

### 1. Research & Investigation
- [ ] Read NAA website at https://www.naa.gov.au thoroughly
- [ ] **Investigate: RecordSearch interface** - Check for any API headers in network requests
- [ ] **Investigate: PhotoSearch** - Check https://recordsearch.naa.gov.au/PhotoSearchNB/ for separate API
- [ ] **Investigate: NameSearch** - Check https://recordsearch.naa.gov.au/NameSearch/ for separate API
- [ ] **Investigate: data.gov.au datasets** - Search for NAA datasets on data.gov.au
- [ ] **Investigate: Trove coverage** - Check what NAA content is indexed in Trove
- [ ] **Investigate: RSS feeds** - Check if NAA offers any RSS/Atom feeds for new content
- [ ] **Investigate: GLAM Workbench status** - Monitor https://github.com/GLAM-Workbench/recordsearch/issues
- [ ] Subscribe to NAA news updates
- [ ] Document any changes or announcements
- [ ] Create `docs/quickrefs/naa-status.md` status document

### 2. Trove Coverage Assessment
- [ ] Assess what NAA content is available via Trove
- [ ] Document gaps in coverage
- [ ] Consider Trove enhancements for NAA content

### 3. Data.gov.au Assessment
- [ ] Search data.gov.au for NAA datasets
- [ ] Document available datasets
- [ ] Consider targeted tools if significant data exists

---

## Investigation Notes

From May 2025 research:
- GLAM Workbench RecordSearch tools no longer work
- NAA blocked automated access to protect systems
- No timeline for official API

---

## Alternative Access

| Method | Status | Notes |
|--------|--------|-------|
| RecordSearch API | ❌ None | No official API |
| Web Scraping | ❌ Blocked | Blocked May 2025 |
| Trove | ✅ Partial | Some content indexed |
| data.gov.au | ✅ Partial | Some datasets available |

---

## Notes

- This is Australia's most significant archive gap
- 45M+ records are effectively inaccessible programmatically
- Community has advocated for API access
- Keep monitoring for changes
- Do NOT attempt to bypass blocks
