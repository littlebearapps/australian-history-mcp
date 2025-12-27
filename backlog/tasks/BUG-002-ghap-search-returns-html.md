# BUG-002: ghap_search returns HTML instead of JSON

**Priority:** High
**Severity:** Major
**Status:** Open
**Found In:** v0.7.0 (TEST-001)
**Component:** GHAP source

---

## Description

The `ghap_search` tool returns HTML error page instead of JSON when searching for placenames. The error message indicates the response starts with `<!DOCTYPE` instead of valid JSON.

## Steps to Reproduce

1. Call ghap_search with any query:
   ```
   ghap_search(query="Melbourne", limit=3)
   ```
   or
   ```
   ghap_search(query="creek", state="VIC", limit=3)
   ```

## Expected Behaviour

Returns GeoJSON FeatureCollection with matching placename results.

## Actual Behaviour

Returns error: `{"error":"Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"}`

## Notes

- `ghap_list_layers` works correctly (returns 653K chars of layer data)
- Only `ghap_search` appears affected
- Could indicate: endpoint changed, rate limiting, server error, or missing Accept header

## Investigation Areas

- [ ] Check TLCMap API status and documentation for changes
- [ ] Verify the search endpoint URL is still valid
- [ ] Test with curl to see actual HTML response content
- [ ] Check if Accept header is required
- [ ] Verify query parameter encoding
- [ ] Check if API requires authentication now

## Files to Investigate

- `src/sources/ghap/tools/search.ts`
- `src/sources/ghap/client.ts`

## Fix Requirements

1. Investigate TLCMap API current status
2. Update endpoint URL if changed
3. Add appropriate headers if required
4. Add error handling for HTML responses
5. Retest search functionality

## Related

- TEST-001 Issue #4
- GHAP API documentation: `docs/quickrefs/ghap-api.md`
- TLCMap API: https://tlcmap.org/
