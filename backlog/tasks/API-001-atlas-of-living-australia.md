# API-001: Atlas of Living Australia (ALA) Integration

**Priority:** High
**Phase:** 1 (Quick Win - No Auth Required)
**Status:** Not Started
**Estimated Tools:** 4

---

## Overview

Integrate the Atlas of Living Australia (ALA) API to provide access to Australia's largest biodiversity database. ALA aggregates data from museums, herbaria, community groups, and government agencies.

**API Base URL:** https://api.ala.org.au
**Auth Required:** None (open access)
**License:** Open, free for all uses
**Content:** 100M+ species occurrence records, 153,000+ species, taxonomic data

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| Website | https://ala.org.au |
| API Portal | https://api.ala.org.au |
| API Documentation | https://docs.ala.org.au |
| Species API Docs | https://api.ala.org.au/apps/species |
| Occurrences API Docs | https://api.ala.org.au/apps/occurrences |
| Biocache (Search) Docs | https://biocache.ala.org.au/ws |

---

## Subtasks

### 1. Research & Documentation
- [ ] Read ALA API documentation thoroughly at https://docs.ala.org.au
- [ ] **Investigate endpoint: `/species/search`** - Document query params, response format, pagination
- [ ] **Investigate endpoint: `/species/{guid}`** - Document GUID format, full species record structure
- [ ] **Investigate endpoint: `/species/autocomplete`** - Document autocomplete behaviour
- [ ] **Investigate endpoint: `/occurrences/search`** - Document spatial/temporal filters, facets
- [ ] **Investigate endpoint: `/occurrences/{uuid}`** - Document single occurrence retrieval
- [ ] **Investigate endpoint: `/occurrences/download`** - Document bulk download format options
- [ ] **Investigate endpoint: `/images/search`** - Document image search and retrieval
- [ ] Document rate limits and best practices
- [ ] Note response formats and pagination patterns
- [ ] Create `docs/quickrefs/ala-api.md` reference document

### 2. Create Source Module Structure
- [ ] Create `src/sources/ala/` directory
- [ ] Create `src/sources/ala/types.ts` with ALA-specific types
- [ ] Create `src/sources/ala/client.ts` extending BaseClient
- [ ] Create `src/sources/ala/index.ts` using defineSource()

### 3. Implement Core Tools
- [ ] **ala_species_search** - Search species by name, taxonomy, or characteristics
- [ ] **ala_occurrence_search** - Search occurrence records by location, date, species
- [ ] **ala_get_species** - Get detailed species information by ID
- [ ] **ala_harvest** - Bulk download occurrence/species records with pagination

### 4. Testing
- [ ] Test each tool manually via MCP protocol
- [ ] Verify response formatting matches MCP standards
- [ ] Test pagination in harvest tool
- [ ] Test error handling for invalid queries
- [ ] Document example queries in quickref

### 5. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update `CLAUDE.md` with new tools table
- [ ] Update `README.md` with ALA section
- [ ] Build and verify with `npm run build`

---

## API Endpoints to Implement

| Endpoint | Tool | Description |
|----------|------|-------------|
| `/species/search` | ala_species_search | Search species names |
| `/occurrences/search` | ala_occurrence_search | Search occurrence records |
| `/species/{guid}` | ala_get_species | Get species details |
| `/occurrences/search` (paginated) | ala_harvest | Bulk download |

---

## Example Queries

```
# Find platypus occurrences in Victoria
ala_occurrence_search: query="Ornithorhynchus anatinus", state="Victoria"

# Search for eucalyptus species
ala_species_search: query="Eucalyptus"

# Get species details
ala_get_species: guid="urn:lsid:biodiversity.org.au:afd.taxon:..."
```

---

## Notes

- ALA data complements Museums Victoria species data
- No API key required - works immediately
- Consider adding image search tool in future iteration
- Rate limits: Check docs, likely generous for open access
