---
id: doc-2
title: Trove v0.8.0 Testing - Enhancement Opportunities
type: other
created_date: '2025-12-29 05:03'
---
# Trove v0.8.0 Testing - Enhancement Opportunities

**Testing Date:** 2025-12-29
**Version:** 0.8.0
**Tester:** Claude Code (MCP-only testing)

---

## Summary

| ID | Category | Enhancement | Effort | Priority |
|----|----------|-------------|--------|----------|
| ENH-TROVE-001 | API | Add pagination to trove_list_titles | Low | High |
| ENH-TROVE-002 | DX | Improve NUC filter documentation and validation | Low | Medium |
| ENH-TROVE-003 | API | Include tags/comments in response output | Medium | Medium |
| ENH-TROVE-004 | DX | Add parameter conflict validation | Medium | Medium |
| ENH-TROVE-005 | Docs | Document valid facet field names | Low | Medium |
| ENH-TROVE-006 | API | Add limit to trove_list_contributors | Low | Low |
| ENH-TROVE-007 | Docs | Add journalTitle filter usage examples | Low | Low |
| ENH-TROVE-008 | API | Add series browsing/listing tool | Medium | Low |
| ENH-TROVE-009 | Testing | Add automated integration tests | High | Medium |
| ENH-TROVE-010 | DX | Improve sortby consistency documentation | Low | Low |

---

## Enhancement Details

### ENH-TROVE-001: Add Pagination to trove_list_titles ⭐ HIGH VALUE

**Category:** API Coverage
**Effort:** Low
**Priority:** High

**Description:**
The `trove_list_titles` tool returns all matching titles in a single response, which can be extremely large (134,542 characters for Victorian newspapers alone).

**Rationale:**
- Large responses consume excessive tokens
- No way to browse titles incrementally
- Performance impact on slow connections
- Difficult to work with in LLM context

**Suggested Implementation:**
Add `limit` and `offset` parameters to control response size:
```typescript
interface TroveListTitlesParams {
  state?: string;
  category?: string;
  limit?: number;   // Default 100, max 1000
  offset?: number;  // Default 0
}
```

---

### ENH-TROVE-002: Improve NUC Filter Documentation and Validation

**Category:** Developer Experience
**Effort:** Low
**Priority:** Medium

**Description:**
The `nuc` parameter for filtering by contributor library currently returns 0 results for valid NUC codes like "NAA". Users need better guidance on:
- Which NUC codes work with which categories
- The correct format for NUC codes
- Which Trove zones/categories support NUC filtering

**Rationale:**
- Users cannot effectively filter by contributor without trial and error
- The existing docs/quickrefs/trove-partners.md lists codes but doesn't explain usage constraints

**Suggested Implementation:**
1. Add validation to check if NUC is supported for the requested category
2. Provide helpful error message if NUC filtering isn't available
3. Document known working NUC + category combinations
4. Consider adding a `trove_list_nucs` tool to discover valid codes

---

### ENH-TROVE-003: Include Tags/Comments in Response Output

**Category:** API Coverage
**Effort:** Medium
**Priority:** Medium

**Description:**
When `includeTags: true` or `includeComments: true` is set, the API returns results but the tags/comments are not visible in the formatted response output.

**Rationale:**
- User-contributed tags are valuable for research
- Text corrections in comments improve OCR accuracy
- Currently these parameters work but provide no visible benefit

**Suggested Implementation:**
1. Add `tags` and `comments` fields to TroveRecord type
2. Map API response tags/comments to output fields
3. Include in formatted response when requested

---

### ENH-TROVE-004: Add Parameter Conflict Validation

**Category:** Developer Experience
**Effort:** Medium
**Priority:** Medium

**Description:**
Certain parameter combinations cause API errors or unexpected results:
- `includeHoldings: true` + `includeLinks: true` → HTTP 400
- `fullTextAvailable: true` + `hasThumbnail: true` → 0 results

**Rationale:**
- Users waste time debugging parameter conflicts
- Better to fail fast with a helpful message
- Reduces API calls that are destined to fail

**Suggested Implementation:**
1. Add validation logic for known incompatible combinations
2. Return descriptive error before making API call
3. Document known limitations in schema descriptions

---

### ENH-TROVE-005: Document Valid Facet Field Names

**Category:** Documentation
**Effort:** Low
**Priority:** Medium

**Description:**
The `facetFields` parameter accepts an array but documentation doesn't clearly list all valid facet names. The `partnerNuc` facet was not returned when requested.

**Rationale:**
- Users don't know which facets are available
- Invalid facet names silently ignored
- partnerNuc may have different spelling/format

**Suggested Implementation:**
1. Research and document all valid Trove facet field names
2. Add enum/autocomplete for facetFields parameter
3. Validate facet names before API call
4. Add warning if requested facet not returned

---

### ENH-TROVE-006: Add Limit to trove_list_contributors

**Category:** API Coverage
**Effort:** Low
**Priority:** Low

**Description:**
`trove_list_contributors` returns all 1500+ contributors. Adding a limit parameter would improve response times and token usage.

**Rationale:**
- Full list rarely needed in a single call
- Consistent with other list tools

**Suggested Implementation:**
```typescript
interface TroveListContributorsParams {
  query?: string;
  limit?: number;   // Default 100
  offset?: number;  // Default 0
}
```

---

### ENH-TROVE-007: Add journalTitle Filter Usage Examples

**Category:** Documentation
**Effort:** Low
**Priority:** Low

**Description:**
The `journalTitle` filter for magazines/journals works but returned low results in testing. Documentation should include:
- Example journal titles that work
- How to discover valid journal titles
- Relationship between journalTitle and magazine category

**Rationale:**
- Users may assume filter is broken when it's just difficult to use
- Cross-reference with trove_list_magazine_titles

**Suggested Implementation:**
1. Add examples to schema description
2. Add use case to CLAUDE.md Common Use Cases
3. Document workflow: list_magazine_titles → get title → search with journalTitle

---

### ENH-TROVE-008: Add Series Browsing/Listing Tool

**Category:** API Coverage
**Effort:** Medium
**Priority:** Low

**Description:**
The `series` filter parameter exists but there's no way to discover available series. A `trove_list_series` tool would complement the filter.

**Rationale:**
- Series are important for archival research
- No current way to discover series identifiers
- Would match pattern of other list tools

**Suggested Implementation:**
Add `trove_list_series` tool with category and query parameters.

---

### ENH-TROVE-009: Add Automated Integration Tests

**Category:** Testing
**Effort:** High
**Priority:** Medium

**Description:**
Currently no automated tests for Trove tools. Integration tests would catch regressions and verify new parameters work correctly.

**Rationale:**
- Manual testing is time-consuming
- API changes could break tools without detection
- New parameters need verification

**Suggested Implementation:**
1. Create test suite with mocked and live API tests
2. Test each tool with minimal valid inputs
3. Test new v0.8.0 parameters specifically
4. Add to CI pipeline

---

### ENH-TROVE-010: Improve sortby Consistency Documentation

**Category:** Documentation
**Effort:** Low
**Priority:** Low

**Description:**
The `sortby: "dateasc"` option showed inconsistent ordering in harvest results (dates: 1902, 1900, 1900). Documentation should clarify:
- How sorting interacts with pagination
- Whether sorting is strict or approximate
- Sort stability across cursor-based pagination

**Rationale:**
- Users expect strict ordering when requesting sorted results
- Cursor pagination may affect sort stability

**Suggested Implementation:**
Add note to trove_harvest schema about sorting limitations with pagination.

---

## High-Value Quick Wins ⭐

These enhancements offer the best effort-to-value ratio:

1. **ENH-TROVE-001**: Add pagination to trove_list_titles (Low effort, High impact)
2. **ENH-TROVE-005**: Document valid facet field names (Low effort, Medium impact)
3. **ENH-TROVE-002**: Improve NUC filter documentation (Low effort, Medium impact)
4. **ENH-TROVE-007**: Add journalTitle usage examples (Low effort, Low-Medium impact)

---

## Feature Parity Gaps

Potential Trove API features not yet implemented:
1. Magazine issue browsing (list issues for a title)
2. Work version comparison
3. Contributor statistics/metrics
4. OCR correction submission
5. User list management (if authenticated)
6. Bulk work lookups (multiple IDs in one call)
