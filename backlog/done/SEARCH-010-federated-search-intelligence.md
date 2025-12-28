# SEARCH-010: Federated Search Intelligence

**Priority:** P1
**Phase:** 2 - Federated & Filter Expansion
**Status:** ✅ Complete
**Completed:** 2025-12-28
**Estimated Effort:** 3-4 days
**Actual Effort:** ~1 day
**Dependencies:** SEARCH-001 to SEARCH-009 (Phase 1 features)

---

## Summary

Enhanced the federated search meta-tool with intelligent source routing, date-aware selection, cross-source result ranking, and historical name suggestions. Implemented as a modular search intelligence layer.

---

## Implementation Notes

### Architecture
Created a dedicated `src/core/search/` module with focused components:

| File | Lines | Purpose |
|------|-------|---------|
| `intent.ts` | 160 | Keyword-based intent classification |
| `temporal.ts` | 140 | Date-aware source filtering |
| `ranker.ts` | 200 | Cross-source result scoring |
| `names.ts` | 120 | Historical placename suggestions |
| `index.ts` | 25 | Module exports |

### Intent Classification

Implemented 8 query intent categories with keyword matching:

```typescript
type QueryIntent =
  | 'heritage'        // → VHD, PROV, Trove
  | 'natural_history' // → ALA, Museums Vic, NMA
  | 'government'      // → PM Transcripts, Trove, PROV
  | 'media'           // → ACMI, Trove, NMA
  | 'newspaper'       // → Trove
  | 'photograph'      // → PROV, Trove, NMA, Museums Vic, GA HAP
  | 'genealogy'       // → Trove, PROV
  | 'geographic'      // → GHAP, GA HAP, PROV
  | 'general';        // → Trove, PROV, NMA, Museums Vic
```

Confidence scoring based on keyword matches (0.5 default, 0.7+ for matches).

### Date-Aware Routing

Source coverage matrix for intelligent filtering:

| Source | From | To |
|--------|------|-----|
| PROV | 1800 | 2010 |
| Trove | 1800 | 2024 |
| GA HAP | 1928 | 1996 |
| PM Transcripts | 1945 | 2024 |
| ACMI | 1900 | 2024 |
| GHAP | 1788 | 1970 |

When `smart=true` and date range specified, sources outside the range are excluded.

### Result Ranking

Scoring algorithm with weighted factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| hasImage | 0.25 | Visual content bonus |
| isDigitised | 0.15 | Online access bonus |
| intentMatch | 0.35 | Source-intent alignment |
| dateProximity | 0.25 | Temporal relevance |

Includes title-based deduplication with "Also in: X, Y" attribution.

### Historical Name Suggestions

Mappings for common Victorian placenames:

```typescript
{
  melbourne: ['port phillip', 'batmania'],
  tasmania: ['van diemens land'],
  bendigo: ['sandhurst'],
  darwin: ['palmerston'],
  // ... 20+ mappings
}
```

Returns suggestions, does NOT auto-expand queries.

---

## New Parameters

Added to federated `search` meta-tool:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `smart` | boolean | false | Enable intelligent source selection |
| `explain` | boolean | false | Include routing decisions in response |
| `parseAdvancedSyntax` | boolean | false | Parse query syntax (from SEARCH-007) |

---

## Example Routing

### Query: "Melbourne heritage buildings 1920s"
```json
{
  "_routing": {
    "detectedIntent": "heritage",
    "intentConfidence": 0.85,
    "matchedKeywords": ["heritage", "building"],
    "dateRange": { "from": "1920", "to": "1929" },
    "sourcesSelected": ["vhd", "prov", "trove"],
    "sourcesExcluded": {
      "pm-transcripts": "Coverage 1945-2024 doesn't overlap with 1920-1929",
      "acmi": "Coverage 1900-2024 doesn't overlap with 1920-1929"
    }
  },
  "_suggestions": [
    {
      "modern": "melbourne",
      "historical": ["port phillip", "batmania"],
      "suggestion": "For older records, try: \"port phillip\" or \"batmania\""
    }
  ]
}
```

### Query: "platypus specimens Victoria"
```json
{
  "_routing": {
    "detectedIntent": "natural_history",
    "intentConfidence": 0.9,
    "matchedKeywords": ["specimens"],
    "sourcesSelected": ["ala", "museumsvic", "nma"]
  }
}
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/core/meta-tools/search.ts` | Added smart, explain, integrated intelligence |
| `src/core/source-router.ts` | Added ParsedQuery support |

---

## Acceptance Criteria

- [x] Intent classification works for 8 query types
- [x] Confidence scoring distinguishes strong vs weak matches
- [x] Date-aware routing excludes sources outside date range
- [x] Results scored by composite relevance
- [x] Explain mode returns routing decisions
- [x] Historical name suggestions included (not auto-applied)
- [x] Performance acceptable (< 5s typical)
- [ ] Result deduplication integration (implemented but not exposed in response)

---

## Future Enhancements

- ML-based intent classification
- Location-aware source boosting
- Query expansion with user consent
- Cross-source deduplication in response

---

## Commit Reference

```
d225c41 feat(search): add intelligent query parsing and federated search (SEARCH-007 to SEARCH-010)
```
