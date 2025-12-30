---
id: task-64.7
title: Test Export and Open Meta-Tools
status: To Do
assignee: []
created_date: '2025-12-30 06:03'
labels:
  - testing
  - v1.0.0
  - utility-tools
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test the export and open utility meta-tools.

## Prerequisites
Run a search first to get sample records for export tests.

## Test Cases

### export()
- [ ] `export(records=[...], format="csv")` - CSV format (inline)
- [ ] `export(records=[...], format="json")` - JSON format (inline)
- [ ] `export(records=[...], format="markdown")` - Markdown format (inline)
- [ ] `export(records=[...], format="download-script")` - Download script
- [ ] `export(records=[...], format="csv", path="/tmp/test-export.csv")` - save to file
- [ ] `export(records=[...], format="json", fields=["id", "title", "url"])` - selected fields
- [ ] Verify CSV has proper headers
- [ ] Verify JSON is valid
- [ ] Verify Markdown has table formatting

### open()
- [ ] `open(url="https://prov.vic.gov.au")` - open URL in browser
- [ ] Verify returns success status
- [ ] Note: This will actually open browser - test sparingly
<!-- SECTION:DESCRIPTION:END -->
