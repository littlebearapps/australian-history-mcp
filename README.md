# Australian History MCP Server

[![npm version](https://img.shields.io/npm/v/@littlebearapps/australian-history-mcp?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@littlebearapps/australian-history-mcp)
[![Downloads](https://img.shields.io/npm/dm/@littlebearapps/australian-history-mcp?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@littlebearapps/australian-history-mcp)
[![CI](https://img.shields.io/github/actions/workflow/status/littlebearapps/australian-history-mcp/ci.yml?branch=main&label=CI&style=for-the-badge&logo=github&logoColor=white)](https://github.com/littlebearapps/australian-history-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

_Last updated: December 2025_

Search Australian archives the easy way. Ask your AI to find newspapers from 1803, aerial photos from 1928, species records, heritage buildings, or government datasets - no manual searching required.

## What You Can Ask Your AI to Search For

Instead of navigating 11 different archive websites, just ask your AI:

- *"Find newspaper articles about the 1939 bushfires in Victoria"*
- *"Show me historical aerial photos of Melbourne from the 1950s"*
- *"What heritage buildings are in Carlton?"*
- *"Get species sightings of platypus in Tasmania since 2020"*
- *"Find Prime Ministerial speeches mentioning 'economic reform'"* (uses FTS5 full-text search)
- *"Search for gold rush artefacts in the National Museum"*
- *"Find historical placenames within 50km of Ballarat"* (uses point+radius)
- *"What films are related to Mad Max?"* (uses related records)
- *"Save this search so I can run it again later"* (uses saved queries)
- *"Plan a research strategy for the Melbourne Olympics 1956"* (uses research planning)
- *"Start a session to track my research on early Melbourne"* (uses session management)
- *"Compress these results to save context"* (uses context compression)

Your AI handles the API calls, pagination, and formatting - you just ask questions in plain English.

### New in v1.0.0: Research Workflow Tools

- **Research Planning** - Analyse topics, generate search strategies, identify historical name variations
- **Session Management** - Track queries, avoid duplicates, resume after context resets
- **Context Compression** - Reduce accumulated results by 70-85% to stay within token limits
- **Checkpoints** - Save/restore research progress for long investigations

## Quick Start

Run directly with npx - no installation required:

```bash
npx @littlebearapps/australian-history-mcp
```

That's it! 10 of 11 data sources work immediately with no API key. Only [Trove](#trove-api-key---why--how-to-apply) requires a free API key.

→ **Next:** Add to your MCP client via [Configuration](#add-this-mcp-to-your-ai-agent)

## Table of Contents

- [What You Can Ask Your AI to Search For](#what-you-can-ask-your-ai-to-search-for)
- [Quick Start](#quick-start)
- [Data Sources - What You Can Find](#data-sources---what-you-can-find)
- [Trove API Key - Why & How to Apply](#trove-api-key---why--how-to-apply)
- [Important Notice - Third-Party Data Sources](#important-notice---third-party-data-sources)
- [Add this MCP to Your AI Agent](#add-this-mcp-to-your-ai-agent)
- [How It Works](#how-it-works)
- [Data Sources - Tools & Examples](#data-sources---tools--examples)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Rate Limits](#rate-limits)
- [Licensing Notes](#licensing-notes)
- [Resources](#resources)
- [Contributing](#contributing)
- [License](#license)

## Data Sources - What You Can Find

> [!IMPORTANT]
> Most sources work immediately with no registration. Only Trove requires a [free API key](#trove-api-key---why--how-to-apply).

| Source | Content |
|--------|---------|
| 🏛️ **Public Record Office Victoria (PROV)** | Victorian state archives: photos, maps, council records, court files, immigration |
| 📰 [***Trove (National Library of Australia)****](#trove-api-key---why--how-to-apply) | **1,500+ partner collections**: newspapers 1803-1954+, gazettes, books, images, magazines, diaries. [See all partner collections →](#extra-data-sources-available-via-trove-api-key) |
| 📍 **Gazetteer of Historical Australian Placenames (GHAP)** | 330,000+ historical placenames with coordinates from ANPS and community datasets via TLCMap |
| 🦘 **Museums Victoria** | Museum objects, natural specimens, species info, educational articles |
| 🌿 **Atlas of Living Australia (ALA)** | 165M+ records including historical museum specimens (1800s-1900s), contemporary citizen science, 153,000+ species profiles |
| 🏛️ **National Museum of Australia (NMA)** | 85,000+ museum objects, people, organisations, places, media |
| 🏚️ **Victorian Heritage Database (VHD)** | 12,000+ heritage places, 700+ shipwrecks, architectural styles |
| 🎬 **Australian Centre for the Moving Image (ACMI)** | 42,000+ films, TV, videogames, digital art, creator info |
| 🎤 **PM Transcripts** | 26,000+ Prime Ministerial speeches, media releases, interviews |
| 🖼️ **IIIF** | Generic manifest/image tools for any IIIF-compliant institution |
| ✈️ **Geoscience Australia Historical Aerial Photography (GA HAP)** | 1.2M+ historical aerial photos (1928-1996), all states/territories |

> **Want another data source added?** [Share your idea in Discussions](https://github.com/littlebearapps/australian-history-mcp/discussions/categories/ideas)

## Trove API Key - Why & How to Apply

Trove is Australia's largest digital research portal, aggregating content from **1,500+ partner organisations** including state libraries, the National Archives, Australian War Memorial, universities, museums, and research institutions. A free API key unlocks access to all of this.

### Extra Data Sources Available via Trove API Key

With just one API key, you gain access to collections from:

| Category | Notable Partners | What You Can Find |
|----------|-----------------|-------------------|
| 📚 **State Libraries** | State Library Victoria, State Library NSW, State Library Queensland, and all other state/territory libraries | Historical photographs, manuscripts, maps, local history, family history records |
| 🏛️ **National Archives** | National Archives of Australia | Immigration records, military service files, government photographs, policy files |
| ⚔️ **War Memorial** | Australian War Memorial | WWI & WWII photographs, unit diaries, service records, military art |
| 🎓 **Universities** | ANU, Melbourne, Sydney, Monash, UNSW, and 30+ other universities | Research papers, theses, academic journals, institutional archives |
| 🖼️ **Museums** | National Gallery, Powerhouse, Australian Museum, state museums | Art collections, object documentation, scientific specimens |
| 🔬 **Research** | CSIRO, AIATSIS, NFSA | Scientific publications, Indigenous collections, film & sound archives |
| ⚖️ **Government** | High Court, Federal Court, Parliament | Legal judgments, parliamentary papers, government publications |
| 📰 **Newspapers** | NLA Digitised (1803-1954+) | 35 million+ newspaper articles with full-text search and OCR |

> **One key, 1,500+ collections** - Instead of registering with dozens of institutions individually, Trove aggregates them all. Use the `nuc` parameter to filter by specific partners (e.g., `nuc: "AWM"` for War Memorial, `nuc: "VSL"` for State Library Victoria).

### How to Apply

> [!IMPORTANT]
> Before applying, review the [Trove API Terms of Use](https://trove.nla.gov.au/about/create-something/using-api/trove-api-terms-use) to understand the requirements and ensure your intended use is eligible.

1. Apply at: https://trove.nla.gov.au/about/create-something/using-api
2. Select "Level 1" (personal/research use)
3. Approval typically within 1 week
4. Add `TROVE_API_KEY` to your MCP configuration (see [Configuration](#add-this-mcp-to-your-ai-agent) below)

## Important Notice - Third-Party Data Sources

> [!CAUTION]
> This MCP server provides programmatic access to **third-party public APIs** that we do not own or control.

**Please be aware:**

- **Terms may change**: Each data source has its own terms of use and API policies that may change at any time without notice.
- **Access may change**: API endpoints, rate limits, data availability, or access requirements could be modified or discontinued by the source providers.
- **User responsibility**: You are responsible for reviewing and complying with each data source's terms of use, licensing requirements, and acceptable use policies.
- **No warranty**: We make no guarantees about the availability, accuracy, or completeness of data from these sources.

**Review the terms of use for each data source you access:**

| Source | Terms of Use |
|--------|--------------|
| PROV | [Copyright Statement](https://prov.vic.gov.au/copyright-statement) |
| Trove | [API Terms of Use](https://trove.nla.gov.au/about/create-something/using-api/trove-api-terms-use) |
| GHAP/TLCMap | [Terms of Use](https://tlcmap.org/help/terms-of-use) |
| Museums Victoria | [Legals](https://museumsvictoria.com.au/legals) |
| ALA | [Terms of Use](https://www.ala.org.au/terms-of-use/) |
| NMA | [Conditions of Use](https://www.nma.gov.au/about/contact-us/conditions-of-use) |
| VHD | [Disclaimer](https://www.heritagecouncil.vic.gov.au/disclaimer) |
| ACMI | [Terms & Conditions](https://www.acmi.net.au/about/terms-conditions) |
| PM Transcripts | [Disclaimer](https://pmtranscripts.pmc.gov.au/disclaimer) |
| GA (HAP) | [Copyright](https://www.ga.gov.au/copyright) |
| IIIF | Varies by institution - check manifest attribution |

## Add this MCP to Your AI Agent

Copy the configuration for your preferred AI client:

### Claude Desktop

> [!NOTE]
> Works on **all plans including Free**. This MCP runs locally via `npx`, so no paid subscription is required.

Add to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "australian-history": {
      "command": "npx",
      "args": ["-y", "@littlebearapps/australian-history-mcp"],
      "env": {
        "TROVE_API_KEY": "your-trove-api-key"
      }
    }
  }
}
```

Restart Claude Desktop after saving the file.

### Claude Code

**Option 1 - CLI command (recommended):**

```bash
claude mcp add australian-history -- npx -y @littlebearapps/australian-history-mcp
```

To include the Trove API key:

```bash
claude mcp add australian-history -e TROVE_API_KEY=your-trove-api-key -- npx -y @littlebearapps/australian-history-mcp
```

**Option 2 - Config file:**

Add to `.mcp.json` in your project directory:

```json
{
  "mcpServers": {
    "australian-history": {
      "command": "npx",
      "args": ["-y", "@littlebearapps/australian-history-mcp"],
      "env": {
        "TROVE_API_KEY": "your-trove-api-key"
      }
    }
  }
}
```

### Cursor

Add to Cursor Settings → MCP → Add Server, or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "australian-history": {
      "command": "npx",
      "args": ["-y", "@littlebearapps/australian-history-mcp"],
      "env": {
        "TROVE_API_KEY": "your-trove-api-key"
      }
    }
  }
}
```

### Codex CLI

Add to your `~/.codex/config.toml`:

```toml
[mcp_servers.australian-history]
command = "npx"
args = ["-y", "@littlebearapps/australian-history-mcp"]
env = { "TROVE_API_KEY" = "your-trove-api-key" }
```

### Gemini CLI

Add to your `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "australian-history": {
      "command": "npx",
      "args": ["-y", "@littlebearapps/australian-history-mcp"],
      "env": {
        "TROVE_API_KEY": "your-trove-api-key"
      }
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json` or user MCP configuration:

```json
{
  "servers": {
    "australian-history": {
      "command": "npx",
      "args": ["-y", "@littlebearapps/australian-history-mcp"],
      "env": {
        "TROVE_API_KEY": "your-trove-api-key"
      }
    }
  }
}
```

## How It Works

This server uses **dynamic tool loading** - instead of exposing all 75 data tools upfront, it presents just 22 meta-tools organised by function:

### Core Tools (10)
| Meta-Tool | Purpose |
|-----------|---------|
| `tools` | Discover available data tools by keyword, source, or category |
| `schema` | Get full parameters for a specific tool |
| `run` | Execute any data tool by name |
| `search` | Search across multiple sources at once |
| `open` | Open URLs in your browser |
| `export` | Export results to CSV, JSON, or Markdown |
| `save_query` | Save a named query for later reuse |
| `list_queries` | List saved queries with filtering options |
| `run_query` | Execute a saved query with optional overrides |
| `delete_query` | Remove a saved query by name |

### Research Planning Tools (1)
| Meta-Tool | Purpose |
|-----------|---------|
| `plan_search` | Analyse topic, generate search strategy, create plan.md |

### Session Management Tools (7)
| Meta-Tool | Purpose |
|-----------|---------|
| `session_start` | Start a named research session |
| `session_status` | Get current progress and coverage gaps |
| `session_end` | End session with final report |
| `session_resume` | Resume a paused or previous session |
| `session_list` | List all sessions with optional filters |
| `session_export` | Export session data (JSON, Markdown, CSV) |
| `session_note` | Add notes to current session |

### Context Compression Tools (4)
| Meta-Tool | Purpose |
|-----------|---------|
| `compress` | Reduce records to essential fields (70-85% token savings) |
| `urls` | Extract only URLs from records |
| `dedupe` | Remove duplicate records using URL and title matching |
| `checkpoint` | Save/load/list/delete research checkpoints |

**Why?** This reduces token usage by 86% (~1,600 vs ~11,909 tokens), making your AI more efficient. Your AI discovers what tools are available, loads parameters only when needed, and executes searches on your behalf.

### Token Efficiency for Long Research Sessions

When researching a topic across multiple searches, results accumulate and consume context. The compression tools help manage this:

| Compression Level | Tokens per Record | Use Case |
|-------------------|-------------------|----------|
| `minimal` | ~20 | Just IDs and URLs for bookmarking |
| `standard` | ~50 | Title, year, source for review |
| `full` | ~80 | All metadata except descriptions |

**Example workflow:**
```
# Plan your research
plan_search(topic="Melbourne Olympics 1956")

# Start tracking session
session_start(name="olympics-research", topic="...")

# Searches are automatically logged
search(query="Melbourne Olympics", sources=["trove", "prov"])

# Compress results to save context (70-85% reduction)
compress(records=results, level="standard")

# End session with summary
session_end()
```

> 💡 **For backwards compatibility:** Set `MCP_MODE=legacy` to expose all 75 tools directly.

## Data Sources - Tools & Examples

<details open>
<summary><h3>Public Record Office Victoria (PROV)</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `prov_search` | Search Victorian state archives with category filter (Agency, Series, Item, etc.) |
| `prov_get_images` | Extract image URLs from a PROV digitised record via IIIF manifest |
| `prov_harvest` | Bulk download PROV records with pagination |
| `prov_get_agency` | Get agency details by VA number |
| `prov_get_series` | Get series details by VPRS number |
| `prov_get_items` | Get items within a series by VPRS number |

**Examples:**
```
# Research: Find digitised historical railway photographs
prov_search with query: "railway", digitisedOnly: true, limit: 50

# Research: Search council meeting minutes from early 1900s
prov_search with query: "council meeting", dateFrom: "1900", dateTo: "1920"

# Technical: Extract all images from a digitised record
prov_get_images with manifestUrl: "<manifest-url-from-search>", size: "full"
```

</details>

<details>
<summary><h3>Trove (National Library of Australia)*</h3></summary>

> **⚠️ API Key Required**: Trove tools require a free API key. [Apply for your key](#trove-api-key---how-to-apply) before using these tools.

**Tools:**

| Tool | Description |
|------|-------------|
| `trove_search` | Search Trove with sortby, filters, holdings for newspapers, gazettes, images, books |
| `trove_newspaper_article` | Get full article details including OCR text and PDF link |
| `trove_list_titles` | List available newspaper or gazette titles by state |
| `trove_title_details` | Get title details with available years and issue counts |
| `trove_harvest` | Bulk download Trove records with cursor-based pagination |
| `trove_get_contributor` | Get contributor details by NUC code |
| `trove_list_contributors` | List/search all 1500+ contributing libraries |
| `trove_list_magazine_titles` | List available magazine titles |
| `trove_get_magazine_title` | Get magazine title details with years/issues |
| `trove_get_work` | Get book/image/map/music details by ID (with holdings, links, versions) |
| `trove_get_versions` | Get all versions of a work with holdings information |
| `trove_get_person` | Get person/organisation biographical data |
| `trove_get_list` | Get user-curated research list by ID |
| `trove_search_people` | Search people and organisations |

**Examples:**
```
# Research: Find 1930s newspaper articles about Melbourne floods
trove_search with query: "Melbourne flood", category: "newspaper",
  dateFrom: "1930", dateTo: "1939", state: "vic"

# Research: Search State Library Victoria collections only
trove_search with query: "gold rush", category: "image", nuc: "VSL"

# Technical: Sort results by date (oldest first) with full text
trove_search with query: "bushrangers", sortby: "dateasc",
  includeFullText: true, limit: 100
```

**Partner Collections Available via Trove:**

Trove aggregates content from **1,500+ partner organisations** across Australia. Use the `nuc` parameter to filter by contributing institution:

| Partner Type | Example NUC Codes | Content |
|--------------|-------------------|---------|
| **State Libraries** | `VSL`, `SLNSW`, `QSL`, `SLSA`, `SLWA`, `TLIB` | Photographs, manuscripts, maps, local history |
| **National Archives** | `NAA` | Government records, immigration files, photographs |
| **War Memorial** | `AWM` | Military history, photographs, unit records |
| **Universities** | `ANU`, `UMEL`, `UNSW`, `USYD`, `UQ` + `:IR` suffix for repositories | Research papers, theses, academic collections |
| **Museums** | `NMA`, `NGA`, `NGV`, `MAAS`, `AM`, `MV` | Objects, art collections, documentation |
| **Research** | `CSIRO`, `AIATSIS`, `NFSA` | Scientific publications, Indigenous collections, film/sound |

```
# Search State Library Victoria photographs
trove_search with query: "Melbourne", category: "image", nuc: "VSL"

# Search War Memorial collections
trove_search with query: "Gallipoli", nuc: "AWM"

# Browse all contributing libraries
trove_list_contributors with query: "university"

# See which partners have content for your search
trove_search with query: "gold rush", includeFacets: true,
  facetFields: ["partnerNuc"]
```

> **Note:** NUC filtering works for `image`, `book`, `magazine`, `research`, `diary`, `music` categories. Newspaper/gazette content is NLA-digitised without per-article NUC data. See [docs/quickrefs/trove-partners.md](docs/quickrefs/trove-partners.md) for the complete partner guide.

</details>

<details>
<summary><h3>Gazetteer of Historical Australian Placenames (GHAP)</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `ghap_search` | Search historical placenames by name, state, LGA, bounding box, or point+radius |
| `ghap_get_place` | Get place details by TLCMap ID |
| `ghap_list_layers` | List all available community data layers |
| `ghap_get_layer` | Get all places from a specific data layer |
| `ghap_harvest` | Bulk download placename records with filters |

**Examples:**
```
# Research: Find historical places named "Melbourne"
ghap_search with query: "Melbourne", state: "VIC"

# Research: Search for placenames in a specific Local Government Area
ghap_search with query: "creek", lga: "Yarra"

# Technical: Get all places from a community-contributed layer
ghap_get_layer with layerId: 123
```

</details>

<details>
<summary><h3>Museums Victoria</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `museumsvic_search` | Search Museums Victoria with random sort option for discovery |
| `museumsvic_get_article` | Get an educational article by ID |
| `museumsvic_get_item` | Get a museum object (photograph, artefact, technology) by ID |
| `museumsvic_get_species` | Get species info (taxonomy, biology, habitat, distribution) by ID |
| `museumsvic_get_specimen` | Get a natural science specimen with taxonomy and collection info |
| `museumsvic_harvest` | Bulk download Museums Victoria records with pagination |

**Examples:**
```
# Research: Find platypus species information
museumsvic_search with query: "platypus", recordType: "species"

# Research: Search gold rush era museum objects
museumsvic_search with query: "gold rush", category: "history & technology"

# Technical: Discover random specimens with images
museumsvic_search with recordType: "specimen", hasImages: true, random: true
```

</details>

<details>
<summary><h3>Atlas of Living Australia (ALA)</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `ala_search_occurrences` | Search species occurrence records by taxon, location, date, or point+radius |
| `ala_search_species` | Search species by common or scientific name |
| `ala_get_species` | Get species profile with taxonomy, images, distribution |
| `ala_harvest` | Bulk download occurrence records with pagination |
| `ala_search_images` | Search images by keyword, taxon, or species |
| `ala_match_name` | Resolve taxonomic names to classification |
| `ala_list_species_lists` | List user-curated species lists |
| `ala_get_species_list` | Get species list details by druid |

**Examples:**
```
# Research: Find koala sightings in Victoria since 2020
ala_search_occurrences with scientificName: "Phascolarctos cinereus",
  stateProvince: "Victoria", startYear: 2020

# Research: Get detailed species profile with images
ala_get_species with guid: "<species-guid-from-search>"

# Technical: Search images of eucalyptus species
ala_search_images with query: "Eucalyptus", limit: 50
```

</details>

<details>
<summary><h3>National Museum of Australia (NMA)</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `nma_search_objects` | Search museum collection objects by keyword, type, date |
| `nma_get_object` | Get detailed object record with media |
| `nma_search_places` | Search places of significance in the collection |
| `nma_harvest` | Bulk download collection records with pagination |
| `nma_get_place` | Get place details by ID |
| `nma_search_parties` | Search people and organisations |
| `nma_get_party` | Get party (person/org) details by ID |
| `nma_search_media` | Search images, video, and sound |
| `nma_get_media` | Get media details by ID |
| `nma_get_related` | Get related objects, parties, and places for a record |

**Examples:**
```
# Research: Find boomerang artefacts in the collection
nma_search_objects with query: "boomerang", limit: 20

# Research: Search for historical photographs
nma_search_objects with query: "convict", type: "Photographs"

# Technical: Find people and organisations related to exploration
nma_search_parties with query: "explorer", limit: 30
```

</details>

<details>
<summary><h3>Victorian Heritage Database (VHD)</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `vhd_search_places` | Search Victorian heritage places by name, location, style |
| `vhd_get_place` | Get detailed heritage place info with images |
| `vhd_search_shipwrecks` | Search Victorian shipwrecks along the coast |
| `vhd_harvest` | Bulk download heritage records with pagination |
| `vhd_get_shipwreck` | Get shipwreck details by ID |
| `vhd_list_municipalities` | List all Victorian municipalities |
| `vhd_list_architectural_styles` | List architectural style classifications |
| `vhd_list_themes` | List heritage themes (history, economics, etc.) |
| `vhd_list_periods` | List historical periods |

**Examples:**
```
# Research: Find Victorian-era heritage buildings in Melbourne CBD
vhd_search_places with query: "bank", municipality: "MELBOURNE CITY",
  architecturalStyle: "Victorian Period (1851-1901)"

# Research: Search shipwrecks along the Victorian coast
vhd_search_shipwrecks with query: "barque", limit: 20

# Technical: Get detailed heritage place record with history
vhd_get_place with id: 12345
```

</details>

<details>
<summary><h3>Australian Centre for the Moving Image (ACMI)</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `acmi_search_works` | Search ACMI collection with field and size options |
| `acmi_get_work` | Get detailed work information by ID |
| `acmi_harvest` | Bulk download ACMI collection works with pagination |
| `acmi_list_creators` | List creators (directors, actors, studios) with pagination |
| `acmi_list_constellations` | List curated thematic collections |
| `acmi_get_constellation` | Get constellation details with works |
| `acmi_get_related` | Get related works (parts, recommendations, group members) |

**Examples:**
```
# Research: Find Australian feature films from the 1970s
acmi_search_works with query: "Australian", type: "Film", year: 1975

# Research: Search for classic videogames in the collection
acmi_search_works with query: "arcade", type: "Videogame"

# Technical: Get related works for a film (parts, recommendations)
acmi_get_related with workId: 12345
```

</details>

<details>
<summary><h3>PM Transcripts*</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `pm_transcripts_get_transcript` | Get Prime Ministerial transcript by ID |
| `pm_transcripts_harvest` | Bulk download transcripts with PM name filter |
| `pm_transcripts_search` | **Full-text search** across all indexed transcripts (requires local index) |
| `pm_transcripts_build_index` | Build/rebuild the local SQLite FTS5 search index |
| `pm_transcripts_index_stats` | Get index statistics (record count, size, last updated) |

> **💡 Full-Text Search**: The `pm_transcripts_search` tool uses a local SQLite FTS5 index for fast, powerful searches. Run `pm_transcripts_build_index` once to create the index (~43 minutes for all 26,000 transcripts). Supports Boolean operators, phrase matching, and BM25 ranking.

> **⚠️ Harvest Limitation**: The PM Transcripts API has no search endpoint, so harvesting scans IDs sequentially. Filtering by PM name can be slow. For targeted PM research, use `startFrom` near the PM's era:
> - Curtin/Chifley (1940s): ~1-2000
> - Menzies (1950s-60s): ~2000-4000
> - Whitlam/Fraser (1970s-80s): ~4000-5000
> - Hawke/Keating (1983-1996): ~5000-10000
> - Howard (1996-2007): ~10000-18000
> - Rudd/Gillard/Abbott+ (2007+): ~18000-26000

**Examples:**
```
# Get a specific transcript
pm_transcripts_get_transcript with id: 12345

# Harvest Hawke era transcripts
pm_transcripts_harvest with primeMinister: "Hawke", maxRecords: 100

# Build the full-text search index (one-time setup)
pm_transcripts_build_index with mode: "full"

# Full-text search for "economic reform" across all transcripts
pm_transcripts_search with query: "economic reform", limit: 20

# Search with phrase matching and PM filter
pm_transcripts_search with query: '"unemployment rate"', primeMinister: "Keating"
```

</details>

<details>
<summary><h3>IIIF (Any Institution)</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `iiif_get_manifest` | Fetch and parse IIIF manifest from any institution |
| `iiif_get_image_url` | Construct IIIF Image API URLs for various sizes/formats |

**Examples:**
```
# Research: Access State Library Victoria digitised content
iiif_get_manifest with manifestUrl:
  "https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/IE145082/manifest"

# Technical: Construct thumbnail URL for a specific image
iiif_get_image_url with imageServiceUrl: "<url-from-manifest>",
  size: "!200,200", format: "jpg"

# Technical: Get full resolution image URL
iiif_get_image_url with imageServiceUrl: "<url-from-manifest>",
  size: "max", format: "jpg", quality: "default"
```

</details>

<details>
<summary><h3>Geoscience Australia Historical Aerial Photography (GA HAP)*</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `ga_hap_search` | Search historical aerial photos by state, year, location, bbox, or point+radius |
| `ga_hap_get_photo` | Get photo details by OBJECTID or film/run/frame |
| `ga_hap_harvest` | Bulk download photo records with pagination |

> **⚠️ Lookup Note**: The RUN and FRAME fields are strings (e.g., "COAST TIE 2", "C-KEY"), not integers. For reliable lookups, use `objectId` from search results rather than film/run/frame combination.

**Examples:**
```
# Search 1950s Victorian aerial photos
ga_hap_search with state: "VIC", yearFrom: 1950, yearTo: 1960, scannedOnly: true

# Get photo details by ID
ga_hap_get_photo with objectId: 12345

# Harvest photos by Melbourne bounding box
ga_hap_harvest with bbox: "144.9,-37.9,145.1,-37.7", maxRecords: 100
```

</details>

_* Section contains usage notes_

## Frequently Asked Questions

<details open>
<summary><strong>1. How do I search historical newspapers?</strong></summary>

Use `trove_search` with `category: "newspaper"`. Filter by date with `dateFrom` and `dateTo` parameters (format: YYYY or YYYY-MM-DD), and by state with the `state` parameter (e.g., "vic", "nsw", "qld").

</details>

<details>
<summary><strong>2. Which sources need an API key?</strong></summary>

Only **Trove** requires an API key. All 10 other sources (PROV, GHAP, Museums Victoria, ALA, NMA, VHD, ACMI, PM Transcripts, IIIF, GA HAP) work immediately with no registration required.

</details>

<details>
<summary><strong>3. How do I download images from digitised records?</strong></summary>

For **PROV records**, use `prov_get_images` with the manifest URL from search results. For **any IIIF-compliant institution**, use `iiif_get_manifest` to get canvas details, then `iiif_get_image_url` to construct download URLs in your preferred size and format.

</details>

<details>
<summary><strong>4. How do I bulk download records?</strong></summary>

Each source has a `_harvest` tool for bulk downloads with pagination:
- `prov_harvest`, `trove_harvest`, `ghap_harvest`
- `museumsvic_harvest`, `ala_harvest`, `nma_harvest`
- `vhd_harvest`, `acmi_harvest`, `pm_transcripts_harvest`, `ga_hap_harvest`

</details>

<details>
<summary><strong>5. Can I search by location or coordinates?</strong></summary>

Yes. Three sources support **point+radius** spatial queries using `lat`, `lon`, and `radiusKm` parameters:
- `ala_search_occurrences` - Species sightings within radius of a point
- `ga_hap_search` - Aerial photos within radius of a point
- `ghap_search` - Historical placenames within radius of a point

For **bounding box** queries, use `bbox` parameter (format: "minLon,minLat,maxLon,maxLat") with `ga_hap_search` or `ghap_search`.

For **state/region** filtering: ALA supports `stateProvince` (e.g., "Victoria"), VHD supports `municipality` for Victorian LGAs, and GA HAP supports `state` codes (VIC, NSW, etc.).

</details>

<details>
<summary><strong>6. How do I find species information?</strong></summary>

Use `ala_search_species` for scientific or common names, or `museumsvic_search` with `recordType: "species"`. Get detailed profiles with `ala_get_species` using the GUID from search results. ALA covers all Australian species; Museums Victoria focuses on Victorian fauna and flora.

</details>

<details>
<summary><strong>7. What's the difference between dynamic and legacy mode?</strong></summary>

**Dynamic mode** (default) exposes 22 meta-tools organised into 4 categories:
- **Core tools** (10): `tools`, `schema`, `run`, `search`, `open`, `export`, `save_query`, `list_queries`, `run_query`, `delete_query`
- **Research planning** (1): `plan_search`
- **Session management** (7): `session_start`, `session_status`, `session_end`, `session_resume`, `session_list`, `session_export`, `session_note`
- **Context compression** (4): `compress`, `urls`, `dedupe`, `checkpoint`

This reduces token usage by 86% (~1,600 vs ~11,909 tokens). Your AI discovers and executes tools on demand.

**Legacy mode** exposes all 75 data tools directly. Use this if you need backwards compatibility or prefer direct tool access.

Switch modes by setting `MCP_MODE=legacy` in your configuration environment variables.

</details>

## Rate Limits

- **PROV**: No documented rate limit
- **Trove**: 200 API calls per minute
- **GHAP/TLCMap**: No documented rate limit
- **Museums Victoria**: No documented rate limit
- **ALA**: No documented rate limit
- **NMA**: No documented rate limit
- **VHD**: No documented rate limit
- **ACMI**: No documented rate limit
- **PM Transcripts**: No documented rate limit (be respectful, 100ms delays recommended)
- **GA HAP**: No documented rate limit (standard ArcGIS Feature Service)

## Licensing Notes

> [!NOTE]
> The licences below apply to **content** from each source. For API usage terms and conditions, see [Important Notice - Third-Party Data Sources](#important-notice---third-party-data-sources).

- **PROV**: CC-BY-NC (non-commercial use)
- **Trove**: Terms vary by content contributor; check individual items
- **GHAP/TLCMap**: CC-BY 4.0 (data contributed to TLCMap)
- **Museums Victoria**: CC-BY 4.0 (most records), Public Domain (some)
- **ALA**: Various (data contributors specify); mostly CC-BY
- **NMA**: CC-BY-NC (non-commercial use)
- **VHD**: CC-BY 4.0 (Victorian government open data)
- **ACMI**: CC0 (public domain dedication for API data)
- **PM Transcripts**: Australian Government (Crown copyright)
- **IIIF**: Varies by institution (check manifest attribution field)
- **GA HAP**: CC-BY 4.0 (Geoscience Australia, attribution required)
- **This MCP Server**: MIT License

## Resources

- [PROV Collection API](https://prov.vic.gov.au/prov-collection-api)
- [Trove API v3 Guide](https://trove.nla.gov.au/about/create-something/using-api/v3/api-technical-guide)
- [GHAP/TLCMap Developer Docs](https://docs.tlcmap.org/help/developers)
- [Museums Victoria Collections API](https://collections.museumsvictoria.com.au/developers)
- [ALA Web Services](https://api.ala.org.au/)
- [National Museum of Australia API](https://data.nma.gov.au/)
- [Victorian Heritage Database](https://vhd.heritagecouncil.vic.gov.au/)
- [ACMI Collection API](https://www.acmi.net.au/api/)
- [PM Transcripts](https://pmtranscripts.pmc.gov.au/)
- [IIIF Documentation](https://iiif.io/api/)
- [Geoscience Australia HAP](https://www.ga.gov.au/scientific-topics/national-location-information/historical-aerial-photography)
- [GLAM Workbench - PROV](https://glam-workbench.net/prov/)
- [GLAM Workbench - Trove](https://glam-workbench.net/trove/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT - See [LICENSE](LICENSE) for details.
