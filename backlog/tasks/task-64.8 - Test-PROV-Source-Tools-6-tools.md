---
id: task-64.8
title: Test PROV Source Tools (6 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:05'
labels:
  - testing
  - v1.0.0
  - prov
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 6 PROV (Public Record Office Victoria) tools via run().

## Test Cases

### prov_search
- [ ] `run(tool="prov_search", args={query:"railway"})` - basic search
- [ ] `run(tool="prov_search", args={query:"council meeting", series:"VPRS 3183"})` - with series
- [ ] `run(tool="prov_search", args={query:"photograph", digitisedOnly:true})` - digitised only
- [ ] `run(tool="prov_search", args={query:"Melbourne", limit:5})` - with limit
- [ ] Verify response has totalResults, records array

### prov_get_images
- [ ] Get a manifestUrl from prov_search results first
- [ ] `run(tool="prov_get_images", args={manifestUrl:"...", pages:"1-5"})` - page range
- [ ] `run(tool="prov_get_images", args={manifestUrl:"...", size:"full"})` - full size
- [ ] `run(tool="prov_get_images", args={manifestUrl:"...", size:"thumbnail"})` - thumbnails
- [ ] Verify returns array of image URLs

### prov_harvest
- [ ] `run(tool="prov_harvest", args={query:"railway", maxRecords:10})` - basic harvest
- [ ] Verify pagination works
- [ ] Verify returns records array

### prov_get_agency
- [ ] `run(tool="prov_get_agency", args={agencyId:"VA 672"})` - get agency by VA number
- [ ] Verify returns agency details (name, functions, dates)

### prov_get_series
- [ ] `run(tool="prov_get_series", args={seriesId:"VPRS 515"})` - get series by VPRS
- [ ] Verify returns series details (title, date range, quantity)

### prov_get_items
- [ ] `run(tool="prov_get_items", args={seriesId:"VPRS 515"})` - list items in series
- [ ] `run(tool="prov_get_items", args={seriesId:"VPRS 515", query:"Melbourne"})` - with filter
- [ ] Verify returns items array
<!-- SECTION:DESCRIPTION:END -->
