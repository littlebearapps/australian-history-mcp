# SEARCH-008: Advanced Query Syntax - Source Builders

**Priority:** P1
**Phase:** 1 - Core Search Enhancements
**Status:** ✅ Complete
**Completed:** 2025-12-28
**Estimated Effort:** 1.5 days
**Actual Effort:** ~0.5 days
**Dependencies:** SEARCH-007 (Query Parser Core)

---

## Summary

Created query builders that transform parsed query data into source-specific query syntax for Trove (Lucene), PROV (Solr), and ALA (biocache). Implemented as a factory pattern with transparent integration into the source router.

---

## Implementation Notes

### Architecture
Used a **wrapping approach** rather than full query transformation:
- Preserves original user query intent
- Adds source-specific date/field syntax around the query
- Easier debugging - can see both original and transformed

### Files Created

| File | Lines | Description |
|------|-------|-------------|
| `src/core/query/builders/types.ts` | 30 | QueryBuilder interface, TransformedQuery |
| `src/core/query/builders/trove.ts` | 85 | Trove/Lucene builder |
| `src/core/query/builders/prov.ts` | 90 | PROV/Solr builder |
| `src/core/query/builders/ala.ts` | 85 | ALA/biocache builder |
| `src/core/query/builders/index.ts` | 35 | Factory and exports |

### Files Modified

| File | Change |
|------|--------|
| `src/core/query/index.ts` | Export builders |
| `src/core/source-router.ts` | Integrate builders via `mapArgsToSource()` |

---

## Field Mappings Implemented

### Trove Fields
| User Field | API Field |
|------------|-----------|
| creator | creator |
| author | creator |
| subject | subject |
| title | title |

### PROV Fields
| User Field | API Field |
|------------|-----------|
| series | is_part_of_series.identifier |
| agency | is_controlled_by_agency.identifier |
| category | category |
| form | form |

### ALA Fields
| User Field | API Field |
|------------|-----------|
| species | taxon_name |
| common | common_name |
| kingdom | kingdom |
| family | family |
| genus | genus |
| state | state |

---

## Integration

Updated `mapArgsToSource()` signature to accept optional ParsedQuery:
```typescript
export function mapArgsToSource(
  source: string,
  args: CommonSearchArgs,
  parsed?: ParsedQuery  // New parameter
): Record<string, unknown>
```

When `parseAdvancedSyntax=true` in federated search:
1. Query is parsed by SEARCH-007 parser
2. Parsed result passed to `mapArgsToSource()`
3. Builder transforms query for supported sources
4. Non-builder sources get standard mapping

---

## Query Transformations

### Trove (Lucene)
```
Input: "gold rush" creator:lawson 1920-1930
Output: "gold rush" creator:(lawson) date:[1920 TO 1930]
```

### PROV (Solr)
```
Input: railway series:3183 1900-1950
Output: railway AND is_part_of_series.identifier:(3183) AND start_dt:[1900-01-01T00:00:00Z TO *] AND end_dt:[* TO 1950-12-31T23:59:59Z]
```

### ALA (biocache)
```
Input: koala kingdom:Animalia state:vic
Output: koala AND kingdom:(Animalia) AND state:(Victoria) AND year:[* TO *]
```

---

## Acceptance Criteria

- [x] All three builders produce valid API queries
- [x] Field mappings work correctly
- [x] Date ranges formatted per API
- [x] Original query preserved in result
- [x] Invalid fields logged as warnings (not errors)
- [x] Integration transparent to existing callers
- [ ] Documentation includes examples (deferred to docs update)

---

## Commit Reference

```
d225c41 feat(search): add intelligent query parsing and federated search (SEARCH-007 to SEARCH-010)
```
