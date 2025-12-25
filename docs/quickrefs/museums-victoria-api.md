# Museums Victoria API Quick Reference

**Base URL:** `https://collections.museumsvictoria.com.au/api`
**Auth:** None required | **Rate Limits:** Undocumented (reasonable use expected)

> [!NOTE]
> This is a third-party API. Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

---

## What's Available

**Victorian museum collections spanning natural sciences, First Peoples, and history & technology.**

| Record Type | Count | Content |
|-------------|-------|---------|
| Items | 1.1M+ | Photographs, artefacts, technology, textiles |
| Specimens | 17M+ | Insects, fossils, minerals, biological specimens |
| Species | 28,000+ | Victorian fauna and flora information |
| Articles | 1,000+ | Educational content and stories |

**Media:** High-resolution images with multiple sizes (thumbnail, small, medium, large)

**Licences:** CC-BY 4.0 (most), Public Domain (some), All Rights Reserved (some)

---

## MCP Tools (6)

| Tool | Purpose |
|------|---------|
| `museumsvic_search` | Search collections with facets |
| `museumsvic_get_article` | Get educational article by ID |
| `museumsvic_get_item` | Get museum object by ID |
| `museumsvic_get_species` | Get species information by ID |
| `museumsvic_get_specimen` | Get natural science specimen by ID |
| `museumsvic_harvest` | Bulk download records |

---

## Search Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `query` | text | Free-text search |
| `recordType` | article, item, species, specimen | Record type filter |
| `category` | natural sciences, first peoples, history & technology | Collection category |
| `hasImages` | boolean | Only records with images |
| `onDisplay` | boolean | Items currently on display |
| `imageLicence` | public domain, cc by, cc by-nc, cc by-sa, cc by-nc-sa | Image licence filter |
| `locality` | text | Geographic location filter |
| `taxon` | text | Taxonomic classification filter |

---

## Common Searches

```
# Victorian wildlife
museumsvic_search recordType="species" query="platypus"

# Gold rush artefacts
museumsvic_search query="gold rush" category="history & technology"

# First Peoples collection
museumsvic_search category="first peoples" hasImages=true

# Insects with public domain images
museumsvic_search recordType="specimen" taxon="insecta" imageLicence="public domain"

# Currently on display
museumsvic_search onDisplay=true hasImages=true
```

---

## Record Types

### Articles
Educational content about topics in the collection. Contains:
- `content` - Full HTML content
- `contentSummary` - Plain text summary
- `keywords` - Topic tags

### Items
Museum objects (photographs, artefacts, technology). Contains:
- `registrationNumber` - Museum catalogue number
- `objectName` - Object type
- `objectSummary` - Description
- `physicalDescription` - Materials, dimensions
- `associations` - Related people, places, events

### Species
Victorian fauna and flora information. Contains:
- `taxonomy` - Scientific classification
- `overview` - General description
- `biology` - Life cycle, behaviour
- `habitat` - Environment information
- `distribution` - Geographic range
- `diet` - Food sources

### Specimens
Natural science collection items. Contains:
- `taxonomy` - Scientific classification
- `collectionEvent` - When/where collected
- `storageLocation` - Museum storage location
- `registrationNumber` - Museum catalogue number

---

## Pagination

- Header-based: `Link` (rel="next"/"prev"), `Total-Results`, `Total-Pages`
- Query params: `?perpage=N` (max 100), `?page=N`
- Harvest tool handles pagination automatically

---

## Tips

1. **Use `recordType`** to narrow results - huge difference in result counts
2. **Check `hasImages`** if you need visual content
3. **Species vs Specimens**: Species = information about species; Specimens = actual collected items
4. **Image licences**: Filter by `imageLicence` for reusable images
5. **IDs are type-prefixed**: e.g., `articles/12345`, `items/67890`

---

## Key Differences from Other Sources

| | PROV/Trove | data.gov.au | Museums Victoria |
|--|------------|-------------|------------------|
| **Content** | Archives, newspapers | Datasets, statistics | Museum objects, specimens |
| **Use case** | Historical research | Data analysis | Natural history, cultural heritage |
| **Formats** | Images, PDFs, text | CSV, JSON, GIS | JSON with images |

---

## Resources

- **Collections Portal:** https://collections.museumsvictoria.com.au/
- **API Docs:** https://collections.museumsvictoria.com.au/developers
