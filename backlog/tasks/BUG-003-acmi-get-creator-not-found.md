# BUG-003: acmi_get_creator returns "Creator not found" for valid IDs

**Priority:** High
**Severity:** Major
**Status:** Open
**Found In:** v0.7.0 (TEST-001)
**Component:** ACMI source

---

## Description

The `acmi_get_creator` tool returns "Creator not found" error for creator IDs that were obtained from `acmi_list_creators` and `acmi_get_work.primaryCreators`.

## Steps to Reproduce

1. List creators:
   ```
   acmi_list_creators()
   ```
   Returns creators with IDs like 89074

2. Or get a work with creators:
   ```
   acmi_get_work(id=123456)
   ```
   Returns primaryCreators with IDs like 66844

3. Try to get creator details:
   ```
   acmi_get_creator(id=89074)
   ```

## Expected Behaviour

Returns creator details (name, filmography, biographical info).

## Actual Behaviour

Returns error: `{"error":"Creator not found: 89074"}`

Both ID sources fail:
- ID 89074 from acmi_list_creators - fails
- ID 66844 from acmi_get_work primaryCreators - fails

## Investigation Areas

- [ ] Check if ACMI API endpoint for creators has changed
- [ ] Verify the ID format expected by the API (string vs number, different field?)
- [ ] Check if creators require a different endpoint path
- [ ] Test API directly with curl to see actual response
- [ ] Compare with ACMI public API documentation
- [ ] Check if creator IDs are actually slugs or different identifiers

## Files to Investigate

- `src/sources/acmi/tools/get-creator.ts`
- `src/sources/acmi/tools/list-creators.ts`
- `src/sources/acmi/client.ts`

## Fix Requirements

1. Investigate ACMI API current creator endpoint structure
2. Identify correct ID format or endpoint path
3. Update get-creator tool to use correct approach
4. Ensure list-creators returns IDs in usable format
5. Add integration test for creator lookup
6. Retest creator retrieval

## Related

- TEST-001 Issue #5
- ACMI API documentation: `docs/quickrefs/acmi-api.md`
- ACMI public API: https://api.acmi.net.au/
