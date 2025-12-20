# Australian Archives MCP Server

MCP server providing Claude Code with programmatic access to Australian historical archives and open data:

- **PROV** (Public Record Office Victoria) - Victorian state government archives
- **Trove** (National Library of Australia) - Federal digitised collections
- **data.gov.au** (CKAN) - Australian government open data portal (85,000+ datasets)

## Installation

```bash
npm install @littlebearapps/australian-archives-mcp
```

Or use directly with npx:

```bash
npx @littlebearapps/australian-archives-mcp
```

## Prerequisites

### Trove API Key

1. Apply for a key at https://trove.nla.gov.au/about/create-something/using-api
2. Store in your keychain:
   ```bash
   source ~/bin/kc.sh
   kc_set trove-api-key "YOUR_API_KEY"
   ```

### PROV

No API key required - PROV uses a public API with CC-BY-NC license.

### data.gov.au

No API key required - data.gov.au uses a public CKAN API.

## Configuration

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "australian-archives": {
      "command": "bash",
      "args": [
        "-c",
        "source ~/bin/kc.sh && export TROVE_API_KEY=$(kc_get trove-api-key) && exec npx -y @littlebearapps/australian-archives-mcp"
      ]
    }
  }
}
```

## Available Tools

### PROV Tools

| Tool | Description |
|------|-------------|
| `prov_search` | Search Victorian state archives |
| `prov_harvest` | Bulk download PROV records |

### Trove Tools

| Tool | Description |
|------|-------------|
| `trove_search` | Search Trove collections |
| `trove_harvest` | Bulk download Trove records |
| `trove_newspaper_article` | Get full newspaper article |
| `trove_list_titles` | List newspaper/gazette titles |
| `trove_title_details` | Get title details and issues |

### data.gov.au Tools

| Tool | Description |
|------|-------------|
| `datagovau_search` | Search datasets by keyword, organisation, format |
| `datagovau_get_dataset` | Get full dataset details with resources |
| `datagovau_get_resource` | Get individual resource details |
| `datagovau_datastore_search` | Query tabular data directly |
| `datagovau_list_organizations` | List publishing organisations |
| `datagovau_get_organization` | Get organisation details |
| `datagovau_list_groups` | List dataset groups/categories |
| `datagovau_get_group` | Get group details |
| `datagovau_list_tags` | List popular tags |
| `datagovau_harvest` | Bulk download dataset metadata |

## Example Usage

### Search Victorian Historical Photos

```
Use prov_search to find photos of Melbourne Town Hall from the 1890s
```

### Search Newspaper Articles

```
Use trove_search to find newspaper articles about floods in Victoria from 1934
```

### Harvest Council Records

```
Use prov_harvest to download all records from VPRS 515 (Melbourne City Council)
```

### Search Government Datasets

```
Use datagovau_search to find datasets about heritage sites in CSV format
```

### Browse ABS Statistics

```
Use datagovau_search with organization "abs" to find Australian Bureau of Statistics data
```

## Content Types

### PROV Victoria

- Historical photographs
- Maps and plans
- Government files
- Council meeting minutes
- Court records
- Agency records (VA numbers)
- Series records (VPRS numbers)

### Trove

- Digitised newspapers (1803-1954+)
- Government gazettes
- Books and periodicals
- Images and photographs
- Maps
- Sheet music
- Diaries and archives

### data.gov.au

- 85,000+ datasets from 800+ organisations
- Statistical data (ABS census, demographics)
- Geographic and spatial data (GeoJSON, SHP)
- Environmental, health, transport datasets
- Formats: CSV, JSON, XML, API, and more

## Rate Limits

- **PROV**: No documented rate limit
- **Trove**: 200 API calls per minute
- **data.gov.au**: No documented rate limit (appears generous)

## License

MIT

## Resources

- [PROV API Documentation](https://prov.vic.gov.au/prov-collection-api)
- [Trove API v3 Guide](https://trove.nla.gov.au/about/create-something/using-api/v3/api-technical-guide)
- [data.gov.au Portal](https://data.gov.au/)
- [CKAN API Guide](https://docs.ckan.org/en/latest/api/)
- [GLAM Workbench - PROV](https://glam-workbench.net/prov/)
- [GLAM Workbench - Trove](https://glam-workbench.net/trove/)
