# API-004: ACMI (Australian Centre for the Moving Image) Integration

**Priority:** High
**Phase:** 2 (Straightforward)
**Status:** Not Started
**Estimated Tools:** 4

---

## Overview

Integrate the ACMI API to provide access to Australia's national museum of screen culture - films, television, video games, and digital art.

**API Base URL:** https://api.acmi.net.au
**Auth Required:** None
**License:** Open
**Content:** ~45,000 Works

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| Website | https://www.acmi.net.au |
| API Base | https://api.acmi.net.au |
| GitHub Repository | https://github.com/ACMILabs/acmi-api |
| Data Dumps | https://github.com/ACMILabs/acmi-api/releases |
| ACMI Labs | https://labs.acmi.net.au |

---

## Content Available

- Films (Australian and international cinema)
- Television programs
- Video games
- Digital art and interactive works
- Creators (directors, actors, artists)

---

## Subtasks

### 1. Research & Documentation
- [ ] Review ACMI API documentation at https://api.acmi.net.au
- [ ] Explore GitHub repository at https://github.com/ACMILabs/acmi-api
- [ ] **Investigate endpoint: `/works`** - Document search params, filters, pagination
- [ ] **Investigate endpoint: `/works/{id}`** - Document work detail structure, related works
- [ ] **Investigate endpoint: `/works/{id}/videos`** - Document video/media access
- [ ] **Investigate endpoint: `/creators`** - Document creator search params
- [ ] **Investigate endpoint: `/creators/{id}`** - Document creator detail structure
- [ ] **Investigate endpoint: `/creators/{id}/works`** - Document works by creator
- [ ] **Investigate data dumps** - Check GitHub releases for bulk JSON exports
- [ ] Identify search parameters and filters
- [ ] Note pagination and response formats
- [ ] Create `docs/quickrefs/acmi-api.md` reference document

### 2. Create Source Module Structure
- [ ] Create `src/sources/acmi/` directory
- [ ] Create `src/sources/acmi/types.ts` with ACMI-specific types
- [ ] Create `src/sources/acmi/client.ts` extending BaseClient
- [ ] Create `src/sources/acmi/index.ts` using defineSource()

### 3. Implement Core Tools
- [ ] **acmi_search** - Search works by title, creator, type, year
- [ ] **acmi_get_work** - Get detailed work information by ID
- [ ] **acmi_creators** - Search for creators (directors, actors, etc.)
- [ ] **acmi_harvest** - Bulk download works with pagination

### 4. Testing
- [ ] Test each tool manually via MCP protocol
- [ ] Verify response formatting matches MCP standards
- [ ] Test type-specific searches (film, tv, game)
- [ ] Test pagination in harvest tool
- [ ] Document example queries in quickref

### 5. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update `CLAUDE.md` with new tools table
- [ ] Update `README.md` with ACMI section
- [ ] Build and verify with `npm run build`

---

## API Endpoints to Implement

| Endpoint | Tool | Description |
|----------|------|-------------|
| `/works` | acmi_search | Search works |
| `/works/{id}` | acmi_get_work | Get work details |
| `/creators` | acmi_creators | Search creators |
| `/works` (paginated) | acmi_harvest | Bulk download |

---

## Example Queries

```
# Find Australian films from the 1970s
acmi_search: query="Australian", type="film", yearFrom="1970", yearTo="1979"

# Search for video games
acmi_search: type="videogame"

# Find works by a director
acmi_creators: query="Peter Weir"
```

---

## Notes

- GitHub repo has full data dumps for offline analysis
- Unique screen culture collection not available elsewhere
- Good documentation on GitHub
- Consider adding exhibition/event data in future
