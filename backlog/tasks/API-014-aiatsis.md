# API-014: AIATSIS Integration

**Priority:** Low
**Phase:** 4 (Limited API Access)
**Status:** Investigation Needed
**Estimated Tools:** 0-3 (depending on findings)

---

## Overview

The Australian Institute of Aboriginal and Torres Strait Islander Studies (AIATSIS) holds 1M+ items on Indigenous cultures and histories, but no public API is documented. Some data (like AustLang) may be available as datasets.

**URL:** https://aiatsis.gov.au
**Catalogue:** Mura catalogue (web-based search)
**Auth Required:** No public API documented
**Content:** 1M+ items on Indigenous cultures and histories

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| AIATSIS Website | https://aiatsis.gov.au |
| Mura Catalogue | https://collection.aiatsis.gov.au |
| AustLang (Languages) | https://collection.aiatsis.gov.au/austlang |
| AIATSIS Map of Indigenous Australia | https://aiatsis.gov.au/explore/map-indigenous-australia |
| AIATSIS Access Protocols | https://aiatsis.gov.au/research/ethical-research/access-conditions |
| AIATSIS on data.gov.au | https://data.gov.au/organization/aiatsis |
| ICIP (Cultural Protocols) | https://aiatsis.gov.au/research/ethical-research |
| AIATSIS Research Services | https://aiatsis.gov.au/research |

---

## Content Available

- Photographs
- Film and video
- Audio recordings
- Manuscripts and papers
- Maps
- Artworks
- Publications
- AustLang (Australian Indigenous Languages Database)

---

## Subtasks

### 1. Research & Investigation
- [ ] Explore AIATSIS website at https://aiatsis.gov.au thoroughly
- [ ] **Investigate: Mura Catalogue API** - Check https://collection.aiatsis.gov.au for underlying API
- [ ] **Investigate: Mura network requests** - Inspect browser network tab for API endpoints
- [ ] **Investigate: AustLang API** - Check https://collection.aiatsis.gov.au/austlang for data export
- [ ] **Investigate: AustLang downloads** - Check if language data is downloadable
- [ ] **Investigate: AIATSIS Map data** - Check if map data is available via API
- [ ] **Investigate: data.gov.au AIATSIS** - Search https://data.gov.au/organization/aiatsis
- [ ] **Investigate: Trove coverage** - Check what AIATSIS content is indexed in Trove
- [ ] **Investigate: Research access** - Check https://aiatsis.gov.au/research for researcher API access
- [ ] Look for developer/researcher access documentation
- [ ] Document findings
- [ ] Create `docs/quickrefs/aiatsis-status.md` reference document

### 2. Cultural Sensitivity Assessment
- [ ] Read AIATSIS access protocols at https://aiatsis.gov.au/research/ethical-research/access-conditions
- [ ] Read ICIP guidelines at https://aiatsis.gov.au/research/ethical-research
- [ ] Understand culturally sensitive material guidelines
- [ ] Document appropriate use requirements
- [ ] Consider if programmatic access is appropriate

### 3. AustLang Assessment
- [ ] Check if AustLang has API or data export
- [ ] Assess if language data is suitable for MCP
- [ ] Document data format and coverage

### 4. Decision
- [ ] Determine if integration is viable and appropriate
- [ ] Document rationale
- [ ] If viable, create implementation plan

---

## Cultural Considerations

AIATSIS materials often include:
- Secret/sacred content with access restrictions
- Content requiring community consultation
- Materials under cultural protocols

**Important:** Any integration must respect Indigenous Cultural and Intellectual Property (ICIP) rights and AIATSIS protocols.

---

## Potential Data Sources

| Source | API Status | Notes |
|--------|------------|-------|
| Mura Catalogue | Unknown | May have underlying API |
| AustLang | Data exports? | Language database |
| data.gov.au | Check | May have datasets |
| Trove | Partial | Some content indexed |

---

## Notes

- Highly significant collection for Indigenous history
- Access may be restricted for cultural reasons
- Must respect ICIP protocols
- AustLang may be most accessible dataset
- Lower priority due to likely access restrictions
