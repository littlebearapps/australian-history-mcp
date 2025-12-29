---
id: task-36.2
title: TEST-003.6 - Test meta-tools with Trove
status: Done
assignee: []
created_date: '2025-12-29 04:46'
updated_date: '2025-12-29 05:04'
labels:
  - testing
  - trove
  - meta-tools
dependencies: []
parent_task_id: task-36
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test the dynamic mode meta-tools (tools, schema, run) specifically with Trove tools.

**Test Scenarios:**
1. tools() - Discover Trove tools by keyword
   - tools(query="newspaper") finds trove_search, trove_newspaper_article
   - tools(source="trove") lists all 14 Trove tools
   - tools(category="search") includes trove_search, trove_search_people
   - tools(category="harvest") includes trove_harvest

2. schema() - Get Trove tool schemas
   - schema(tool="trove_search") returns full parameter schema
   - Verify new v0.8.0 parameters appear in schema
   - Verify enums are correct (illustrationTypes, wordCount, etc.)

3. run() - Execute Trove tools via meta-tool
   - run(tool="trove_search", args={query:"Melbourne"})
   - run() with new v0.8.0 parameters
   - Error handling for invalid tool names
   - Error handling for missing required params
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 tools(query="newspaper") finds Trove newspaper tools
- [x] #2 tools(source="trove") lists all 14 Trove tools
- [x] #3 tools(category="search") includes Trove search tools
- [x] #4 schema(tool="trove_search") returns complete schema
- [x] #5 Schema includes all v0.8.0 parameters
- [x] #6 Schema enums match implementation
- [x] #7 run(tool="trove_search", args={...}) executes correctly
- [x] #8 run() handles errors gracefully
- [x] #9 run() validates required parameters
<!-- AC:END -->
