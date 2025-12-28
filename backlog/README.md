# Australian History MCP - Backlog

This backlog tracks implementation tasks for the australian-history-mcp server.

## Currently Implemented (v0.5.0)

| Source | Tools | Auth | Status |
|--------|-------|------|--------|
| PROV (Public Record Office Victoria) | 5 | None | ✅ Complete |
| Trove (National Library) | 13 | API Key | ✅ Complete |
| GHAP (TLCMap) | 5 | None | ✅ Complete |
| Museums Victoria | 6 | None | ✅ Complete |
| Atlas of Living Australia (ALA) | 8 | None | ✅ Complete |
| National Museum of Australia (NMA) | 9 | None | ✅ Complete |
| Victorian Heritage Database (VHD) | 9 | None | ✅ Complete |
| ACMI | 7 | None | ✅ Complete |
| PM Transcripts | 2 | None | ✅ Complete |
| IIIF (Generic) | 2 | None | ✅ Complete |
| Geoscience Australia HAP | 3 | None | ✅ Complete |

**Total: 69 tools across 11 sources**

---

## Public Release Preparation (PREP-xxx)

Tasks for preparing the repository for public GitHub release.

### ⚠️ Content Filter Workaround (API Error 400)

Claude Code's content filter may block reproduction of standard templates (licenses, codes of conduct, CI workflows).

**Workaround:** Use `curl` to download content directly - the filter only applies to Claude's generated output, NOT to shell command results.

**Example:**
```bash
curl -sL "https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md" -o CODE_OF_CONDUCT.md
```

**Reference:** See PREP-001 task file for detailed documentation. Known bug: GitHub Issues [#4379](https://github.com/anthropics/claude-code/issues/4379), [#6772](https://github.com/anthropics/claude-code/issues/6772).

---

### File Creation Tasks
| Task | Description | Priority | Status |
|------|-------------|----------|--------|
| PREP-001 | Core Documentation (LICENSE, CONTRIBUTING, CHANGELOG, SECURITY, CODE_OF_CONDUCT) | P0 | ✅ Completed |
| PREP-002 | GitHub Issue & PR Templates | P1 | ✅ Completed |
| PREP-003 | GitHub Discussion Templates | P2 | Not Started |
| PREP-004 | CI/CD Workflows (ci.yml, codeql.yml, release.yml, dependabot.yml) | P1 | Not Started |
| PREP-005 | Package.json Enhancements | P3 | Not Started |

### GitHub CLI Tasks (Execute with delays to avoid API 400)
| Task | Description | Operations | Status |
|------|-------------|------------|--------|
| PREP-006 | GitHub Labels | 21 labels | Not Started |
| PREP-007 | Retrospective Milestones (Closed) | 5 milestones | Not Started |
| PREP-008 | Current Milestones (Open) | 2 milestones | Not Started |
| PREP-009 | Retrospective Issues v0.1.0 | 3 issues | Not Started |
| PREP-010 | Retrospective Issues v0.2.0 | 3 issues | Not Started |
| PREP-011 | Retrospective Issues v0.3.0 | 5 issues | Not Started |
| PREP-012 | Retrospective Issues v0.4.0 | 3 issues | Not Started |
| PREP-013 | Retrospective Issues v0.5.0 | 4 issues | Not Started |

### Manual UI Tasks
| Task | Description | Status |
|------|-------------|--------|
| PREP-014 | GitHub Repository Settings | Not Started |

**IMPORTANT:** GitHub CLI tasks must be executed ONE operation at a time with 2-second delays to avoid API 400 errors.

---

## Search Enhancements (SEARCH-xxx)

Enhanced search capabilities across all data sources. Planned for v0.8.0+.

### Phase 1: Core Search Enhancements
| Task | Description | Priority | Effort | Status |
|------|-------------|----------|--------|--------|
| SEARCH-001 | PM Transcripts Search Tool (title/metadata) | P0 | N/A | ❌ Not Implementable (API limitation) |
| SEARCH-002 | Faceted Search Infrastructure (shared types) | P0 | 1 day | ✅ Completed (2025-12-28) |
| SEARCH-003 | Faceted Search - Trove (native API facets) | P0 | 0.5 days | ✅ Completed (2025-12-28) |
| SEARCH-004 | Faceted Search - PROV (Solr facets) | P1 | 0.5 days | ✅ Completed (2025-12-28) |
| SEARCH-005 | Faceted Search - ALA (native API facets) | P1 | 0.5 days | ✅ Completed (2025-12-28) |
| SEARCH-006 | Faceted Search - Remaining Sources (client-side) | P1 | 1.5 days | ✅ Completed (2025-12-28) |
| SEARCH-007 | Advanced Query Syntax - Parser Core | P1 | 2 days | Not Started |
| SEARCH-008 | Advanced Query Syntax - Source Builders | P1 | 1.5 days | Not Started |
| SEARCH-009 | Sorting Options - Multi-Source | P2 | 1 day | Not Started |

### Phase 2: Federated & Filter Expansion
| Task | Description | Priority | Effort | Status |
|------|-------------|----------|--------|--------|
| SEARCH-010 | Federated Search Intelligence | P1 | 3-4 days | Not Started |
| SEARCH-011 | NMA Filter Expansion (4 → 8+ params) | P2 | 1 day | Not Started |
| SEARCH-012 | ACMI Filter Expansion (4 → 8+ params) | P2 | 1 day | Not Started |
| SEARCH-013 | GA HAP Technical Filters | P2 | 1 day | Not Started |
| SEARCH-014 | VHD Filter Expansion | P2 | 0.5 days | Not Started |
| SEARCH-015 | ALA Filter Expansion | P2 | 0.5 days | Not Started |

### Phase 3: Future Enhancements
| Task | Description | Priority | Effort | Status |
|------|-------------|----------|--------|--------|
| SEARCH-016 | Spatial Query Support (point+radius) | P3 | 2-3 days | Not Started |
| SEARCH-017 | Related Records Discovery | P3 | 2 days | Not Started |
| SEARCH-018 | PM Transcripts Full-Text Index (SQLite) | P3 | 3-4 days | Not Started |
| SEARCH-019 | Search History & Saved Queries | P3 | 1 day | Not Started |

**Total: 19 tasks across 3 phases**

---

## Future API Integrations (API-xxx)

### Phase 3: Needs Investigation
| Task | API | Priority | Est. Tools | Status |
|------|-----|----------|------------|--------|
| API-006 | Western Australian Museum | Medium | 4 | Not Started |
| API-007 | Australian War Memorial | Medium | 4-5 | Not Started |
| API-008 | Victorian Collections | Medium | 3-4 | Not Started |
| API-009 | AusStage | Medium | 4 | Not Started |
| API-010 | GHAP/TLCMap | Medium | 5 | ✅ Implemented |
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

## Task Files

All detailed task files are in `backlog/tasks/`:

### Public Release Preparation
```
backlog/tasks/
├── PREP-001-core-documentation.md
├── PREP-002-github-templates.md
├── PREP-003-discussion-templates.md
├── PREP-004-ci-workflows.md
├── PREP-005-package-json.md
├── PREP-006-github-labels.md
├── PREP-007-retrospective-milestones.md
├── PREP-008-current-milestones.md
├── PREP-009-retro-issues-v010.md
├── PREP-010-retro-issues-v020.md
├── PREP-011-retro-issues-v030.md
├── PREP-012-retro-issues-v040.md
├── PREP-013-retro-issues-v050.md
└── PREP-014-github-settings.md
```

### Search Enhancements
```
backlog/tasks/
├── SEARCH-001-pm-transcripts-search.md      (Phase 1 - PM Transcripts search tool)
├── SEARCH-002-faceted-search-infrastructure.md (Phase 1 - Shared facet types)
├── SEARCH-003-faceted-search-trove.md       (Phase 1 - Trove facets)
├── SEARCH-004-faceted-search-prov.md        (Phase 1 - PROV facets)
├── SEARCH-005-faceted-search-ala.md         (Phase 1 - ALA facets)
├── SEARCH-006-faceted-search-remaining.md   (Phase 1 - Client-side facets)
├── SEARCH-007-query-parser-core.md          (Phase 1 - Boolean query parser)
├── SEARCH-008-query-builders.md             (Phase 1 - Source-specific builders)
├── SEARCH-009-sorting-options.md            (Phase 1 - Multi-source sorting)
├── SEARCH-010-federated-search-intelligence.md (Phase 2 - Smart routing)
├── SEARCH-011-nma-filter-expansion.md       (Phase 2 - NMA filters)
├── SEARCH-012-acmi-filter-expansion.md      (Phase 2 - ACMI filters)
├── SEARCH-013-ga-hap-technical-filters.md   (Phase 2 - GA HAP filters)
├── SEARCH-014-vhd-filter-expansion.md       (Phase 2 - VHD filters)
├── SEARCH-015-ala-filter-expansion.md       (Phase 2 - ALA filters)
├── SEARCH-016-spatial-query-support.md      (Phase 3 - Point+radius)
├── SEARCH-017-related-records.md            (Phase 3 - Related records)
├── SEARCH-018-pm-transcripts-fulltext.md    (Phase 3 - Full-text index)
└── SEARCH-019-saved-queries.md              (Phase 3 - Saved queries)
```

### Future API Integrations
```
backlog/tasks/
├── API-001-atlas-of-living-australia.md    (✅ Implemented)
├── API-002-victorian-heritage-database.md  (✅ Implemented)
├── API-003-national-museum-australia.md    (✅ Implemented)
├── API-004-acmi.md                         (✅ Implemented)
├── API-005-pm-transcripts.md               (✅ Implemented)
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

## Execution Order for PREP Tasks

1. **Phase 1: File Creation** (no GitHub API calls)
   - PREP-001 → PREP-005
   - Commit and push all files

2. **Phase 2: GitHub CLI Operations** (with delays)
   - PREP-006: Labels (21 ops × 2s = ~42s)
   - PREP-007: Retro milestones (5 ops × 2s = ~10s)
   - PREP-008: Current milestones (2 ops × 2s = ~4s)
   - PREP-009-013: Retro issues (36 ops × 2s = ~72s)

3. **Phase 3: Manual Settings**
   - PREP-014: GitHub UI settings

**Total estimated time:** ~45 mins (file creation) + ~3 mins (CLI ops) + ~5 mins (UI) = ~53 mins
