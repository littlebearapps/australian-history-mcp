# API-008: Victorian Collections Integration

**Priority:** Medium
**Phase:** 3 (Needs Investigation)
**Status:** Not Started
**Estimated Tools:** 3-4

---

## Overview

Investigate and potentially integrate Victorian Collections API to access aggregated data from 600+ Victorian museums, galleries, and historical societies.

**URL:** https://victoriancollections.net.au
**Auth Required:** Unknown - needs investigation
**Content:** 250,000+ items from 600+ organisations

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| Website | https://victoriancollections.net.au |
| Search Interface | https://victoriancollections.net.au/search |
| About | https://victoriancollections.net.au/about |
| For Organisations | https://victoriancollections.net.au/organisations |
| Creative Victoria | https://creative.vic.gov.au |

---

## Content Available

- Local museum collections
- Historical society archives
- Small gallery collections
- Community heritage items
- Regional Victorian history

---

## Subtasks

### 1. Research & Investigation
- [ ] Explore Victorian Collections website at https://victoriancollections.net.au
- [ ] **Investigate: Search API** - Check network requests for underlying API
- [ ] **Investigate: Item detail endpoint** - Document item retrieval
- [ ] **Investigate: Organisation listing** - Check organisation data access
- [ ] **Investigate: Image API** - Check image access and licensing
- [ ] **Investigate: Export functionality** - Check for bulk download options
- [ ] Check for developer documentation
- [ ] Identify if API is public or restricted
- [ ] Look for bulk data exports
- [ ] Check Museums Victoria for overlap
- [ ] Document findings and feasibility
- [ ] Create `docs/quickrefs/victorian-collections-api.md` reference document

### 2. Evaluate Access Options
- [ ] Public API (if exists)
- [ ] Partnership/registration required?
- [ ] Data exports available?
- [ ] Make go/no-go decision

### 3. Create Source Module (if viable)
- [ ] Create `src/sources/victorian-collections/` directory
- [ ] Create types, client, and index files
- [ ] Handle auth if required

### 4. Implement Core Tools (if viable)
- [ ] **vc_search** - Search all Victorian Collections
- [ ] **vc_organisations** - Browse contributing organisations
- [ ] **vc_get_item** - Get item details
- [ ] **vc_harvest** - Bulk download records

### 5. Testing
- [ ] Test each tool manually
- [ ] Test organisation-specific searches
- [ ] Verify data quality

### 6. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update documentation
- [ ] Build and verify

---

## Investigation Questions

1. Does Victorian Collections have a public API?
2. Is registration required for API access?
3. What data is available vs what's on the website?
4. How does this relate to Museums Victoria?
5. Are there usage restrictions?

---

## Example Queries (Tentative)

```
# Search regional collections
vc_search: query="gold rush", region="Ballarat"

# Find items from a specific organisation
vc_search: organisation="Ballarat Historical Society"

# Browse organisations
vc_organisations: region="Gippsland"
```

---

## Notes

- Aggregates many small collections not available elsewhere
- May provide access to unique regional content
- Relationship with Museums Victoria unclear
- API access needs investigation
