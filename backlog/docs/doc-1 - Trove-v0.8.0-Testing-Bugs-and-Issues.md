---
id: doc-1
title: Trove v0.8.0 Testing - Bugs and Issues
type: other
created_date: '2025-12-29 05:02'
---
# Trove v0.8.0 Testing - Bugs and Issues Report

**Testing Date:** 2025-12-29
**Version:** 0.8.0
**Tester:** Claude Code (MCP-only testing)

---

## Summary

| ID | Severity | Tool | Issue |
|----|----------|------|-------|
| BUG-TROVE-001 | Medium | trove_search | NUC filter returns 0 results for valid codes |
| BUG-TROVE-002 | Medium | trove_search | fullTextAvailable + hasThumbnail conflict |
| BUG-TROVE-003 | Medium | trove_search | partnerNuc facet not returned |
| BUG-TROVE-004 | High | trove_search | includeHoldings + includeLinks returns HTTP 400 |
| OBS-TROVE-001 | Low | trove_search | articleCategory filter may not work correctly |
| OBS-TROVE-002 | Low | trove_harvest | sortby dateasc shows inconsistent ordering |
| OBS-TROVE-003 | Low | trove_list_titles | Response too large, needs pagination |
| OBS-TROVE-004 | Low | trove_search | includeTags returns results but tags not visible |

---

## Bug Details

### BUG-TROVE-001: NUC Filter Returns 0 Results

**Severity:** Medium
**Tool:** trove_search
**Category:** Parameter handling

**Description:**
When using the `nuc` parameter to filter by National Union Catalogue code, searches return 0 results even for valid NUC codes like "NAA" (National Archives of Australia).

**Steps to Reproduce:**
1. Call trove_search with: `{query: "immigration", category: "book", nuc: "NAA", limit: 5}`
2. Observe totalResults = 0

**Expected Behaviour:**
Should return books from the National Archives of Australia collection related to "immigration".

**Actual Behaviour:**
Returns 0 results with empty records array.

**Suggested Fix:**
Verify NUC parameter is being passed correctly to Trove API. Check if NUC filtering requires a specific category or additional parameters. The Trove API may require the full NUC code format or different encoding.

---

### BUG-TROVE-002: fullTextAvailable + hasThumbnail Conflict

**Severity:** Medium
**Tool:** trove_search
**Category:** Parameter handling

**Description:**
Combining `fullTextAvailable: true` with `hasThumbnail: true` returns 0 results even for broad queries that individually return many results with either filter.

**Steps to Reproduce:**
1. Call trove_search with: `{query: "Sydney", category: "newspaper", fullTextAvailable: true, hasThumbnail: true, limit: 5}`
2. Observe totalResults = 0

**Expected Behaviour:**
Should return newspaper articles about Sydney that have both full text available AND a thumbnail image.

**Actual Behaviour:**
Returns 0 results. Each filter works individually but not combined.

**Suggested Fix:**
Check how multiple availability filters are combined in the API request. They may need AND vs OR logic, or the Trove API may not support combining these specific filters.

---

### BUG-TROVE-003: partnerNuc Facet Not Returned

**Severity:** Medium
**Tool:** trove_search
**Category:** Faceted search

**Description:**
When requesting `facetFields: ["partnerNuc"]`, the response includes state and decade facets but NOT the partnerNuc facet.

**Steps to Reproduce:**
1. Call trove_search with: `{query: "Melbourne", category: "image", includeFacets: true, facetFields: ["partnerNuc", "state", "decade"], limit: 3}`
2. Examine the facets in the response
3. Note that partnerNuc is missing

**Expected Behaviour:**
Response should include a partnerNuc facet showing which partner libraries/organisations contributed the matching records.

**Actual Behaviour:**
Response includes state and decade facets only. partnerNuc facet is absent.

**Suggested Fix:**
1. Verify the exact facet field name in Trove API v3 documentation (may be different spelling/casing)
2. Check if partnerNuc is only available for certain categories
3. May need to use `l-partnerNuc` or similar format

---

### BUG-TROVE-004: includeHoldings + includeLinks Returns HTTP 400

**Severity:** High
**Tool:** trove_search
**Category:** API error

**Description:**
When searching for books with both `includeHoldings: true` and `includeLinks: true`, the API returns an HTTP 400 Bad Request error.

**Steps to Reproduce:**
1. Call trove_search with: `{query: "Australian history", category: "book", includeHoldings: true, includeLinks: true, limit: 3}`
2. Observe HTTP 400 error

**Expected Behaviour:**
Should return book results with holdings information (which libraries have copies) and links (online access URLs).

**Actual Behaviour:**
Returns error: "Trove API error (400): Bad Request"

**Error Message:**
`Trove API error (400): Bad Request`

**Suggested Fix:**
1. Test each parameter individually to isolate which causes the error
2. Check Trove API v3 documentation for valid include parameter combinations
3. May need to use different parameter names or only one at a time

---

## Observations (Lower Priority)

### OBS-TROVE-001: articleCategory Filter May Not Work

**Severity:** Low
**Tool:** trove_search
**Category:** Filter behaviour

**Description:**
When filtering by `articleCategory: "Family Notices"`, results return with `category: "Article"` instead of "Family Notices".

**Notes:**
This may be expected behaviour if articleCategory is a sub-filter that doesn't change the returned category field. Needs clarification from Trove API docs.

---

### OBS-TROVE-002: sortby dateasc Inconsistent

**Severity:** Low
**Tool:** trove_harvest
**Category:** Sorting behaviour

**Description:**
When using `sortby: "dateasc"`, returned dates show 1902, 1900, 1900 - not strictly ascending order.

**Notes:**
May be expected if sorting is approximate or if records have the same date. Could also be cursor-based pagination affecting sort stability.

---

### OBS-TROVE-003: trove_list_titles Response Too Large

**Severity:** Low
**Tool:** trove_list_titles
**Category:** Performance

**Description:**
Calling `trove_list_titles` for Victorian newspapers returns 134,542 characters. No pagination or limit parameter available.

**Suggested Enhancement:**
Add `limit` and `offset` parameters to control response size.

---

### OBS-TROVE-004: includeTags Returns Results But Tags Not Visible

**Severity:** Low
**Tool:** trove_search
**Category:** Response format

**Description:**
When using `includeTags: true`, results are returned but the tags themselves are not visible in the response output.

**Notes:**
Tags may be present in raw API response but not included in the formatted MCP tool output. Needs verification of response mapping.

---

## Testing Coverage

**All 14 Trove tools tested:**
- ✅ trove_search (comprehensive parameter testing)
- ✅ trove_harvest (pagination and sorting)
- ✅ trove_newspaper_article (full text retrieval)
- ✅ trove_list_titles (Victorian newspapers)
- ✅ trove_title_details (year/issue breakdown)
- ✅ trove_get_contributor (NUC lookup)
- ✅ trove_list_contributors (library listing)
- ✅ trove_list_magazine_titles (magazine listing)
- ✅ trove_get_magazine_title (magazine details)
- ✅ trove_get_work (book details with holdings)
- ✅ trove_get_person (biographical data)
- ✅ trove_get_list (error handling for not found)
- ✅ trove_search_people (people search)
- ✅ trove_get_versions (work versions with holdings)

**New v0.8.0 Parameters Tested:**
- ✅ illustrationTypes (Photo, Cartoon)
- ✅ wordCount (<100 Words, 100-1000 Words, 1000+ Words)
- ✅ articleCategory (Article, Family Notices)
- ✅ includeTags / hasTags
- ✅ includeComments / hasComments
- ✅ rights (Free, Out of Copyright)
- ✅ fullTextAvailable
- ✅ hasThumbnail
- ✅ year / month with decade
- ✅ series
- ✅ journalTitle
- ✅ facetFields (including partnerNuc)
- ✅ includeHoldings / includeLinks
