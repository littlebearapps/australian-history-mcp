# API-003: National Museum of Australia (NMA) Integration

**Priority:** High
**Phase:** 1 (Quick Win - No Auth Required)
**Status:** Not Started
**Estimated Tools:** 4

---

## Overview

Integrate the National Museum of Australia API to provide access to Australia's national cultural heritage collection.

**Auth Required:** None
**License:** Public Domain / CC
**Content:** ~85,000 object records, 20,000+ images

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| Website | https://www.nma.gov.au |
| Collection Search | https://www.nma.gov.au/explore/collection |
| API Information | https://www.nma.gov.au/about/our-collection/museum-api |
| Open Data | https://www.nma.gov.au/about/our-collection/open-data |

---

## Content Available

- Museum objects (artefacts, artworks, historical items)
- First Peoples collections
- Australian history collections
- Natural history specimens
- Images (Public Domain and CC licensed)

---

## Subtasks

### 1. Research & Documentation
- [ ] Access NMA API information page at https://www.nma.gov.au/about/our-collection/museum-api
- [ ] **Investigate endpoint: `/objects`** - Document search params, filters, response format
- [ ] **Investigate endpoint: `/objects/{id}`** - Document object detail structure
- [ ] **Investigate endpoint: `/objects/{id}/media`** - Document media/image retrieval
- [ ] **Investigate endpoint: `/collections`** - Document collection browsing
- [ ] **Investigate endpoint: `/search`** - Document full-text search capabilities
- [ ] **Investigate data exports** - Check if bulk downloads available
- [ ] Document authentication method (if any)
- [ ] Identify search parameters and filters
- [ ] Note response format and pagination
- [ ] Create `docs/quickrefs/nma-api.md` reference document

### 2. Create Source Module Structure
- [ ] Create `src/sources/nma/` directory
- [ ] Create `src/sources/nma/types.ts` with NMA-specific types
- [ ] Create `src/sources/nma/client.ts` extending BaseClient
- [ ] Create `src/sources/nma/index.ts` using defineSource()

### 3. Implement Core Tools
- [ ] **nma_search** - Search museum collection by keyword, type, collection
- [ ] **nma_get_object** - Get detailed object information by ID
- [ ] **nma_images** - Search for images in the collection
- [ ] **nma_harvest** - Bulk download collection records

### 4. Testing
- [ ] Test each tool manually via MCP protocol
- [ ] Verify response formatting matches MCP standards
- [ ] Test collection-specific searches
- [ ] Test pagination in harvest tool
- [ ] Document example queries in quickref

### 5. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update `CLAUDE.md` with new tools table
- [ ] Update `README.md` with NMA section
- [ ] Build and verify with `npm run build`

---

## API Endpoints to Implement

| Endpoint | Tool | Description |
|----------|------|-------------|
| `/objects` or `/search` | nma_search | Search collection |
| `/objects/{id}` | nma_get_object | Get object details |
| `/images` | nma_images | Search images |
| `/objects` (paginated) | nma_harvest | Bulk download |

---

## Example Queries

```
# Search for First Peoples artefacts
nma_search: query="First Peoples", type="artefact"

# Find convict-era objects
nma_search: query="convict"

# Get object details
nma_get_object: id="12345"
```

---

## Notes

- National-level collection complements state museums
- Many images are Public Domain - great for research
- API documentation may need investigation
- Consider adding collection/exhibition browse in future
