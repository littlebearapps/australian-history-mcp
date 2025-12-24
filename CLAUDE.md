# CLAUDE.md - Australian History MCP Server

**Language:** Australian English
**Last Updated:** 2025-12-24
**Version:** 0.6.0

---

## Quick Facts

**Project:** Australian History MCP Server
**Package:** `@littlebearapps/australian-history-mcp`
**Purpose:** Programmatic search and batch harvesting of Australian historical archives

**Data Sources:**
- **PROV** (Public Record Office Victoria) - Victorian state government archives (no API key)
- **Trove** (National Library of Australia) - Federal digitised collections (requires API key)
- **data.gov.au** (CKAN) - Australian government open data portal (no API key)
- **Museums Victoria** - Victorian museum collections (no API key)
- **ALA** (Atlas of Living Australia) - Australian biodiversity data (no API key)
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

**ALA Content (Biodiversity Data):**
- 165M+ species occurrence records
- 153,000+ species profiles with taxonomy
- Distribution maps and conservation status
- Citizen science observations

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

# Run directly
node dist/index.js

# Type check
npx tsc --noEmit
```

---

## MCP Tools Available

### PROV Tools (5)
| Tool | API Key | Purpose |
|------|---------|---------|
| `prov_search` | None | Search Victorian state archives (with category filter) |
| `prov_get_images` | None | Extract image URLs from digitised records |
| `prov_harvest` | None | Bulk download PROV records |
| `prov_get_agency` | None | Get agency details by VA number |
| `prov_get_series` | None | Get series details by VPRS number |

### Trove Tools (13)
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

### data.gov.au Tools (11)
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
| `datagovau_autocomplete` | None | Autocomplete dataset names and titles |

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

### NMA Tools (9)
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
| `acmi_get_creator` | None | Get creator details and filmography |
| `acmi_list_constellations` | None | List curated thematic collections |
| `acmi_get_constellation` | None | Get constellation details with works |

### PM Transcripts Tools (2)
| Tool | API Key | Purpose |
|------|---------|---------|
| `pm_transcripts_get_transcript` | None | Get Prime Ministerial transcript by ID |
| `pm_transcripts_harvest` | None | Bulk download transcripts with filters |

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

### data.gov.au (No Key Required)
data.gov.au tools work immediately with no configuration.

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
| `src/sources/prov/` | PROV source (5 tools) |
| `src/sources/trove/` | Trove source (13 tools) |
| `src/sources/datagovau/` | data.gov.au source (11 tools) |
| `src/sources/museums-victoria/` | Museums Victoria source (6 tools) |
| `src/sources/ala/` | ALA source (8 tools) |
| `src/sources/nma/` | NMA source (9 tools) |
| `src/sources/vhd/` | VHD source (9 tools) |
| `src/sources/acmi/` | ACMI source (7 tools) |
| `src/sources/pm-transcripts/` | PM Transcripts source (2 tools) |
| `src/sources/iiif/` | IIIF source (2 tools) |
| `src/sources/ga-hap/` | GA HAP source (3 tools) |
| `docs/quickrefs/` | Quick reference documentation |
| `docs/search-queries/` | Research query templates (VFL clubs, etc.) |
| `dist/` | Compiled JavaScript output |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             Claude Code Session                                  │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │ stdio
┌───────────────────────────────────▼─────────────────────────────────────────────┐
│               Australian Archives MCP Server (75 tools, 11 sources)              │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         Tool Registry (Map-based)                         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  ┌────┐ ┌─────┐ ┌───────┐ ┌──────┐ ┌───┐ ┌───┐ ┌───┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  │PROV│ │Trove│ │dataGov│ │MusVic│ │ALA│ │NMA│ │VHD│ │ACMI│ │PM T│ │IIIF│ │ GA ││
│  │(5) │ │(13) │ │(11)   │ │(6)   │ │(8)│ │(9)│ │(9)│ │(7) │ │(2) │ │(2) │ │(3) ││
│  └──┬─┘ └──┬──┘ └───┬───┘ └──┬───┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘│
└─────┼──────┼────────┼────────┼───────┼─────┼─────┼─────┼──────┼──────┼──────┼────┘
      │      │        │        │       │     │     │     │      │      │      │
      ▼      ▼        ▼        ▼       ▼     ▼     ▼     ▼      ▼      ▼      ▼
   PROV   Trove   data.gov  MusVic  ALA   NMA   VHD   ACMI   PMC   Any    GA
   Solr   API v3  CKAN API  API     API   API   API   API    XML  IIIF  ArcGIS
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
Use prov_harvest, trove_harvest, datagovau_harvest, museumsvic_harvest,
ala_harvest, nma_harvest, vhd_harvest, acmi_harvest, pm_transcripts_harvest,
or ga_hap_harvest
```

---

## Documentation Hierarchy

1. **This file (CLAUDE.md)** - Overview and quick start
2. **`docs/quickrefs/tools-reference.md`** - Complete tool parameters
3. **`docs/quickrefs/prov-api.md`** - PROV API details and tips
4. **`docs/quickrefs/trove-api.md`** - Trove API details and tips
5. **`docs/quickrefs/datagovau-api.md`** - data.gov.au CKAN API details
6. **`docs/quickrefs/museums-victoria-api.md`** - Museums Victoria API details
7. **`docs/quickrefs/ala-api.md`** - Atlas of Living Australia API details
8. **`docs/quickrefs/nma-api.md`** - National Museum of Australia API details
9. **`docs/quickrefs/vhd-api.md`** - Victorian Heritage Database API details
10. **`docs/quickrefs/acmi-api.md`** - ACMI API details
11. **`docs/quickrefs/pm-transcripts-api.md`** - PM Transcripts API details and limitations
12. **`docs/quickrefs/iiif-api.md`** - IIIF standard reference and tools
13. **`docs/quickrefs/slv-guide.md`** - State Library Victoria access patterns
14. **`docs/quickrefs/ga-hap-api.md`** - Geoscience Australia HAP API details
15. **`README.md`** - Public documentation for npm

---

## MCP Configuration

**Location:** Root `claude-code-tools/` only (lean profile)

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
- **data.gov.au:** Mostly CC-BY licensed; check individual datasets
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

---

## Known Quirks

- **PROV API field names:** Uses hyphens (`iiif-manifest`) and dot notation (`is_part_of_series.title`)
- **Trove rate limit:** 200 calls/minute - harvest tool handles pagination automatically
- **Trove state parameter:** Use abbreviations (vic, nsw, etc.) - automatically mapped to full names for search API
- **Multi-word queries:** PROV requires phrase wrapping for multi-word searches (handled automatically)
- **data.gov.au URL:** The API base URL is `https://data.gov.au/data/api/3/action/` (note the `/data/` prefix)
- **Datastore availability:** Only some data.gov.au resources have datastore enabled for direct querying
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
- **PM Transcripts harvest:** Slow for PM filtering due to sequential scanning. Use `pm_transcripts_get_transcript` for individual lookups. Approximate PM era ID ranges: Curtin ~1-2000, Menzies ~2000-4000, Hawke ~5000-8000, Keating ~8000-10000, Howard ~10000-18000
- **IIIF Presentation API versions:** Supports v2.x and v3.x manifests; v3 uses different structure (`items` instead of `sequences`)
- **IIIF Image API port:** SLV uses port 2083 for images, standard 443 for manifests
- **Trove NUC filtering:** Use `nuc` parameter to filter by contributor (e.g., "VSL" for State Library Victoria)
- **GA HAP coordinates:** API uses Web Mercator (EPSG:3857); our tools convert to WGS84 latitude/longitude
- **GA HAP URL fields:** PREVIEW_URL and TIF_URL contain HTML anchor tags; client extracts href automatically
- **GA HAP pagination:** Max 2000 records per query; use harvest tool for larger downloads
- **GA HAP state codes:** NSW=1, VIC=2, QLD=3, SA=4, WA=5, TAS=6, NT=7, ACT=8
- **GA HAP RUN/FRAME fields:** These are strings not integers (e.g., "COAST TIE 2", "C-KEY"); prefer objectId for lookups

---

**Token Count:** ~800 tokens
