# Australian Archives MCP Server

MCP server providing Claude Code with programmatic access to Australian historical archives:

- **PROV** (Public Record Office Victoria) - Victorian state government archives
- **Trove** (National Library of Australia) - Federal digitised collections

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

## Rate Limits

- **PROV**: No documented rate limit
- **Trove**: 200 API calls per minute

## License

MIT

## Resources

- [PROV API Documentation](https://prov.vic.gov.au/prov-collection-api)
- [Trove API v3 Guide](https://trove.nla.gov.au/about/create-something/using-api/v3/api-technical-guide)
- [GLAM Workbench - PROV](https://glam-workbench.net/prov/)
- [GLAM Workbench - Trove](https://glam-workbench.net/trove/)
