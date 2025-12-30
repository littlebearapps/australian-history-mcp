# CLAUDE.md - Australian History MCP Server

**Language:** Australian English
**Last Updated:** 2025-12-29
**Version:** 1.0.0

---

## Quick Facts

**Project:** Australian History MCP Server
**Package:** `@littlebearapps/australian-history-mcp`
**Purpose:** Programmatic search and batch harvesting of Australian historical archives

**Data Sources:**
- **PROV** (Public Record Office Victoria) - Victorian state government archives (no API key)
- **Trove** (National Library of Australia) - Federal digitised collections (requires API key)
- **GHAP** (Gazetteer of Historical Australian Placenames) - Historical placenames via TLCMap (no API key)
- **Museums Victoria** - Victorian museum collections (no API key)
- **ALA** (Atlas of Living Australia) - Historical specimens + contemporary biodiversity (no API key)
- **NMA** (National Museum of Australia) - National museum collections (no API key)
- **VHD** (Victorian Heritage Database) - Heritage places and shipwrecks (no API key)
- **ACMI** (Australian Centre for the Moving Image) - Films, TV, videogames, digital art (no API key)
- **PM Transcripts** - Prime Ministerial speeches and media releases (no API key)
- **IIIF** - Generic IIIF manifest and image tools for any institution (no API key)
- **GA HAP** (Geoscience Australia) - Historical aerial photography 1928-1996 (no API key)

**PROV Content (Victorian State Archives):**
- Historical photographs and maps
- Government files and correspondence
- Council records and meeting minutes
- Court and immigration records

**Trove Content (National Library + 1,500+ Partner Organisations):**
- Old newspaper articles (1803-1954+)
- Government gazettes
- Books, magazines, images
- **Partner collections:** State Libraries (VSL, SLNSW, QSL, etc.), university repositories, National Archives, War Memorial, museums, AIATSIS, and more. Use `nuc` parameter to filter by contributor.

**GHAP Content (Historical Placenames):**
- 330,000+ historical placenames with coordinates
- Australian National Placename Survey (ANPS) gazetteer
- Community-contributed TLCMap data layers
- State, LGA, and bounding box filtering

**Museums Victoria Content (Museum Collections):**
- Museum objects (photographs, artefacts, technology, textiles)
- Natural science specimens (insects, fossils, minerals)
- Species information (Victorian fauna and flora)
- Educational articles and stories

**ALA Content (Historical + Contemporary Biodiversity):**
- 165M+ species occurrence records (including historical museum specimens from 1800s-1900s)
- 153,000+ species profiles with taxonomy and conservation status
- Historical collection data from museums and herbaria
- Contemporary citizen science observations

**NMA Content (Museum Collections):**
- 85,000+ museum objects (artefacts, artwork, photographs)
- People and organisations (parties)
- Places of significance
- Media and documentation

**VHD Content (Heritage Database):**
- 12,000+ heritage places (buildings, sites, gardens)
- Victorian shipwrecks (700+ wrecks)
- Architectural styles and periods
- Heritage overlays and protection status

**ACMI Content (Moving Image Collection):**
- 42,000+ works (films, TV, videogames, digital art)
- Feature films, documentaries, shorts
- Television programs and series
- Videogames and interactive media
- Creator information (directors, actors, studios)

**PM Transcripts Content:**
- 26,000+ transcripts (1945-present)
- Prime Ministerial speeches
- Media releases and statements
- Interviews and press conferences
- PDF document links

**GA HAP Content (Historical Aerial Photography):**
- 1.2 million+ aerial photographs (1928-1996)
- All Australian states and territories
- Preview images and full resolution TIFFs
- Film, run, and frame metadata
- Coordinate locations (photo centres)

---

## Essential Commands

```bash
# Build
npm run build

# Development (watch mode)
npm run dev

# Run directly (dynamic mode - default)
node dist/index.js

# Run in legacy mode (all 75 tools exposed)
MCP_MODE=legacy node dist/index.js

# Type check
npx tsc --noEmit
```

---

## Dynamic Tool Loading (Default Mode)

The server uses **dynamic tool loading** by default, exposing 22 meta-tools instead of all 75 data tools. This reduces initial token usage by **86%** (~1,600 vs ~11,909 tokens).

### Meta-Tools Exposed

#### Core Tools (10)
| Tool | Purpose |
|------|---------|
| `tools` | Discover available data tools by keyword, source, or category |
| `schema` | Get full input schema for a specific tool |
| `run` | Execute any data tool by name with arguments |
| `search` | **Federated search across multiple sources in parallel** |
| `open` | Open a URL in the default browser |
| `export` | Export records to CSV, JSON, Markdown, or download script |
| `save_query` | Save a named query for later reuse |
| `list_queries` | List saved queries with filtering options |
| `run_query` | Execute a saved query with optional parameter overrides |
| `delete_query` | Remove a saved query by name |

#### Research Planning Tools (1)
| Tool | Purpose |
|------|---------|
| `plan_search` | Analyse topic, generate search strategy, create plan.md |

#### Session Management Tools (7)
| Tool | Purpose |
|------|---------|
| `session_start` | Start a named research session |
| `session_status` | Get current progress and coverage gaps |
| `session_end` | End session with final report |
| `session_resume` | Resume a paused or previous session |
| `session_list` | List all sessions with optional filters |
| `session_export` | Export session data (JSON, Markdown, CSV) |
| `session_note` | Add notes to current session |

#### Context Compression Tools (4)
| Tool | Purpose |
|------|---------|
| `compress` | Reduce records to essential fields (minimal/standard/full) |
| `urls` | Extract only URLs from records |
| `dedupe` | Remove duplicate records using URL and title matching |
| `checkpoint` | Save/load/list/delete research checkpoints |

### Federated Search

The `search` meta-tool executes parallel searches across multiple sources:

```
# Auto-select sources based on query keywords
search(query="Melbourne photos 1920s", limit=5)
→ Searches PROV, Trove, NMA, Museums Victoria in parallel

# Explicit source selection
search(query="railway", sources=["prov", "trove"], limit=3)
→ Searches only specified sources

# With content type filter
search(query="gold rush", type="image", limit=5)
→ Searches sources that handle images
```

**Response includes:**
- `sourcesSearched` - which sources were queried
- `totalResults` - combined result count
- `results` - per-source records with source attribution
- `errors` - any sources that failed (others continue)
- `_timing` - execution time per source (for debugging)

### Workflow: tools() → schema() → run()

```
1. Discover: tools(query="newspaper")
   → Returns matching tools: trove_search, trove_newspaper_article, etc.

2. Get Schema: schema(tool="trove_search")
   → Returns full inputSchema with all parameters

3. Execute: run(tool="trove_search", args={query:"Melbourne", limit:5})
   → Returns search results
```

### Example Session

```
# Find tools for searching newspapers
tools(query="newspaper")
→ 5 matching tools: trove_search, trove_harvest, trove_newspaper_article...

# Get parameters for trove_search
schema(tool="trove_search")
→ {query, category, dateFrom, dateTo, state, creator, sortby, limit...}

# Search for articles
run(tool="trove_search", args={query:"Melbourne flood", category:"newspaper", dateFrom:"1930"})
→ {totalResults: 1234, records: [...]}

# Export results to CSV
export(records=<results.records>, format="csv", path="/tmp/floods.csv")
→ {status: "saved", path: "/tmp/floods.csv"}
```

### Mode Switching

Set `MCP_MODE` environment variable:

| Mode | Tools Exposed | Use Case |
|------|---------------|----------|
| `dynamic` (default) | 22 meta-tools | Research workflows, token-efficient |
| `legacy` | 75 data tools | Backwards compatibility, direct access |

```json
{
  "australian-history": {
    "command": "npx",
    "args": ["-y", "@littlebearapps/australian-history-mcp"],
    "env": {
      "TROVE_API_KEY": "your-key",
      "MCP_MODE": "dynamic"
    }
  }
}
```

---

## MCP Tools Available

### PROV Tools (6)
| Tool | API Key | Purpose |
|------|---------|---------|
| `prov_search` | None | Search Victorian state archives (with category filter) |
| `prov_get_images` | None | Extract image URLs from digitised records |
| `prov_harvest` | None | Bulk download PROV records |
| `prov_get_agency` | None | Get agency details by VA number |
| `prov_get_series` | None | Get series details by VPRS number |
| `prov_get_items` | None | Get items within a series by VPRS number |

### Trove Tools (14)
| Tool | API Key | Purpose |
|------|---------|---------|
| `trove_search` | Required | Search newspapers, images, books (with sortby, filters, holdings) |
| `trove_harvest` | Required | Bulk download Trove records (with sortby) |
| `trove_newspaper_article` | Required | Get full newspaper article text |
| `trove_list_titles` | Required | List newspaper/gazette titles |
| `trove_title_details` | Required | Get title info with issue dates |
| `trove_get_contributor` | Required | Get contributor details by NUC code |
| `trove_list_contributors` | Required | List/search all 1500+ contributing libraries |
| `trove_list_magazine_titles` | Required | List available magazine titles |
| `trove_get_magazine_title` | Required | Get magazine title details with years/issues |
| `trove_get_work` | Required | Get book/image/map/music details by ID (with holdings, links, versions) |
| `trove_get_person` | Required | Get person/organisation biographical data |
| `trove_get_list` | Required | Get user-curated research list by ID |
| `trove_search_people` | Required | Search people and organisations |
| `trove_get_versions` | Required | Get all versions of a work with holdings info |

### GHAP Tools (5)
| Tool | API Key | Purpose |
|------|---------|---------|
| `ghap_search` | None | Search historical placenames by name, state, LGA, bbox |
| `ghap_get_place` | None | Get place details by TLCMap ID |
| `ghap_list_layers` | None | List all available community data layers |
| `ghap_get_layer` | None | Get all places from a specific layer |
| `ghap_harvest` | None | Bulk download placename records with filters |

### Museums Victoria Tools (6)
| Tool | API Key | Purpose |
|------|---------|---------|
| `museumsvic_search` | None | Search museum collections (with random sort option) |
| `museumsvic_get_article` | None | Get educational article by ID |
| `museumsvic_get_item` | None | Get museum object by ID |
| `museumsvic_get_species` | None | Get species information by ID |
| `museumsvic_get_specimen` | None | Get natural science specimen by ID |
| `museumsvic_harvest` | None | Bulk download museum records |

### ALA Tools (8)
| Tool | API Key | Purpose |
|------|---------|---------|
| `ala_search_occurrences` | None | Search species occurrence records |
| `ala_search_species` | None | Search species by common/scientific name |
| `ala_get_species` | None | Get species profile with taxonomy and images |
| `ala_harvest` | None | Bulk download occurrence records |
| `ala_search_images` | None | Search images by keyword, taxon, or species |
| `ala_match_name` | None | Resolve taxonomic names to classification |
| `ala_list_species_lists` | None | List user-curated species lists |
| `ala_get_species_list` | None | Get species list details by druid |

### NMA Tools (10)
| Tool | API Key | Purpose |
|------|---------|---------|
| `nma_search_objects` | None | Search museum collection objects |
| `nma_get_object` | None | Get detailed object record |
| `nma_search_places` | None | Search places of significance |
| `nma_harvest` | None | Bulk download collection records |
| `nma_get_place` | None | Get place details by ID |
| `nma_search_parties` | None | Search people and organisations |
| `nma_get_party` | None | Get party (person/org) details by ID |
| `nma_search_media` | None | Search images, video, and sound |
| `nma_get_media` | None | Get media details by ID |
| `nma_get_related` | None | Get related objects, places, parties from _links |

### VHD Tools (9)
| Tool | API Key | Purpose |
|------|---------|---------|
| `vhd_search_places` | None | Search heritage places |
| `vhd_get_place` | None | Get detailed heritage place record |
| `vhd_search_shipwrecks` | None | Search Victorian shipwrecks |
| `vhd_harvest` | None | Bulk download heritage records |
| `vhd_get_shipwreck` | None | Get shipwreck details by ID |
| `vhd_list_municipalities` | None | List all Victorian municipalities |
| `vhd_list_architectural_styles` | None | List architectural style classifications |
| `vhd_list_themes` | None | List heritage themes (history, economics, etc.) |
| `vhd_list_periods` | None | List historical periods |

### ACMI Tools (7)
| Tool | API Key | Purpose |
|------|---------|---------|
| `acmi_search_works` | None | Search ACMI collection (with field and size options) |
| `acmi_get_work` | None | Get detailed work information by ID |
| `acmi_harvest` | None | Bulk download ACMI collection works |
| `acmi_list_creators` | None | List creators (directors, actors, studios) |
| `acmi_list_constellations` | None | List curated thematic collections |
| `acmi_get_constellation` | None | Get constellation details with works |
| `acmi_get_related` | None | Get related works (parts, groups, recommendations) |

### PM Transcripts Tools (5)
| Tool | API Key | Purpose |
|------|---------|---------|
| `pm_transcripts_get_transcript` | None | Get Prime Ministerial transcript by ID |
| `pm_transcripts_harvest` | None | Bulk download transcripts with filters |
| `pm_transcripts_search` | None | Full-text search with FTS5 (requires local index) |
| `pm_transcripts_build_index` | None | Build/rebuild/update local FTS5 search index |
| `pm_transcripts_index_stats` | None | Get FTS5 index statistics and PM coverage |

### IIIF Tools (2)
| Tool | API Key | Purpose |
|------|---------|---------|
| `iiif_get_manifest` | None | Fetch and parse IIIF manifest from any institution |
| `iiif_get_image_url` | None | Construct IIIF Image API URLs for various sizes/formats |

### GA HAP Tools (3)
| Tool | API Key | Purpose |
|------|---------|---------|
| `ga_hap_search` | None | Search historical aerial photos by state/year/location |
| `ga_hap_get_photo` | None | Get photo details by OBJECTID or film/run/frame |
| `ga_hap_harvest` | None | Bulk download photo records with pagination |

**See:** `docs/quickrefs/` for complete parameter documentation

---

## API Key Setup

### PROV (No Key Required)
PROV tools work immediately with no configuration.

### GHAP (No Key Required)
GHAP/TLCMap tools work immediately with no configuration.

### Museums Victoria (No Key Required)
Museums Victoria tools work immediately with no configuration.

### ALA (No Key Required)
ALA tools work immediately with no configuration.

### NMA (No Key Required)
NMA tools work immediately with no configuration.

### VHD (No Key Required)
VHD tools work immediately with no configuration.

### ACMI (No Key Required)
ACMI tools work immediately with no configuration.

### PM Transcripts (No Key Required)
PM Transcripts tools work immediately with no configuration.

### IIIF (No Key Required)
IIIF tools work immediately with no configuration. Works with any IIIF-compliant institution.

### GA HAP (No Key Required)
GA HAP tools work immediately with no configuration. CC-BY 4.0 licensed.

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
| `src/index.ts` | MCP server entry point (75 tools via registry) |
| `src/registry.ts` | Tool registry with Map-based dispatch |
| `src/core/` | Shared infrastructure |
| `src/core/types.ts` | Base types (MCPToolResponse, APIError) |
| `src/core/base-client.ts` | Shared fetch helpers with retry |
| `src/core/base-source.ts` | Source interface definition |
| `src/core/harvest-runner.ts` | Shared pagination logic |
| `src/sources/prov/` | PROV source (6 tools) |
| `src/sources/trove/` | Trove source (14 tools) |
| `src/sources/ghap/` | GHAP source (5 tools) |
| `src/sources/museums-victoria/` | Museums Victoria source (6 tools) |
| `src/sources/ala/` | ALA source (8 tools) |
| `src/sources/nma/` | NMA source (10 tools) |
| `src/sources/vhd/` | VHD source (9 tools) |
| `src/sources/acmi/` | ACMI source (8 tools) |
| `src/sources/pm-transcripts/` | PM Transcripts source (5 tools) |
| `src/sources/iiif/` | IIIF source (2 tools) |
| `src/sources/ga-hap/` | GA HAP source (3 tools) |
| `docs/quickrefs/` | Quick reference documentation |
| `docs/search-queries/` | Research query templates (VFL clubs, etc.) |
| `dist/` | Compiled JavaScript output |

---

## Architecture

### Dynamic Mode (Default)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code Session                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ stdio
┌───────────────────────────────▼─────────────────────────────────┐
│    Australian History MCP Server (22 meta-tools exposed)         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Core: tools | schema | run | search | open | export       │ │
│  │  Planning: plan_search                                      │ │
│  │  Sessions: session_start | session_status | session_end... │ │
│  │  Compression: compress | urls | dedupe | checkpoint         │ │
│  └───────────────────────────┬────────────────────────────────┘ │
│                              │ run(tool, args)                   │
│  ┌───────────────────────────▼────────────────────────────────┐ │
│  │              Tool Registry (75 data tools)                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌────┐ ┌─────┐ ┌────┐ ┌──────┐ ┌───┐ ┌────┐ ┌───┐ ┌────┐ ...  │
│  │PROV│ │Trove│ │GHAP│ │MusVic│ │ALA│ │NMA │ │VHD│ │ACMI│       │
│  │(6) │ │(14) │ │(5) │ │(6)   │ │(8)│ │(10)│ │(9)│ │(7) │       │
│  └──┬─┘ └──┬──┘ └─┬──┘ └──┬───┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬──┘        │
└─────┼──────┼──────┼───────┼───────┼─────┼─────┼─────┼────────────┘
      ▼      ▼      ▼       ▼       ▼     ▼     ▼     ▼
    PROV  Trove  TLCMap  MusVic   ALA   NMA   VHD   ACMI (+ 3 more)
```

### Legacy Mode (MCP_MODE=legacy)

All 75 data tools exposed directly (backwards compatible).

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

### Sort Trove Results by Date (Trove)
```
Use trove_search with query "gold discovery", sortby "dateasc" (oldest first)
or sortby "datedesc" (newest first)
```

### Search by Author/Creator (Trove)
```
Use trove_search with query "bushrangers" and creator "Lawson" to find
works by Henry Lawson about bushrangers
```

### Get Work Details with Holdings (Trove)
```
Use trove_get_work with workId and include ["holdings", "links"] to see
which libraries have copies and online access links
```

### Search People and Organisations (Trove)
```
Use trove_search_people with query "Henry Lawson" to find biographical records
```

### Browse Contributing Libraries (Trove)
```
Use trove_list_contributors to list all 1500+ libraries,
or with query "university" to filter
```

### Search Illustrated Articles (Trove)
```
Use trove_search with query "Melbourne", category "newspaper",
illustrationTypes ["Photo", "Cartoon"] to find articles with photos or cartoons
```

### Search by Word Count (Trove)
```
Use trove_search with query "gold rush", category "newspaper",
wordCount "<100 Words" for short articles
```

### Filter Magazine Articles by Publication Title (Trove)
```
Use trove_search with query "photography", category "magazine",
journalTitle "The Bulletin" to search The Bulletin magazine specifically
Popular magazines: The Bulletin, Women's Weekly, Pix, Walkabout
```

### Find Tagged/Corrected Articles (Trove)
```
Use trove_search with query "Ned Kelly", hasTags true to find articles
with user tags, or includeComments true to get user corrections
```

### Filter by Rights (Trove)
```
Use trove_search with query "photograph", category "image",
rights "Free" to find freely reusable content
```

### Search Partner Collections (Trove)
```
Use trove_search with query "immigration", nuc "NAA" for National Archives,
or nuc "AWM" for War Memorial collections. See docs/quickrefs/trove-partners.md
```

### Find Historical Placenames (GHAP)
```
Use ghap_search with query "Melbourne" and state "VIC"
```

### Search Placenames by LGA (GHAP)
```
Use ghap_search with query "creek" and lga "Yarra"
```

### Get Community Layer Data (GHAP)
```
1. Use ghap_list_layers to browse available datasets
2. Use ghap_get_layer with layerId to get all places from a layer
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

### Search Species Occurrences (ALA)
```
Use ala_search_occurrences with scientificName "Phascolarctos cinereus" (koala)
```

### Get Species Profile (ALA)
```
Use ala_get_species with GUID from search results
```

### Search Museum Objects (NMA)
```
Use nma_search_objects with query "boomerang" or "gold rush"
```

### Get Object Details (NMA)
```
Use nma_get_object with ID from search results
```

### Search Heritage Places (VHD)
```
Use vhd_search_places with query "railway station" and municipality "Melbourne"
```

### Search Shipwrecks (VHD)
```
Use vhd_search_shipwrecks with query "barque" or location keywords
```

### Search Australian Films (ACMI)
```
Use acmi_search_works with query "Mad Max" and type "Film"
```

### Get PM Transcript (PM Transcripts)
```
Use pm_transcripts_get_transcript with id 12345
```

### Harvest Early Transcripts (PM Transcripts)
```
Use pm_transcripts_harvest with startFrom 1 and maxRecords 10
Note: For specific PMs, use startFrom near their era (e.g., Hawke startFrom=5000)
```

### Search State Library Victoria Content (Trove + NUC)
```
Use trove_search with query "Melbourne 1890s", category "image", nuc "VSL"
Common NUC codes: VSL (SLV), SLNSW (State Library NSW), ANL (NLA), QSL (State Library QLD)
```

### Access SLV IIIF Manifest
```
Use iiif_get_manifest with manifestUrl "https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/IE145082/manifest"
```

### Construct IIIF Image URL (Any Institution)
```
Use iiif_get_image_url with imageServiceUrl from manifest, size "!1024,1024", format "jpg"
Size options: "max" (full), "!w,h" (best fit), "pct:50" (percentage), "w," or ",h" (single dimension)
```

### Search Victorian Aerial Photos (GA HAP)
```
Use ga_hap_search with state "VIC", yearFrom 1950, yearTo 1960, scannedOnly true
```

### Search Colour Aerial Photos (GA HAP)
```
Use ga_hap_search with filmType "colour" and state "VIC"
Film types: bw (Black/White), colour, bw-infrared, colour-infrared, infrared
```

### Search Detailed Large-Scale Photos (GA HAP)
```
Use ga_hap_search with scaleMin 5000, scaleMax 15000 for detailed urban/site surveys
Scale: lower denominator = more detail (1:5000 is very detailed, 1:100000 is wide area)
```

### Search by Camera Type (GA HAP)
```
Use ga_hap_search with camera "Wild" or "Williamson" for partial match on camera model
Common cameras: Wild RC9, Williamson F24, Zeiss RMK, Fairchild
```

### Get Aerial Photo Details (GA HAP)
```
Use ga_hap_get_photo with objectId from search results, or filmNumber + run + frame
```

### Harvest Aerial Photos by Location (GA HAP)
```
Use ga_hap_harvest with bbox "144.9,-37.9,145.1,-37.7" (Melbourne area) and maxRecords 100
State codes: NSW, VIC, QLD, SA, WA, TAS, NT, ACT
```

### Bulk Download Research Results
```
Use prov_harvest, trove_harvest, ghap_harvest, museumsvic_harvest,
ala_harvest, nma_harvest, vhd_harvest, acmi_harvest, pm_transcripts_harvest,
or ga_hap_harvest
```

### Search by Location (Spatial - ALA, GA HAP, GHAP)
```
Use ala_search_occurrences with lat=-37.81, lon=144.96, radiusKm=50 for Melbourne area
Use ga_hap_search with lat=-37.81, lon=144.96, radiusKm=25 for aerial photos near Melbourne
Use ghap_search with lat=-37.81, lon=144.96, radiusKm=10 for historical placenames
```

### Get Items within a PROV Series
```
Use prov_get_items with seriesId "VPRS 515" to list items in the series
Add query "Melbourne" to filter items within the series
```

### Get Related Museum Objects (NMA)
```
Use nma_get_related with objectId from nma_get_object results
Returns related objects, places, parties, and media via _links
```

### Get Related Works (ACMI)
```
Use acmi_get_related with workId from acmi_get_work results
Returns parts (episodes), groups (series), and recommendations
```

### Get Work Versions (Trove)
```
Use trove_get_versions with workId to see all versions
Returns holdings, formats, and library locations for each version
```

### Full-Text Search PM Transcripts (FTS5)
```
1. Build index first: pm_transcripts_build_index with mode "build"
   (Takes ~43 minutes for all 26,000+ transcripts)
2. Search: pm_transcripts_search with query "climate change" or "economic reform"
   Supports FTS5 operators: "phrase match", term1 OR term2, term1 NOT term2
3. Check index: pm_transcripts_index_stats for coverage and size
```

### Update PM Transcripts Index (Incremental)
```
Use pm_transcripts_build_index with mode "update"
Only fetches new transcripts since last build (seconds vs minutes)
```

### Save a Query for Later Reuse
```
Use save_query with:
  name: "melbourne-floods-1930s"
  source: "trove"
  tool: "trove_search"
  parameters: {query: "Melbourne flood", category: "newspaper", dateFrom: "1930", dateTo: "1939"}
  tags: ["research", "floods"]
```

### Run a Saved Query
```
Use run_query with name "melbourne-floods-1930s"
Add overrides {limit: 50} to modify parameters for this run
```

### List and Manage Saved Queries
```
Use list_queries to see all saved queries
Filter with source "trove" or tag "research"
Sort by lastUsed or useCount to find frequently used queries
Use delete_query to remove old queries
```

### Plan a Research Topic
```
Use plan_search with topic "History of Arden Street Oval 1920s"
Returns: search strategy, historical name suggestions, source priorities, coverage matrix
Optionally saves plan.md file for reference
```

### Start a Research Session
```
Use session_start with name "arden-street-research", topic "Arden Street Oval history"
All subsequent searches are automatically logged to the session
Use session_status to check progress and coverage gaps
```

### Compress Accumulated Results
```
Use compress with records from searches, level "standard" (~50 tokens/record)
Levels: "minimal" (~20 tokens), "standard" (~50), "full" (~80)
Reduces token usage by 70-85% for large result sets
```

### Remove Duplicate Results
```
Use dedupe with records from multiple searches
Matches by URL first, then title similarity (Jaccard coefficient)
Source priority: trove > prov > nma > museums-victoria > vhd > acmi > ghap > ala
```

### Save Research Progress (Checkpoint)
```
Use checkpoint with action "save", name "arden-street-day1"
Stores compressed records and fingerprints for later resume
Use checkpoint with action "load", name "arden-street-day1" to restore
```

### Resume After Context Reset
```
Use session_resume with name "arden-street-research"
Restores session state, coverage tracking, and query history
Continue research without losing previous progress
```

### Complete Research Workflow
```
1. plan_search(topic="...") → Review strategy
2. session_start(name="...", topic="...") → Begin tracking
3. search(query="...") → Auto-logged to session
4. compress(records=..., level="standard") → Reduce tokens
5. checkpoint(action="save", name="...") → Save progress
6. session_end() → Complete with final report
```

---

## Documentation Hierarchy

1. **This file (CLAUDE.md)** - Overview and quick start
2. **`docs/quickrefs/tools-reference.md`** - Complete tool parameters
3. **`docs/quickrefs/prov-api.md`** - PROV API details and tips
4. **`docs/quickrefs/trove-api.md`** - Trove API details and tips
5. **`docs/quickrefs/trove-partners.md`** - Trove partner data sources (NUC codes)
6. **`docs/quickrefs/ghap-api.md`** - GHAP/TLCMap API details
7. **`docs/quickrefs/museums-victoria-api.md`** - Museums Victoria API details
8. **`docs/quickrefs/ala-api.md`** - Atlas of Living Australia API details
9. **`docs/quickrefs/nma-api.md`** - National Museum of Australia API details
10. **`docs/quickrefs/vhd-api.md`** - Victorian Heritage Database API details
11. **`docs/quickrefs/acmi-api.md`** - ACMI API details
12. **`docs/quickrefs/pm-transcripts-api.md`** - PM Transcripts API details and limitations
13. **`docs/quickrefs/iiif-api.md`** - IIIF standard reference and tools
14. **`docs/quickrefs/slv-guide.md`** - State Library Victoria access patterns
15. **`docs/quickrefs/ga-hap-api.md`** - Geoscience Australia HAP API details
16. **`README.md`** - Public documentation for npm

---

## MCP Configuration

### Via npm (recommended for users)

```json
{
  "australian-history": {
    "command": "npx",
    "args": ["-y", "@littlebearapps/australian-history-mcp"],
    "env": { "TROVE_API_KEY": "your-key-here" }
  }
}
```

### Via local development

**Fragment:** `mcp/profiles/fragments/australian-history.json`

```json
{
  "command": "bash",
  "args": [
    "-c",
    "source ~/bin/kc.sh && export TROVE_API_KEY=$(kc_get trove-api-key 2>/dev/null || echo '') && exec node /Users/nathanschram/claude-code-tools/lba/apps/mcp-servers/australian-history-mcp/dist/index.js"
  ]
}
```

---

## Licensing Notes

- **PROV:** CC-BY-NC license (non-commercial use)
- **Trove:** Terms vary by content contributor; check individual items
- **GHAP/TLCMap:** CC-BY 4.0 (data contributed to TLCMap)
- **Museums Victoria:** CC-BY 4.0 (most records), Public Domain (some)
- **ALA:** Various (data contributors specify); mostly CC-BY
- **NMA:** CC-BY-NC (non-commercial use)
- **VHD:** CC-BY 4.0 (Victorian government open data)
- **ACMI:** CC0 (public domain dedication for API data)
- **PM Transcripts:** Australian Government (Crown copyright)
- **IIIF:** Varies by institution (check manifest attribution field)
- **GA HAP:** CC-BY 4.0 (Geoscience Australia, attribution required)
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

### Publishing to npm

Uses GitHub Actions OIDC trusted publishing (no NPM_TOKEN needed):

```bash
npm version patch   # Bump version (updates package.json + creates git tag)
git push origin main --tags   # Push commit and tag → triggers publish workflow
```

Workflow: `.github/workflows/publish.yml` (triggers on `v*` tags)

---

## Known Quirks

- **PROV API field names:** Uses hyphens (`iiif-manifest`) and dot notation (`is_part_of_series.title`)
- **Trove rate limit:** 200 calls/minute - harvest tool handles pagination automatically
- **Trove state parameter:** Use abbreviations (vic, nsw, etc.) - automatically mapped to full names for search API
- **Multi-word queries:** PROV requires phrase wrapping for multi-word searches (handled automatically)
- **GHAP/TLCMap API:** Uses GeoJSON FeatureCollection format; coordinates in WGS84
- **GHAP search modes:** Supports fuzzy, contains, and exact name matching
- **GHAP layers:** Community datasets accessed via layer ID from ghap_list_layers
- **Museums Victoria pagination:** Uses Link header; harvest tool handles automatically
- **Museums Victoria IDs:** Record IDs are type-prefixed (e.g., `articles/12345`, `items/67890`)
- **ALA dual APIs:** Uses biocache-ws for occurrences and bie-ws for species profiles
- **ALA GUIDs:** Species identified by LSID GUIDs (e.g., `urn:lsid:biodiversity.org.au:...`)
- **NMA pagination:** Uses offset-based pagination; harvest tool handles automatically
- **VHD response format:** HAL+JSON with `_embedded` and `_links` structure
- **VHD images:** Returned as dictionary keyed by ID, not array
- **VHD API params:** Uses `rpp` (records per page) not `limit`, `kw` (keyword) not `query`
- **VHD lookup embedded keys:** API returns different keys than endpoint paths (e.g., `local_government_authority` not `municipalities`, `architectural_style` not `architectural-styles`, `period` not `periods`)
- **ACMI pagination:** Page-based (page 1, 2, 3...) not offset-based
- **ACMI work types:** Film, Television, Videogame, Artwork, Object, etc.
- **ACMI constellations:** API uses `name` field not `title` for constellation names
- **PM Transcripts format:** XML responses requiring parsing
- **PM Transcripts IDs:** Sequential integers, gaps exist for missing transcripts
- **PM Transcripts no search API:** The API only supports lookup by transcript ID (`/query?transcript=ID`). There is no search endpoint and the sitemap is no longer accessible. Use `pm_transcripts_harvest` with PM/date filters to scan ID ranges.
- **PM Transcripts harvest:** Sequential ID scanning only. Approximate PM era ID ranges: Curtin ~1-2000, Menzies ~2000-4000, Hawke ~5000-8000, Keating ~8000-10000, Howard ~10000-18000
- **IIIF Presentation API versions:** Supports v2.x and v3.x manifests; v3 uses different structure (`items` instead of `sequences`)
- **IIIF Image API port:** SLV uses port 2083 for images, standard 443 for manifests
- **Trove NUC filtering:** Use `nuc` parameter to filter by contributor (e.g., "VSL" for State Library Victoria)
- **Trove sortby and pagination:** Using `sortby=dateasc/datedesc` for bulk harvesting may cause cursor instability if new records are added during harvest. Use `bulkHarvest=true` for stable ID-based pagination.
- **GA HAP coordinates:** API uses Web Mercator (EPSG:3857); our tools convert to WGS84 latitude/longitude
- **GA HAP URL fields:** PREVIEW_URL and TIF_URL contain HTML anchor tags; client extracts href automatically
- **GA HAP pagination:** Max 2000 records per query; use harvest tool for larger downloads
- **GA HAP state codes:** NSW=1, VIC=2, QLD=3, SA=4, WA=5, TAS=6, NT=7, ACT=8
- **GA HAP RUN/FRAME fields:** These are strings not integers (e.g., "COAST TIE 2", "C-KEY"); prefer objectId for lookups
- **Spatial queries:** Point+radius converted to bounding box internally; results may include records slightly outside radius. Haversine approximation optimal for radii <500km; at high latitudes (>60°) or large radii, bounding box becomes less accurate.
- **Spatial coordinate format:** All spatial params use WGS84 (lat, lon in decimal degrees); GA HAP internally converts to Web Mercator
- **PROV sorting:** Only `relevance` and `title` sorting available; date sorting not supported (PROV Solr uses SpatialField for `start_dt` which cannot be sorted)
- **Museums Victoria sorting:** Supports `relevance`, `quality`, `date`, `random`; alphabetical sorting is NOT supported (API ignores invalid values)
- **ALA sorting:** Uses camelCase field names (`eventDate` not `event_date`); `taxon_name` works with snake_case
- **PM Transcripts FTS5 index:** Stored at `~/.local/share/australian-history-mcp/pm-transcripts.db` (~50-100MB)
- **PM Transcripts FTS5 build time:** Initial build ~43 minutes (26k transcripts); incremental update much faster
- **PM Transcripts FTS5 operators:** Supports "phrase match", term1 OR term2, term1 NOT term2, NEAR(a b, 5)
- **Saved queries storage:** JSON file at `~/.local/share/australian-history-mcp/saved-queries.json`
- **Saved query names:** Alphanumeric, hyphens, underscores only; max 64 characters

---

**Token Count:** ~1600 tokens
