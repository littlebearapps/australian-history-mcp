# Contributing to Australian History MCP

Thank you for your interest in contributing to the Australian History MCP Server! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Adding New Sources](#adding-new-sources)
- [Adding New Tools](#adding-new-tools)
- [Testing Changes](#testing-changes)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git

### Clone and Install

```bash
git clone https://github.com/littlebearapps/australian-history-mcp.git
cd australian-history-mcp
npm install
```

### Build and Run

```bash
# Build the project
npm run build

# Run in development mode (watch for changes)
npm run dev

# Start the MCP server
npm start
```

## Development Setup

### API Keys

Some data sources require API keys:

| Source | Required | How to Get |
|--------|----------|------------|
| Trove | Yes | [Apply at NLA](https://trove.nla.gov.au/about/create-something/using-api) |
| PROV | No | - |
| GHAP | No | - |
| Museums Victoria | No | - |
| ALA | No | - |
| NMA | No | - |
| VHD | No | - |
| ACMI | No | - |
| PM Transcripts | No | - |
| GA HAP | No | - |

Set API keys as environment variables:

```bash
export TROVE_API_KEY="your-key-here"
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Watch mode - rebuild on changes |
| `npm start` | Run the compiled MCP server |
| `npm run lint` | Check code style with ESLint |
| `npm test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── index.ts              # MCP server entry point
├── registry.ts           # Tool registry with Map-based dispatch
├── core/                 # Shared infrastructure
│   ├── types.ts          # Base types (MCPToolResponse, APIError)
│   ├── base-client.ts    # Shared fetch helpers with retry
│   ├── base-source.ts    # Source interface definition
│   └── harvest-runner.ts # Shared pagination logic
└── sources/              # Data source modules
    ├── prov/             # Public Record Office Victoria
    ├── trove/            # National Library of Australia
    ├── ghap/             # GHAP (TLCMap)
    ├── museums-victoria/ # Museums Victoria
    ├── ala/              # Atlas of Living Australia
    ├── nma/              # National Museum of Australia
    ├── vhd/              # Victorian Heritage Database
    ├── acmi/             # Australian Centre for the Moving Image
    ├── pm-transcripts/   # Prime Ministerial Transcripts
    ├── iiif/             # Generic IIIF tools
    └── ga-hap/           # Geoscience Australia HAP
```

Each source follows a consistent module structure:

```
sources/[name]/
├── index.ts      # Source definition using defineSource()
├── types.ts      # Source-specific TypeScript types
├── client.ts     # API client extending BaseClient
└── tools/        # Individual tool implementations
    ├── search.ts
    ├── get.ts
    └── harvest.ts
```

## Adding New Sources

1. **Create source directory:**
   ```bash
   mkdir -p src/sources/[name]/tools
   ```

2. **Create types.ts** with source-specific types:
   ```typescript
   export interface MySourceRecord {
     id: string;
     title: string;
     // ...
   }
   ```

3. **Create client.ts** extending BaseClient:
   ```typescript
   import { BaseClient } from '../../core/base-client.js';

   export class MySourceClient extends BaseClient {
     constructor() {
       super('https://api.example.com');
     }

     async search(query: string): Promise<MySourceRecord[]> {
       return this.get('/search', { q: query });
     }
   }
   ```

4. **Create tool files** in `tools/` directory:
   ```typescript
   import { SourceTool } from '../../../core/base-source.js';
   import { client } from '../client.js';

   export const searchTool: SourceTool = {
     name: 'mysource_search',
     description: 'Search MySource records',
     inputSchema: {
       type: 'object',
       properties: {
         query: { type: 'string', description: 'Search query' }
       },
       required: ['query']
     },
     handler: async (args) => {
       const results = await client.search(args.query);
       return { content: [{ type: 'text', text: JSON.stringify(results) }] };
     }
   };
   ```

5. **Create index.ts** using `defineSource()`:
   ```typescript
   import { defineSource } from '../../core/base-source.js';
   import { searchTool } from './tools/search.js';

   export default defineSource({
     name: 'mysource',
     tools: [searchTool]
   });
   ```

6. **Register in src/index.ts:**
   ```typescript
   import mysource from './sources/mysource/index.js';

   // Add to sources array
   const sources = [prov, trove, mysource, /* ... */];
   ```

7. **Build and test:**
   ```bash
   npm run build
   echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
   ```

## Adding New Tools

To add a tool to an existing source:

1. Create tool file in `src/sources/[source]/tools/`:
   ```typescript
   export const myNewTool: SourceTool = {
     name: 'source_mytool',
     description: 'What the tool does',
     inputSchema: { /* JSON Schema */ },
     handler: async (args) => { /* implementation */ }
   };
   ```

2. Import and add to source's `tools` array in `index.ts`

3. Build: `npm run build`

## Testing Changes

```bash
# Run the test suite
npm test

# Test tool listing
npm run build
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js

# Test a specific tool
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"prov_search","arguments":{"query":"railway"}},"id":1}' | node dist/index.js
```

## Code Style

- **TypeScript:** Strict mode enabled
- **ESLint:** Run `npm run lint` before committing
- **Formatting:** Use consistent indentation (2 spaces)
- **Naming:**
  - Tool names: `source_action` (e.g., `prov_search`, `trove_harvest`)
  - Files: kebab-case (e.g., `base-client.ts`)
  - Types: PascalCase (e.g., `ProvRecord`)

## Pull Request Process

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/my-new-feature
   ```

2. **Make changes** following the code style guidelines

3. **Test** your changes:
   ```bash
   npm run build
   npm run lint
   npm test
   ```

4. **Commit** using conventional commits:
   ```
   feat: add new tool for source X
   fix: correct parsing of API response
   docs: update README with new examples
   ```

5. **Push** and create a pull request

6. **Fill out** the PR template completely

7. **Address** any review feedback

### PR Requirements

- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Documentation updated if needed
- [ ] Changelog entry added for user-facing changes

## Questions?

- Open a [Discussion](https://github.com/littlebearapps/australian-history-mcp/discussions) for questions
- Check existing [Issues](https://github.com/littlebearapps/australian-history-mcp/issues) for known problems
- Read the [README](README.md) for usage documentation

Thank you for contributing!
