# PROV API Quick Reference

Public Record Office Victoria API details and tips.

> [!NOTE]
> This is a third-party API. Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

---

## API Details

| Property | Value |
|----------|-------|
| Base URL | `https://api.prov.vic.gov.au/search` |
| Endpoint | `/query` |
| Authentication | None required |
| Format | JSON |
| License | CC-BY-NC (non-commercial) |
| Rate Limit | None published |

---

## What PROV Contains

- **State government records** - Victorian government agencies from 1836
- **Local council records** - Some council archives transferred to PROV
- **Court records** - Supreme Court, County Court, Magistrates' Court
- **Land records** - Titles, surveys, parish plans
- **Immigration records** - Assisted immigration, shipping records
- **Photographs** - Official photographs, building records
- **Maps and plans** - Government surveys, building plans

**Sample counts (Melbourne query, Dec 2025):**
- 5,200+ digitised photographs
- 900+ digitised maps/plans
- 10,000+ government/council files

---

## Key Identifiers

### Series (VPRS)
Victorian Public Record Series - groups of related records.

**Examples:**
- `VPRS 515` - Historical photographs
- `VPRS 3183` - Melbourne City Council minutes
- `VPRS 932` - Unassisted passenger lists

### Agency (VA)
Victorian Agency - the government body that created records.

**Examples:**
- `VA 473` - Melbourne City Council
- `VA 538` - Melbourne Metropolitan Board of Works
- `VA 669` - Public Works Department

---

## Record Forms

| Form | Description |
|------|-------------|
| `Photograph or Image` | Photographic prints, negatives, images |
| `Map, Plan, or Drawing` | Maps, plans, architectural drawings |
| `File` | Paper files, correspondence |
| `Volume` | Bound volumes, registers |
| `Document` | Individual documents |
| `Card` | Index cards, card records |
| `Object` | Physical objects, artefacts |
| `Moving Image` | Film, video recordings |
| `Sound Recording` | Audio recordings |

---

## Search Tips

### Finding Digitised Content
Use `digitisedOnly: true` to get only records with IIIF manifests (viewable images).

### Council Records
Search by agency number for specific councils:
- Melbourne City Council: `VA 473`
- Fitzroy City Council: `VA 1051`
- Collingwood City Council: `VA 1099`

### Date Ranges
Dates can be:
- Year only: `1890`
- Full date: `1890-05-15`
- Ranges: Use `dateFrom` and `dateTo` together

### Series Browsing
If you know the series, search by series number alone:
```
prov_search with series="VPRS 515"
```

---

## IIIF Manifests & Image Extraction

Digitised records include IIIF manifests for viewing images. Use the `prov_get_images` tool to extract downloadable URLs.

### Using prov_get_images

```
prov_get_images with manifestUrl="<manifest_url>" pages="1-5" size="full"
```

**Parameters:**
- `manifestUrl` (required): The IIIF manifest URL from search results
- `pages` (optional): Page filter - "1-5", "1,3,7", or "1-3,7,10-12"
- `size` (optional): "thumbnail" (200px), "medium" (800px), "full", or "all" (default)

**Returns:**
- Total page count
- Array of image URLs for each page

### Example: North Melbourne Football Ground (159 pages)
```
prov_get_images with
  manifestUrl="https://images.prov.vic.gov.au/manifests/09/B1/9F/7A/-F9F5-11E9-AE98-5B68487109BE/images/manifest.json"
  pages="1-5"
  size="full"
```

### Direct Image URL Format
PROV uses Loris IIIF Image Server. URLs follow this pattern:
```
https://images.prov.vic.gov.au/loris/{encoded-path}/full/{size}/0/default.jpg
```

Size options:
- `!200,200` - Thumbnail (max 200px)
- `!800,800` - Medium (max 800px)
- `full` - Full resolution

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique record identifier |
| `title` | string | Record title |
| `presentation_text` | string | Description/abstract |
| `series_id` | number | VPRS number (without prefix) |
| `is_part_of_series.title` | string | Series name |
| `agencies.ids` | array | VA numbers |
| `agencies.titles` | array | Agency names |
| `record_form` | string | Type of record |
| `start_dt` | string | Start date |
| `end_dt` | string | End date |
| `iiif-manifest` | string | IIIF manifest URL (if digitised) |

---

## External Resources

- **PROV Website:** https://prov.vic.gov.au/
- **API Documentation:** https://prov.vic.gov.au/prov-collection-api
- **GLAM Workbench (PROV):** https://glam-workbench.net/prov/
- **Finding Aids:** https://prov.vic.gov.au/explore-collection
