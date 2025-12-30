---
id: task-64.12
title: Test ACMI Source Tools (7 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:06'
labels:
  - testing
  - v1.0.0
  - acmi
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 7 ACMI (Australian Centre for the Moving Image) tools via run().

## Test Cases

### acmi_search_works
- [ ] `run(tool="acmi_search_works", args={query:"Mad Max"})` - basic search
- [ ] `run(tool="acmi_search_works", args={query:"Melbourne", type:"Film"})` - films
- [ ] `run(tool="acmi_search_works", args={query:"game", type:"Videogame"})` - videogames
- [ ] `run(tool="acmi_search_works", args={query:"documentary", type:"Television"})` - TV
- [ ] Verify returns works with IDs, types, creators

### acmi_get_work
- [ ] Get a work ID from acmi_search_works first
- [ ] `run(tool="acmi_get_work", args={id:"..."})` - get work details
- [ ] Verify returns full work information

### acmi_harvest
- [ ] `run(tool="acmi_harvest", args={query:"Australian", maxRecords:10})` - harvest
- [ ] Verify page-based pagination works

### acmi_list_creators
- [ ] `run(tool="acmi_list_creators", args={})` - list creators
- [ ] `run(tool="acmi_list_creators", args={query:"director"})` - search creators
- [ ] Verify returns creator list with IDs

### acmi_list_constellations
- [ ] `run(tool="acmi_list_constellations", args={})` - list curated collections
- [ ] Verify returns constellation IDs and names

### acmi_get_constellation
- [ ] Get a constellation ID from acmi_list_constellations
- [ ] `run(tool="acmi_get_constellation", args={id:"..."})` - get constellation
- [ ] Verify returns constellation details with works

### acmi_get_related
- [ ] Get a work ID with related content
- [ ] `run(tool="acmi_get_related", args={workId:"..."})` - get related works
- [ ] Verify returns parts (episodes), groups (series), recommendations
<!-- SECTION:DESCRIPTION:END -->
