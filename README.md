# Australian History MCP Server

[![npm version](https://img.shields.io/npm/v/@littlebearapps/australian-history-mcp?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@littlebearapps/australian-history-mcp)
[![Downloads](https://img.shields.io/npm/dm/@littlebearapps/australian-history-mcp?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@littlebearapps/australian-history-mcp)
[![CI](https://img.shields.io/github/actions/workflow/status/littlebearapps/australian-history-mcp/ci.yml?branch=main&label=CI&style=for-the-badge&logo=github&logoColor=white)](https://github.com/littlebearapps/australian-history-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

A Model Context Protocol (MCP) server for searching and harvesting Australian historical archives, government data, and museum collections.

## Table of Contents

- [History Data Sources](#history-data-sources)
- [Installation](#installation)
- [Configuration](#configuration)
- [Trove API Key - How to Apply](#trove-api-key---how-to-apply)
- [Tools (75 total)](#tools-75-total)
- [Usage Examples](#usage-examples)
- [Content Types](#content-types)
- [Rate Limits](#rate-limits)
- [Licensing Notes](#licensing-notes)
- [Resources](#resources)
- [Contributing](#contributing)
- [License](#license)

## History Data Sources

Most data sources are ready to use immediately with no registration required.

> [!NOTE]
> Only Trove (National Library of Australia) requires an API key, which is [free to apply for](#trove-api-key---how-to-apply).

| Source | Access | Content |
|--------|--------|---------|
| **PROV** (Public Record Office Victoria) | Ready to use | Victorian state archives: photos, maps, council records, court files |
| **Trove** (National Library of Australia) | [Free API Key needed](#trove-api-key---how-to-apply) | Digitised newspapers, gazettes, books, images, magazines |
| **data.gov.au** | Ready to use | 85,000+ government datasets from 800+ organisations |
| **Museums Victoria** | Ready to use | Museum objects, natural science specimens, species info, articles |
| **ALA** (Atlas of Living Australia) | Ready to use | 165M+ species occurrence records, 153,000+ species profiles |
| **NMA** (National Museum of Australia) | Ready to use | 85,000+ museum objects, people, places, media |
| **VHD** (Victorian Heritage Database) | Ready to use | 12,000+ heritage places, 700+ shipwrecks, architectural data |
| **ACMI** (Australian Centre for the Moving Image) | Ready to use | 42,000+ films, TV, videogames, digital art |
| **PM Transcripts** | Ready to use | 26,000+ Prime Ministerial speeches, media releases, interviews |
| **IIIF** | Ready to use | Generic IIIF manifest/image tools for any institution |
| **GA HAP** (Geoscience Australia) | Ready to use | 1.2M+ historical aerial photos (1928-1996), all states/territories |

> **Want another data source added?** [Share your idea in Discussions](https://github.com/littlebearapps/australian-history-mcp/discussions/categories/ideas)

## Installation

### Quick Start (npx)

No installation required - run directly:

```bash
npx @littlebearapps/australian-history-mcp
```

### Global Install

```bash
npm install -g @littlebearapps/australian-history-mcp
australian-history-mcp
```

### From Source

```bash
git clone https://github.com/littlebearapps/australian-history-mcp
cd australian-history-mcp
npm install
npm run build
node dist/index.js
```

## Configuration

### Claude Desktop & Claude Code

Add to your config file:
- **Claude Desktop**: `claude_desktop_config.json`
- **Claude Code**: `.mcp.json` in your project directory

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

## Trove API Key - How to Apply

Trove tools require an API key. All other sources (PROV, data.gov.au, Museums Victoria, ALA, NMA, VHD, ACMI, PM Transcripts, IIIF, GA HAP) work without authentication.

1. Apply at: https://trove.nla.gov.au/about/create-something/using-api
2. Select "Level 1" (personal/research use)
3. Approval typically within 1 week
4. Add `TROVE_API_KEY` to your MCP configuration (see above)

## Tools (75 total)

<details open>
<summary><h3>PROV Tools (5)</h3></summary>

| Tool | Description |
|------|-------------|
| `prov_search` | Search Victorian state archives with category filter (Agency, Series, Item, etc.) |
| `prov_get_images` | Extract image URLs from a PROV digitised record via IIIF manifest |
| `prov_harvest` | Bulk download PROV records with pagination |
| `prov_get_agency` | Get agency details by VA number |
| `prov_get_series` | Get series details by VPRS number |

</details>

<details>
<summary><h3>Trove Tools (13)</h3></summary>

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
| `trove_get_person` | Get person/organisation biographical data |
| `trove_get_list` | Get user-curated research list by ID |
| `trove_search_people` | Search people and organisations |

</details>

<details>
<summary><h3>data.gov.au Tools (11)</h3></summary>

| Tool | Description |
|------|-------------|
| `datagovau_search` | Search data.gov.au for Australian government open datasets |
| `datagovau_get_dataset` | Get full dataset details including all resources and metadata |
| `datagovau_get_resource` | Get resource details including download URL and datastore status |
| `datagovau_datastore_search` | Query tabular data directly from a datastore-enabled resource |
| `datagovau_list_organizations` | List government organisations publishing on data.gov.au |
| `datagovau_get_organization` | Get organisation details and optionally their datasets |
| `datagovau_list_groups` | List dataset groups (thematic categories) |
| `datagovau_get_group` | Get group details and optionally datasets in this group |
| `datagovau_list_tags` | List popular tags used on datasets |
| `datagovau_harvest` | Bulk download dataset metadata with pagination |
| `datagovau_autocomplete` | Autocomplete dataset names and titles |

</details>

<details>
<summary><h3>Museums Victoria Tools (6)</h3></summary>

| Tool | Description |
|------|-------------|
| `museumsvic_search` | Search Museums Victoria with random sort option for discovery |
| `museumsvic_get_article` | Get an educational article by ID |
| `museumsvic_get_item` | Get a museum object (photograph, artefact, technology) by ID |
| `museumsvic_get_species` | Get species info (taxonomy, biology, habitat, distribution) by ID |
| `museumsvic_get_specimen` | Get a natural science specimen with taxonomy and collection info |
| `museumsvic_harvest` | Bulk download Museums Victoria records with pagination |

</details>

<details>
<summary><h3>ALA Tools (8)</h3></summary>

| Tool | Description |
|------|-------------|
| `ala_search_occurrences` | Search species occurrence records by taxon, location, date |
| `ala_search_species` | Search species by common or scientific name |
| `ala_get_species` | Get species profile with taxonomy, images, distribution |
| `ala_harvest` | Bulk download occurrence records with pagination |
| `ala_search_images` | Search images by keyword, taxon, or species |
| `ala_match_name` | Resolve taxonomic names to classification |
| `ala_list_species_lists` | List user-curated species lists |
| `ala_get_species_list` | Get species list details by druid |

</details>

<details>
<summary><h3>NMA Tools (9)</h3></summary>

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

</details>

<details>
<summary><h3>VHD Tools (9)</h3></summary>

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

</details>

<details>
<summary><h3>ACMI Tools (7)</h3></summary>

| Tool | Description |
|------|-------------|
| `acmi_search_works` | Search ACMI collection with field and size options |
| `acmi_get_work` | Get detailed work information by ID |
| `acmi_harvest` | Bulk download ACMI collection works with pagination |
| `acmi_list_creators` | List creators (directors, actors, studios) |
| `acmi_get_creator` | Get creator details and filmography |
| `acmi_list_constellations` | List curated thematic collections |
| `acmi_get_constellation` | Get constellation details with works |

</details>

<details>
<summary><h3>PM Transcripts Tools (2)</h3></summary>

| Tool | Description |
|------|-------------|
| `pm_transcripts_get_transcript` | Get Prime Ministerial transcript by ID |
| `pm_transcripts_harvest` | Bulk download transcripts (see limitations below) |

</details>

<details>
<summary><h3>IIIF Tools (2)</h3></summary>

| Tool | Description |
|------|-------------|
| `iiif_get_manifest` | Fetch and parse IIIF manifest from any institution |
| `iiif_get_image_url` | Construct IIIF Image API URLs for various sizes/formats |

</details>

<details>
<summary><h3>GA HAP Tools (3)</h3></summary>

| Tool | Description |
|------|-------------|
| `ga_hap_search` | Search historical aerial photos by state, year, location, bbox |
| `ga_hap_get_photo` | Get photo details by OBJECTID or film/run/frame |
| `ga_hap_harvest` | Bulk download photo records with pagination |

</details>

<!-- End of Tools section -->

> **⚠️ GA HAP Lookup Note**: The RUN and FRAME fields are strings (e.g., "COAST TIE 2", "C-KEY"), not integers. For reliable lookups, use `objectId` from search results rather than film/run/frame combination.

> **⚠️ PM Transcripts Harvest Limitation**: The PM Transcripts API has no search endpoint, so harvesting scans IDs sequentially. Filtering by PM name can be slow. For targeted PM research, use `startFrom` near the PM's era:
> - Curtin/Chifley (1940s): ~1-2000
> - Menzies (1950s-60s): ~2000-4000
> - Whitlam/Fraser (1970s-80s): ~4000-5000
> - Hawke/Keating (1983-1996): ~5000-10000
> - Howard (1996-2007): ~10000-18000
> - Rudd/Gillard/Abbott+ (2007+): ~18000-26000

## Usage Examples

### Search Historical Railway Photos (PROV)

```
Use prov_search with query "railway" and digitisedOnly=true
```

### Find 1930s Newspaper Articles (Trove)

```
Use trove_search with:
  query: "Melbourne flood"
  category: "newspaper"
  dateFrom: "1930"
  dateTo: "1939"
  state: "vic"
```

### Find Government Heritage Data (data.gov.au)

```
Use datagovau_search with:
  query: "heritage"
  format: "CSV"
```

### Search for Australian Wildlife (Museums Victoria)

```
Use museumsvic_search with:
  query: "platypus"
  recordType: "species"
```

### Search for Koalas (ALA)

```
Use ala_search_occurrences with:
  scientificName: "Phascolarctos cinereus"
  limit: 50
```

### Find Museum Artefacts (NMA)

```
Use nma_search_objects with:
  query: "boomerang"
  limit: 20
```

### Search Heritage Places (VHD)

```
Use vhd_search_places with:
  query: "railway station"
  municipality: "Melbourne"
```

### Search Shipwrecks (VHD)

```
Use vhd_search_shipwrecks with:
  query: "barque"
```

### Search Australian Films (ACMI)

```
Use acmi_search_works with:
  query: "Mad Max"
  type: "Film"
```

### Get PM Transcript (PM Transcripts)

```
Use pm_transcripts_get_transcript with:
  id: 12345
```

### Harvest Hawke Era Transcripts (PM Transcripts)

```
Use pm_transcripts_harvest with:
  primeMinister: "Hawke"
  maxRecords: 100
```

### Search Victorian Aerial Photos (GA HAP)

```
Use ga_hap_search with:
  state: "VIC"
  yearFrom: 1950
  yearTo: 1960
  scannedOnly: true
```

### Get Aerial Photo Details (GA HAP)

```
Use ga_hap_get_photo with:
  objectId: 12345
```

### Harvest Aerial Photos by Location (GA HAP)

```
Use ga_hap_harvest with:
  bbox: "144.9,-37.9,145.1,-37.7"
  maxRecords: 100
```

### Bulk Download Records

All sources have harvest tools for batch downloading:

```
Use prov_harvest, trove_harvest, datagovau_harvest, museumsvic_harvest,
ala_harvest, nma_harvest, vhd_harvest, acmi_harvest, pm_transcripts_harvest,
or ga_hap_harvest with maxRecords parameter (up to 1000)
```

## Content Types

### PROV Victoria
- Historical photographs and maps
- Government files and correspondence
- Council meeting minutes
- Court and immigration records
- Agency records (VA numbers)
- Series records (VPRS numbers)

### Trove
- Digitised newspapers (1803-1954+)
- Government gazettes
- Books, periodicals, magazines
- Images and photographs
- Maps and sheet music
- Diaries and archives

### data.gov.au
- Statistical data (ABS census, demographics)
- Geographic and spatial data (GeoJSON, SHP)
- Environmental, health, transport datasets
- Formats: CSV, JSON, XML, API, and more

### Museums Victoria
- Museum objects (photographs, artefacts, technology, textiles)
- Natural science specimens (insects, fossils, minerals)
- Species information (Victorian fauna and flora)
- Educational articles and stories

### Atlas of Living Australia
- Species occurrence records (165M+ observations)
- Species profiles with taxonomy and images
- Distribution maps and conservation status
- Citizen science observations

### National Museum of Australia
- Museum objects (artefacts, artwork, photographs)
- People and organisations (parties)
- Places of significance
- Media and documentation

### Victorian Heritage Database
- Heritage places (buildings, sites, gardens)
- Victorian shipwrecks (700+ wrecks)
- Architectural styles and periods
- Heritage overlays and protection status

### ACMI (Australian Centre for the Moving Image)
- Films (feature films, documentaries, shorts)
- Television programs and series
- Videogames and interactive media
- Digital art and installations
- Creator information (directors, actors, studios)

### PM Transcripts
- Prime Ministerial speeches (1945-present)
- Media releases and statements
- Interviews and press conferences
- PDF document links for original transcripts

### Geoscience Australia HAP
- 1.2 million+ aerial photographs (1928-1996)
- All Australian states and territories
- Preview images and full resolution TIFFs
- Flight, run, and frame metadata
- Photo centre coordinates

## Rate Limits

- **PROV**: No documented rate limit
- **Trove**: 200 API calls per minute
- **data.gov.au**: No documented rate limit
- **Museums Victoria**: No documented rate limit
- **ALA**: No documented rate limit
- **NMA**: No documented rate limit
- **VHD**: No documented rate limit
- **ACMI**: No documented rate limit
- **PM Transcripts**: No documented rate limit (be respectful, 100ms delays recommended)
- **GA HAP**: No documented rate limit (standard ArcGIS Feature Service)

## Licensing Notes

- **PROV**: CC-BY-NC (non-commercial use)
- **Trove**: Terms vary by content contributor; check individual items
- **data.gov.au**: Mostly CC-BY; check individual datasets
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
- [data.gov.au Portal](https://data.gov.au/)
- [CKAN API Guide](https://docs.ckan.org/en/latest/api/)
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
