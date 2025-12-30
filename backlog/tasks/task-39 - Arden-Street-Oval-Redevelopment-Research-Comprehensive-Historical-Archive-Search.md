---
id: task-39
title: >-
  Arden Street Oval Redevelopment Research - Comprehensive Historical Archive
  Search
status: Done
assignee: []
created_date: '2025-12-29 10:01'
updated_date: '2025-12-29 10:13'
labels:
  - research
  - historical-archives
  - north-melbourne-fc
  - arden-street
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Systematic search across Australian historical archives to find primary-source contemporaneous mentions of demolition plans, funding commitments, council/state contributions, pavilion/gate/turnstiles related to North Melbourne Football Club's Arden Street Oval redevelopment (circa 2003-2010).

**Research Goals:**
1. Find the "paper trail" for the $2M grandstand restoration and $15M training facility
2. Document what was demolished (Henderson Pavilion, ticket gates, social club, etc.)
3. Locate planning permits and address-anchored records
4. Find visual confirmation via aerial photography
5. Check heritage protection status of demolished elements

**Sources to Search:**
- Trove (newspapers/gazettes/journals/images/books)
- PROV (Public Record Office Victoria)
- Victorian Heritage Database (VHD)
- Geoscience Australia Historical Aerial Photography (GA HAP)
- Museums Victoria
- National Museum of Australia (NMA)
- GHAP/TLCMap (placenames)
- IIIF (high-res imagery if manifests found)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All Trove queries (#1-20) executed with results documented
- [x] #2 All PROV queries (#1-10) executed with results documented
- [x] #3 All VHD queries (#1-7) executed with results documented
- [x] #4 GA HAP aerial photography search completed for 2006-2010
- [x] #5 Museums Victoria and NMA photograph searches completed
- [x] #6 GHAP placename searches completed
- [x] #7 All results include URLs and key metadata
- [x] #8 Summary of findings compiled with gaps identified
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Search Strategy

Execute searches in priority packs:

### Pack A: Money + Decision Trail (HIGH PRIORITY)
- Trove queries #1-8 (project + funding)
- PROV queries #1-5 (state records)
- VHD queries #1-2 (heritage status)

### Pack B: Demolition Scope (HIGH PRIORITY)
- Trove queries #9-14 (Henderson/ticket gate/social club)
- PROV queries #6-8 (demolition files)
- VHD queries #3-7 (demolished elements heritage)

### Pack C: Visual Confirmation (MEDIUM PRIORITY)
- GA HAP queries #1-8 (aerial photography 2006-2010)
- Museums Victoria photograph queries
- NMA photograph queries

### Pack D: Permit/Address Thread (MEDIUM PRIORITY)
- Trove queries #15-17 (planning permits)
- PROV queries #9-10 (council reports)

### Pack E: Broadened Synonyms (LOW PRIORITY)
- Trove queries #18-20 (Kangaroos/Shinboner variants)

### Pack F: Placenames/IIIF (LOW PRIORITY)
- GHAP queries #1-4 (naming variants)
- IIIF manifest searches (if found via Trove)

## Query Execution Notes
- Run each Trove query twice: with quotes (exact) and without (broad)
- Time-bound PROV with years: 2003, 2005, 2007, 2008, 2009
- GA HAP: Focus on state=VIC, years 2006-2010
- Document ALL results with URLs and descriptions
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Research Complete (2025-12-29)

Executed 60+ queries across 8 data sources. Full results documented in `docs/search-queries/arden-street-research-results.md`.

### Key Findings:
- 5 contemporaneous articles (2005-2012) about redevelopment found via Trove
- Heritage assessments (Allom Lovell 1999, Lovell Chen 2006) located
- VHD confirms NO heritage registration for Arden Street grandstand
- 1976 & 1981 GA HAP aerials available (scanned, downloadable)
- 13 PROV records from 1920s council files (digitised with IIIF)
- 1924 newspaper coverage of turnstile/gate incident

### Critical Gaps Identified:
- No modern newspaper coverage (Trove digitised ends ~1954)
- No PROV records for 2000s (20-30 year transfer lag)
- No aerial photography 2006-2010 (GA HAP ends 1996)
- Henderson Pavilion documentation sparse
- No GHAP placename entries
<!-- SECTION:NOTES:END -->
