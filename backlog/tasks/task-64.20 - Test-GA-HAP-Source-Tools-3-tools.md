---
id: task-64.20
title: Test GA HAP Source Tools (3 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:07'
labels:
  - testing
  - v1.0.0
  - ga-hap
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 3 GA HAP (Geoscience Australia Historical Aerial Photography) tools via run().

## Test Cases

### ga_hap_search
- [ ] `run(tool="ga_hap_search", args={state:"VIC"})` - search by state
- [ ] `run(tool="ga_hap_search", args={state:"VIC", yearFrom:1950, yearTo:1960})` - date range
- [ ] `run(tool="ga_hap_search", args={state:"VIC", scannedOnly:true})` - scanned only
- [ ] `run(tool="ga_hap_search", args={lat:-37.81, lon:144.96, radiusKm:25})` - spatial search

### ga_hap_get_photo
- [ ] `run(tool="ga_hap_get_photo", args={objectId:"..."})` - get by OBJECTID

### ga_hap_harvest
- [ ] `run(tool="ga_hap_harvest", args={state:"VIC", maxRecords:10})` - basic harvest
<!-- SECTION:DESCRIPTION:END -->
