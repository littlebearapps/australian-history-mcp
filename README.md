# Australian Archives MCP Server

[![npm version](https://img.shields.io/npm/v/@littlebearapps/australian-archives-mcp.svg)](https://www.npmjs.com/package/@littlebearapps/australian-archives-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A Model Context Protocol (MCP) server for searching and harvesting Australian historical archives, government data, and museum collections.

## Data Sources

| Source | Auth Required | Content |
|--------|---------------|---------|
| **PROV** (Public Record Office Victoria) | None | Victorian state archives: photos, maps, council records, court files |
| **Trove** (National Library of Australia) | API Key | Digitised newspapers, gazettes, books, images, magazines |
| **data.gov.au** | None | 85,000+ government datasets from 800+ organisations |
| **Museums Victoria** | None | Museum objects, natural science specimens, species info, articles |

## Installation

### Quick Start (npx)

No installation required - run directly:

```bash
npx @littlebearapps/australian-archives-mcp
```

### Global Install

```bash
npm install -g @littlebearapps/australian-archives-mcp
australian-archives-mcp
```

### From Source

```bash
git clone https://github.com/littlebearapps/australian-archives-mcp
cd australian-archives-mcp
npm install
npm run build
node dist/index.js
```

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "australian-archives": {
      "command": "npx",
      "args": ["-y", "@littlebearapps/australian-archives-mcp"],
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
    "australian-archives": {
      "command": "npx",
      "args": ["-y", "@littlebearapps/australian-archives-mcp"],
      "env": {
        "TROVE_API_KEY": "your-trove-api-key"
      }
    }
  }
}
```

### Claude Code

Add to `.mcp.json` in your project:

```json
{
  "mcpServers": {
    "australian-archives": {
      "command": "npx",
      "args": ["-y", "@littlebearapps/australian-archives-mcp"],
      "env": {
        "TROVE_API_KEY": "your-trove-api-key"
      }
    }
  }
}
```

## Trove API Key

Trove tools require an API key. PROV, data.gov.au, and Museums Victoria work without authentication.

1. Apply at: https://trove.nla.gov.au/about/create-something/using-api
2. Select "Level 1" (personal/research use)
3. Approval typically within 1 week
4. Add `TROVE_API_KEY` to your MCP configuration (see above)

## Tools (24 total)

### PROV Tools (3)

| Tool | Description |
|------|-------------|
| `prov_search` | Search Victorian state archives: photos, maps, records, council minutes |
| `prov_get_images` | Extract image URLs from a PROV digitised record via IIIF manifest |
| `prov_harvest` | Bulk download PROV records with pagination |

### Trove Tools (5)

| Tool | Description |
|------|-------------|
| `trove_search` | Search Trove for Australian newspapers, gazettes, images, books, magazines |
| `trove_newspaper_article` | Get full article details including OCR text and PDF link |
| `trove_list_titles` | List available newspaper or gazette titles by state |
| `trove_title_details` | Get title details with available years and issue counts |
| `trove_harvest` | Bulk download Trove records with cursor-based pagination |

### data.gov.au Tools (10)

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

### Museums Victoria Tools (6)

| Tool | Description |
|------|-------------|
| `museumsvic_search` | Search Museums Victoria for objects, specimens, species, and articles |
| `museumsvic_get_article` | Get an educational article by ID |
| `museumsvic_get_item` | Get a museum object (photograph, artefact, technology) by ID |
| `museumsvic_get_species` | Get species info (taxonomy, biology, habitat, distribution) by ID |
| `museumsvic_get_specimen` | Get a natural science specimen with taxonomy and collection info |
| `museumsvic_harvest` | Bulk download Museums Victoria records with pagination |

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

### Bulk Download Records

All sources have harvest tools for batch downloading:

```
Use prov_harvest, trove_harvest, datagovau_harvest, or museumsvic_harvest
with maxRecords parameter (up to 1000)
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

## Rate Limits

- **PROV**: No documented rate limit
- **Trove**: 200 API calls per minute
- **data.gov.au**: No documented rate limit
- **Museums Victoria**: No documented rate limit

## Licensing Notes

- **PROV**: CC-BY-NC (non-commercial use)
- **Trove**: Terms vary by content contributor; check individual items
- **data.gov.au**: Mostly CC-BY; check individual datasets
- **Museums Victoria**: CC-BY 4.0 (most records), Public Domain (some)
- **This MCP Server**: MIT License

## Resources

- [PROV Collection API](https://prov.vic.gov.au/prov-collection-api)
- [Trove API v3 Guide](https://trove.nla.gov.au/about/create-something/using-api/v3/api-technical-guide)
- [data.gov.au Portal](https://data.gov.au/)
- [CKAN API Guide](https://docs.ckan.org/en/latest/api/)
- [Museums Victoria Collections API](https://collections.museumsvictoria.com.au/developers)
- [GLAM Workbench - PROV](https://glam-workbench.net/prov/)
- [GLAM Workbench - Trove](https://glam-workbench.net/trove/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT - See [LICENSE](LICENSE) for details.
