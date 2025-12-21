# CLAUDE.md - Australian Archives MCP Server

**Language:** Australian English
**Last Updated:** 2025-12-21
**Version:** 0.2.0

---

## Quick Facts

**Project:** Australian Archives MCP Server
**Package:** `@littlebearapps/australian-archives-mcp`
**Purpose:** Programmatic search and batch harvesting of Australian historical archives

**Data Sources:**
- **PROV** (Public Record Office Victoria) - Victorian state government archives (no API key)
- **Trove** (National Library of Australia) - Federal digitised collections (requires API key)
- **data.gov.au** (CKAN) - Australian government open data portal (no API key)
- **Museums Victoria** - Victorian museum collections (no API key)

**PROV Content (Victorian State Archives):**
- Historical photographs and maps
- Government files and correspondence
- Council records and meeting minutes
- Court and immigration records

**Trove Content (National Library):**
- Old newspaper articles
- Government gazettes
- Books, magazines, images

**data.gov.au Content (Open Data Portal):**
- 85,000+ datasets from 800+ government organisations
- Statistical data (ABS census, demographics)
- Geographic and spatial data
- Environmental, health, transport datasets

**Museums Victoria Content (Museum Collections):**
- Museum objects (photographs, artefacts, technology, textiles)
- Natural science specimens (insects, fossils, minerals)
- Species information (Victorian fauna and flora)
- Educational articles and stories

---

## Essential Commands

```bash
# Build
npm run build

# Development (watch mode)
npm run dev

# Run directly
node dist/index.js

# Type check
npx tsc --noEmit
```

---

## MCP Tools Available

### PROV Tools (3)
| Tool | API Key | Purpose |
|------|---------|---------|
| `prov_search` | None | Search Victorian state archives |
| `prov_get_images` | None | Extract image URLs from digitised records |
| `prov_harvest` | None | Bulk download PROV records |

### Trove Tools (5)
| Tool | API Key | Purpose |
|------|---------|---------|
| `trove_search` | Required | Search newspapers, images, books |
| `trove_newspaper_article` | Required | Get full newspaper article text |
| `trove_list_titles` | Required | List newspaper/gazette titles |
| `trove_title_details` | Required | Get title info with issue dates |
| `trove_harvest` | Required | Bulk download Trove records |

### data.gov.au Tools (10)
| Tool | API Key | Purpose |
|------|---------|---------|
| `datagovau_search` | None | Search datasets by keyword, organisation, format |
| `datagovau_get_dataset` | None | Get full dataset details with resources |
| `datagovau_get_resource` | None | Get individual resource details |
| `datagovau_datastore_search` | None | Query tabular data directly |
| `datagovau_list_organizations` | None | List publishing organisations |
| `datagovau_get_organization` | None | Get organisation details |
| `datagovau_list_groups` | None | List dataset groups/categories |
| `datagovau_get_group` | None | Get group details |
| `datagovau_list_tags` | None | List popular tags |
| `datagovau_harvest` | None | Bulk download dataset metadata |

### Museums Victoria Tools (6)
| Tool | API Key | Purpose |
|------|---------|---------|
| `museumsvic_search` | None | Search museum collections |
| `museumsvic_get_article` | None | Get educational article by ID |
| `museumsvic_get_item` | None | Get museum object by ID |
| `museumsvic_get_species` | None | Get species information by ID |
| `museumsvic_get_specimen` | None | Get natural science specimen by ID |
| `museumsvic_harvest` | None | Bulk download museum records |

**See:** `docs/quickrefs/` for complete parameter documentation

---

## API Key Setup

### PROV (No Key Required)
PROV tools work immediately with no configuration.

### data.gov.au (No Key Required)
data.gov.au tools work immediately with no configuration.

### Museums Victoria (No Key Required)
Museums Victoria tools work immediately with no configuration.

### Trove (API Key Required)

1. **Apply for key:** https://trove.nla.gov.au/about/create-something/using-api
   - Select "Level 1" (personal/research use)
   - Approval typically within 1 week

2. **Store in keychain:**
   ```bash
   source ~/bin/kc.sh
   kc_set trove-api-key "YOUR_API_KEY_HERE"
   ```

3. **Verify:** Restart Claude Code session and use any Trove tool

---

## Repository Map

**Source Module Architecture** - Each source is a self-contained module:

| Path | Description |
|:--|:--|
| `src/index.ts` | MCP server entry point (24 tools via registry) |
| `src/registry.ts` | Tool registry with Map-based dispatch |
| `src/core/` | Shared infrastructure |
| `src/core/types.ts` | Base types (MCPToolResponse, APIError) |
| `src/core/base-client.ts` | Shared fetch helpers with retry |
| `src/core/base-source.ts` | Source interface definition |
| `src/core/harvest-runner.ts` | Shared pagination logic |
| `src/sources/prov/` | PROV source (3 tools) |
| `src/sources/trove/` | Trove source (5 tools) |
| `src/sources/datagovau/` | data.gov.au source (10 tools) |
| `src/sources/museums-victoria/` | Museums Victoria source (6 tools) |
| `docs/quickrefs/` | Quick reference documentation |
| `dist/` | Compiled JavaScript output |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Claude Code Session                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ stdio
┌───────────────────────────────────▼─────────────────────────────────────────┐
│              Australian Archives MCP Server (24 tools, 4 sources)            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        Tool Registry (Map-based)                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │   PROV     │  │   Trove    │  │ data.gov.au │  │ Museums Victoria │     │
│  │  (3 tools) │  │  (5 tools) │  │  (10 tools) │  │    (6 tools)     │     │
│  │  no auth   │  │  API key   │  │   no auth   │  │     no auth      │     │
│  └─────┬──────┘  └─────┬──────┘  └──────┬──────┘  └────────┬─────────┘     │
└────────┼───────────────┼────────────────┼──────────────────┼───────────────┘
         │               │                │                  │
┌────────▼───────┐ ┌─────▼─────────┐ ┌────▼──────────┐ ┌─────▼─────────────┐
│ PROV Solr API  │ │ Trove API v3  │ │  CKAN API     │ │ Collections API   │
│  (CC-BY-NC)    │ │(200 calls/min)│ │ data.gov.au   │ │ museumsvictoria   │
└────────────────┘ └───────────────┘ └───────────────┘ └───────────────────┘
```

---

## Common Use Cases

### Find Digitised Railway Photographs (PROV)
```
Use prov_search with query "railway" and digitisedOnly=true
```

### Search Victorian Council Minutes (PROV)
```
Use prov_search with query "council meeting" and series "VPRS 3183"
```

### Extract Images from Digitised Record (PROV)
```
Use prov_get_images with manifestUrl from search results, pages "1-10", size "full"
```

### Find 1930s Newspaper Articles (Trove)
```
Use trove_search with query "Melbourne flood", category "newspaper",
dateFrom "1930", dateTo "1939", state "vic"
```

### Find Heritage Datasets (data.gov.au)
```
Use datagovau_search with query "heritage" and format "CSV"
```

### Find ABS Census Data (data.gov.au)
```
Use datagovau_search with organization "abs" and query "census"
```

### Query Tabular Data Directly (data.gov.au)
```
1. Use datagovau_get_dataset to find a resource with datastoreActive=true
2. Use datagovau_datastore_search with the resource ID
```

### Search Museum Objects (Museums Victoria)
```
Use museumsvic_search with query "gold rush" and category "history & technology"
```

### Find Victorian Species (Museums Victoria)
```
Use museumsvic_search with recordType "species" and taxon "Platypus"
```

### Get Specimen Details (Museums Victoria)
```
Use museumsvic_get_specimen with ID from search results
```

### Bulk Download Research Results
```
Use prov_harvest, trove_harvest, datagovau_harvest, or museumsvic_harvest
```

---

## Documentation Hierarchy

1. **This file (CLAUDE.md)** - Overview and quick start
2. **`docs/quickrefs/tools-reference.md`** - Complete tool parameters
3. **`docs/quickrefs/prov-api.md`** - PROV API details and tips
4. **`docs/quickrefs/trove-api.md`** - Trove API details and tips
5. **`docs/quickrefs/datagovau-api.md`** - data.gov.au CKAN API details
6. **`docs/quickrefs/museums-victoria-api.md`** - Museums Victoria API details
7. **`README.md`** - Public documentation for npm

---

## MCP Configuration

**Location:** Root `claude-code-tools/` only (lean profile)

**Fragment:** `mcp/profiles/fragments/australian-archives.json`

```json
{
  "command": "bash",
  "args": [
    "-c",
    "source ~/bin/kc.sh && export TROVE_API_KEY=$(kc_get trove-api-key 2>/dev/null || echo '') && exec node /Users/nathanschram/claude-code-tools/lba/apps/mcp-servers/australian-archives-mcp/dist/index.js"
  ]
}
```

---

## Licensing Notes

- **PROV:** CC-BY-NC license (non-commercial use)
- **Trove:** Terms vary by content contributor; check individual items
- **data.gov.au:** Mostly CC-BY licensed; check individual datasets
- **Museums Victoria:** CC-BY 4.0 (most records), Public Domain (some)
- **This MCP Server:** MIT license

---

## Development

### Adding a New Source

1. Create `src/sources/[name]/` directory
2. Create `types.ts` with source-specific types
3. Create `client.ts` extending BaseClient
4. Create `tools/` directory with tool files
5. Create `index.ts` using `defineSource()`
6. Import and register in `src/index.ts`
7. Run `npm run build`

### Adding a New Tool to Existing Source

1. Create tool file in `src/sources/[source]/tools/`
2. Export tool using `SourceTool` interface
3. Add to source's `tools` array in `index.ts`
4. Run `npm run build`

### Testing Changes

```bash
# Build and test with echo
npm run build
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

---

## Known Quirks

- **PROV API field names:** Uses hyphens (`iiif-manifest`) and dot notation (`is_part_of_series.title`)
- **Trove rate limit:** 200 calls/minute - harvest tool handles pagination automatically
- **Multi-word queries:** PROV requires phrase wrapping for multi-word searches (handled automatically)
- **data.gov.au URL:** The API base URL is `https://data.gov.au/data/api/3/action/` (note the `/data/` prefix)
- **Datastore availability:** Only some data.gov.au resources have datastore enabled for direct querying
- **Museums Victoria pagination:** Uses Link header; harvest tool handles automatically
- **Museums Victoria IDs:** Record IDs are type-prefixed (e.g., `articles/12345`, `items/67890`)

---

**Token Count:** ~600 tokens
