---
id: task-64.15
title: Test IIIF Source Tools (2 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:07'
labels:
  - testing
  - v1.0.0
  - iiif
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test both IIIF (International Image Interoperability Framework) tools via run().

## Test Cases

### iiif_get_manifest
- [ ] `run(tool="iiif_get_manifest", args={manifestUrl:"https://rosetta.slv.vic.gov.au/delivery/iiif/presentation/2.1/IE145082/manifest"})` - SLV manifest
- [ ] Try a NLA manifest if available
- [ ] Verify returns parsed manifest with canvases, images
- [ ] Verify handles both IIIF v2.x and v3.x manifests

### iiif_get_image_url
- [ ] Get an imageServiceUrl from iiif_get_manifest first
- [ ] `run(tool="iiif_get_image_url", args={imageServiceUrl:"...", size:"max"})` - full size
- [ ] `run(tool="iiif_get_image_url", args={imageServiceUrl:"...", size:"!1024,1024"})` - best fit
- [ ] `run(tool="iiif_get_image_url", args={imageServiceUrl:"...", size:"pct:50"})` - percentage
- [ ] `run(tool="iiif_get_image_url", args={imageServiceUrl:"...", size:"1024,"})` - width only
- [ ] `run(tool="iiif_get_image_url", args={imageServiceUrl:"...", format:"jpg"})` - JPEG
- [ ] `run(tool="iiif_get_image_url", args={imageServiceUrl:"...", format:"png"})` - PNG
- [ ] Verify returns valid IIIF Image API URL
<!-- SECTION:DESCRIPTION:END -->
