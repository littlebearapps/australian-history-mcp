# State Library Victoria (SLV) Guide

How to find and access State Library Victoria content using this MCP server.

> [!NOTE]
> SLV content is accessed via third-party APIs (Trove and IIIF). Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

---

## Quick Start

SLV content can be accessed two ways:

1. **Via Trove** (search) - Use `trove_search` with `nuc: "VSL"` filter
2. **Via IIIF** (direct access) - Use `iiif_get_manifest` if you have an item ID

---

## Option 1: Search SLV Content via Trove

SLV is a Principal Partner of Trove and contributes 300,000+ digitised items.

### Search SLV's Images

```
Use trove_search with:
  query: "Melbourne street"
  category: "image"
  nuc: "VSL"
```

### Search SLV's Books

```
Use trove_search with:
  query: "goldfields"
  category: "book"
  nuc: "VSL"
```

### Harvest SLV Photographs

```
Use trove_harvest with:
  query: "photograph"
  category: "image"
  nuc: "VSL"
  maxRecords: 100
```

### Common NUC Codes

| Code | Institution |
|------|-------------|
| `VSL` | State Library Victoria |
| `SLNSW` | State Library NSW |
| `QSL` | State Library Queensland |
| `ANL` | National Library of Australia |
| `ANL:DL` | NLA Digital Library |

---

## Option 2: Access SLV IIIF Directly

If you have an SLV item ID (e.g., `IE145082`), you can access it directly via IIIF.

### Get SLV Manifest

```
Use iiif_get_manifest with:
  manifestUrl: "https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/IE145082/manifest"
```

### Construct SLV Image URLs

```
Use iiif_get_image_url with:
  imageServiceUrl: "https://rosetta.slv.vic.gov.au:2083/iiif/2/IE145082:FL21000768.jpg"
  size: "!1024,1024"
  format: "jpg"
```

---

## SLV URL Patterns

### Manifest URL Pattern

```
https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/{IE_ID}/manifest
```

### Image Service URL Pattern

```
https://rosetta.slv.vic.gov.au:2083/iiif/2/{IE_ID}:{FL_ID}.{ext}
```

### Full Image URL Pattern

```
https://rosetta.slv.vic.gov.au:2083/iiif/2/{IE_ID}:{FL_ID}.{ext}/{region}/{size}/{rotation}/{quality}.{format}
```

**Example:**
```
https://rosetta.slv.vic.gov.au:2083/iiif/2/IE145082:FL21000768.jpg/full/max/0/default.jpg
```

---

## Finding SLV Item IDs

### From Trove Search Results

When you search Trove with `nuc: "VSL"`, look for items with SLV URLs:
- `handle.slv.vic.gov.au/...`
- `rosetta.slv.vic.gov.au/...`

The ID will be in format `IE######` (e.g., `IE145082`).

### From SLV Catalogue

1. Search the SLV catalogue: https://www.slv.vic.gov.au/search
2. Find a digitised item
3. Extract the IE number from the URL or metadata

### From SLV Open Data (GitHub)

CSV datasets at `github.com/statelibraryvic/opendata` contain item IDs for:
- Argus newspaper front pages
- MMBW plans
- Melbourne landmarks
- Victorian hotels

---

## Common Size Parameters

| Parameter | Description |
|-----------|-------------|
| `max` | Full resolution |
| `!200,200` | Thumbnail (max 200px) |
| `!800,800` | Medium (max 800px) |
| `!1024,1024` | Large (max 1024px) |
| `pct:50` | 50% of original |
| `,500` | Height 500px (width auto) |
| `500,` | Width 500px (height auto) |

---

## Workflow Example: Research Victorian Photographs

1. **Search via Trove**
   ```
   trove_search with query="Melbourne 1890s" category="image" nuc="VSL" limit=20
   ```

2. **Find item with SLV URL**
   Look for `thumbnailUrl` or `url` containing `slv.vic.gov.au`

3. **Extract IE ID**
   From URL like `rosetta.slv.vic.gov.au/.../IE123456/...`

4. **Get full manifest**
   ```
   iiif_get_manifest with manifestUrl="https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/IE123456/manifest"
   ```

5. **Download high-resolution images**
   Use `imageServiceUrl` from manifest with `iiif_get_image_url`

---

## Licensing

- **SLV digitised images:** Public domain or SLV copyright (free to use)
- **Metadata:** CC-BY 4.0

Always check the `attribution` field in manifests for specific requirements.
