# API-011: HuNI Integration

**Priority:** Medium
**Phase:** 3 (Needs Investigation)
**Status:** Not Started
**Estimated Tools:** 3-4

---

## Overview

Investigate and potentially integrate the Humanities Networked Infrastructure (HuNI) API to provide access to aggregated data from 32 Australian cultural datasets.

**URL:** https://huni.net.au / https://harvest.huni.net.au
**Auth Required:** OpenAPI available (needs investigation)
**Content:** 17.75M records aggregated from 32 Australian cultural websites

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| HuNI Website | https://huni.net.au |
| HuNI Search | https://huni.net.au/search |
| Harvest API | https://harvest.huni.net.au |
| API Documentation | https://huni.net.au/api/ (check if exists) |
| About HuNI | https://huni.net.au/about/ |
| Deakin University | https://www.deakin.edu.au (host institution) |

---

## Content Available (Aggregated From)

- Dictionary of Australian Biography
- AusStage
- Design & Art Australia Online
- Australian National Botanic Gardens
- National Portrait Gallery
- And 27+ other sources

---

## Subtasks

### 1. Research & Investigation
- [ ] Explore HuNI website at https://huni.net.au
- [ ] Explore harvest API at https://harvest.huni.net.au
- [ ] **Investigate: Search API** - Document search endpoint parameters
- [ ] **Investigate: Record detail endpoint** - Document record retrieval
- [ ] **Investigate: Source filtering** - Check filtering by data source
- [ ] **Investigate: Linked data** - Check relationship traversal
- [ ] **Investigate: OpenAPI spec** - Check for Swagger/OpenAPI documentation
- [ ] **Investigate: Rate limits** - Document API constraints
- [ ] Check if OpenAPI spec is available
- [ ] Identify data sources aggregated
- [ ] Check overlap with existing sources
- [ ] Document findings and feasibility
- [ ] Create `docs/quickrefs/huni-api.md` reference document

### 2. Evaluate Access Options
- [ ] Public API availability
- [ ] OpenAPI/Swagger documentation
- [ ] Rate limits and usage terms
- [ ] Make go/no-go decision

### 3. Assess Value vs Overlap
- [ ] Compare with existing sources
- [ ] Identify unique data only in HuNI
- [ ] Determine if aggregation adds value

### 4. Create Source Module (if viable)
- [ ] Create `src/sources/huni/` directory
- [ ] Create types, client, and index files
- [ ] Handle linked data formats

### 5. Implement Core Tools (if viable)
- [ ] **huni_search** - Search across all aggregated sources
- [ ] **huni_sources** - List available data sources
- [ ] **huni_get_record** - Get detailed record
- [ ] **huni_harvest** - Bulk download records

### 6. Testing
- [ ] Test each tool manually
- [ ] Test source-specific filtering
- [ ] Test linked data navigation
- [ ] Verify data quality

### 7. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update documentation
- [ ] Build and verify

---

## Investigation Questions

1. Is HuNI API publicly accessible?
2. What are the rate limits?
3. How much overlap is there with existing sources?
4. Does HuNI add linked data relationships?
5. Is the project still actively maintained?

---

## Example Queries (Tentative)

```
# Search across all sources
huni_search: query="Fred Williams"

# Filter by data source
huni_search: source="Dictionary of Australian Biography"

# Get linked records
huni_get_record: id="12345"
```

---

## Notes

- Meta-aggregator of 32 cultural sources
- May have significant overlap with other sources
- Value is in linked data relationships
- Check if project is still active/maintained
- 17.75M records is substantial
