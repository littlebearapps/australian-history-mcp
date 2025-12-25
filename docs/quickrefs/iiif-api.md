# IIIF API Quick Reference

International Image Interoperability Framework - works with any compliant institution.

> [!NOTE]
> IIIF is an open standard used by many institutions. Terms of use vary by institution - check the manifest attribution field for each item.

---

## What is IIIF?

IIIF is a set of open standards for sharing digital images. Used by:
- State Library Victoria (SLV)
- National Library of Australia (NLA)
- Bodleian Libraries, Oxford
- Internet Archive
- Many more GLAM institutions worldwide

---

## MCP Tools

### iiif_get_manifest

Fetch and parse an IIIF manifest from any institution.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `manifestUrl` | string | Yes | Full URL to the IIIF manifest |
| `includeCanvases` | boolean | No | Include canvas details (default: true) |
| `maxCanvases` | number | No | Max canvases to return (default: 50, max: 200) |

**Returns:**
- `id` - Manifest URI
- `label` - Title/name
- `description` - Description text
- `attribution` - Rights/attribution text
- `license` - License URL
- `thumbnailUrl` - Thumbnail image URL
- `metadata` - Key-value metadata
- `totalCanvases` - Total image count
- `canvases[]` - Array of canvas objects with image URLs

### iiif_get_image_url

Construct IIIF Image API URLs for various sizes and formats.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imageServiceUrl` | string | Yes | Base URL from manifest imageServiceUrl |
| `region` | string | No | Image region (default: "full") |
| `size` | string | No | Image size (default: "max") |
| `rotation` | string | No | Rotation in degrees (default: "0") |
| `quality` | string | No | Image quality (default: "default") |
| `format` | string | No | Output format (default: "jpg") |

---

## Image API Parameters

### Region

| Value | Description |
|-------|-------------|
| `full` | Entire image |
| `square` | Square crop from centre |
| `x,y,w,h` | Pixel coordinates (e.g., `100,100,500,500`) |
| `pct:x,y,w,h` | Percentage coordinates (e.g., `pct:10,10,80,80`) |

### Size

| Value | Description |
|-------|-------------|
| `max` | Full resolution |
| `full` | Same as max (deprecated) |
| `w,` | Width in pixels, height auto (e.g., `800,`) |
| `,h` | Height in pixels, width auto (e.g., `,600`) |
| `w,h` | Exact dimensions (e.g., `800,600`) |
| `!w,h` | Best fit within dimensions (e.g., `!1024,1024`) |
| `pct:n` | Percentage of original (e.g., `pct:50`) |

### Rotation

| Value | Description |
|-------|-------------|
| `0` | No rotation |
| `90` | 90 degrees clockwise |
| `180` | 180 degrees |
| `270` | 270 degrees clockwise |
| `!n` | Mirror then rotate (e.g., `!0` for horizontal flip) |

### Quality

| Value | Description |
|-------|-------------|
| `default` | Server default |
| `color` | Colour image |
| `gray` | Greyscale |
| `bitonal` | Black and white |

### Format

| Value | Description |
|-------|-------------|
| `jpg` | JPEG (most common) |
| `png` | PNG (lossless) |
| `gif` | GIF |
| `webp` | WebP (smaller files) |
| `tif` | TIFF (archival) |

---

## Common Manifest URL Patterns

### State Library Victoria (SLV)

```
https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/{IE_ID}/manifest
```

Example: `https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/IE145082/manifest`

### National Library of Australia (NLA)

```
https://nla.gov.au/nla.obj-{ID}/manifest
```

Example: `https://nla.gov.au/nla.obj-123456789/manifest`

### Bodleian Libraries, Oxford

```
https://iiif.bodleian.ox.ac.uk/iiif/manifest/{ID}.json
```

Example: `https://iiif.bodleian.ox.ac.uk/iiif/manifest/abc123.json`

---

## Example Workflows

### Download Full-Resolution Image

1. Get manifest: `iiif_get_manifest` with manifest URL
2. Find canvas with `imageServiceUrl`
3. Construct URL: `iiif_get_image_url` with `size: "max"`

### Create Thumbnail

```
iiif_get_image_url with:
  imageServiceUrl: "<from manifest>"
  size: "!200,200"
  format: "jpg"
```

### Extract Region

```
iiif_get_image_url with:
  imageServiceUrl: "<from manifest>"
  region: "100,100,500,500"
  size: "max"
```

### Convert to Greyscale

```
iiif_get_image_url with:
  imageServiceUrl: "<from manifest>"
  quality: "gray"
  format: "jpg"
```

---

## Discovery

IIIF provides image access but **not search**. To find content:

1. **Use Trove** for Australian content (with NUC filtering)
2. **Use institution catalogues** to find item IDs
3. **Use open data CSVs** if available

Once you have an item ID, use these IIIF tools to access the images.

---

## External Resources

- **IIIF Specification:** https://iiif.io/api/
- **IIIF Image API Playground:** https://www.learniiif.org/image-api/playground
- **IIIF Community:** https://iiif.io/community/
