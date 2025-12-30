---
id: task-64.13
title: Test VHD Source Tools (9 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:06'
labels:
  - testing
  - v1.0.0
  - vhd
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 9 VHD (Victorian Heritage Database) tools via run().

## Test Cases

### vhd_search_places
- [ ] `run(tool="vhd_search_places", args={query:"railway station"})` - basic search
- [ ] `run(tool="vhd_search_places", args={query:"church", municipality:"Melbourne"})` - with municipality
- [ ] `run(tool="vhd_search_places", args={query:"Victorian", architecturalStyle:"Victorian"})` - style filter
- [ ] Verify returns places with heritage overlays

### vhd_get_place
- [ ] Get a place ID from vhd_search_places first
- [ ] `run(tool="vhd_get_place", args={id:"..."})` - get place details
- [ ] Verify returns full heritage information, images

### vhd_search_shipwrecks
- [ ] `run(tool="vhd_search_shipwrecks", args={query:"barque"})` - search wrecks
- [ ] `run(tool="vhd_search_shipwrecks", args={query:"Melbourne"})` - by location
- [ ] Verify returns shipwreck records

### vhd_get_shipwreck
- [ ] Get a shipwreck ID from vhd_search_shipwrecks first
- [ ] `run(tool="vhd_get_shipwreck", args={id:"..."})` - get wreck details
- [ ] Verify returns wreck information

### vhd_harvest
- [ ] `run(tool="vhd_harvest", args={query:"railway", maxRecords:10})` - basic harvest
- [ ] Verify pagination works

### vhd_list_municipalities
- [ ] `run(tool="vhd_list_municipalities", args={})` - list all
- [ ] Verify returns Victorian municipality list

### vhd_list_architectural_styles
- [ ] `run(tool="vhd_list_architectural_styles", args={})` - list styles
- [ ] Verify returns style classifications

### vhd_list_themes
- [ ] `run(tool="vhd_list_themes", args={})` - list heritage themes
- [ ] Verify returns theme list

### vhd_list_periods
- [ ] `run(tool="vhd_list_periods", args={})` - list historical periods
- [ ] Verify returns period list
<!-- SECTION:DESCRIPTION:END -->
