---
id: task-64.9
title: Test Museums Victoria Source Tools (6 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:05'
labels:
  - testing
  - v1.0.0
  - museums-victoria
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 6 Museums Victoria tools via run().

## Test Cases

### museumsvic_search
- [ ] `run(tool="museumsvic_search", args={query:"gold rush"})` - basic search
- [ ] `run(tool="museumsvic_search", args={query:"railway", category:"history & technology"})` - with category
- [ ] `run(tool="museumsvic_search", args={recordType:"species", taxon:"Platypus"})` - species search
- [ ] `run(tool="museumsvic_search", args={query:"Melbourne", sort:"random"})` - random sort
- [ ] `run(tool="museumsvic_search", args={query:"test", limit:5})` - with limit

### museumsvic_get_article
- [ ] Get an article ID from search (articles/xxx format)
- [ ] `run(tool="museumsvic_get_article", args={id:"..."})` - get article
- [ ] Verify returns article content, images

### museumsvic_get_item
- [ ] Get an item ID from search (items/xxx format)
- [ ] `run(tool="museumsvic_get_item", args={id:"..."})` - get museum object
- [ ] Verify returns object details, images

### museumsvic_get_species
- [ ] Get a species ID from search
- [ ] `run(tool="museumsvic_get_species", args={id:"..."})` - get species info
- [ ] Verify returns taxonomy, habitat, images

### museumsvic_get_specimen
- [ ] Get a specimen ID from search (specimens/xxx format)
- [ ] `run(tool="museumsvic_get_specimen", args={id:"..."})` - get specimen
- [ ] Verify returns specimen details

### museumsvic_harvest
- [ ] `run(tool="museumsvic_harvest", args={query:"gold", maxRecords:10})` - basic harvest
- [ ] Verify pagination via Link header works
<!-- SECTION:DESCRIPTION:END -->
