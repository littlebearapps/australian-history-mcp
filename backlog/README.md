# Australian History MCP - Backlog

This backlog tracks implementation tasks for the australian-history-mcp server.

**Last Updated:** 2025-12-29
**Task Management:** backlog.md MCP tools

---

## Task Management

Tasks are now managed via **backlog.md** MCP tools:

```bash
# List all tasks
mcp__backlog__task_list

# View a specific task
mcp__backlog__task_view --id task-1

# Create a new task
mcp__backlog__task_create --title "New feature" --description "..." --priority high

# Edit a task
mcp__backlog__task_edit --id task-1 --status "Done"

# Search tasks
mcp__backlog__task_search --query "trove"
```

### Task Statistics

| Status | Count |
|--------|-------|
| Done | 29 |
| To Do | 3 |
| **Total** | **32** |

### Labels

- `blocked` - Task blocked by external dependency
- `needs-investigation` - Requires research before implementation
- `wont-fix` - Will not be implemented
- `duplicate` - Duplicate of another task
- `api-integration` - New API source integration
- `search` - Search enhancement feature
- `infrastructure` - Infrastructure/tooling task
- `testing` - Testing task
- `phase-1` - Phase 1 implementation
- `phase-2` - Phase 2 implementation

---

## Currently Implemented (v0.8.0)

| Source | Tools | Auth | Status |
|--------|-------|------|--------|
| PROV (Public Record Office Victoria) | 6 | None | Complete |
| Trove (National Library) | 14 | API Key | Complete |
| GHAP (TLCMap) | 5 | None | Complete |
| Museums Victoria | 6 | None | Complete |
| Atlas of Living Australia (ALA) | 8 | None | Complete |
| National Museum of Australia (NMA) | 10 | None | Complete |
| Victorian Heritage Database (VHD) | 9 | None | Complete |
| ACMI | 7 | None | Complete |
| PM Transcripts | 5 | None | Complete |
| IIIF (Generic) | 2 | None | Complete |
| Geoscience Australia HAP | 3 | None | Complete |

**Total: 75 tools across 11 sources**

### Additional Features (v0.6.0-v0.8.0)
- Dynamic tool loading (10 meta-tools vs 75 legacy)
- Federated search with smart source routing
- Spatial queries (point+radius, bbox)
- PM Transcripts FTS5 full-text search
- Saved queries with persistence
- Advanced query parsing (dates, phrases, exclusions)
- Faceted search across all sources

---

## Outstanding Work

### High Priority (To Do)

1. **task-30**: SEARCH-020 - Fix testing issues (7 missing tools in registry, sorting investigations)

### Medium Priority (To Do)

2. **task-11**: API-006 - Western Australian Museum integration (4 tools)
3. **task-12**: API-007 - Australian War Memorial integration (4-5 tools)

Use `mcp__backlog__task_list --status "To Do"` to see all pending tasks.

---

## Archive

Original task files (PREP-*, API-*, SEARCH-*, TEST-*) are preserved in:

```
backlog/archive/legacy/
```

These files contain detailed implementation notes and are kept for historical reference.

---

## Key Resources

- **GLAM Workbench:** https://glam-workbench.net/glam-data-list/
- **Victorian API Catalogue:** https://www.developer.vic.gov.au/api-catalogue
- **api.gov.au:** https://api.gov.au
