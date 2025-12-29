# API-013: State Libraries Integration

**Priority:** Low
**Phase:** 4 (Limited API Access)
**Status:** Investigation Needed
**Estimated Tools:** 0-4 (depending on findings)

---

## Overview

Australian state libraries (NSW, QLD, SA, WA, TAS, ACT, NT) generally don't have public APIs, but their content is often available via Trove.

**Status:** Most don't have public APIs
**Alternative:** Content often available via Trove API (already implemented)

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| **State Library NSW** | https://www.sl.nsw.gov.au |
| SLNSW Catalogue | https://search.sl.nsw.gov.au |
| SLNSW Developer/API | (needs investigation) |
| **State Library QLD** | https://www.slq.qld.gov.au |
| SLQ Catalogue | https://onesearch.slq.qld.gov.au |
| SLQ Digital Collections | https://www.slq.qld.gov.au/discover/collections |
| **State Library SA** | https://www.slsa.sa.gov.au |
| SLSA Catalogue | https://catalogue.slsa.sa.gov.au |
| **State Library WA** | https://www.slwa.wa.gov.au |
| SLWA Catalogue | https://encore.slwa.wa.gov.au |
| **Libraries Tasmania** | https://www.libraries.tas.gov.au |
| LINC Tasmania | https://www.linc.tas.gov.au |
| **ACT Heritage Library** | https://www.library.act.gov.au/heritage |
| **NT Library** | https://ntl.nt.gov.au |
| Trove Contributors | https://trove.nla.gov.au/partners |

---

## State Libraries to Investigate

### State Library of New South Wales (SLNSW)
- URL: https://www.sl.nsw.gov.au
- API Status: Unknown
- Notable Collections: Banks Papers, Australian manuscripts

### State Library of Queensland (SLQ)
- URL: https://www.slq.qld.gov.au
- API Status: Unknown
- Notable Collections: John Oxley Library, Queensland newspapers

### State Library of South Australia (SLSA)
- URL: https://www.slsa.sa.gov.au
- API Status: Unknown
- Notable Collections: Mortlock Library, early SA history

### State Library of Western Australia (SLWA)
- URL: https://www.slwa.wa.gov.au
- API Status: Unknown
- Notable Collections: Battye Library, WA history

### Libraries Tasmania
- URL: https://www.libraries.tas.gov.au
- API Status: Unknown
- Notable Collections: Allport Library, Tasmanian Archives

### ACT Heritage Library
- URL: https://www.library.act.gov.au
- API Status: Unknown
- Notable Collections: ACT history, Canberra development

### Northern Territory Library
- URL: https://ntl.nt.gov.au
- API Status: Unknown
- Notable Collections: Northern Territory history

---

## Subtasks

### 1. Research & Investigation
- [ ] Read Trove contributor list at https://trove.nla.gov.au/partners
- [ ] **Investigate: SLNSW API** - Check https://search.sl.nsw.gov.au for API docs/developer access
- [ ] **Investigate: SLNSW network requests** - Check for underlying API in catalogue
- [ ] **Investigate: SLQ API** - Check https://onesearch.slq.qld.gov.au for API
- [ ] **Investigate: SLQ Digital Collections** - Check for separate digital API
- [ ] **Investigate: SLSA API** - Check https://catalogue.slsa.sa.gov.au for developer access
- [ ] **Investigate: SLWA API** - Check https://encore.slwa.wa.gov.au for API endpoints
- [ ] **Investigate: LINC Tasmania** - Check https://www.linc.tas.gov.au for API
- [ ] **Investigate: ACT Heritage Library** - Check for digital collection API
- [ ] **Investigate: NT Library** - Check https://ntl.nt.gov.au for API
- [ ] Document findings for each library
- [ ] Create `docs/quickrefs/state-libraries-status.md` reference document

### 2. Trove Coverage Assessment
- [ ] Assess what state library content is in Trove
- [ ] Document gaps per state
- [ ] Determine if Trove is sufficient

### 3. State Data Portals Check
- [ ] Search for state library datasets on data.gov.au
- [ ] **Investigate: data.nsw.gov.au** - Check for SLNSW datasets
- [ ] **Investigate: data.qld.gov.au** - Check for SLQ datasets
- [ ] **Investigate: data.sa.gov.au** - Check for SLSA datasets
- [ ] **Investigate: data.wa.gov.au** - Check for SLWA datasets
- [ ] **Investigate: data.tas.gov.au** - Check for Libraries Tasmania datasets
- [ ] Document findings

### 4. Decision
- [ ] Decide if any state library warrants dedicated integration
- [ ] Document rationale

---

## Notes

- Most state library content flows through Trove
- May not need dedicated integrations
- State data portals may have relevant datasets
- Low priority unless specific gap identified
- Consider state-by-state if user has specific interest
