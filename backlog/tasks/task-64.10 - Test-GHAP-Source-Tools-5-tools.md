---
id: task-64.10
title: Test GHAP Source Tools (5 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:05'
labels:
  - testing
  - v1.0.0
  - ghap
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 5 GHAP (Gazetteer of Historical Australian Placenames) tools via run().

## Test Cases

### ghap_search
- [ ] `run(tool="ghap_search", args={query:"Melbourne"})` - basic search
- [ ] `run(tool="ghap_search", args={query:"creek", state:"VIC"})` - with state
- [ ] `run(tool="ghap_search", args={query:"station", lga:"Yarra"})` - with LGA
- [ ] `run(tool="ghap_search", args={query:"Melbourne", matchType:"exact"})` - exact match
- [ ] `run(tool="ghap_search", args={query:"Melb", matchType:"fuzzy"})` - fuzzy match
- [ ] Verify returns GeoJSON-style results with coordinates

### ghap_get_place
- [ ] Get a place ID from ghap_search first
- [ ] `run(tool="ghap_get_place", args={placeId:"..."})` - get place details
- [ ] Verify returns coordinates, source, description

### ghap_list_layers
- [ ] `run(tool="ghap_list_layers", args={})` - list all community layers
- [ ] Verify returns layer IDs and names

### ghap_get_layer
- [ ] Get a layer ID from ghap_list_layers first
- [ ] `run(tool="ghap_get_layer", args={layerId:"..."})` - get layer places
- [ ] Verify returns array of places

### ghap_harvest
- [ ] `run(tool="ghap_harvest", args={query:"railway", maxRecords:10})` - basic harvest
- [ ] `run(tool="ghap_harvest", args={query:"creek", state:"VIC", maxRecords:10})` - with filters
- [ ] Verify pagination works
<!-- SECTION:DESCRIPTION:END -->
