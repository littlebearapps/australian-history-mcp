---
id: task-64.11
title: Test ALA Source Tools (8 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:06'
labels:
  - testing
  - v1.0.0
  - ala
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 8 ALA (Atlas of Living Australia) tools via run().

## Test Cases

### ala_search_occurrences
- [ ] `run(tool="ala_search_occurrences", args={scientificName:"Phascolarctos cinereus"})` - koala
- [ ] `run(tool="ala_search_occurrences", args={commonName:"platypus"})` - by common name
- [ ] `run(tool="ala_search_occurrences", args={scientificName:"Vombatus ursinus", state:"Victoria"})` - with state
- [ ] `run(tool="ala_search_occurrences", args={scientificName:"Ornithorhynchus anatinus", lat:-37.81, lon:144.96, radiusKm:50})` - spatial
- [ ] Verify returns occurrence records with coordinates

### ala_search_species
- [ ] `run(tool="ala_search_species", args={query:"platypus"})` - basic search
- [ ] `run(tool="ala_search_species", args={query:"eucalyptus"})` - plants
- [ ] Verify returns species list with GUIDs

### ala_get_species
- [ ] Get a GUID from ala_search_species first
- [ ] `run(tool="ala_get_species", args={guid:"..."})` - get species profile
- [ ] Verify returns taxonomy, conservation status, images

### ala_harvest
- [ ] `run(tool="ala_harvest", args={scientificName:"Phascolarctos cinereus", maxRecords:10})` - harvest
- [ ] Verify pagination works

### ala_search_images
- [ ] `run(tool="ala_search_images", args={query:"koala"})` - keyword search
- [ ] `run(tool="ala_search_images", args={taxon:"Phascolarctos cinereus"})` - by taxon
- [ ] Verify returns image URLs and metadata

### ala_match_name
- [ ] `run(tool="ala_match_name", args={name:"koala"})` - resolve common name
- [ ] `run(tool="ala_match_name", args={name:"Phascolarctos cinereus"})` - scientific name
- [ ] Verify returns matched taxon with classification

### ala_list_species_lists
- [ ] `run(tool="ala_list_species_lists", args={})` - list all
- [ ] `run(tool="ala_list_species_lists", args={query:"threatened"})` - search lists
- [ ] Verify returns list IDs (druids)

### ala_get_species_list
- [ ] Get a druid from ala_list_species_lists first
- [ ] `run(tool="ala_get_species_list", args={druid:"..."})` - get list details
- [ ] Verify returns species in list
<!-- SECTION:DESCRIPTION:END -->
