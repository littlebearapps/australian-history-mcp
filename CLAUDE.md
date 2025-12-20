# CLAUDE.md - Australian Archives MCP Server

**Language:** Australian English
**Last Updated:** 2025-12-20
**Version:** 0.1.0

---

## Quick Facts

**Project:** Australian Archives MCP Server
**Package:** `@littlebearapps/australian-archives-mcp`
**Purpose:** Programmatic search and batch harvesting of Australian historical archives

**Data Sources:**
- **PROV** (Public Record Office Victoria) - Victorian state government archives (no API key)
- **Trove** (National Library of Australia) - Federal digitised collections (requires API key)
- **data.gov.au** (CKAN) - Australian government open data portal (no API key)

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

### PROV Tools (2)
| Tool | API Key | Purpose |
|------|---------|---------|
| `prov_search` | None | Search Victorian state archives |
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

**See:** `docs/quickrefs/` for complete parameter documentation

---

## API Key Setup

### PROV (No Key Required)
PROV tools work immediately with no configuration.

### data.gov.au (No Key Required)
data.gov.au tools work immediately with no configuration.

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

| Path | Description |
|:--|:--|
| `src/index.ts` | MCP server entry point (17 tools registered) |
| `src/types.ts` | TypeScript type definitions |
| `src/clients/prov_client.ts` | PROV API client (Solr-based) |
| `src/clients/trove_client.ts` | Trove API v3 client |
| `src/clients/datagovau_client.ts` | data.gov.au CKAN API client |
| `src/tools/prov_search.ts` | PROV search tool |
| `src/tools/trove_search.ts` | Trove search tool |
| `src/tools/trove_newspaper.ts` | Newspaper article/title tools |
| `src/tools/datagovau_search.ts` | data.gov.au search tool |
| `src/tools/datagovau_dataset.ts` | Dataset/resource tools |
| `src/tools/datagovau_browse.ts` | Organisation/group/tag tools |
| `src/tools/harvest.ts` | Bulk harvest tools (all 3 sources) |
| `docs/quickrefs/` | Quick reference documentation |
| `dist/` | Compiled JavaScript output |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                     Claude Code Session                            │
└──────────────────────────────┬────────────────────────────────────┘
                               │ stdio
┌──────────────────────────────▼────────────────────────────────────┐
│               Australian Archives MCP Server (17 tools)           │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────────┐        │
│  │ PROV Client │    │Trove Client │    │data.gov.au CLI │        │
│  │  (no auth)  │    │  (API key)  │    │   (no auth)    │        │
│  └──────┬──────┘    └──────┬──────┘    └───────┬────────┘        │
└─────────┼──────────────────┼───────────────────┼─────────────────┘
          │                  │                   │
┌─────────▼──────┐  ┌────────▼────────┐  ┌───────▼────────────────┐
│  PROV Solr API │  │  Trove API v3   │  │   CKAN API (data.gov)  │
│  (CC-BY-NC)    │  │ (200 calls/min) │  │  data.gov.au/data/api  │
└────────────────┘  └─────────────────┘  └────────────────────────┘
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

### Bulk Download Research Results
```
Use prov_harvest, trove_harvest, or datagovau_harvest with maxRecords parameter
```

---

## Documentation Hierarchy

1. **This file (CLAUDE.md)** - Overview and quick start
2. **`docs/quickrefs/tools-reference.md`** - Complete tool parameters
3. **`docs/quickrefs/prov-api.md`** - PROV API details and tips
4. **`docs/quickrefs/trove-api.md`** - Trove API details and tips
5. **`docs/quickrefs/datagovau-api.md`** - data.gov.au CKAN API details
6. **`README.md`** - Public documentation for npm

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
- **This MCP Server:** MIT license

---

## Development

### Adding New Tools

1. Create tool file in `src/tools/`
2. Export schema and executor function
3. Import in `src/index.ts`
4. Add to `tools` array and switch statement
5. Run `npm run build`

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

---

**Token Count:** ~500 tokens
