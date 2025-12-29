# API-015: National Film and Sound Archive (NFSA) Integration

**Priority:** Low
**Phase:** 4 (Limited API Access)
**Status:** Investigation Needed
**Estimated Tools:** 0-3 (depending on findings)

---

## Overview

The National Film and Sound Archive (NFSA) holds 2.8M+ audiovisual works but no public API is documented. The search system was recently modernised but API access is unclear.

**URL:** https://www.nfsa.gov.au
**Auth Required:** No public API documented
**Content:** 2.8M+ audiovisual works

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| NFSA Website | https://www.nfsa.gov.au |
| NFSA Collection Search | https://www.nfsa.gov.au/collection |
| NFSA Curated Stories | https://www.nfsa.gov.au/collection/curated |
| NFSA on Trove | https://trove.nla.gov.au/search?keyword=nfsa |
| NFSA on data.gov.au | https://data.gov.au/organization/nfsa |
| NFSA Blog/News | https://www.nfsa.gov.au/latest |
| NFSA About/Research | https://www.nfsa.gov.au/about |
| ACMI (related) | https://www.acmi.net.au |

---

## Content Available

- Australian films
- Television programs
- Radio broadcasts
- Sound recordings (music, oral history)
- Video games
- Advertising
- Home movies
- Newsreels

---

## Subtasks

### 1. Research & Investigation
- [ ] Explore NFSA website at https://www.nfsa.gov.au thoroughly
- [ ] **Investigate: Collection search API** - Check https://www.nfsa.gov.au/collection for underlying API
- [ ] **Investigate: Network requests** - Inspect browser network tab for API endpoints
- [ ] **Investigate: Search parameters** - Document search query format and filters
- [ ] **Investigate: Record detail endpoint** - Check how individual items are retrieved
- [ ] **Investigate: Curated content API** - Check https://www.nfsa.gov.au/collection/curated for API
- [ ] **Investigate: data.gov.au NFSA** - Search https://data.gov.au/organization/nfsa
- [ ] **Investigate: Trove coverage** - Check what NFSA content is indexed in Trove
- [ ] **Investigate: MongoDB/vector search** - Check if new search system exposes API
- [ ] Look for developer/researcher access documentation
- [ ] Document findings
- [ ] Create `docs/quickrefs/nfsa-status.md` reference document

### 2. Compare with ACMI
- [ ] Assess overlap with ACMI collection
- [ ] Identify unique NFSA content (radio, sound recordings)
- [ ] Determine if ACMI covers sufficient ground

### 3. Technical Assessment
- [ ] Check for API in network requests
- [ ] Look for OpenAPI/Swagger documentation
- [ ] Assess new MongoDB/vector search implementation

### 4. Decision
- [ ] Determine if integration is viable
- [ ] Document rationale
- [ ] If viable, create implementation plan

---

## Recent Changes

- NFSA modernised search system (2024-2025)
- Uses MongoDB and vector search
- May have API not yet publicly documented

---

## Overlap Assessment

| Content Type | NFSA | ACMI | Notes |
|--------------|------|------|-------|
| Australian Films | ✅ | ✅ | Significant overlap |
| Television | ✅ | ✅ | Overlap |
| Radio | ✅ | ❌ | NFSA unique |
| Sound Recordings | ✅ | ❌ | NFSA unique |
| Video Games | ✅ | ✅ | Overlap |
| Advertising | ✅ | Partial | NFSA more comprehensive |

---

## Notes

- ACMI (API-004) may cover much of this content
- NFSA unique for radio and sound recordings
- Lower priority due to ACMI overlap
- Worth monitoring for API availability
- May become higher priority if API announced
