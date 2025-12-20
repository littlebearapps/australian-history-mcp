# data.gov.au API Quick Reference

**Base URL:** `https://data.gov.au/data/api/3/action/`
**Auth:** None required | **Rate Limits:** Generous (undocumented)

---

## What's Available

**This is structured government DATA, not historical archives like PROV/Trove.**

| Category | Datasets | Content |
|----------|----------|---------|
| Civic Infrastructure | 248 | Roads, utilities, planning |
| Environment | 215 | Biodiversity, climate, conservation |
| Community Services | 160 | Welfare, social services |
| Statistical Services | 71 | Census, demographics |
| Heritage Registers | 1,800+ | State heritage lists (GIS) |
| Spatial/GIS | 3,600+ | Boundaries, mapping layers |

**Formats:** CSV, JSON, GeoJSON, SHP, KML, WMS/WFS, XML, PDF

---

## MCP Tools (10)

| Tool | Purpose |
|------|---------|
| `datagovau_search` | Search by keyword, org, format, tags |
| `datagovau_get_dataset` | Get dataset with all resources |
| `datagovau_get_resource` | Get single resource details |
| `datagovau_datastore_search` | Query tabular data directly |
| `datagovau_list_organizations` | List 800+ publishers |
| `datagovau_get_organization` | Get org details |
| `datagovau_list_groups` | List 25 categories |
| `datagovau_get_group` | Get category details |
| `datagovau_list_tags` | List 63,000+ tags |
| `datagovau_harvest` | Bulk download metadata |

---

## Common Searches

```
# Heritage registers (VIC, TAS, QLD, NSW)
datagovau_search query="heritage register"

# Population/census data
datagovau_search query="census population"

# Historical photographs (State Libraries)
datagovau_search query="photographs images"

# GIS/spatial data
datagovau_search format="GeoJSON"
```

---

## Key Differences from PROV/Trove

| | PROV/Trove | data.gov.au |
|--|------------|-------------|
| **Content** | Historical records, newspapers, photos | Current datasets, statistics, GIS |
| **Use case** | Historical research | Data analysis, mapping |
| **Formats** | Images, PDFs, text | CSV, JSON, shapefiles |

---

## Tips

1. **Use `list_groups`** first to see 25 categories
2. **Check `datastore_active`** before using datastore_search
3. **Heritage registers** have GIS layers (SHP, GeoJSON)
4. **Photos** mainly from State Libraries (SA, WA)

---

## Resources

- **Portal:** https://data.gov.au/
- **CKAN Docs:** https://docs.ckan.org/en/latest/api/
