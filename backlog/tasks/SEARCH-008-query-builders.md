# SEARCH-008: Advanced Query Syntax - Source Builders

**Priority:** P1
**Phase:** 1 - Core Search Enhancements
**Status:** Not Started
**Estimated Effort:** 1.5 days
**Dependencies:** SEARCH-007 (Query Parser Core)

---

## Overview

Create query builders that transform the parsed AST into source-specific query syntax for Trove (Lucene), PROV (Solr), and ALA (Solr).

Each builder converts the common AST into the exact syntax required by each API.

---

## Files to Create

| File | Description |
|------|-------------|
| `src/core/query/builders/types.ts` | Builder interface and config |
| `src/core/query/builders/trove-builder.ts` | Trove/Lucene query builder |
| `src/core/query/builders/prov-builder.ts` | PROV/Solr query builder |
| `src/core/query/builders/ala-builder.ts` | ALA/Solr query builder |
| `src/core/query/builders/index.ts` | Builder exports |

## Files to Modify

| File | Change |
|------|--------|
| `src/sources/trove/tools/search.ts` | Use query builder |
| `src/sources/prov/tools/search.ts` | Use query builder |
| `src/sources/ala/tools/search-occurrences.ts` | Use query builder |

---

## Subtasks

### 1. Define Builder Interface
- [ ] Create `src/core/query/builders/types.ts`:
  ```typescript
  interface QueryBuilder {
    build(ast: QueryNode): string;
    supportsField(field: string): boolean;
    mapField(field: string): string;
  }

  interface BuilderConfig {
    fieldMappings: Record<string, string>;
    defaultOperator: 'AND' | 'OR';
    phraseQuoteChar: '"' | "'";
    wildcardChar: '*';
    escapeChars: string[];
  }
  ```

### 2. Implement Trove Builder
- [ ] Create `src/core/query/builders/trove-builder.ts`
- [ ] Implement AST → Lucene syntax conversion:
  ```typescript
  // Term: word → word
  // Phrase: "gold rush" → "gold rush"
  // AND: a AND b → a AND b
  // OR: a OR b → a OR b
  // NOT: NOT a → NOT a
  // Field: creator:lawson → creator:(lawson)
  // Wildcard: rail* → rail*
  ```
- [ ] Map field names to Trove search indexes:
  ```typescript
  {
    'creator': 'creator',
    'author': 'creator',
    'subject': 'subject',
    'title': 'title',
    'isbn': 'identifier',
    'issn': 'identifier',
  }
  ```
- [ ] Escape special Lucene characters
- [ ] Handle nested groups

### 3. Implement PROV Builder
- [ ] Create `src/core/query/builders/prov-builder.ts`
- [ ] Implement AST → PROV Solr syntax:
  ```typescript
  // Term: word → text:word
  // Phrase: "gold rush" → text:"gold rush"
  // AND: a AND b → (a) AND (b)
  // OR: a OR b → (a) OR (b)
  // NOT: NOT a → NOT (a)
  // Field: series:3183 → series_id:3183
  ```
- [ ] Map field names to PROV Solr fields:
  ```typescript
  {
    'series': 'series_id',
    'agency': 'agency_id',
    'category': 'category',
    'form': 'record_form',
  }
  ```
- [ ] Handle PROV's specific query syntax requirements

### 4. Implement ALA Builder
- [ ] Create `src/core/query/builders/ala-builder.ts`
- [ ] Implement AST → ALA biocache syntax:
  ```typescript
  // Term: word → text:word
  // Phrase: "common name" → text:"common name"
  // AND: a AND b → (a) AND (b)
  // Field: kingdom:Animalia → kingdom:Animalia
  ```
- [ ] Map field names to ALA fields:
  ```typescript
  {
    'species': 'scientificName',
    'common': 'vernacularName',
    'kingdom': 'kingdom',
    'family': 'family',
    'genus': 'genus',
    'state': 'stateProvince',
  }
  ```

### 5. Create Builder Factory
- [ ] Add to `index.ts`:
  ```typescript
  function getBuilder(source: 'trove' | 'prov' | 'ala'): QueryBuilder;
  ```
- [ ] Export all builders

### 6. Integrate with Search Tools

#### Trove Integration
- [ ] Modify `src/sources/trove/tools/search.ts`:
  ```typescript
  import { parseQuery, TroveBuilder } from '../../../core/query';

  // In search function
  const parseResult = parseQuery(input.query);
  if (parseResult.errors.length === 0) {
    const builder = new TroveBuilder();
    apiQuery = builder.build(parseResult.ast);
  } else {
    // Fall back to simple query or return errors
  }
  ```

#### PROV Integration
- [ ] Modify `src/sources/prov/tools/search.ts`
- [ ] Use PROVBuilder for query construction

#### ALA Integration
- [ ] Modify `src/sources/ala/tools/search-occurrences.ts`
- [ ] Use ALABuilder for query construction

### 7. Add Query Validation
- [ ] Validate field names are supported by source
- [ ] Return helpful error for unsupported fields
- [ ] Handle unknown fields gracefully

### 8. Testing
- [ ] Test each builder with various AST structures
- [ ] Test field mapping for each source
- [ ] Test special character escaping
- [ ] Test integration with search tools
- [ ] Test error handling for invalid fields
- [ ] Compare generated queries with expected output

### 9. Documentation
- [ ] Document supported fields per source
- [ ] Add query syntax examples to each API quickref
- [ ] Update CLAUDE.md with advanced query examples

---

## Query Syntax by Source

### Trove (Lucene)
```
# Simple search
trove_search: query="gold rush"

# Boolean search
trove_search: query="gold AND victoria NOT queensland"

# Field search
trove_search: query="creator:lawson AND subject:bushrangers"

# Phrase + boolean
trove_search: query='"melbourne flood" OR "yarra flood"'
```

### PROV (Solr)
```
# Simple search
prov_search: query="railway bridge"

# Boolean search
prov_search: query="railway AND photograph NOT map"

# Series-specific
prov_search: query="series:3183 AND photograph"
```

### ALA (Solr)
```
# Simple search
ala_search_occurrences: query="eucalyptus"

# Taxonomy search
ala_search_occurrences: query="kingdom:Plantae AND family:Myrtaceae"

# Location + taxonomy
ala_search_occurrences: query="state:Victoria AND genus:Eucalyptus"
```

---

## Field Mappings

### Trove Fields
| User Field | API Field | Description |
|------------|-----------|-------------|
| creator | creator | Author/creator |
| author | creator | Alias for creator |
| subject | subject | Subject terms |
| title | title | Title search |
| isbn | identifier | ISBN lookup |
| issn | identifier | ISSN lookup |

### PROV Fields
| User Field | API Field | Description |
|------------|-----------|-------------|
| series | series_id | VPRS series number |
| agency | agency_id | VA agency number |
| category | category | Record category |
| form | record_form | Record form type |

### ALA Fields
| User Field | API Field | Description |
|------------|-----------|-------------|
| species | scientificName | Scientific name |
| common | vernacularName | Common name |
| kingdom | kingdom | Taxonomic kingdom |
| family | family | Taxonomic family |
| genus | genus | Taxonomic genus |
| state | stateProvince | State/territory |

---

## Acceptance Criteria

- [ ] All three builders produce valid API queries
- [ ] Field mappings work correctly
- [ ] Boolean operators generate correct syntax
- [ ] Phrase queries are properly quoted
- [ ] Special characters are escaped
- [ ] Search tools use builders transparently
- [ ] Invalid fields return helpful errors
- [ ] Documentation includes examples

---

## Notes

- Builders should be stateless and reusable
- Consider caching parsed queries
- Field validation prevents API errors
- Keep syntax compatible across sources where possible
