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

Implement the Speakeasy three-tool discovery pattern. Instead of exposing 69 tools, expose only 3 meta-tools.

### 2.1 Architecture Change

**Before (69 tools):**
```
ListTools → Returns 69 tool schemas (~23,000 tokens)
```

**After (3 tools):**
```
ListTools → Returns 3 tool schemas (~500 tokens)
  - search_tools(query, source?) → Find relevant tools
  - describe_tool(toolName) → Get full schema
  - execute_tool(toolName, args) → Run the tool
```

### 2.2 New Tool Implementations

**search_tools:**
```typescript
{
  name: 'search_tools',
  description: 'Search available tools. Sources: PROV (archives), Trove (newspapers/books), GHAP (placenames), MuseumsVic, ALA (biodiversity), NMA (museum), VHD (heritage), ACMI (film/TV), PM Transcripts, GA HAP (aerial photos)',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'What you want to do' },
      source: { type: 'string', description: 'Filter by source name' },
    },
  },
}
```

**describe_tool:**
```typescript
{
  name: 'describe_tool',
  description: 'Get full schema for a tool',
  inputSchema: {
    type: 'object',
    properties: {
      toolName: { type: 'string' },
    },
    required: ['toolName'],
  },
}
```

**execute_tool:**
```typescript
{
  name: 'execute_tool',
  description: 'Execute a tool with parameters',
  inputSchema: {
    type: 'object',
    properties: {
      toolName: { type: 'string' },
      args: { type: 'object' },
    },
    required: ['toolName', 'args'],
  },
}
```

### 2.3 Tool Index for Discovery

Create `src/core/tool-index.ts`:

```typescript
interface ToolIndexEntry {
  name: string;
  source: string;
  shortDescription: string;  // 3-5 words
  keywords: string[];        // For semantic search
}

export const TOOL_INDEX: ToolIndexEntry[] = [
  { name: 'prov_search', source: 'prov', shortDescription: 'Search Victorian archives', keywords: ['search', 'archives', 'records', 'photos', 'maps'] },
  { name: 'prov_get_images', source: 'prov', shortDescription: 'Extract IIIF images', keywords: ['images', 'download', 'digitised'] },
  { name: 'trove_search', source: 'trove', shortDescription: 'Search newspapers/books', keywords: ['newspapers', 'books', 'images', 'articles'] },
  // ... 66 more entries
];
```

### 2.4 Implementation: search_tools

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
    tip: 'Use describe_tool(name) for full parameter schema',
  });
}
```

### 2.5 Implementation: describe_tool

```typescript
async execute(args: { toolName: string }) {
  const tool = registry.getTool(args.toolName);
  if (!tool) {
    return errorResponse(`Unknown tool: ${args.toolName}`);
  }

  return successResponse({
    schema: tool.schema,  // Full schema with all parameters
    examples: getToolExamples(args.toolName),  // Optional usage examples
  });
}
```

### 2.6 Implementation: execute_tool

```typescript
async execute(args: { toolName: string; args: Record<string, unknown> }) {
  return registry.executeTool(args.toolName, args.args);
}
```

### Phase 2 Token Analysis

| Mode | Initial Load | Per-Tool Discovery | Per-Tool Execution |
|------|--------------|-------------------|-------------------|
| **Current (69 tools)** | 23,000 | 0 | 0 |
| **Dynamic (3 tools)** | 500 | ~200-400 | 0 |

**Typical workflow (search 5 topics, use 8 tools):**
- Current: 23,000 tokens (all upfront)
- Dynamic: 500 + (5 × 100) + (8 × 300) = 3,400 tokens

**Savings: 85%**

### Phase 2 Trade-offs

**Pros:**
- 85-90% token reduction
- Scales to unlimited tools without context growth
- Better tool discovery via semantic search

**Cons:**
- 2-3x more LLM calls per tool usage
- ~50% slower initial tool execution
- Requires agent to learn discovery pattern

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

## References

1. [Anthropic Engineering: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
2. [Speakeasy: How We Reduced Token Usage by 100x](https://www.speakeasy.com/blog/how-we-reduced-token-usage-by-100x-dynamic-toolsets-v2)
3. [SEP-1576: Mitigating Token Bloat in MCP](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1576)
4. [CodeRabbit: Ballooning Context in the MCP Era](https://www.coderabbit.ai/blog/handling-ballooning-context-in-the-mcp-era-context-engineering-on-steroids)
5. [K2View: MCP Strategies for Token-Efficient Context](https://www.k2view.com/blog/mcp-strategies-for-grounded-prompts-and-token-efficient-llm-context/)
