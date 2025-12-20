# data.gov.au API Quick Reference

**API Type:** CKAN (Comprehensive Knowledge Archive Network)
**Base URL:** `https://data.gov.au/data/api/3/action/`
**Authentication:** None required for read operations
**Rate Limits:** Not documented (appears generous)

---

## Overview

data.gov.au is Australia's national open data portal, powered by CKAN. It aggregates datasets from federal, state, and local government agencies.

**Key Statistics:**
- 85,000+ datasets
- 800+ publishing organisations
- Formats: CSV, JSON, GeoJSON, SHP, XML, API, and more

---

## MCP Tools Available

| Tool | Purpose |
|------|---------|
| `datagovau_search` | Search datasets by keyword, organisation, format, tags |
| `datagovau_get_dataset` | Get full dataset details including resources |
| `datagovau_get_resource` | Get specific resource (file/API) details |
| `datagovau_datastore_search` | Query tabular data directly |
| `datagovau_list_organizations` | List all publishing organisations |
| `datagovau_get_organization` | Get organisation details |
| `datagovau_list_groups` | List dataset groups/categories |
| `datagovau_get_group` | Get group details |
| `datagovau_list_tags` | List popular tags |
| `datagovau_harvest` | Bulk download dataset metadata |

---

## Common Use Cases

### Find Heritage Datasets
```
Use datagovau_search with query "heritage" and format "CSV"
```

### Find ABS Census Data
```
Use datagovau_search with organization "abs" and query "census"
```

### Get Dataset with Resources
```
Use datagovau_get_dataset with dataset name or ID
```

### Query Tabular Data
```
1. Use datagovau_get_dataset to find a resource with datastoreActive=true
2. Use datagovau_datastore_search with the resource ID
```

### Bulk Download Organisation's Datasets
```
Use datagovau_harvest with organization filter
```

---

## API Endpoints Reference

### package_search
Search datasets by keyword and filters.

```
GET /package_search?q={query}&rows={limit}&start={offset}
```

**Filter Parameters (fq):**
- `organization:{slug}` - Filter by organisation
- `groups:{name}` - Filter by group
- `tags:{tag}` - Filter by tag
- `res_format:{format}` - Filter by resource format

### package_show
Get full dataset details.

```
GET /package_show?id={dataset_id_or_name}
```

### resource_show
Get resource details.

```
GET /resource_show?id={resource_id}
```

### datastore_search
Query tabular data in a resource.

```
GET /datastore_search?resource_id={id}&q={query}&limit={limit}
```

### organization_list / organization_show
List or get organisation details.

```
GET /organization_list?all_fields=true
GET /organization_show?id={org_slug}
```

### group_list / group_show
List or get group details.

```
GET /group_list?all_fields=true
GET /group_show?id={group_slug}
```

### tag_list
List tags.

```
GET /tag_list?query={prefix}
```

---

## Response Format

All CKAN API responses follow this structure:

```json
{
  "success": true,
  "result": { ... },
  "help": "https://data.gov.au/data/api/3/action/help_show?name=package_search"
}
```

On error:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "__type": "Error Type"
  }
}
```

---

## Dataset Structure

A dataset (package) contains:
- `id` - UUID
- `name` - URL slug
- `title` - Human-readable title
- `notes` - Description (may be long)
- `organization` - Publishing organisation
- `resources` - Array of files/APIs
- `tags` - Array of tags
- `license_id` / `license_title` - License info
- `metadata_created` / `metadata_modified` - Timestamps

---

## Resource Structure

A resource contains:
- `id` - UUID
- `name` - Display name
- `format` - File format (CSV, JSON, etc.)
- `url` - Download/access URL
- `size` - File size (if known)
- `datastore_active` - True if queryable via datastore

---

## Popular Organisations

| Slug | Name |
|------|------|
| `abs` | Australian Bureau of Statistics |
| `bom` | Bureau of Meteorology |
| `geoscience-australia` | Geoscience Australia |
| `csiro` | CSIRO |
| `agriculture-department` | Dept of Agriculture |

Use `datagovau_list_organizations` to get the full list.

---

## Common Formats

- `CSV` - Comma-separated values
- `JSON` - JavaScript Object Notation
- `GeoJSON` - Geographic JSON
- `SHP` - Shapefile
- `KML` - Keyhole Markup Language
- `XML` - Extensible Markup Language
- `API` - Web API endpoint

---

## Tips

1. **Empty searches work** - Returns recently modified datasets
2. **Use organisation slug** - Found via list_organizations tool
3. **Check datastore_active** - Before trying datastore_search
4. **Pagination** - Use limit and offset for large result sets
5. **Sort options** - "metadata_modified desc", "relevance", "title asc"

---

## Licensing

Most datasets are CC-BY licensed, but check individual dataset licenses. The portal itself is managed by the Department of Finance.

---

## External Resources

- **Portal:** https://data.gov.au/
- **CKAN Docs:** https://docs.ckan.org/en/latest/api/
- **Data Request:** https://data.gov.au/request-data
