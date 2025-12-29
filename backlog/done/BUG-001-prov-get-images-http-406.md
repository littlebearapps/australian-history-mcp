# BUG-001: prov_get_images returns HTTP 406 error

**Priority:** High
**Severity:** Major
**Status:** Open
**Found In:** v0.7.0 (TEST-001)
**Component:** PROV source

---

## Description

The `prov_get_images` tool returns HTTP 406 "Not Acceptable" error when attempting to fetch valid IIIF manifests from PROV's image server.

## Steps to Reproduce

1. Search for digitised PROV records:
   ```
   prov_search(query="railway", digitisedOnly=true)
   ```
2. Get manifest URL from a result with `iiif-manifest` field
3. Call prov_get_images with the manifest URL:
   ```
   prov_get_images(manifestUrl="https://images.prov.vic.gov.au/manifests/2D/4D/76/52/-BEE6-11ED-8BFF-3164724967CE/images/manifest.json", pages="1-2", size="full")
   ```

## Expected Behaviour

Returns array of image URLs extracted from the IIIF manifest.

## Actual Behaviour

Returns error: `{"error":"HTTP 406: Unknown Reason"}`

## Investigation Areas

- [ ] Check if Accept header is required (e.g., `Accept: application/json` or `Accept: application/ld+json`)
- [ ] Verify manifest URL encoding is correct
- [ ] Test manifest URL directly in browser/curl
- [ ] Check if PROV has updated their IIIF server requirements
- [ ] Review IIIF Presentation API version compatibility

## Files to Investigate

- `src/sources/prov/tools/images.ts`
- `src/sources/prov/client.ts`

## Fix Requirements

1. Identify root cause of 406 error
2. Implement fix (likely Accept header)
3. Add unit test for manifest fetching
4. Retest with multiple PROV manifests

## Related

- TEST-001 Issue #3
- PROV API documentation: `docs/quickrefs/prov-api.md`
