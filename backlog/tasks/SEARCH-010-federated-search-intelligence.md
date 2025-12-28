# SEARCH-010: Federated Search Intelligence

**Priority:** P1
**Phase:** 2 - Federated & Filter Expansion
**Status:** Not Started
**Estimated Effort:** 3-4 days
**Dependencies:** SEARCH-001 to SEARCH-009 (Phase 1 features)

---

## Overview

Enhance the federated search meta-tool with intelligent source routing, date-aware selection, and improved result ranking.

**Current State:** Source selection is keyword-based only (substring matching).

**Goal:** Smart routing based on query intent, temporal context, and content type.

---

## Files to Create

| File | Description |
|------|-------------|
| `src/core/meta-tools/source-router.ts` | Intent classification & routing |
| `src/core/meta-tools/result-ranker.ts` | Cross-source result ranking |
| `src/core/meta-tools/query-expander.ts` | Related term suggestions |

## Files to Modify

| File | Change |
|------|--------|
| `src/core/meta-tools/search.ts` | Integrate smart routing |

---

## Subtasks

### 1. Intent Classification

#### 1.1 Define Query Intent Categories
- [ ] Create intent taxonomy:
  ```typescript
  type QueryIntent =
    | 'heritage'        // Buildings, sites, architecture
    | 'natural_history' // Species, specimens, biodiversity
    | 'government'      // Politics, policy, transcripts
    | 'media'           // Films, TV, moving image
    | 'newspaper'       // Historical news articles
    | 'photograph'      // Historical photographs
    | 'genealogy'       // People, families, records
    | 'geographic'      // Places, locations, maps
    | 'general';        // Unclear intent
  ```

#### 1.2 Create Intent Classifier
- [ ] Create `src/core/meta-tools/source-router.ts`
- [ ] Implement keyword-based intent detection:
  ```typescript
  const intentKeywords = {
    heritage: ['heritage', 'building', 'architecture', 'historic site', 'heritage overlay'],
    natural_history: ['species', 'specimen', 'wildlife', 'plant', 'animal', 'biodiversity'],
    government: ['prime minister', 'pm', 'speech', 'policy', 'parliament', 'government'],
    media: ['film', 'movie', 'television', 'tv show', 'documentary', 'videogame'],
    newspaper: ['article', 'news', 'headline', 'newspaper'],
    photograph: ['photo', 'photograph', 'picture', 'image'],
    genealogy: ['family', 'ancestor', 'birth', 'death', 'marriage', 'immigration'],
    geographic: ['place', 'location', 'town', 'suburb', 'placename', 'map'],
  };
  ```
- [ ] Return confidence scores for each intent

#### 1.3 Map Intents to Sources
- [ ] Define source relevance per intent:
  ```typescript
  const intentSourceMap: Record<QueryIntent, string[]> = {
    heritage: ['vhd', 'prov', 'trove'],
    natural_history: ['ala', 'museumsvic', 'nma'],
    government: ['pm-transcripts', 'trove', 'prov'],
    media: ['acmi', 'trove', 'nma'],
    newspaper: ['trove'],
    photograph: ['prov', 'trove', 'nma', 'museumsvic', 'ga-hap'],
    genealogy: ['trove', 'prov'],
    geographic: ['ghap', 'ga-hap', 'prov'],
    general: ['trove', 'prov', 'nma', 'museumsvic'],
  };
  ```

---

### 2. Date-Aware Routing

#### 2.1 Detect Temporal Context
- [ ] Parse date references in queries:
  - Explicit: "1920s", "19th century", "World War II"
  - Relative: "colonial era", "gold rush period"
  - Named events: "Great Depression", "Federation"
- [ ] Extract date ranges from query

#### 2.2 Route by Date Range
- [ ] Define source date coverage:
  ```typescript
  const sourceDateRanges = {
    'prov': { from: 1800, to: 2000 },      // Victorian state archives
    'trove': { from: 1800, to: 2024 },     // Newspapers from 1803
    'ga-hap': { from: 1928, to: 1996 },    // Aerial photography
    'pm-transcripts': { from: 1945, to: 2024 }, // Post-WWII
    'acmi': { from: 1890, to: 2024 },      // Moving image era
    'ala': { from: 1800, to: 2024 },       // Historical specimens
    'vhd': { from: 1800, to: 2024 },       // Heritage places
    'ghap': { from: 1788, to: 1950 },      // Historical placenames
    'museumsvic': { from: 1800, to: 2024 },
    'nma': { from: 1788, to: 2024 },
  };
  ```
- [ ] Exclude sources outside date range

#### 2.3 Handle Location Context
- [ ] Detect location references (Melbourne, Victoria, Sydney, etc.)
- [ ] Boost Victoria-specific sources for Victorian locations:
  - PROV (Victorian archives)
  - VHD (Victorian heritage)
  - Museums Vic
- [ ] Handle "near me" or general Australian context

---

### 3. Result Ranking

#### 3.1 Cross-Source Relevance Scoring
- [ ] Create `src/core/meta-tools/result-ranker.ts`
- [ ] Implement scoring algorithm:
  ```typescript
  interface RankingFactors {
    textMatch: number;      // Query term match quality
    dateRelevance: number;  // Temporal match
    sourceAuthority: number; // Source reliability
    hasImage: number;       // Visual content bonus
    digitised: number;      // Digitised content bonus
  }
  ```
- [ ] Normalize scores across sources (0-1 scale)

#### 3.2 Merge and Sort Results
- [ ] Combine results from all sources
- [ ] Sort by composite score
- [ ] Preserve source attribution
- [ ] Limit to top N results

#### 3.3 Result Deduplication
- [ ] Detect potential duplicates across sources
- [ ] Heuristics: Same title + similar date + same type
- [ ] Merge duplicates with multiple source attribution
- [ ] Show "Also in: Trove, PROV" for duplicates

---

### 4. Query Expansion

#### 4.1 Historical Name Mapping
- [ ] Create `src/core/meta-tools/query-expander.ts`
- [ ] Define historical name mappings:
  ```typescript
  const historicalNames = {
    'Melbourne': ['Port Phillip', 'Batmania'],
    'Sydney': ['Port Jackson'],
    'Tasmania': ['Van Diemens Land'],
    'Gold Rush': ['Ballarat', 'Bendigo', 'goldfields'],
    'Aboriginal': ['Indigenous', 'First Nations', 'First Peoples'],
  };
  ```

#### 4.2 Suggest Related Searches
- [ ] Based on initial results, suggest related terms
- [ ] Return expanded queries for user consideration
- [ ] Don't auto-expand without user consent

---

### 5. Update Federated Search

#### 5.1 Integrate Components
- [ ] Modify `src/core/meta-tools/search.ts`:
  ```typescript
  // 1. Classify query intent
  const intents = classifyIntent(query);

  // 2. Apply date-aware routing
  const dateRange = extractDateRange(query, input.dateFrom, input.dateTo);
  const eligibleSources = filterByDateRange(sources, dateRange);

  // 3. Select sources based on intent
  const selectedSources = input.sources || selectSources(intents, eligibleSources);

  // 4. Execute searches
  const results = await executeSearches(selectedSources, query, params);

  // 5. Rank and merge results
  const rankedResults = rankResults(results, query, intents);
  ```

#### 5.2 Add Debug/Explain Mode
- [ ] Add `explain?: boolean` parameter
- [ ] Return routing decisions in response:
  ```typescript
  {
    _routing: {
      detectedIntent: 'heritage',
      intentConfidence: 0.85,
      dateRange: { from: 1920, to: 1930 },
      sourcesSelected: ['vhd', 'prov', 'trove'],
      sourcesExcluded: ['pm-transcripts', 'ga-hap'],
      excludeReason: 'date_range_mismatch'
    }
  }
  ```

---

### 6. Testing
- [ ] Test intent classification accuracy
- [ ] Test date-aware routing
- [ ] Test location-aware routing
- [ ] Test result ranking quality
- [ ] Test edge cases (ambiguous queries)
- [ ] Test explain mode output

### 7. Documentation
- [ ] Document routing logic
- [ ] Add examples of intelligent routing
- [ ] Update CLAUDE.md with federated search improvements

---

## Example Routing Decisions

```
Query: "Melbourne heritage buildings 1920s"
→ Intent: heritage (high confidence)
→ Date range: 1920-1929
→ Location: Melbourne, Victoria
→ Sources: VHD (primary), PROV, Trove
→ Excluded: PM Transcripts (wrong intent), GA HAP (date range limited)

Query: "platypus specimens"
→ Intent: natural_history (high confidence)
→ Date range: any
→ Sources: ALA (primary), Museums Vic
→ Excluded: VHD, ACMI, PM Transcripts (wrong intent)

Query: "Hawke economic policy 1980s"
→ Intent: government (high confidence)
→ Date range: 1980-1989
→ Sources: PM Transcripts (primary), Trove
→ Excluded: VHD, ALA, Museums Vic (wrong intent)
```

---

## Acceptance Criteria

- [ ] Intent classification works for common query types
- [ ] Date-aware routing excludes irrelevant sources
- [ ] Location awareness boosts relevant sources
- [ ] Results are ranked by relevance across sources
- [ ] Explain mode shows routing decisions
- [ ] Performance is acceptable (< 5s for typical queries)

---

## Notes

- Start with simple keyword-based intent classification
- Consider ML-based classification in future
- Balance between precision and recall in source selection
- Over-selection is better than missing relevant sources
- Query expansion is optional - don't change user's query without consent
