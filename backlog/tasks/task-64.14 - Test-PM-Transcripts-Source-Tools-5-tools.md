---
id: task-64.14
title: Test PM Transcripts Source Tools (5 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:07'
labels:
  - testing
  - v1.0.0
  - pm-transcripts
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 5 PM Transcripts (Prime Ministerial) tools via run().

## Test Cases

### pm_transcripts_get_transcript
- [ ] `run(tool="pm_transcripts_get_transcript", args={id:1})` - get transcript by ID
- [ ] `run(tool="pm_transcripts_get_transcript", args={id:5000})` - Hawke era
- [ ] `run(tool="pm_transcripts_get_transcript", args={id:10000})` - Howard era
- [ ] Verify returns transcript text, date, PM name, PDF link

### pm_transcripts_harvest
- [ ] `run(tool="pm_transcripts_harvest", args={startFrom:1, maxRecords:5})` - early transcripts
- [ ] `run(tool="pm_transcripts_harvest", args={startFrom:5000, maxRecords:5})` - Hawke era
- [ ] Verify sequential ID scanning works
- [ ] Verify handles gaps in IDs gracefully

### pm_transcripts_search (requires FTS5 index)
- [ ] First check if index exists with pm_transcripts_index_stats
- [ ] If no index: `run(tool="pm_transcripts_build_index", args={mode:"build"})` - build first
- [ ] `run(tool="pm_transcripts_search", args={query:"climate change"})` - basic search
- [ ] `run(tool="pm_transcripts_search", args={query:"economic reform"})` - policy topic
- [ ] `run(tool="pm_transcripts_search", args={query:"\"trade agreement\""})` - phrase match
- [ ] Verify FTS5 operators work (OR, NOT, NEAR)

### pm_transcripts_build_index
- [ ] `run(tool="pm_transcripts_build_index", args={mode:"update"})` - incremental update
- [ ] Verify only fetches new transcripts since last build

### pm_transcripts_index_stats
- [ ] `run(tool="pm_transcripts_index_stats", args={})` - get index statistics
- [ ] Verify returns transcript count, PM coverage, index size
<!-- SECTION:DESCRIPTION:END -->
