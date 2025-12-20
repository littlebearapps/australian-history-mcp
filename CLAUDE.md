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

**Target Content:**
- Historical photographs and maps
- Old newspaper articles
- Government meeting minutes
- Council records
- State and federal government archives

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

| Tool | Source | API Key | Purpose |
|------|--------|---------|---------|
| `prov_search` | PROV | None | Search Victorian state archives |
| `prov_harvest` | PROV | None | Bulk download PROV records |
| `trove_search` | Trove | Required | Search newspapers, images, books |
| `trove_newspaper_article` | Trove | Required | Get full newspaper article text |
| `trove_list_titles` | Trove | Required | List newspaper/gazette titles |
| `trove_title_details` | Trove | Required | Get title info with issue dates |
| `trove_harvest` | Trove | Required | Bulk download Trove records |

**See:** `docs/quickrefs/tools-reference.md` for complete parameter documentation

---

## API Key Setup

### PROV (No Key Required)
PROV tools work immediately with no configuration.

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
| `src/index.ts` | MCP server entry point |
| `src/types.ts` | TypeScript type definitions |
| `src/clients/prov_client.ts` | PROV API client (Solr-based) |
| `src/clients/trove_client.ts` | Trove API v3 client |
| `src/tools/prov_search.ts` | PROV search tool |
| `src/tools/trove_search.ts` | Trove search tool |
| `src/tools/trove_newspaper.ts` | Newspaper article/title tools |
| `src/tools/harvest.ts` | Bulk harvest tools (both sources) |
| `docs/quickrefs/` | Quick reference documentation |
| `dist/` | Compiled JavaScript output |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Claude Code Session                     │
└────────────────────────┬────────────────────────────────┘
                         │ stdio
┌────────────────────────▼────────────────────────────────┐
│            Australian Archives MCP Server                │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │   PROV Client   │    │   Trove Client  │            │
│  │   (no auth)     │    │   (API key)     │            │
│  └────────┬────────┘    └────────┬────────┘            │
└───────────┼──────────────────────┼──────────────────────┘
            │                      │
┌───────────▼──────────┐  ┌────────▼─────────────────────┐
│   PROV Solr API      │  │      Trove API v3            │
│   api.prov.vic.gov.au│  │   api.trove.nla.gov.au       │
│   (CC-BY-NC license) │  │   (200 calls/min limit)      │
└──────────────────────┘  └──────────────────────────────┘
```

---

## Common Use Cases

### Find Digitised Railway Photographs
```
Use prov_search with query "railway" and digitisedOnly=true
```

### Search Victorian Council Minutes
```
Use prov_search with query "council meeting" and series "VPRS 3183"
```

### Find 1930s Newspaper Articles
```
Use trove_search with query "Melbourne flood", category "newspaper",
dateFrom "1930", dateTo "1939", state "vic"
```

### Bulk Download Research Results
```
Use prov_harvest or trove_harvest with maxRecords parameter
```

---

## Documentation Hierarchy

1. **This file (CLAUDE.md)** - Overview and quick start
2. **`docs/quickrefs/tools-reference.md`** - Complete tool parameters
3. **`docs/quickrefs/prov-api.md`** - PROV API details and tips
4. **`docs/quickrefs/trove-api.md`** - Trove API details and tips
5. **`README.md`** - Public documentation for npm

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

---

**Token Count:** ~350 tokens
