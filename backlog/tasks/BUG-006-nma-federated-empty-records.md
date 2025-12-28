# BUG-006: NMA federated search returns count but empty records array

**Priority:** Medium
**Severity:** Minor
**Status:** Open
**Found In:** v0.7.0 (TEST-001)
**Component:** Federated search / NMA source router

---

## Description

When using the federated `search()` meta-tool, the NMA source returns a correct `count` value but an empty `records` array. Other sources (PROV, Trove, Museums Victoria) return records correctly.

## Steps to Reproduce

1. Call federated search:
   ```
   search(query="Melbourne 1920s", limit=3)
   ```

2. Or explicitly include NMA:
   ```
   search(query="boomerang", sources=["nma"], limit=5)
   ```

## Expected Behaviour

NMA returns both count and matching records:
```json
{
  "source": "nma",
  "count": 3,
  "records": [{ ... }, { ... }, { ... }]
}
```

## Actual Behaviour

NMA returns count but empty records:
```json
{
  "source": "nma",
  "count": 3,
  "records": []
}
```

## Notes

- Direct `nma_search_objects` tool works correctly
- Issue is specific to the federated search source router
- Consistent across multiple queries

## Investigation Areas

- [ ] Check NMA source router mapping in federated search
- [ ] Compare response parsing between direct tool and router
- [ ] Verify record field mapping from NMA API response
- [ ] Check if there's a data extraction step that's failing

## Files to Investigate

- `src/core/source-router.ts` (or federated search implementation)
- `src/core/meta-tools/search.ts`
- `src/sources/nma/tools/search-objects.ts`

## Fix Requirements

1. Identify where NMA records are being lost in the router
2. Fix record mapping/extraction for NMA source
3. Ensure consistent response format across all sources
4. Add integration test for NMA in federated search
5. Retest federated search with NMA included

## Related

- TEST-001 Issue #2
- NMA API documentation: `docs/quickrefs/nma-api.md`
