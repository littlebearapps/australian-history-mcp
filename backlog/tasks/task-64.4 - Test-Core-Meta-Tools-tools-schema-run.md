---
id: task-64.4
title: 'Test Core Meta-Tools (tools, schema, run)'
status: To Do
assignee: []
created_date: '2025-12-30 06:03'
labels:
  - testing
  - v1.0.0
  - meta-tools
dependencies: []
parent_task_id: task-64
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test the 3 core discovery and execution meta-tools.

## Test Cases

### tools() - Tool Discovery
- [ ] `tools()` - list all tools (no filter)
- [ ] `tools(query="newspaper")` - keyword search
- [ ] `tools(query="harvest")` - find harvest tools
- [ ] `tools(source="prov")` - filter by source
- [ ] `tools(source="trove")` - filter by source
- [ ] `tools(category="search")` - filter by category
- [ ] `tools(category="get")` - filter by category
- [ ] `tools(category="list")` - filter by category
- [ ] `tools(category="harvest")` - filter by category
- [ ] `tools(query="species", source="ala")` - combined filters
- [ ] Verify tool count matches expected (75 tools)

### schema() - Get Tool Schema
- [ ] `schema(tool="prov_search")` - PROV tool
- [ ] `schema(tool="trove_search")` - Trove tool
- [ ] `schema(tool="ghap_search")` - GHAP tool
- [ ] `schema(tool="ala_search_occurrences")` - ALA tool
- [ ] `schema(tool="nonexistent_tool")` - should error gracefully
- [ ] Verify schema includes inputSchema with properties, required

### run() - Execute Tool
- [ ] `run(tool="prov_search", args={query:"railway"})` - basic execution
- [ ] `run(tool="trove_search", args={query:"Melbourne", limit:3})` - with limit
- [ ] Verify returns proper response structure
- [ ] Test missing required param - should error with helpful message
- [ ] Test invalid tool name - should error gracefully
<!-- SECTION:DESCRIPTION:END -->
