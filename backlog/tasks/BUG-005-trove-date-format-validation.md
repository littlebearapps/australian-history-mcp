# BUG-005: trove_search accepts invalid date formats

**Priority:** Low
**Severity:** Minor
**Status:** Open
**Found In:** v0.7.0 (TEST-001)
**Component:** Trove source

---

## Description

The `trove_search` tool accepts invalid date formats for `dateFrom` and `dateTo` parameters without validation. Invalid dates are passed through to the Trove API literally, which interprets them as search terms.

## Steps to Reproduce

1. Call trove_search with invalid date formats:
   ```
   trove_search(query="Melbourne", dateFrom="not-a-date", dateTo="invalid")
   ```

## Expected Behaviour

Returns error: "Invalid date format. Use YYYY or YYYY-MM-DD"

## Actual Behaviour

Returns 34M+ results. The dates are passed to Trove's search as `date:[not-a-date TO invalid]` which matches articles containing the word "invalid" in the headline.

## Impact

- Confusing search results
- User may not realise dates weren't applied correctly
- Subtle data quality issues in research

## Investigation Areas

- [ ] Review Trove API expected date formats
- [ ] Determine validation regex for valid dates

## Files to Investigate

- `src/sources/trove/tools/search.ts`
- `src/sources/trove/client.ts`

## Fix Requirements

1. Add date format validation for dateFrom/dateTo parameters
2. Accept formats: YYYY, YYYY-MM, YYYY-MM-DD
3. Return clear error for invalid formats
4. Add unit tests for date validation
5. Retest with valid and invalid date formats

## Valid Date Formats

```
YYYY        (e.g., 1920)
YYYY-MM     (e.g., 1920-03)
YYYY-MM-DD  (e.g., 1920-03-15)
```

## Validation Regex

```typescript
const dateRegex = /^\d{4}(-\d{2}(-\d{2})?)?$/;
```

## Related

- TEST-001 Issue #6
- Trove API documentation: `docs/quickrefs/trove-api.md`
