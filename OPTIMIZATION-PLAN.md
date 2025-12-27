# MCP Architecture Optimization Plan

## Executive Summary

**Problem:** Your Australian History MCP server exposes 69 tools across 11 sources, consuming an estimated **22,000-27,000 tokens** just for tool definitions. This represents 15-30% of Claude's context before any conversation begins.

**Goal:** Reduce token consumption by **80-95%** whilst maintaining full functionality.

**Research Sources:**
- [Anthropic: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) - 98.7% token reduction via code-first patterns
- [Speakeasy: 100x Token Reduction](https://www.speakeasy.com/blog/how-we-reduced-token-usage-by-100x-dynamic-toolsets-v2) - Dynamic 3-tool discovery pattern
- [SEP-1576: Schema Deduplication](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1576) - JSON $ref and adaptive field control
- [Scott Spence: Optimising MCP Context](https://scottspence.com/posts/optimising-mcp-server-context-usage-in-claude-code) - Practical Claude Code optimization

---

## Current State Analysis

### Token Cost Breakdown (Estimated)

| Component | Count | Tokens | % |
|-----------|-------|--------|---|
| Tool names | 69 | 350 | 1.5% |
| Tool descriptions | 69 | 3,500 | 15% |
| Parameter properties | ~400 | 6,000 | 26% |
| Parameter descriptions | ~400 | 10,000 | 43% |
| Enums/types | ~150 | 3,000 | 13% |
| **Total** | | **~23,000** | 100% |

### Key Verbosity Issues Identified

1. **Redundant parameter descriptions** - "Maximum results to return (1-100)" appears 25+ times
2. **Embedded examples** - NUC codes, date formats, etc. repeated in every tool
3. **Verbose state enums** - Same 8 states defined separately in 4 sources
4. **All tools loaded upfront** - 69 schemas sent before any query

---

## Optimization Strategy: Three Phases

### Phase 1: Quick Wins (Est. 40% token reduction)
Minimal code changes, maximum impact.

### Phase 2: Dynamic Tool Loading (Est. 90% token reduction)
Implement Speakeasy's 3-tool discovery pattern.

### Phase 3: Advanced Optimizations (Est. 95% token reduction)
Code execution pattern, schema deduplication.

---

## Phase 1: Quick Wins

### 1.1 Compress Tool Descriptions

**Before (trove_search):**
```typescript
description: 'Search Trove for Australian newspapers, gazettes, images, books, and magazines. Supports sorting, advanced filters, search indexes, and holdings retrieval.'
```

**After:**
```typescript
description: 'Search Trove newspapers, images, books'
```

**Rule:** Max 10 words per description. Move details to CLAUDE.md.

### 1.2 Standardize Parameter Descriptions

Create `src/core/param-descriptions.ts`:

```typescript
export const PARAMS = {
  // Common across all sources
  QUERY: 'Search query',
  LIMIT: 'Max results',
  OFFSET: 'Skip N results',
  DATE_FROM: 'Start date',
  DATE_TO: 'End date',
  STATE: 'Australian state',

  // Source-specific but reused
  INCLUDE_FULL: 'Include full text',
  DIGITISED_ONLY: 'Digitised records only',
  HAS_IMAGES: 'Records with images only',
} as const;
```

**Before:**
```typescript
limit: { type: 'number', description: 'Maximum results to return (1-100)', default: 20 }
nuc: { type: 'string', description: 'NUC code to filter by contributor/partner. Common codes: VSL (State Library Victoria), SLNSW (State Library NSW), ANL (National Library), QSL (State Library Queensland)' }
```

**After:**
```typescript
limit: { type: 'number', description: PARAMS.LIMIT, default: 20 }
nuc: { type: 'string', description: 'Contributor NUC code' }
```

**Token savings:** ~6,000 tokens (60% of parameter descriptions)

### 1.3 Consolidate Enums

Create `src/core/enums.ts`:

```typescript
export const AU_STATES = ['vic', 'nsw', 'qld', 'sa', 'wa', 'tas', 'nt', 'act'] as const;
export const AU_STATES_FULL = ['Victoria', 'New South Wales', ...] as const;
export const SORT_ORDERS = ['relevance', 'dateasc', 'datedesc'] as const;
```

**Token savings:** ~800 tokens

### 1.4 Remove Inline Examples

Move all examples from tool schemas to CLAUDE.md or quickrefs.

**Before:**
```typescript
decade: { description: 'Filter by decade (e.g., "199" for 1990s, "188" for 1880s)' }
```

**After:**
```typescript
decade: { description: 'Decade prefix (see docs)' }
```

**Token savings:** ~1,500 tokens

### Phase 1 Summary

| Optimization | Token Savings |
|--------------|---------------|
| Compress descriptions | 2,000 |
| Standardize params | 6,000 |
| Consolidate enums | 800 |
| Remove examples | 1,500 |
| **Total** | **~10,300 tokens (45%)** |

---

## Phase 2: Dynamic Tool Loading (RECOMMENDED)

Implement the Speakeasy-inspired discovery pattern. Instead of exposing 69 tools, expose only 5 meta-tools with minimal, clear names.

### 2.1 Architecture Change

**Before (69 tools):**
```
ListTools → Returns 69 tool schemas (~23,000 tokens)
```

**After (5 meta-tools):**
```
ListTools → Returns 5 tool schemas (~220 tokens)
  - tools(query?, source?) → List/discover available tools
  - schema(tool) → Get full tool definition
  - run(tool, args) → Execute any data tool
  - open(url) → Open in browser
  - export(records, format) → Export to CSV/JSON/Markdown/script
```

### 2.2 Tool Index for Discovery

Create `src/core/tool-index.ts`:

```typescript
interface ToolIndexEntry {
  name: string;
  source: string;
  shortDescription: string;  // 3-5 words
  keywords: string[];        // For search matching
}

export const TOOL_INDEX: ToolIndexEntry[] = [
  { name: 'prov_search', source: 'prov', shortDescription: 'Search Victorian archives', keywords: ['search', 'archives', 'records', 'photos', 'maps'] },
  { name: 'prov_get_images', source: 'prov', shortDescription: 'Extract IIIF images', keywords: ['images', 'download', 'digitised'] },
  { name: 'trove_search', source: 'trove', shortDescription: 'Search newspapers/books', keywords: ['newspapers', 'books', 'images', 'articles'] },
  // ... 66 more entries
];
```

### 2.3 Implementation: find

```typescript
async execute(args: { query?: string; source?: string }) {
  let results = TOOL_INDEX;

  if (args.source) {
    results = results.filter(t => t.source === args.source.toLowerCase());
  }

  if (args.query) {
    const q = args.query.toLowerCase();
    results = results.filter(t =>
      t.shortDescription.toLowerCase().includes(q) ||
      t.keywords.some(k => k.includes(q))
    );
  }

  return successResponse({
    tools: results.map(t => ({
      name: t.name,
      source: t.source,
      description: t.shortDescription,
    })),
    tip: 'Use schema(tool) before run(tool, args)',
  });
}
```

### 2.4 Implementation: schema

```typescript
async execute(args: { tool: string }) {
  const tool = registry.getTool(args.tool);
  if (!tool) {
    return errorResponse(`Unknown tool: ${args.tool}`);
  }

  return successResponse({
    name: tool.schema.name,
    description: tool.schema.description,
    parameters: tool.schema.inputSchema,
  });
}
```

### 2.5 Implementation: run

```typescript
async execute(args: { tool: string; args?: Record<string, unknown> }) {
  return registry.executeTool(args.tool, args.args ?? {});
}
```

### 2.6 Implementation: open

```typescript
async execute(args: { url: string }) {
  const { exec } = await import('child_process');
  const cmd = process.platform === 'darwin' ? 'open'
            : process.platform === 'win32' ? 'start'
            : 'xdg-open';
  exec(`${cmd} "${args.url}"`);
  return successResponse({ opened: args.url });
}
```

### 2.7 Implementation: export

```typescript
async execute(args: { records: any[]; format: 'csv' | 'json' | 'markdown' | 'script'; path?: string }) {
  switch (args.format) {
    case 'csv':
      return exportAsCsv(args.records, args.path);
    case 'json':
      return exportAsJson(args.records, args.path);
    case 'markdown':
      return exportAsMarkdown(args.records, args.path);  // Table + links
    case 'script':
      return generateDownloadScript(args.records);
  }
}
```

### Phase 2 Token Analysis

| Mode | Initial Load | Per-Tool Discovery | Per-Tool Execution |
|------|--------------|-------------------|-------------------|
| **Current (69 tools)** | 23,000 | 0 | 0 |
| **Dynamic (5 meta-tools)** | 220 | ~100-300 | 0 |

**Typical workflow (search 5 topics, use 8 tools):**
- Current: 23,000 tokens (all upfront)
- Dynamic: 220 + (5 × 50) + (8 × 200) = 2,070 tokens

**Savings: 91%**

### Phase 2 Trade-offs

**Pros:**
- 91-99% token reduction
- Scales to unlimited tools without context growth
- Clear, intuitive tool names
- `open` and `export` enable complete research workflow

**Cons:**
- 2-3x more LLM calls per tool usage
- ~30% slower initial tool execution
- Requires agent to learn discovery pattern (mitigated by clear names)

---

## Phase 3: Advanced Optimizations

### 3.1 Hybrid Mode: Common Tools + Discovery

Expose the 10 most-used tools directly, plus the 3 discovery tools:

```typescript
const ALWAYS_EXPOSED = [
  'trove_search',
  'prov_search',
  'ghap_search',
  'museumsvic_search',
  'ala_search_occurrences',
  'nma_search_objects',
  'vhd_search_places',
  'acmi_search_works',
  'trove_harvest',
  'prov_harvest',
];
```

This gives immediate access to the most common operations while keeping 59 less-common tools behind discovery.

**Token cost:** ~4,000 (vs 23,000 current, vs 500 full dynamic)

### 3.2 Schema Deduplication with $ref

For tools with shared parameter groups, use JSON Schema references:

```typescript
// src/core/shared-schemas.ts
export const SHARED_SCHEMAS = {
  pagination: {
    limit: { type: 'number', description: 'Max results', default: 20 },
    offset: { type: 'number', description: 'Skip N results' },
  },
  dateRange: {
    dateFrom: { type: 'string', description: 'Start date' },
    dateTo: { type: 'string', description: 'End date' },
  },
  stateFilter: {
    state: { type: 'string', enum: AU_STATES, description: 'Australian state' },
  },
};

// In tool definition:
inputSchema: {
  type: 'object',
  properties: {
    query: { type: 'string', description: 'Search query' },
    ...SHARED_SCHEMAS.pagination,
    ...SHARED_SCHEMAS.dateRange,
    ...SHARED_SCHEMAS.stateFilter,
  },
}
```

**Note:** This is JavaScript-level deduplication. True JSON $ref support would require MCP protocol changes per SEP-1576.

### 3.3 Progressive Detail Levels

Implement `describe_tool` with verbosity options:

```typescript
describe_tool(toolName, verbosity: 'minimal' | 'standard' | 'full')
```

- **minimal:** name, 1-line description, required params only
- **standard:** name, description, all params with types
- **full:** everything including examples and edge cases

### 3.4 Source-Level Grouping

Group tools by source in discovery results:

```typescript
search_tools() → {
  sources: [
    { name: 'trove', description: 'Newspapers, books, images', toolCount: 13 },
    { name: 'prov', description: 'Victorian state archives', toolCount: 5 },
    // ...
  ],
  tip: 'Use search_tools(source="trove") to list tools for a source'
}
```

---

## Implementation Roadmap

### Week 1: Phase 1 (Quick Wins)

| Day | Task | Files |
|-----|------|-------|
| 1 | Create param-descriptions.ts and enums.ts | src/core/ |
| 2 | Update PROV, Trove, GHAP tools | src/sources/{prov,trove,ghap}/tools/*.ts |
| 3 | Update MuseumsVic, ALA, NMA tools | src/sources/{museums-victoria,ala,nma}/tools/*.ts |
| 4 | Update VHD, ACMI, PM, IIIF, GA HAP tools | src/sources/{vhd,acmi,...}/tools/*.ts |
| 5 | Test, measure token reduction | - |

**Deliverable:** 40-45% token reduction with zero functionality change.

### Week 2: Phase 2 (Dynamic Loading)

| Day | Task | Files |
|-----|------|-------|
| 1 | Create tool-index.ts with all 69 tools | src/core/tool-index.ts |
| 2 | Implement search_tools | src/tools/search-tools.ts |
| 3 | Implement describe_tool | src/tools/describe-tool.ts |
| 4 | Implement execute_tool | src/tools/execute-tool.ts |
| 5 | Add mode switch (dynamic vs legacy) | src/index.ts |
| 6 | Test with Claude Code | - |
| 7 | Documentation update | CLAUDE.md |

**Deliverable:** 85-90% token reduction, configurable mode.

### Week 3: Phase 3 (Polish)

| Day | Task |
|-----|------|
| 1-2 | Implement hybrid mode (10 common + discovery) |
| 3-4 | Add schema deduplication |
| 5 | Performance testing and optimization |
| 6-7 | Documentation and release |

**Deliverable:** 90-95% token reduction, production-ready.

---

## Configuration Options

Add to package.json or environment:

```json
{
  "mcpMode": "dynamic",  // "legacy" | "dynamic" | "hybrid"
  "hybridTools": ["trove_search", "prov_search", ...],
  "verbosity": "standard"  // "minimal" | "standard" | "full"
}
```

Or via environment:
```bash
MCP_MODE=dynamic
MCP_VERBOSITY=minimal
```

---

## Metrics to Track

Before/after measurements:

1. **Tool definition tokens** - Count via `tools/list` response
2. **Typical session tokens** - Measure with Claude Code telemetry
3. **Tool discovery success rate** - Can Claude find the right tool?
4. **Latency** - Time to first tool execution

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude can't learn discovery pattern | High | Hybrid mode with common tools exposed |
| Increased latency | Medium | Cache tool schemas in conversation |
| Breaking existing workflows | High | Legacy mode for backwards compatibility |
| Tool search returning wrong results | Medium | Improve keywords, add fuzzy matching |

---

## Recommendation

**Start with Phase 1** (Quick Wins) as it requires minimal architectural change and delivers 40% improvement immediately.

**Then implement Phase 2** (Dynamic Loading) as the main solution. The Speakeasy pattern is proven to work and provides 85-90% reduction.

**Consider Phase 3** (Hybrid) only if testing reveals Claude struggles with the pure dynamic approach.

---

## Appendix: Current Tool Inventory

### PROV (5 tools)
- prov_search, prov_get_images, prov_harvest, prov_get_agency, prov_get_series

### Trove (13 tools)
- trove_search, trove_harvest, trove_newspaper_article, trove_list_titles, trove_title_details, trove_get_contributor, trove_list_contributors, trove_list_magazine_titles, trove_get_magazine_title, trove_get_work, trove_get_person, trove_get_list, trove_search_people

### GHAP (5 tools)
- ghap_search, ghap_get_place, ghap_list_layers, ghap_get_layer, ghap_harvest

### Museums Victoria (6 tools)
- museumsvic_search, museumsvic_get_article, museumsvic_get_item, museumsvic_get_species, museumsvic_get_specimen, museumsvic_harvest

### ALA (8 tools)
- ala_search_occurrences, ala_search_species, ala_get_species, ala_harvest, ala_search_images, ala_match_name, ala_list_species_lists, ala_get_species_list

### NMA (9 tools)
- nma_search_objects, nma_get_object, nma_search_places, nma_harvest, nma_get_place, nma_search_parties, nma_get_party, nma_search_media, nma_get_media

### VHD (9 tools)
- vhd_search_places, vhd_get_place, vhd_search_shipwrecks, vhd_harvest, vhd_get_shipwreck, vhd_list_municipalities, vhd_list_architectural_styles, vhd_list_themes, vhd_list_periods

### ACMI (7 tools)
- acmi_search_works, acmi_get_work, acmi_harvest, acmi_list_creators, acmi_get_creator, acmi_list_constellations, acmi_get_constellation

### PM Transcripts (2 tools)
- pm_transcripts_get_transcript, pm_transcripts_harvest

### IIIF (2 tools)
- iiif_get_manifest, iiif_get_image_url

### GA HAP (3 tools)
- ga_hap_search, ga_hap_get_photo, ga_hap_harvest

---

## Phase 4: Enhanced UX Tooling

Based on research into what exists and best practices, here are recommendations for three key UX enhancements.

### 4.1 URL Listing for Users (Already Implemented ✓)

**Current State:** Excellent coverage across all 11 sources.

Every tool that returns records already includes URLs:

| Source | URL Fields Returned |
|--------|---------------------|
| PROV | `url`, `iiifManifest` |
| Trove | `troveUrl`, `pdfUrl`, `thumbnailUrl` |
| GHAP | `url` (TLCMap link) |
| Museums Victoria | `thumbnailUrl`, `imageUrl` |
| ALA | `imageUrl`, `thumbnailUrl`, `largeImageUrl` |
| NMA | `downloadUrl` (in media) |
| VHD | `url`, `imageUrl` |
| ACMI | `webUrl`, `apiUrl`, `wikidataUrl` |
| PM Transcripts | `documentUrl`, `webUrl` |
| GA HAP | `previewUrl`, `downloadUrl` (TIF) |
| IIIF | `imageUrl`, `imageServiceUrl`, `fullImageUrl` |

**Enhancement Opportunity:** Add a dedicated `list_urls` tool for aggregating URLs from search results:

```typescript
{
  name: 'list_urls',
  description: 'Extract and format all URLs from a search result for easy access',
  inputSchema: {
    type: 'object',
    properties: {
      records: { type: 'array', description: 'Records from any search tool' },
      urlTypes: {
        type: 'array',
        items: { enum: ['view', 'thumbnail', 'download', 'pdf', 'iiif'] },
        description: 'Which URL types to include'
      },
      format: {
        enum: ['list', 'markdown', 'csv'],
        description: 'Output format'
      },
    },
  },
}
```

This would output:
```markdown
## Search Results URLs

1. **Melbourne Town Hall** - [View](https://...) | [Download](https://...)
2. **Flinders Street Station** - [View](https://...) | [Hi-Res TIFF](https://...)
```

### 4.2 Downloads & Batch Downloads (Partially Implemented ✓)

**Current State:** All 10 harvest tools support batch downloading metadata with URLs.

**What exists:**
- All harvest tools return `downloadUrl` or equivalent for each record
- GA HAP returns both `previewUrl` and `downloadUrl` (full-res TIFF)
- IIIF tools construct download URLs in any size/format
- Pagination handles batches up to 1000 records

**What's missing:**
- No actual file download to local filesystem
- No batch download orchestration

**Enhancement Options:**

#### Option A: File System Integration (Recommended)

Use the MCP Filesystem server pattern alongside this server:

```typescript
// New tool: save_images
{
  name: 'save_images',
  description: 'Download images from URLs to local directory',
  inputSchema: {
    type: 'object',
    properties: {
      urls: { type: 'array', items: { type: 'string' } },
      outputDir: { type: 'string', description: 'Local directory path' },
      prefix: { type: 'string', description: 'Filename prefix' },
      format: { enum: ['jpg', 'png', 'tif', 'original'] },
    },
    required: ['urls', 'outputDir'],
  },
}
```

Implementation would:
1. Accept array of image URLs (from IIIF, GA HAP, etc.)
2. Download each to specified directory
3. Return manifest of saved files

#### Option B: Export Package Tool

```typescript
// New tool: export_package
{
  name: 'export_package',
  description: 'Create downloadable package of records with metadata',
  inputSchema: {
    type: 'object',
    properties: {
      records: { type: 'array', description: 'Records from harvest/search' },
      format: { enum: ['json', 'csv', 'zip'] },
      includeImages: { type: 'boolean', default: false },
      imageSizes: { enum: ['thumbnail', 'medium', 'full'] },
    },
  },
}
```

#### Option C: Download Script Generator

Generate a shell script/manifest that users can run:

```typescript
// Returns:
{
  script: "#!/bin/bash\ncurl -O https://...\ncurl -O https://...",
  manifest: [
    { url: "https://...", filename: "photo_001.jpg", size: "2.3MB" },
    // ...
  ],
}
```

**Recommendation:** Start with Option C (script generator) as it requires no filesystem access, then add Option A for power users.

### 4.3 Browser Preview / Opening Files (Not Implemented)

**Current State:** No browser opening functionality exists.

**Why:** MCP is designed for IDE integration, not browser automation. The protocol returns data; the client decides how to present it.

**Best Practice Options:**

#### Option A: Return Formatted Click Links (Simplest)

Claude Code and most MCP clients render markdown links as clickable. Ensure responses format URLs properly:

```typescript
// In tool responses:
return successResponse({
  // ... record data
  _userTip: 'Click to view: [Open in Browser](https://example.com/record/123)',
});
```

#### Option B: MCP Resources Primitive

Use MCP's `resources` primitive instead of tools for browseable content:

```typescript
// Register as resource, not tool
server.setResourceHandler({
  uri: 'prov://record/123',
  name: 'PROV Record 123',
  mimeType: 'text/html',
  description: 'Click to open in browser',
});
```

Clients that support resources can open these directly.

#### Option C: Integration with Browser MCP

Reference the [Chrome DevTools MCP](https://developer.chrome.com/blog/chrome-devtools-mcp) or [Playwright MCP](https://github.com/modelcontextprotocol/servers) for browser automation:

```typescript
// User's MCP config would include both servers
{
  "australian-history": { ... },
  "browser": {
    "command": "npx",
    "args": ["@anthropic/mcp-server-puppeteer"]
  }
}
```

Then chain tools: `australian-history → get URL → browser → open page`

#### Option D: System Open Command (Desktop Only)

For local MCP installations, add a simple open tool:

```typescript
// New tool: open_url
{
  name: 'open_url',
  description: 'Open a URL in the default browser',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
    },
    required: ['url'],
  },
}

// Implementation:
async execute(args: { url: string }) {
  const { exec } = await import('child_process');
  const cmd = process.platform === 'darwin' ? 'open'
            : process.platform === 'win32' ? 'start'
            : 'xdg-open';
  exec(`${cmd} "${args.url}"`);
  return successResponse({ opened: args.url });
}
```

**Recommendation:**
1. Implement Option A (markdown links) immediately - zero cost
2. Add Option D (`open_url` tool) for desktop users
3. Document Option C for users who need browser automation

---

## Phase 5: Potential New Data Sources

Based on research, these Australian data sources have APIs or structured access that could be added:

### 5.1 High Priority (Public APIs Available)

#### Australian War Memorial (AWM)
- **Content:** 1M+ photographs, diaries, medals, service records
- **API:** Uses the same ALA infrastructure for some data
- **Access:** Collection Search at awm.gov.au/digital-collection
- **Priority:** HIGH - Major historical resource
- **Note:** Need to verify API availability; may require screen scraping

#### State Library NSW (SLNSW)
- **Content:** 300,000+ digitised items, photographs, manuscripts
- **API:** Funnelback search API at `www.sl.nsw.gov.au/api`
- **Access:** Via Data.NSW portal with CKAN support
- **Priority:** HIGH - Complements Trove's NSW content
- **Reference:** [Data.NSW Collections](https://data.nsw.gov.au/data/dataset/collections)

#### Queensland State Archives (QSA)
- **Content:** Cabinet minutes, immigration, court records
- **API:** ArchivesSearch + Open Data Portal CSV datasets
- **Access:** data.qld.gov.au with full URL listings
- **Priority:** MEDIUM - Good for genealogy research
- **Reference:** [QSA Digitised Collection](https://www.data.qld.gov.au/dataset/queensland-state-archives-digitised-collection)

### 5.2 Medium Priority (IIIF/Structured Access)

#### State Library Victoria Enhanced
- **Current:** SLV access via Trove NUC filter + IIIF
- **Enhancement:** Direct SLV IIIF collection harvesting
- **Source:** 170,000+ copyright-free images
- **API:** IIIF manifests + Handle system
- **Reference:** [SLV IIIF Guide](https://lab.slv.vic.gov.au/resources/using-iiif-to-work-with-the-librarys-digitised-collections)

#### National Library of Australia (NLA) Direct
- **Current:** NLA content via Trove
- **Enhancement:** Direct NLA object access via IIIF
- **Pattern:** `https://nla.gov.au/nla.obj-{ID}/manifest`
- **Priority:** MEDIUM - Supplements Trove access

#### Australian Museum (Sydney)
- **Content:** 21M+ specimens and objects
- **API:** Data flows through ALA for biodiversity
- **Note:** May overlap with existing ALA tools
- **Priority:** LOW - Mostly covered by ALA

### 5.3 Future Consideration

#### National Archives of Australia (NAA)
- **Content:** 54M+ items including service records
- **Status:** ⚠️ API access blocked as of May 2025
- **Note:** Screen scrapers no longer work
- **Reference:** [GLAM Workbench Note](https://glam-workbench.net/recordsearch/)
- **Priority:** WAIT - Monitor for API availability

#### State Records of South Australia
- **Content:** Colonial and state government records
- **Access:** ArchivesSearch SA portal
- **Priority:** LOW - Limited digital access

#### Western Australian Museum
- **Content:** Maritime archaeology, natural science
- **API:** WA Museum Sandbox (experimental)
- **Priority:** LOW - Limited coverage

### 5.4 Implementation Approach for New Sources

For each new source, follow the established pattern:

```
src/sources/[source-name]/
├── index.ts          # Source definition with defineSource()
├── client.ts         # API client extending BaseClient
├── types.ts          # TypeScript interfaces
└── tools/
    ├── search.ts     # Primary search tool
    ├── get-[item].ts # Detail retrieval
    └── harvest.ts    # Bulk download
```

**Minimum viable source:** 3 tools (search, get, harvest)

---

## Integration with Dynamic Tool Loading

**Critical:** All new tools must integrate with the Phase 2 dynamic loading strategy to avoid re-introducing context bloat.

### Naming Convention: Minimal but Clear

Use short, clear names. Claude reads descriptions primarily, so names can be minimal:

| Long Name | Short Name | Why |
|-----------|------------|-----|
| `search_tools` | `find` | Clear in context, saves tokens |
| `describe_tool` | `schema` | More accurate - returns schema |
| `execute_tool` | `run` | Universal, intuitive |
| `open_url` | `open` | Obvious purpose |
| `utilities` | `export` | Specific to actual use |

### Final Architecture: 5 Meta-Tools

```typescript
// 1. TOOLS - List/discover available tools
{
  name: 'tools',
  description: 'List available tools by keyword. Sources: PROV (archives), Trove (newspapers), GHAP (placenames), MuseumsVic, ALA (biodiversity), NMA, VHD (heritage), ACMI (film/TV), PM Transcripts, GA HAP (aerial photos)',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'What you want to do' },
      source: { type: 'string', description: 'Filter by source name' },
    },
  },
}

// 2. SCHEMA - Get full tool definition
{
  name: 'schema',
  description: 'Get full parameter schema for a tool before calling it',
  inputSchema: {
    type: 'object',
    properties: {
      tool: { type: 'string', description: 'Tool name from tools() results' },
    },
    required: ['tool'],
  },
}

// 3. RUN - Execute any data tool
{
  name: 'run',
  description: 'Execute any data source tool by name',
  inputSchema: {
    type: 'object',
    properties: {
      tool: { type: 'string', description: 'Tool name' },
      args: { type: 'object', description: 'Tool arguments' },
    },
    required: ['tool'],
  },
}

// 4. OPEN - Browser preview (high frequency, tiny footprint)
{
  name: 'open',
  description: 'Open URL in default browser',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
    },
    required: ['url'],
  },
}

// 5. EXPORT - Data export utilities
{
  name: 'export',
  description: 'Export records: CSV, JSON, Markdown, or download script',
  inputSchema: {
    type: 'object',
    properties: {
      records: { type: 'array', description: 'Records from search/harvest' },
      format: { enum: ['csv', 'json', 'markdown', 'script'], description: 'Output format' },
      path: { type: 'string', description: 'Output file path (optional)' },
    },
    required: ['records', 'format'],
  },
}
```

### Token Cost Analysis

| Tool | Purpose | Tokens |
|------|---------|--------|
| `find` | Discover tools | ~50 |
| `schema` | Get tool definition | ~40 |
| `run` | Execute any tool | ~50 |
| `open` | Browser preview | ~30 |
| `export` | CSV/JSON/script | ~50 |
| **Total** | | **~220** |

**Comparison:**
- Current (69 tools): ~23,000 tokens
- New (5 meta-tools): ~220 tokens
- **Reduction: 99%**

### Where New Source Tools Live

New sources (SLNSW, AWM, QSA, etc.) are added to the discoverable pool, accessed via `run`:

```typescript
// Added to TOOL_INDEX for discovery via tools()
{ name: 'slnsw_search', source: 'slnsw', shortDescription: 'Search NSW library', keywords: ['photographs', 'manuscripts', 'nsw'] },
{ name: 'awm_search', source: 'awm', shortDescription: 'Search War Memorial', keywords: ['soldiers', 'wwi', 'wwii', 'medals'] },
// ... accessed via run("slnsw_search", {...}) after discovery
```

**Impact:** Adding 15 new tools (5 sources × 3 tools each) adds **0 tokens** to initial context.

### Example Research Workflow

```
User: "Find photos of WWI soldiers from Victoria"

Agent:
1. tools(query="soldiers photos")
   → Returns: awm_search, trove_search, prov_search

2. schema(tool="awm_search")
   → Returns: full parameter schema with filters

3. run(tool="awm_search", args={query:"Victoria soldiers", type:"photograph"})
   → Returns: 20 records with URLs

4. open(url=results[0].url)
   → Opens first result in browser for user

5. export(records=results, format="markdown")
   → Saves results as formatted markdown with links
```

### Hybrid Mode (Optional)

For users who want instant access to common tools:

```typescript
const ALWAYS_EXPOSED = [
  // Meta-tools (required)
  'find', 'schema', 'run', 'open', 'export',

  // Common data tools (optional, for quick access)
  'trove_search',
  'prov_search',
];
```

**Token cost:** ~1,200 tokens (vs 23,000 current) - still 95% reduction

---

## Phase 2.5: Federated Search Tool (RECOMMENDED)

### The Problem with Pure Dynamic Loading

When a user asks *"Find photos of Melbourne from the 1920s"* without specifying a source, the pure dynamic pattern requires many round-trips:

```
1. tools("photos 1920s") → Returns 6 relevant tools
2-5. schema() for each tool (4 calls)
6-9. run() for each source (4 calls)
10. open(results[0].url)
11. export(results, "markdown")
```

**That's 11 tool calls** for a simple query. Research shows this is a known problem:

> *"Agents typically use about 4× more tokens than chat interactions, and multi-agent systems use about 15× more tokens."* — [Anthropic Engineering](https://www.anthropic.com/engineering/multi-agent-research-system)

### The Solution: Unified `search` Meta-Tool

Based on research from [Together.ai Parallel Workflows](https://docs.together.ai/docs/parallel-workflows), [Parallel.ai Search](https://parallel.ai/blog/introducing-parallel-search), and [Anthropic's Multi-Agent System](https://www.anthropic.com/engineering/multi-agent-research-system), add a federated search tool that:

1. Accepts a natural language query
2. Internally routes to relevant sources using smart selection
3. Executes searches **in parallel** (Promise.all)
4. Aggregates and ranks results
5. Returns compressed, information-dense response

### Implementation: search Meta-Tool

```typescript
{
  name: 'search',
  description: 'Search across all Australian history sources in parallel. ' +
    'Auto-selects relevant sources based on query. ' +
    'Sources: newspapers (Trove), archives (PROV), aerial photos (GA HAP), ' +
    'heritage (VHD), museums (NMA, MuseumsVic, ACMI), biodiversity (ALA), ' +
    'placenames (GHAP), PM speeches (pm). Note: IIIF excluded (use tools→run for direct manifest access)',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Natural language search query' },
      sources: {
        type: 'array',
        items: { enum: ['trove', 'prov', 'ga_hap', 'vhd', 'nma', 'museumsvic', 'acmi', 'ala', 'ghap', 'pm'] },
        description: 'Limit to specific sources (auto-selects if omitted). Note: IIIF excluded (requires manifest URL)'
      },
      types: {
        type: 'array',
        items: { enum: ['image', 'document', 'map', 'newspaper', 'object', 'place', 'species'] },
        description: 'Filter by content type'
      },
      dateFrom: { type: 'string', description: 'Start year' },
      dateTo: { type: 'string', description: 'End year' },
      state: { type: 'string', enum: ['vic', 'nsw', 'qld', 'sa', 'wa', 'tas', 'nt', 'act'] },
      limit: { type: 'number', description: 'Results per source (default: 10)' },
    },
    required: ['query'],
  },
}
```

### Smart Source Selection

```typescript
function selectSourcesForQuery(query: string, types?: string[]): string[] {
  const q = query.toLowerCase();
  const sources = new Set<string>();

  // Content type routing
  if (types?.includes('newspaper') || /newspaper|article|gazette/.test(q)) {
    sources.add('trove');
  }
  if (types?.includes('image') || /photo|photograph|picture|image/.test(q)) {
    sources.add('trove').add('prov').add('ga_hap').add('museumsvic');
  }
  if (types?.includes('map') || /map|aerial|survey/.test(q)) {
    sources.add('ga_hap').add('prov');
  }
  if (/heritage|building|historic|architecture/.test(q)) {
    sources.add('vhd');
  }
  if (/shipwreck|maritime|vessel|ship/.test(q)) {
    sources.add('vhd');
  }
  if (/species|animal|plant|bird|insect/.test(q)) {
    sources.add('ala').add('museumsvic');
  }
  if (/film|movie|television|tv|game/.test(q)) {
    sources.add('acmi');
  }
  if (/place|location|town|creek|river/.test(q)) {
    sources.add('ghap');
  }
  if (/prime minister|speech|transcript|policy|government announcement/.test(q)) {
    sources.add('pm');
  }

  // Default: search the big 4 for general queries
  if (sources.size === 0) {
    sources.add('trove').add('prov').add('museumsvic').add('nma');
  }

  // Note: IIIF is excluded - it requires a manifest URL, not search

  return Array.from(sources);
}
```

### Parallel Execution with Aggregation

```typescript
async execute(args: SearchArgs) {
  // 1. Smart source selection
  const sources = args.sources ?? selectSourcesForQuery(args.query, args.types);

  // 2. Execute all searches in parallel
  const searchPromises = sources.map(source =>
    executeSourceSearch(source, {
      query: args.query,
      dateFrom: args.dateFrom,
      dateTo: args.dateTo,
      state: args.state,
      limit: args.limit ?? 10,
    }).catch(err => ({ source, error: err.message, results: [] }))
  );

  const results = await Promise.all(searchPromises);

  // 3. Aggregate results with source attribution
  const aggregated = results.flatMap(r =>
    r.results.map(item => ({ ...item, _source: r.source }))
  );

  // 4. Return compressed response
  return successResponse({
    query: args.query,
    sourcesSearched: sources,
    totalResults: aggregated.length,
    results: aggregated.slice(0, 30).map(item => ({
      title: item.title,
      source: item._source,
      date: item.date,
      description: item.description?.substring(0, 150),
      thumbnailUrl: item.thumbnailUrl,
      viewUrl: item.viewUrl,
      downloadUrl: item.downloadUrl,
    })),
    tip: 'Use open(url) to preview, export(results, format) to save',
  });
}
```

### New Workflow: 3 Calls Instead of 11

```
User: "Find photos of Melbourne from the 1920s"

Agent:
1. search(query: "Melbourne photographs", types: ["image"],
          dateFrom: "1920", dateTo: "1929", state: "vic")
   → Parallel search across Trove, PROV, GA HAP, MuseumsVic
   → Returns aggregated results with source attribution

2. open(results[0].viewUrl)
   → Opens best result in browser

3. export(results, "markdown")
   → Saves all results with links
```

**Reduction: 11 calls → 3 calls (73% fewer tool invocations)**

### When to Use Each Tool

| User Intent | Tool Path | Why |
|-------------|-----------|-----|
| General research query | `search` → `open` → `export` | Federated search handles routing |
| Specific source needed | `tools` → `schema` → `run` | User knows what they want |
| Bulk data download | `tools` → `run("*_harvest")` | Harvest tools for large datasets |
| Specialised lookup (magazines, contributors) | `tools` → `schema` → `run` | Niche Trove tools |
| IIIF manifest access | `tools` → `run("iiif_get_manifest")` | Requires manifest URL |
| Detailed record lookup | `tools` → `run("*_get_*")` | Get full details by ID |

### What search() Covers vs Individual Tools

**search() handles (10 sources):**
| Source | Content Types | Auto-Selected When Query Contains |
|--------|---------------|----------------------------------|
| Trove | newspapers, books, images | "newspaper", "article", "gazette", "photo" |
| PROV | archives, photos, maps | "photo", "map", "archive", "record" |
| GA HAP | aerial photos | "aerial", "map", "survey" |
| VHD | heritage places, shipwrecks | "heritage", "building", "shipwreck" |
| NMA | museum objects | (default for general queries) |
| Museums Victoria | specimens, species, objects | "species", "animal", "photo" |
| ACMI | films, TV, games | "film", "movie", "tv", "game" |
| ALA | biodiversity occurrences | "species", "animal", "plant" |
| GHAP | historical placenames | "place", "town", "creek" |
| PM Transcripts | speeches, media releases | "prime minister", "speech", "transcript" |

**Individual tools still needed for:**
| Tool Category | Example | Why Not in search() |
|---------------|---------|---------------------|
| IIIF tools | `iiif_get_manifest` | Requires manifest URL, not a search |
| Harvest tools | `trove_harvest`, `prov_harvest` | Bulk download, pagination |
| Get-by-ID tools | `trove_get_work`, `nma_get_object` | Fetch full record details |
| Lookup tools | `trove_list_contributors`, `vhd_list_periods` | Reference data, not search |
| Specialist tools | `trove_newspaper_article`, `ala_match_name` | Specific functions |

**Result:** search() covers ~80% of typical research queries. Individual tools via `tools()` → `run()` handle the remaining 20% (bulk operations, lookups, IIIF).

### Token Comparison

| Scenario | 69 Tools | 5 Meta-Tools | 6 Meta-Tools + search |
|----------|----------|--------------|----------------------|
| Initial load | 23,000 | 220 | 300 |
| "Find Melbourne photos 1920s" | 0 | ~2,000 (11 calls) | ~400 (3 calls) |
| **Total** | **23,000** | **2,220** | **700** |

**With federated search: 97% reduction** vs current architecture.

### References

- [Anthropic: Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system) - Token usage and parallel agent architecture
- [Together.ai: Parallel Workflows](https://docs.together.ai/docs/parallel-workflows) - Scatter-gather pattern
- [Parallel.ai: Search API](https://parallel.ai/blog/introducing-parallel-search) - Information-dense excerpts
- [Patronus AI: Agent Routing](https://www.patronus.ai/ai-agent-development/ai-agent-routing) - Smart routing patterns
- [Data Learning Science: Parallelization Pattern](https://datalearningscience.com/p/3-parallelization-agentic-design) - Aggregation best practices

---

## Summary: Final Architecture

### 6 Meta-Tools (~300 tokens total)

| Tool | Purpose | Frequency |
|------|---------|-----------|
| `search` | **Federated search (primary)** | Most queries |
| `tools` | List/discover available tools | Advanced use |
| `schema` | Get tool parameters | Advanced use |
| `run` | Execute specific tool | Advanced use |
| `open` | Browser preview | After searches |
| `export` | CSV/JSON/MD/script | End of research |

**Naming rationale:** `tools` (not `find`) avoids confusion with `search`. Clear domains:
- **Data:** `search`, `open`, `export`
- **Tool discovery:** `tools`, `schema`, `run`

### 84+ Discoverable Data Tools (0 initial tokens)

| Category | Tools | Accessed Via |
|----------|-------|--------------|
| Current sources | 69 | `run(tool, args)` |
| New sources | +15 | `run(tool, args)` |
| **Total** | **84+** | **~300 tokens each when loaded** |

### New Sources to Add (Discoverable)

| Source | Tools | Effort | Priority |
|--------|-------|--------|----------|
| SLNSW (State Library NSW) | 3-5 | Medium | P1 |
| AWM (War Memorial) | 3-5 | Medium | P1 |
| QSA (Qld State Archives) | 3-5 | Medium | P2 |
| SLV Enhanced (Direct IIIF) | 2-3 | Low | P2 |
| NLA Direct (IIIF) | 2-3 | Low | P3 |

### Before vs After

| Metric | Current | Optimized | Reduction |
|--------|---------|-----------|-----------|
| Initial context | ~23,000 tokens | ~300 tokens | **99%** |
| Tools exposed | 69 | 6 | 91% |
| Typical search workflow | 0 extra (pre-loaded) | ~400 tokens (3 calls) | N/A |
| Scalability | Linear growth | Constant | ∞ |

### Typical Session Comparison

| Workflow | Current (69 tools) | Optimized (6 meta-tools) |
|----------|-------------------|-------------------------|
| Initial load | 23,000 tokens | 300 tokens |
| "Find Melbourne photos 1920s" | 0 (already loaded) | 400 (search + open + export) |
| "Find shipwrecks in Victoria" | 0 (already loaded) | 350 (search + open) |
| **Total for 2 searches** | **23,000 tokens** | **1,050 tokens** |

**Real-world reduction: 95%+** for typical research sessions

---

## Implementation Checklist: Ensuring Zero Functionality Loss

### Critical: Complete Tool Index

The TOOL_INDEX must include ALL 69 tools with good keywords. Example complete index:

```typescript
export const TOOL_INDEX: ToolIndexEntry[] = [
  // PROV (5 tools)
  { name: 'prov_search', source: 'prov', shortDescription: 'Search Victorian archives', keywords: ['search', 'archives', 'records', 'photos', 'maps', 'victoria', 'government'] },
  { name: 'prov_get_images', source: 'prov', shortDescription: 'Extract IIIF images', keywords: ['images', 'download', 'digitised', 'iiif', 'photos'] },
  { name: 'prov_harvest', source: 'prov', shortDescription: 'Bulk download PROV records', keywords: ['harvest', 'bulk', 'download', 'batch'] },
  { name: 'prov_get_agency', source: 'prov', shortDescription: 'Get agency details', keywords: ['agency', 'VA', 'government', 'department'] },
  { name: 'prov_get_series', source: 'prov', shortDescription: 'Get series details', keywords: ['series', 'VPRS', 'collection'] },

  // Trove (13 tools)
  { name: 'trove_search', source: 'trove', shortDescription: 'Search newspapers/books/images', keywords: ['search', 'newspapers', 'books', 'images', 'articles', 'gazette'] },
  { name: 'trove_harvest', source: 'trove', shortDescription: 'Bulk download Trove records', keywords: ['harvest', 'bulk', 'download', 'batch'] },
  { name: 'trove_newspaper_article', source: 'trove', shortDescription: 'Get full article text', keywords: ['article', 'text', 'full', 'newspaper'] },
  { name: 'trove_list_titles', source: 'trove', shortDescription: 'List newspaper titles', keywords: ['newspapers', 'titles', 'list', 'publications'] },
  { name: 'trove_title_details', source: 'trove', shortDescription: 'Get title issue dates', keywords: ['title', 'details', 'issues', 'dates'] },
  { name: 'trove_get_contributor', source: 'trove', shortDescription: 'Get library details', keywords: ['library', 'contributor', 'NUC', 'institution'] },
  { name: 'trove_list_contributors', source: 'trove', shortDescription: 'List all libraries', keywords: ['libraries', 'contributors', 'institutions', 'list'] },
  { name: 'trove_list_magazine_titles', source: 'trove', shortDescription: 'List magazine titles', keywords: ['magazines', 'periodicals', 'titles', 'list'] },
  { name: 'trove_get_magazine_title', source: 'trove', shortDescription: 'Get magazine details', keywords: ['magazine', 'periodical', 'details', 'issues'] },
  { name: 'trove_get_work', source: 'trove', shortDescription: 'Get book/image details', keywords: ['work', 'book', 'image', 'details', 'holdings'] },
  { name: 'trove_get_person', source: 'trove', shortDescription: 'Get biographical data', keywords: ['person', 'biography', 'people', 'organisation'] },
  { name: 'trove_get_list', source: 'trove', shortDescription: 'Get curated list', keywords: ['list', 'curated', 'collection', 'user'] },
  { name: 'trove_search_people', source: 'trove', shortDescription: 'Search people/orgs', keywords: ['people', 'search', 'organisations', 'biography'] },

  // GHAP (5 tools)
  { name: 'ghap_search', source: 'ghap', shortDescription: 'Search historical placenames', keywords: ['placenames', 'places', 'locations', 'historical', 'geography'] },
  { name: 'ghap_get_place', source: 'ghap', shortDescription: 'Get place details', keywords: ['place', 'details', 'coordinates', 'location'] },
  { name: 'ghap_list_layers', source: 'ghap', shortDescription: 'List community datasets', keywords: ['layers', 'datasets', 'community', 'tlcmap'] },
  { name: 'ghap_get_layer', source: 'ghap', shortDescription: 'Get layer places', keywords: ['layer', 'dataset', 'places', 'all'] },
  { name: 'ghap_harvest', source: 'ghap', shortDescription: 'Bulk download placenames', keywords: ['harvest', 'bulk', 'download', 'batch'] },

  // Museums Victoria (6 tools)
  { name: 'museumsvic_search', source: 'museumsvic', shortDescription: 'Search museum collections', keywords: ['search', 'museum', 'objects', 'specimens', 'species'] },
  { name: 'museumsvic_get_article', source: 'museumsvic', shortDescription: 'Get educational article', keywords: ['article', 'education', 'content'] },
  { name: 'museumsvic_get_item', source: 'museumsvic', shortDescription: 'Get museum object', keywords: ['item', 'object', 'artefact', 'details'] },
  { name: 'museumsvic_get_species', source: 'museumsvic', shortDescription: 'Get species info', keywords: ['species', 'animal', 'plant', 'biology'] },
  { name: 'museumsvic_get_specimen', source: 'museumsvic', shortDescription: 'Get specimen details', keywords: ['specimen', 'natural', 'science', 'sample'] },
  { name: 'museumsvic_harvest', source: 'museumsvic', shortDescription: 'Bulk download museum records', keywords: ['harvest', 'bulk', 'download', 'batch'] },

  // ALA (8 tools)
  { name: 'ala_search_occurrences', source: 'ala', shortDescription: 'Search species sightings', keywords: ['occurrences', 'sightings', 'species', 'biodiversity', 'wildlife'] },
  { name: 'ala_search_species', source: 'ala', shortDescription: 'Search species by name', keywords: ['species', 'search', 'taxonomy', 'animals', 'plants'] },
  { name: 'ala_get_species', source: 'ala', shortDescription: 'Get species profile', keywords: ['species', 'profile', 'taxonomy', 'details'] },
  { name: 'ala_harvest', source: 'ala', shortDescription: 'Bulk download occurrences', keywords: ['harvest', 'bulk', 'download', 'batch'] },
  { name: 'ala_search_images', source: 'ala', shortDescription: 'Search species images', keywords: ['images', 'photos', 'species', 'wildlife'] },
  { name: 'ala_match_name', source: 'ala', shortDescription: 'Resolve taxonomy', keywords: ['taxonomy', 'name', 'classification', 'resolve'] },
  { name: 'ala_list_species_lists', source: 'ala', shortDescription: 'List species lists', keywords: ['lists', 'curated', 'species', 'collections'] },
  { name: 'ala_get_species_list', source: 'ala', shortDescription: 'Get species list', keywords: ['list', 'species', 'details', 'curated'] },

  // NMA (9 tools)
  { name: 'nma_search_objects', source: 'nma', shortDescription: 'Search museum objects', keywords: ['search', 'objects', 'artefacts', 'collection', 'museum'] },
  { name: 'nma_get_object', source: 'nma', shortDescription: 'Get object details', keywords: ['object', 'artefact', 'details', 'item'] },
  { name: 'nma_search_places', source: 'nma', shortDescription: 'Search significant places', keywords: ['places', 'search', 'locations', 'sites'] },
  { name: 'nma_harvest', source: 'nma', shortDescription: 'Bulk download NMA records', keywords: ['harvest', 'bulk', 'download', 'batch'] },
  { name: 'nma_get_place', source: 'nma', shortDescription: 'Get place details', keywords: ['place', 'location', 'site', 'details'] },
  { name: 'nma_search_parties', source: 'nma', shortDescription: 'Search people/orgs', keywords: ['people', 'parties', 'organisations', 'search'] },
  { name: 'nma_get_party', source: 'nma', shortDescription: 'Get person/org details', keywords: ['party', 'person', 'organisation', 'details'] },
  { name: 'nma_search_media', source: 'nma', shortDescription: 'Search images/video', keywords: ['media', 'images', 'video', 'photos', 'search'] },
  { name: 'nma_get_media', source: 'nma', shortDescription: 'Get media details', keywords: ['media', 'image', 'video', 'details', 'download'] },

  // VHD (9 tools)
  { name: 'vhd_search_places', source: 'vhd', shortDescription: 'Search heritage places', keywords: ['heritage', 'places', 'buildings', 'search', 'historic'] },
  { name: 'vhd_get_place', source: 'vhd', shortDescription: 'Get heritage place details', keywords: ['heritage', 'place', 'building', 'details'] },
  { name: 'vhd_search_shipwrecks', source: 'vhd', shortDescription: 'Search Victorian shipwrecks', keywords: ['shipwrecks', 'maritime', 'wrecks', 'ships', 'search'] },
  { name: 'vhd_harvest', source: 'vhd', shortDescription: 'Bulk download heritage records', keywords: ['harvest', 'bulk', 'download', 'batch'] },
  { name: 'vhd_get_shipwreck', source: 'vhd', shortDescription: 'Get shipwreck details', keywords: ['shipwreck', 'wreck', 'maritime', 'details'] },
  { name: 'vhd_list_municipalities', source: 'vhd', shortDescription: 'List Victorian councils', keywords: ['municipalities', 'councils', 'LGA', 'list'] },
  { name: 'vhd_list_architectural_styles', source: 'vhd', shortDescription: 'List architectural styles', keywords: ['architectural', 'styles', 'buildings', 'list'] },
  { name: 'vhd_list_themes', source: 'vhd', shortDescription: 'List heritage themes', keywords: ['themes', 'categories', 'heritage', 'list'] },
  { name: 'vhd_list_periods', source: 'vhd', shortDescription: 'List historical periods', keywords: ['periods', 'eras', 'dates', 'historical', 'list'] },

  // ACMI (7 tools)
  { name: 'acmi_search_works', source: 'acmi', shortDescription: 'Search films/TV/games', keywords: ['films', 'movies', 'tv', 'television', 'games', 'search'] },
  { name: 'acmi_get_work', source: 'acmi', shortDescription: 'Get work details', keywords: ['work', 'film', 'movie', 'details'] },
  { name: 'acmi_harvest', source: 'acmi', shortDescription: 'Bulk download ACMI works', keywords: ['harvest', 'bulk', 'download', 'batch'] },
  { name: 'acmi_list_creators', source: 'acmi', shortDescription: 'List directors/actors', keywords: ['creators', 'directors', 'actors', 'filmmakers', 'list'] },
  { name: 'acmi_get_creator', source: 'acmi', shortDescription: 'Get creator filmography', keywords: ['creator', 'director', 'actor', 'filmography'] },
  { name: 'acmi_list_constellations', source: 'acmi', shortDescription: 'List themed collections', keywords: ['constellations', 'themes', 'curated', 'collections'] },
  { name: 'acmi_get_constellation', source: 'acmi', shortDescription: 'Get constellation works', keywords: ['constellation', 'theme', 'collection', 'works'] },

  // PM Transcripts (2 tools)
  { name: 'pm_transcripts_get_transcript', source: 'pm', shortDescription: 'Get PM speech/release', keywords: ['transcript', 'speech', 'prime minister', 'media', 'release'] },
  { name: 'pm_transcripts_harvest', source: 'pm', shortDescription: 'Bulk download transcripts', keywords: ['harvest', 'bulk', 'download', 'batch', 'transcripts'] },

  // IIIF (2 tools)
  { name: 'iiif_get_manifest', source: 'iiif', shortDescription: 'Fetch IIIF manifest', keywords: ['iiif', 'manifest', 'images', 'metadata', 'any institution'] },
  { name: 'iiif_get_image_url', source: 'iiif', shortDescription: 'Construct image URL', keywords: ['iiif', 'image', 'url', 'download', 'size'] },

  // GA HAP (3 tools)
  { name: 'ga_hap_search', source: 'ga_hap', shortDescription: 'Search aerial photos', keywords: ['aerial', 'photos', 'historical', 'photography', 'search'] },
  { name: 'ga_hap_get_photo', source: 'ga_hap', shortDescription: 'Get aerial photo details', keywords: ['aerial', 'photo', 'details', 'tiff', 'download'] },
  { name: 'ga_hap_harvest', source: 'ga_hap', shortDescription: 'Bulk download aerial photos', keywords: ['harvest', 'bulk', 'download', 'batch', 'aerial'] },
];
```

**Verification:** 69 tools indexed = 69 tools accessible. Zero functionality loss.

---

## Ensuring Claude Code Understands the Pattern

### Problem: Claude Might Not Discover the Hidden Tools

When Claude Code loads this MCP server, it sees only 5 tools. Without guidance, it might:
1. Not realize 84+ tools are hidden
2. Try to call data tools directly (will fail)
3. Skip the `find → schema → run` workflow

### Solution: Enhanced Descriptions + CLAUDE.md Guidance

**Update meta-tool descriptions to be self-documenting:**

```typescript
{
  name: 'search',
  description: 'PRIMARY TOOL: Search across all Australian history sources in parallel. ' +
    'Auto-selects relevant sources based on query. ' +
    'For specific tools, use tools() → schema() → run() instead.',
}

{
  name: 'tools',
  description: 'List available data tools (84+ available). ' +
    'Use when you need a specific tool not covered by search(). ' +
    'Sources: PROV, Trove, GHAP, MuseumsVic, ALA, NMA, VHD, ACMI, PM Transcripts, GA HAP, IIIF',
}

{
  name: 'schema',
  description: 'Get full parameter schema for a tool. ' +
    'ALWAYS call this before run() to see required/optional parameters.',
}

{
  name: 'run',
  description: 'Execute a data tool by name. ' +
    'Use tools() to discover tools, schema() to get parameters, then run().',
}
```

**Add workflow guidance to CLAUDE.md:**

```markdown
## Dynamic Tool Discovery

This MCP exposes 5 meta-tools that provide access to 84+ data source tools.

### Workflow
1. `tools(query)` - Discover relevant tools (e.g., tools("newspapers") → trove_search)
2. `schema(tool)` - Get parameters (e.g., schema("trove_search") → {query, category, ...})
3. `run(tool, args)` - Execute the tool (e.g., run("trove_search", {query: "Melbourne"}))
4. `open(url)` - Preview results in browser
5. `export(records, format)` - Save to CSV/JSON/Markdown

### Quick Reference
- Data tools are NOT directly callable - use run()
- Always check schema() before run() for correct parameters
- tools() with no query lists all 84+ tools grouped by source
```

### Error Handling for Better UX

Implement helpful errors when Claude makes mistakes:

```typescript
// In run() implementation
if (!TOOL_INDEX.some(t => t.name === args.tool)) {
  return errorResponse(
    `Unknown tool: ${args.tool}. ` +
    `Use tools() to discover available tools, then run(tool, args).`
  );
}

// If schema wasn't called first and params look wrong
if (Object.keys(args.args || {}).length === 0) {
  return errorResponse(
    `No arguments provided. Use schema("${args.tool}") to see required parameters.`
  );
}
```

---

## Verification Summary

### ✅ Functionality Preserved

| Check | Status |
|-------|--------|
| All 69 tools indexed in TOOL_INDEX | ✅ (see complete index above) |
| All tools accessible via run() | ✅ |
| All schemas accessible via schema() | ✅ |
| Harvest/bulk download works | ✅ via run("*_harvest", args) |
| URL extraction works | ✅ data tools return same fields |
| IIIF image construction works | ✅ via run("iiif_get_image_url", args) |

### ✅ Claude Code Optimized

| Check | Status |
|-------|--------|
| Clear meta-tool names | ✅ search, tools, schema, run, open, export |
| Self-documenting descriptions | ✅ (enhanced above) |
| Workflow guidance in CLAUDE.md | ✅ (added above) |
| Helpful error messages | ✅ (guides to correct usage) |
| Keywords for all 69 tools | ✅ (enables accurate tools()) |

---

## References

1. [Anthropic Engineering: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
2. [Speakeasy: How We Reduced Token Usage by 100x](https://www.speakeasy.com/blog/how-we-reduced-token-usage-by-100x-dynamic-toolsets-v2)
3. [SEP-1576: Mitigating Token Bloat in MCP](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1576)
4. [CodeRabbit: Ballooning Context in the MCP Era](https://www.coderabbit.ai/blog/handling-ballooning-context-in-the-mcp-era-context-engineering-on-steroids)
5. [K2View: MCP Strategies for Token-Efficient Context](https://www.k2view.com/blog/mcp-strategies-for-grounded-prompts-and-token-efficient-llm-context/)
6. [MCP Tools Specification](https://modelcontextprotocol.io/docs/concepts/tools) - Resource links and content types
7. [Chrome DevTools MCP](https://developer.chrome.com/blog/chrome-devtools-mcp) - Browser automation integration
8. [SLV IIIF Guide](https://lab.slv.vic.gov.au/resources/using-iiif-to-work-with-the-librarys-digitised-collections) - State Library Victoria access
9. [GLAM Workbench](https://glam-workbench.net/) - Australian GLAM data tools
10. [Australian War Memorial Digital Collection](https://www.awm.gov.au/digital-collection)
11. [Data.NSW Collections API](https://data.nsw.gov.au/data/dataset/collections)
12. [Queensland State Archives Open Data](https://www.data.qld.gov.au/dataset/queensland-state-archives-digitised-collection)
