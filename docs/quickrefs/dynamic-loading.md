# Dynamic Tool Loading Guide

**Last Updated:** 2025-12-27

This guide explains the dynamic tool loading architecture introduced in v0.7.0.

---

## Overview

The Australian History MCP Server uses **dynamic tool loading** by default. Instead of exposing all 76 data tools upfront (which consumes ~12,500 tokens), it exposes only 10 meta-tools (~1,100 tokens).

**Token reduction: 93%**

---

## Meta-Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `tools` | Discover available data tools | `tools(query="newspaper")` |
| `schema` | Get full input schema for a tool | `schema(tool="trove_search")` |
| `run` | Execute any data tool | `run(tool="trove_search", args={...})` |
| `search` | Federated search across sources | `search(query="Melbourne 1920s")` |
| `open` | Open URL in browser | `open(url="https://...")` |
| `export` | Export records to file | `export(records=[...], format="csv")` |
| `save_query` | Save a named query | `save_query(name="vic-floods", ...)` |
| `list_queries` | List saved queries | `list_queries()` |
| `run_query` | Execute a saved query | `run_query(name="vic-floods")` |
| `delete_query` | Remove a saved query | `delete_query(name="vic-floods")` |

---

## Workflow: tools() → schema() → run()

### Step 1: Discover Tools

```
tools(query="newspaper")
```

Returns matching tools:
```json
{
  "matchingTools": 5,
  "tools": [
    {"name": "trove_search", "source": "Trove", "category": "search"},
    {"name": "trove_harvest", "source": "Trove", "category": "harvest"},
    {"name": "trove_newspaper_article", "source": "Trove", "category": "get"}
  ]
}
```

### Step 2: Get Schema

```
schema(tool="trove_search")
```

Returns full input schema:
```json
{
  "tool": "trove_search",
  "source": "Trove",
  "inputSchema": {
    "properties": {
      "query": {"type": "string", "description": "Search terms"},
      "category": {"type": "string", "enum": ["all", "newspaper", ...]},
      "dateFrom": {"type": "string", "description": "Start date (YYYY)"},
      "dateTo": {"type": "string", "description": "End date (YYYY)"},
      "state": {"type": "string", "enum": ["vic", "nsw", ...]},
      "limit": {"type": "number", "default": 20}
    }
  }
}
```

### Step 3: Execute Tool

```
run(tool="trove_search", args={
  "query": "Melbourne flood",
  "category": "newspaper",
  "dateFrom": "1930",
  "dateTo": "1939",
  "state": "vic"
})
```

Returns search results.

---

## Discovery Options

### By Keyword

```
tools(query="heritage")
→ vhd_search_places, vhd_get_place, vhd_harvest, ...
```

### By Source

```
tools(source="prov")
→ prov_search, prov_harvest, prov_get_images, prov_get_agency, prov_get_series
```

### By Category

```
tools(category="harvest")
→ All harvest tools across all sources
```

### Combined Filters

```
tools(source="trove", category="get")
→ trove_newspaper_article, trove_get_work, trove_get_person, ...
```

---

## Federated Search

The `search()` meta-tool searches multiple sources in parallel with a single call.

### Basic Usage

```
search(query="Melbourne photos 1920s", limit=5)
```

Returns aggregated results from auto-selected sources:
```json
{
  "query": "Melbourne photos 1920s",
  "sourcesSearched": ["prov", "trove", "nma", "museumsvic"],
  "totalResults": 47,
  "results": [
    {"source": "prov", "sourceDisplay": "Public Record Office Victoria", "count": 15, "records": [...]},
    {"source": "trove", "sourceDisplay": "Trove (National Library)", "count": 22, "records": [...]}
  ],
  "errors": [],
  "_timing": {"total_ms": 1234, "sources": {"prov": 450, "trove": 890}}
}
```

### Explicit Source Selection

```
search(query="railway", sources=["prov", "nma"], limit=3)
```

### Content Type Filter

```
search(query="gold rush", type="image", limit=5)
```

Valid types: `image`, `newspaper`, `document`, `species`, `heritage`, `film`

### Date and State Filters

```
search(query="flood", dateFrom="1900", dateTo="1950", state="vic", limit=10)
```

### Error Handling

Federated search continues even if some sources fail:
```json
{
  "sourcesSearched": ["prov", "nma"],
  "results": [...],
  "errors": [
    {"source": "trove", "error": "Skipped: TROVE_API_KEY not configured"}
  ]
}
```

### Source Keywords (Auto-Select)

| Source | Trigger Keywords |
|--------|------------------|
| PROV | victoria, archives, government, council, colonial |
| Trove | newspaper, article, gazette, book, magazine |
| Museums Victoria | museum, specimen, artefact, natural history |
| ALA | species, wildlife, animal, plant, biodiversity |
| NMA | museum, national, artefact, indigenous, aboriginal |
| VHD | heritage, building, architecture, historic, site |
| ACMI | film, movie, television, videogame, digital |
| GHAP | placename, location, coordinates, geography |
| GA HAP | aerial, photograph, geoscience, aviation |

**Not included:** PM Transcripts (no search), IIIF (requires explicit manifest URL)

---

## Caching Hints

Meta-tools include caching hints in responses:

```json
{
  "_cache": {
    "hint": "Schema is stable - cache for session",
    "key": "schema:trove_search",
    "ttl": "session"
  }
}
```

**Recommendation:** Cache `tools()` and `schema()` results for the session to avoid repeated lookups.

---

## Mode Switching

### Dynamic Mode (Default)

10 meta-tools exposed. Use `tools() → schema() → run()` or `search()` workflow.

### Legacy Mode

All 76 data tools exposed directly. Set `MCP_MODE=legacy`:

```json
{
  "australian-history": {
    "command": "npx",
    "args": ["-y", "@littlebearapps/australian-history-mcp"],
    "env": {
      "TROVE_API_KEY": "your-key",
      "MCP_MODE": "legacy"
    }
  }
}
```

---

## Tool Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `search` | Search/query data | `trove_search`, `prov_search` |
| `get` | Get single record by ID | `trove_get_work`, `nma_get_object` |
| `list` | List available items | `trove_list_titles`, `vhd_list_municipalities` |
| `harvest` | Bulk download with pagination | `trove_harvest`, `prov_harvest` |

---

## Data Sources Available

| Source | Tools | API Key |
|--------|-------|---------|
| PROV | 6 | None |
| Trove | 14 | Required |
| GHAP | 5 | None |
| Museums Victoria | 6 | None |
| ALA | 8 | None |
| NMA | 10 | None |
| VHD | 9 | None |
| ACMI | 8 | None |
| PM Transcripts | 5 | None |
| IIIF | 2 | None |
| GA HAP | 3 | None |
| **Total** | **76** | |

---

## Example Session

```
# User: "Find historical photos of Melbourne from the 1950s"

# AI discovers relevant tools
tools(query="photos")
→ prov_search, ga_hap_search, ala_search_images, museumsvic_search

# AI gets schema for best match
schema(tool="ga_hap_search")
→ {state, yearFrom, yearTo, bbox, scannedOnly, ...}

# AI executes search
run(tool="ga_hap_search", args={
  "state": "VIC",
  "yearFrom": 1950,
  "yearTo": 1959,
  "scannedOnly": true,
  "limit": 20
})
→ Returns 20 aerial photos with preview URLs

# User: "Export these to a CSV"
export(records=<results>, format="csv", path="/tmp/melbourne-1950s.csv")
→ Saved to /tmp/melbourne-1950s.csv
```

---

## Backwards Compatibility

Direct tool calls still work in dynamic mode as a fallback:

```
prov_search(query="railway", limit=5)
```

This bypasses the meta-tool workflow but is supported for compatibility.
