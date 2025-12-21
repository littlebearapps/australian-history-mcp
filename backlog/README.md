# Australian Archives MCP - API Integration Backlog

This backlog tracks the implementation of additional Australian government and non-profit APIs into the australian-archives-mcp server.

## Currently Implemented (v0.2.0)

| Source | Tools | Auth | Status |
|--------|-------|------|--------|
| PROV (Public Record Office Victoria) | 3 | None | ✅ Complete |
| Trove (National Library) | 5 | API Key | ✅ Complete |
| data.gov.au (CKAN) | 10 | None | ✅ Complete |
| Museums Victoria | 6 | None | ✅ Complete |

**Total: 24 tools across 4 sources**

---

## Backlog Overview

### Phase 1: Quick Wins (No Auth Required)
| Task | API | Priority | Est. Tools | Status |
|------|-----|----------|------------|--------|
| API-001 | Atlas of Living Australia | High | 4 | Not Started |
| API-002 | Victorian Heritage Database | High | 4 | Not Started |
| API-003 | National Museum of Australia | High | 4 | Not Started |

### Phase 2: Straightforward
| Task | API | Priority | Est. Tools | Status |
|------|-----|----------|------------|--------|
| API-004 | ACMI | High | 4 | Not Started |
| API-005 | PM Transcripts | High | 3 | Not Started |

### Phase 3: Needs Investigation
| Task | API | Priority | Est. Tools | Status |
|------|-----|----------|------------|--------|
| API-006 | Western Australian Museum | Medium | 4 | Not Started |
| API-007 | Australian War Memorial | Medium | 4-5 | Not Started |
| API-008 | Victorian Collections | Medium | 3-4 | Not Started |
| API-009 | AusStage | Medium | 4 | Not Started |
| API-010 | GHAP/TLCMap | Medium | 3-4 | Not Started |
| API-011 | HuNI | Medium | 3-4 | Not Started |

### Phase 4: Limited API Access
| Task | API | Priority | Est. Tools | Status |
|------|-----|----------|------------|--------|
| API-012 | National Archives Australia | Low | 0 | Blocked (No API) |
| API-013 | State Libraries | Low | 0-4 | Investigation Needed |
| API-014 | AIATSIS | Low | 0-3 | Investigation Needed |
| API-015 | NFSA | Low | 0-3 | Investigation Needed |
| API-016 | Australian Web Archive | Low | 0 | Available via Trove |

---

## Recommended Implementation Order

1. **API-001: Atlas of Living Australia** - 100M+ biodiversity records, excellent docs
2. **API-002: Victorian Heritage Database** - Heritage sites, shipwrecks, no auth
3. **API-003: National Museum of Australia** - National cultural heritage
4. **API-004: ACMI** - Screen culture, GitHub data dumps available
5. **API-005: PM Transcripts** - Political history, CC-BY licensed

Then investigate Phase 3 APIs as time permits.

---

## Task Files

All detailed task files are in `backlog/tasks/`:

```
backlog/tasks/
├── API-001-atlas-of-living-australia.md
├── API-002-victorian-heritage-database.md
├── API-003-national-museum-australia.md
├── API-004-acmi.md
├── API-005-pm-transcripts.md
├── API-006-western-australian-museum.md
├── API-007-australian-war-memorial.md
├── API-008-victorian-collections.md
├── API-009-ausstage.md
├── API-010-ghap-tlcmap.md
├── API-011-huni.md
├── API-012-national-archives-australia.md
├── API-013-state-libraries.md
├── API-014-aiatsis.md
├── API-015-nfsa.md
└── API-016-australian-web-archive.md
```

---

## Key Resources

- **GLAM Workbench:** https://glam-workbench.net/glam-data-list/
- **Victorian API Catalogue:** https://www.developer.vic.gov.au/api-catalogue
- **api.gov.au:** https://api.gov.au

---

## Estimated Impact

If all Phase 1-2 APIs implemented:
- **+19 tools** (from 24 to 43)
- **+9 sources** (from 4 to 9)
- **+100M+ additional records** accessible
