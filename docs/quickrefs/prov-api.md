# PROV API Quick Reference

Public Record Office Victoria API details and tips.

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
| `photograph` | Photographic prints, negatives |
| `map` | Maps, charts |
| `plan` | Building plans, engineering drawings |
| `drawing` | Architectural drawings, sketches |
| `file` | Paper files, correspondence |
| `volume` | Bound volumes, registers |
| `register` | Official registers, indexes |

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

## IIIF Manifests

Digitised records include IIIF manifests for viewing images.

**Manifest URL format:**
```
https://prov.vic.gov.au/archive/iiif/[item-id]/manifest
```

**Usage:**
- Open in IIIF viewer (e.g., Mirador, Universal Viewer)
- Extract individual image URLs for download
- Access metadata embedded in manifest

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
