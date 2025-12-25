# Australian History MCP Server

[![npm version](https://img.shields.io/npm/v/@littlebearapps/australian-history-mcp?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@littlebearapps/australian-history-mcp)
[![Downloads](https://img.shields.io/npm/dm/@littlebearapps/australian-history-mcp?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@littlebearapps/australian-history-mcp)
[![CI](https://img.shields.io/github/actions/workflow/status/littlebearapps/australian-history-mcp/ci.yml?branch=main&label=CI&style=for-the-badge&logo=github&logoColor=white)](https://github.com/littlebearapps/australian-history-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

_Last updated: December 2025_

Search Australian archives the easy way. Ask your AI to find newspapers from 1803, aerial photos from 1928, species records, heritage buildings, or government datasets - no manual searching required.

## Quick Start

Run directly with npx - no installation required:

```bash
npx @littlebearapps/australian-history-mcp
```

That's it! 10 of 11 data sources work immediately with no API key. Only [Trove](#trove-api-key---how-to-apply) requires a free API key.

→ **Next:** Add to your MCP client via [Configuration](#configuration)

## What You Can Ask

Instead of navigating 11 different archive websites, just ask your AI:

- *"Find newspaper articles about the 1939 bushfires in Victoria"*
- *"Show me historical aerial photos of Melbourne from the 1950s"*
- *"What heritage buildings are in Carlton?"*
- *"Get species sightings of platypus in Tasmania since 2020"*
- *"Find Prime Ministerial speeches from the Hawke era"*
- *"Search for gold rush artefacts in the National Museum"*
- *"Download government datasets about water quality"*

Your AI handles the API calls, pagination, and formatting - you just ask questions in plain English.

## Table of Contents

- [Quick Start](#quick-start)
- [What You Can Ask](#what-you-can-ask)
- [Data Sources - What You Can Find](#data-sources---what-you-can-find)
- [Important Notice - Third-Party Data Sources](#important-notice---third-party-data-sources)
- [Trove API Key - How to Apply](#trove-api-key---how-to-apply)
- [Add this MCP to Your AI Agent](#add-this-mcp-to-your-ai-agent)
- [Data Sources - Tools & Examples](#data-sources---tools--examples)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Rate Limits](#rate-limits)
- [Licensing Notes](#licensing-notes)
- [Resources](#resources)
- [Contributing](#contributing)
- [License](#license)

## Data Sources - What You Can Find

> [!IMPORTANT]
> Most sources work immediately with no registration. Only Trove requires a [free API key](#trove-api-key---how-to-apply).

| Source | Content |
|--------|---------|
| 🏛️ **Public Record Office Victoria (PROV)** | Victorian state archives: photos, maps, council records, court files, immigration |
| 📰 [***Trove (National Library of Australia)****](#trove-api-key---how-to-apply) | Newspapers 1803-1954+, gazettes, books, images, magazines, diaries |
| 📊 **data.gov.au** | 85,000+ government datasets: census, demographics, geographic, environmental, health |
| 🦘 **Museums Victoria** | Museum objects, natural specimens, species info, educational articles |
| 🌿 **Atlas of Living Australia (ALA)** | 165M+ species records, 153,000+ profiles, distribution maps, citizen science |
| 🏛️ **National Museum of Australia (NMA)** | 85,000+ museum objects, people, organisations, places, media |
| 🏚️ **Victorian Heritage Database (VHD)** | 12,000+ heritage places, 700+ shipwrecks, architectural styles |
| 🎬 **Australian Centre for the Moving Image (ACMI)** | 42,000+ films, TV, videogames, digital art, creator info |
| 🎤 **PM Transcripts** | 26,000+ Prime Ministerial speeches, media releases, interviews |
| 🖼️ **IIIF** | Generic manifest/image tools for any IIIF-compliant institution |
| ✈️ **Geoscience Australia Historical Aerial Photography (GA HAP)** | 1.2M+ historical aerial photos (1928-1996), all states/territories |

> **Want another data source added?** [Share your idea in Discussions](https://github.com/littlebearapps/australian-history-mcp/discussions/categories/ideas)

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
| data.gov.au | [Terms of Use](https://data.gov.au/about) |
| Museums Victoria | [Legals](https://museumsvictoria.com.au/legals) |
| ALA | [Terms of Use](https://www.ala.org.au/terms-of-use/) |
| NMA | [Conditions of Use](https://www.nma.gov.au/about/contact-us/conditions-of-use) |
| VHD | [Disclaimer](https://www.heritagecouncil.vic.gov.au/disclaimer) |
| ACMI | [Terms & Conditions](https://www.acmi.net.au/about/terms-conditions) |
| PM Transcripts | [Disclaimer](https://pmtranscripts.pmc.gov.au/disclaimer) |
| GA (HAP) | [Copyright](https://www.ga.gov.au/copyright) |
| IIIF | Varies by institution - check manifest attribution |

## Trove API Key - How to Apply

Trove tools require an API key. All other sources work without any registration or API key.

> [!IMPORTANT]
> Before applying, review the [Trove API Terms of Use](https://trove.nla.gov.au/about/create-something/using-api/trove-api-terms-use) to understand the requirements and ensure your intended use is eligible.

1. Apply at: https://trove.nla.gov.au/about/create-something/using-api
2. Select "Level 1" (personal/research use)
3. Approval typically within 1 week
4. Add `TROVE_API_KEY` to your MCP configuration (see below)

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

</details>

<details>
<summary><h3>data.gov.au</h3></summary>

**Tools:**

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

**Examples:**
```
# Research: Find government heritage datasets in CSV format
datagovau_search with query: "heritage", format: "CSV", limit: 20

# Research: Search ABS census and demographic data
datagovau_search with query: "census", organization: "australianbureauofstatistics"

# Technical: Query tabular data directly from a datastore resource
datagovau_datastore_search with resourceId: "<resource-id>",
  query: "Melbourne", limit: 100
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
| `ala_search_occurrences` | Search species occurrence records by taxon, location, date |
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
| `acmi_list_creators` | List creators (directors, actors, studios) |
| `acmi_get_creator` | Get creator details and filmography |
| `acmi_list_constellations` | List curated thematic collections |
| `acmi_get_constellation` | Get constellation details with works |

**Examples:**
```
# Research: Find Australian feature films from the 1970s
acmi_search_works with query: "Australian", type: "Film", year: 1975

# Research: Search for classic videogames in the collection
acmi_search_works with query: "arcade", type: "Videogame"

# Technical: Get creator filmography and biography
acmi_get_creator with id: 12345
```

</details>

<details>
<summary><h3>PM Transcripts*</h3></summary>

**Tools:**

| Tool | Description |
|------|-------------|
| `pm_transcripts_get_transcript` | Get Prime Ministerial transcript by ID |
| `pm_transcripts_harvest` | Bulk download transcripts with PM name filter |

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
| `ga_hap_search` | Search historical aerial photos by state, year, location, bbox |
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

Only **Trove** requires an API key. All 10 other sources (PROV, data.gov.au, Museums Victoria, ALA, NMA, VHD, ACMI, PM Transcripts, IIIF, GA HAP) work immediately with no registration required.

</details>

<details>
<summary><strong>3. How do I download images from digitised records?</strong></summary>

For **PROV records**, use `prov_get_images` with the manifest URL from search results. For **any IIIF-compliant institution**, use `iiif_get_manifest` to get canvas details, then `iiif_get_image_url` to construct download URLs in your preferred size and format.

</details>

<details>
<summary><strong>4. How do I bulk download records?</strong></summary>

Each source has a `_harvest` tool for bulk downloads with pagination:
- `prov_harvest`, `trove_harvest`, `datagovau_harvest`
- `museumsvic_harvest`, `ala_harvest`, `nma_harvest`
- `vhd_harvest`, `acmi_harvest`, `pm_transcripts_harvest`, `ga_hap_harvest`

</details>

<details>
<summary><strong>5. Can I search by location or coordinates?</strong></summary>

Yes. Use `ga_hap_search` with `bbox` for aerial photos by bounding box (format: "minLon,minLat,maxLon,maxLat"). ALA tools support `stateProvince` filtering (e.g., "Victoria", "New South Wales"). VHD supports `municipality` filtering for Victorian local government areas.

</details>

<details>
<summary><strong>6. How do I find species information?</strong></summary>

Use `ala_search_species` for scientific or common names, or `museumsvic_search` with `recordType: "species"`. Get detailed profiles with `ala_get_species` using the GUID from search results. ALA covers all Australian species; Museums Victoria focuses on Victorian fauna and flora.

</details>

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

> [!NOTE]
> The licences below apply to **content** from each source. For API usage terms and conditions, see [Important Notice - Third-Party Data Sources](#important-notice---third-party-data-sources).

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
