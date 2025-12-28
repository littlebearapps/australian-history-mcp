# SEARCH-017: Related Records Discovery

**Priority:** P3
**Phase:** 3 - Future Enhancements
**Status:** Not Started
**Estimated Effort:** 2 days
**Dependencies:** None

---

## Overview

Expose related/linked records across sources. Many APIs return relationship data that isn't currently exposed.

**Goal:** Allow users to discover connected records (related works, linked objects, parent/child relationships).

---

## Sources & Relationships

| Source | Relationship Type | API Support |
|--------|-------------------|-------------|
| ACMI | Related works | Yes (in get_work response) |
| NMA | Related objects, parties | Partial |
| Trove | Versions, editions, holdings | Yes (via includes) |
| PROV | Series/item hierarchy | Yes |
| VHD | Heritage precinct places | Partial |

---

## Files to Create

| File | Description |
|------|-------------|
| `src/sources/acmi/tools/get-related.ts` | ACMI related works tool |
| `src/sources/nma/tools/get-related.ts` | NMA related objects tool |
| `src/sources/trove/tools/get-versions.ts` | Trove work versions tool |
| `src/sources/prov/tools/get-items.ts` | PROV series items tool |

---

## Subtasks

### 1. ACMI Related Works

#### Research
- [ ] Check `acmi_get_work` response for `related_works` field
- [ ] Document related works structure
- [ ] Identify relationship types (sequel, prequel, remake, etc.)

#### Implementation
- [ ] Create `src/sources/acmi/tools/get-related.ts`:
  ```typescript
  interface ACMIGetRelatedInput {
    workId: number;
    relationshipType?: string;  // Filter by type
    limit?: number;
  }
  ```
- [ ] Return related works with relationship descriptions
- [ ] Add to ACMI source exports

---

### 2. NMA Related Objects

#### Research
- [ ] Check `nma_get_object` response for relationship fields
- [ ] Identify related object links
- [ ] Document party/place associations

#### Implementation
- [ ] Create `src/sources/nma/tools/get-related.ts`:
  ```typescript
  interface NMAGetRelatedInput {
    objectId: string;
    relationType?: 'object' | 'party' | 'place';
    limit?: number;
  }
  ```
- [ ] Return related objects/parties/places
- [ ] Add to NMA source exports

---

### 3. Trove Work Versions

#### Research
- [ ] Check `trove_get_work` response for version/edition data
- [ ] Document version structure
- [ ] Identify holdings per version

#### Implementation
- [ ] Create `src/sources/trove/tools/get-versions.ts`:
  ```typescript
  interface TroveGetVersionsInput {
    workId: string;
    includeHoldings?: boolean;
  }
  ```
- [ ] Return all versions/editions of a work
- [ ] Include library holdings per version
- [ ] Add to Trove source exports

---

### 4. PROV Series Items

#### Research
- [ ] Document PROV series → items hierarchy
- [ ] Check if API supports series item listing
- [ ] Identify pagination for large series

#### Implementation
- [ ] Create `src/sources/prov/tools/get-items.ts`:
  ```typescript
  interface PROVGetItemsInput {
    seriesId: string;  // VPRS number
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }
  ```
- [ ] Return items within a series
- [ ] Support date filtering
- [ ] Add to PROV source exports

---

### 5. VHD Precinct Places (Optional)

#### Research
- [ ] Check if VHD has precinct/group relationships
- [ ] Document heritage precinct structure

#### Implementation
- [ ] If supported, add `vhd_get_precinct_places` tool
- [ ] Return places within a heritage precinct

---

### 6. Cross-Source Linking (Future)

- [ ] Consider linking same item across sources:
  - Trove work → NMA object (same item)
  - Museums Vic species → ALA occurrences
  - VHD place → PROV records
- [ ] Requires identifier matching or manual curation

---

### 7. Testing
- [ ] Test each get-related tool
- [ ] Test with items having many relationships
- [ ] Test with items having no relationships
- [ ] Verify relationship types are accurate

### 8. Documentation
- [ ] Document each new tool
- [ ] Add relationship discovery examples
- [ ] Explain hierarchical navigation patterns

---

## Example Queries

```
# ACMI: Find related films
acmi_get_related: workId=12345
→ Returns: sequels, prequels, remakes, related documentaries

# NMA: Find related objects
nma_get_related: objectId="123456", relationType="object"
→ Returns: Objects in same collection, related artworks

# Trove: Find all versions of a book
trove_get_versions: workId="12345678", includeHoldings=true
→ Returns: First edition, reprints, digital versions, library holdings

# PROV: List items in a series
prov_get_items: seriesId="VPRS 3183", limit=50
→ Returns: Individual items within council minutes series
```

---

## Use Case: Hierarchical Navigation

```
# 1. Find a series about council minutes
prov_search: query="council minutes", category="series"
→ Found: VPRS 3183 - Shire of Rodney Minutes

# 2. Get items within that series
prov_get_items: seriesId="VPRS 3183", dateFrom="1900", dateTo="1910"
→ Found: 15 item records covering 1900-1910

# 3. Get details of specific item
prov_search: query="VPRS 3183/P1/12"
→ Full item details
```

---

## Acceptance Criteria

- [ ] At least 3 sources have get-related tools
- [ ] Relationship types are documented
- [ ] Hierarchical navigation works (series → items)
- [ ] Documentation includes use case examples

---

## Notes

- Focus on most useful relationships first
- Some relationships may be one-way only
- Cross-source linking is complex - defer to future
- Consider caching relationship data
