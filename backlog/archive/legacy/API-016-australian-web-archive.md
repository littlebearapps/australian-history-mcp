# API-016: Australian Web Archive (PANDORA/AWA) Integration

**Priority:** Low
**Phase:** 4 (Already Available via Trove)
**Status:** Available via Trove
**Estimated Tools:** 0 (use existing Trove tools)

---

## Overview

The Australian Web Archive (including PANDORA and the broader AWA) preserves archived Australian websites from 1996 onwards. This content is already accessible via the Trove API.

**URL:** Via Trove (https://webarchive.nla.gov.au)
**Auth Required:** Via Trove API (already implemented)
**Content:** Archived Australian websites from 1996+

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| Australian Web Archive | https://webarchive.nla.gov.au |
| PANDORA Archive | https://pandora.nla.gov.au |
| NLA Web Archive Help | https://webarchive.nla.gov.au/help |
| Trove API (accessing AWA) | https://trove.nla.gov.au/about/what-trove/technical |
| Trove API v3 Docs | https://trove.nla.gov.au/about/create-something/using-api |
| AWA Search | https://webarchive.nla.gov.au/search |
| CDX API (if available) | (needs investigation) |
| GLAM Workbench AWA | https://glam-workbench.net/web-archives/ |

---

## Content Available

- Government websites (historical versions)
- News websites
- Cultural institution websites
- Political party websites
- Business websites
- Personal websites of significance

---

## Current Status

**✅ ALREADY AVAILABLE** via existing Trove integration

The Trove API can search and access Australian Web Archive content. No additional integration needed.

---

## How to Access via Trove

```
# Search for archived websites
trove_search: query="prime minister site:gov.au", category="website"

# Note: Trove category for web archives needs verification
```

---

## Subtasks (Documentation Only)

### 1. Research & Investigation
- [ ] Explore Australian Web Archive at https://webarchive.nla.gov.au
- [ ] **Investigate: Trove web archive category** - Verify Trove category for web archive content
- [ ] **Investigate: Trove web archive search** - Test searching archived websites via Trove API
- [ ] **Investigate: AWA search API** - Check https://webarchive.nla.gov.au/search for underlying API
- [ ] **Investigate: CDX API** - Check if Wayback-style CDX endpoint exists
- [ ] **Investigate: GLAM Workbench AWA** - Review https://glam-workbench.net/web-archives/
- [ ] **Investigate: Direct AWA access** - Check if direct API access offers more than Trove
- [ ] Document how to search archived websites via Trove
- [ ] Add examples to `docs/quickrefs/trove-api.md`
- [ ] Test web archive queries

### 2. Assess Coverage
- [ ] Understand what's in PANDORA vs broader AWA
- [ ] Document date ranges and coverage
- [ ] Note any access restrictions

---

## PANDORA vs AWA

| Archive | Focus | Size |
|---------|-------|------|
| PANDORA | Curated, significant websites | Selective |
| AWA (Broader) | Domain harvests | More comprehensive |

---

## Notes

- **No new integration needed** - use Trove
- May need to document Trove parameters for web archives
- Lower priority as functionality exists
- Consider updating Trove quickref documentation
