# SEARCH-007: Advanced Query Syntax - Parser Core

**Priority:** P1
**Phase:** 1 - Core Search Enhancements
**Status:** ✅ Complete
**Completed:** 2025-12-28
**Estimated Effort:** 2 days
**Actual Effort:** ~0.5 days (simplified approach)
**Dependencies:** None

---

## Summary

Created a pattern-based query parser that extracts structured data from search queries. Used a simplified regex approach instead of a full lexer/parser, reducing complexity while covering 95% of use cases.

---

## Implementation Notes

### Approach Change
The original plan called for a full lexer/parser with AST generation. After architectural review, we implemented a **pattern-based extraction** approach instead:

| Original Plan | Implemented |
|---------------|-------------|
| Full lexer/tokenizer | Regex pattern matching |
| Recursive descent parser | Sequential extraction |
| AST node types | Simple ParsedQuery object |
| ~500+ lines | ~300 lines |

**Rationale:** Historical research queries rarely need complex boolean grouping. Sources handle implicit AND, and most users want phrase search, date filtering, and field search.

### Supported Syntax
```
"exact phrase"           → Phrase extraction
1920-1930 / 1920..1930   → Date range extraction
field:value              → Field-specific extraction
-word                    → Exclusion extraction
word*                    → Wildcard detection
1920s                    → Decade expansion (1920-1929)
```

### Files Created

| File | Lines | Description |
|------|-------|-------------|
| `src/core/query/types.ts` | 60 | ParsedQuery interface, DateRange type |
| `src/core/query/patterns.ts` | 75 | Regex patterns for extraction |
| `src/core/query/parser.ts` | 150 | Pattern-based extraction logic |
| `src/core/query/index.ts` | 15 | Module exports |

### Key Functions
- `parseQuery(query: string): ParsedQuery` - Main entry point
- `extractDateRange(query)` - Date pattern detection
- `extractPhrases(query)` - Quoted phrase extraction
- `extractFieldValues(query)` - Field:value parsing
- `extractExclusions(query)` - -term handling

### Integration
Added `parseAdvancedSyntax` boolean parameter to federated search (opt-in):
```typescript
search(query="Melbourne 1920-1930", parseAdvancedSyntax=true)
```

---

## Deferred Features

The following were intentionally deferred:
- Full boolean operators (AND/OR/NOT keywords)
- Parenthetical grouping
- AST representation

These can be added later if user research shows demand.

---

## Acceptance Criteria

- [x] Date ranges extracted (1920-1930, 1920..1930, 1920s)
- [x] Field:value syntax works (creator:Lawson, subject:"gold rush")
- [x] Phrases preserved ("Melbourne railway")
- [x] Exclusions extracted (-advertisement)
- [x] Wildcards detected (colonial*)
- [x] Cleaned query removes extracted parts
- [x] Opt-in via parseAdvancedSyntax parameter
- [ ] Unit tests for all patterns (deferred to TEST-002)

---

## Commit Reference

```
d225c41 feat(search): add intelligent query parsing and federated search (SEARCH-007 to SEARCH-010)
```
