# API-002: Victorian Heritage Database (VHD) Integration

**Priority:** High
**Phase:** 1 (Quick Win - No Auth Required)
**Status:** Not Started
**Estimated Tools:** 4

---

## Overview

Integrate the Victorian Heritage Database API to provide access to Victoria's heritage places, archaeological sites, and historic shipwrecks.

**API Base URL:** https://api.heritagecouncil.vic.gov.au
**Auth Required:** None (authentication-free RESTful API)
**License:** CC-BY 4.0
**Response Format:** HAL+JSON

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| Website | https://vhd.heritagecouncil.vic.gov.au |
| API Base | https://api.heritagecouncil.vic.gov.au |
| API Documentation | https://api.heritagecouncil.vic.gov.au/documentation/VHD-v1 |
| Victorian Heritage Council | https://heritagecouncil.vic.gov.au |

---

## Content Available

- **Victorian Heritage Register** - Legally protected heritage places
- **Heritage Inventory** - Archaeological sites and significant places
- **Historic Shipwrecks** - Shipwreck sites in Victorian waters

---

## Subtasks

### 1. Research & Documentation
- [ ] Read VHD API v1 documentation at https://api.heritagecouncil.vic.gov.au/documentation/VHD-v1
- [ ] **Investigate endpoint: `/places`** - Document search params, filters, pagination
- [ ] **Investigate endpoint: `/places/{id}`** - Document place detail structure, related entities
- [ ] **Investigate endpoint: `/places/{id}/images`** - Document image retrieval
- [ ] **Investigate endpoint: `/heritage-register`** - Document registered places filters
- [ ] **Investigate endpoint: `/heritage-inventory`** - Document archaeological site access
- [ ] **Investigate endpoint: `/shipwrecks`** - Document shipwreck search and filters
- [ ] **Investigate endpoint: `/shipwrecks/{id}`** - Document shipwreck detail structure
- [ ] Understand HAL+JSON response format and hypermedia links
- [ ] Document available filters and search parameters
- [ ] Note pagination patterns (_embedded, _links)
- [ ] Create `docs/quickrefs/vhd-api.md` reference document

### 2. Create Source Module Structure
- [ ] Create `src/sources/vhd/` directory
- [ ] Create `src/sources/vhd/types.ts` with VHD-specific types
- [ ] Create `src/sources/vhd/client.ts` extending BaseClient
- [ ] Handle HAL+JSON format in client
- [ ] Create `src/sources/vhd/index.ts` using defineSource()

### 3. Implement Core Tools
- [ ] **vhd_places_search** - Search heritage places by name, location, type
- [ ] **vhd_get_place** - Get detailed place information by ID
- [ ] **vhd_shipwrecks** - Search historic shipwreck records
- [ ] **vhd_harvest** - Bulk download heritage records with pagination

### 4. Testing
- [ ] Test each tool manually via MCP protocol
- [ ] Verify HAL+JSON parsing works correctly
- [ ] Test location-based searches
- [ ] Test pagination following _links.next
- [ ] Document example queries in quickref

### 5. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update `CLAUDE.md` with new tools table
- [ ] Update `README.md` with VHD section
- [ ] Build and verify with `npm run build`

---

## API Endpoints to Implement

| Endpoint | Tool | Description |
|----------|------|-------------|
| `/places` | vhd_places_search | Search heritage places |
| `/places/{id}` | vhd_get_place | Get place details |
| `/shipwrecks` | vhd_shipwrecks | Search shipwrecks |
| `/places` (paginated) | vhd_harvest | Bulk download |

---

## Example Queries

```
# Find heritage buildings in Melbourne
vhd_places_search: query="Melbourne", type="building"

# Search for shipwrecks
vhd_shipwrecks: query="gold rush"

# Get place details
vhd_get_place: id="12345"
```

---

## Notes

- HAL+JSON format requires special handling for _embedded and _links
- Complements PROV for Victorian historical research
- Consider adding archaeology/inventory search in future
- CC-BY 4.0 allows commercial use with attribution
