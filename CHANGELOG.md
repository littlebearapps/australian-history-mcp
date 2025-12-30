# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-30

This is the first stable release of the Australian History MCP Server, providing programmatic access to 11 Australian data sources with 75 data tools and 22 meta-tools.

### Added
- **Research Planning** - `plan_search` meta-tool for structured research strategy
  - Analyses topics to extract themes and research questions
  - Suggests historical name variations (suburbs, streets, venues)
  - Prioritises relevant data sources with capital city recognition
  - Generates coverage matrix (sources vs content types)
  - Creates plan.md file for reference
- **Session Management** - 7 meta-tools for tracking research sessions
  - `session_start` - Start a named research session
  - `session_status` - Get current progress and coverage gaps
  - `session_end` - End session with final report
  - `session_resume` - Resume a paused or previous session (by ID or name)
  - `session_list` - List all sessions with optional filters
  - `session_export` - Export session data (JSON, Markdown, CSV)
  - `session_note` - Add notes to current session
- **Context Compression** - 4 meta-tools for reducing token usage
  - `compress` - Reduce records to essential fields (70-85% savings)
  - `urls` - Extract only URLs from records
  - `dedupe` - Remove duplicate records using URL and title matching
  - `checkpoint` - Save/load/list/delete research checkpoints
- **Saved Queries** - 4 meta-tools for reusable searches
  - `save_query` - Save a named query for later reuse
  - `list_queries` - List saved queries with filtering (searches name, description, and parameters)
  - `run_query` - Execute a saved query with optional overrides (supports all tools including meta-tools)
  - `delete_query` - Remove a saved query by name
- **Automatic query logging** when session is active
- **Result fingerprinting** for duplicate detection across searches
- **Checkpoint persistence** for long research sessions
- **Invalid source warnings** in federated search when invalid source names are passed

### Fixed
- Melbourne now correctly resolves to VIC (capital city priority in GHAP lookup)
- GA-HAP now prioritised for aerial photograph queries (+50 relevance boost)
- Species and common terms (platypus, koala, photographs, etc.) no longer parsed as locations
- ALA now prioritised for biodiversity/species queries
- `plan_search` now generates fallback search steps when no high-relevance sources found
- `session_resume` now finds sessions by name, not just UUID
- Duplicate fingerprints prevented in session tracking
- `run_query` now works with meta-tools (fixed circular dependency)
- `list_queries` search now checks query parameters, not just name/description
- `export` now respects `fields` parameter for JSON format
- GHAP HTML error responses now handled gracefully with informative error messages

### Changed
- Meta-tool count: 10 → 22
- Dynamic mode token cost: ~1,100 → ~1,600 tokens (still 86% reduction vs legacy)
- Biodiversity theme added to intent classifier (platypus, koala, species, fauna, flora)
- Photograph theme added to intent classifier (aerial, airphoto, photo, image)

### Documentation
- Updated CLAUDE.md with all new meta-tools and use cases
- Updated README.md with new features and workflow examples
- Added `docs/quickrefs/research-workflow.md` guide
- Added `docs/dev-guides/manual-testing-checklist.md`
- Added `docs/testing/v1.0.0-test-findings.md` with comprehensive test results
- Added integration test suite in `tests/integration/`

## [0.7.0] - 2025-12-27

### Added
- **Dynamic tool loading** - 6 meta-tools instead of 69 (93% token reduction)
  - `tools` - Discover available data tools by keyword, source, or category
  - `schema` - Get full input schema for a specific tool
  - `run` - Execute any data tool with parameter validation
  - `search` - Federated search across multiple sources in parallel
  - `open` - Open URLs in the default browser
  - `export` - Export records to CSV, JSON, Markdown, or download script
- **Federated search** - Search PROV, Trove, NMA, Museums Victoria, ALA, VHD, ACMI, GHAP, GA HAP in parallel with a single call
- **Parameter validation** in `run()` meta-tool for required parameters
- **Date format validation** for Trove dateFrom/dateTo (YYYY, YYYY-MM, YYYY-MM-DD)
- Shared parameter descriptions (PARAMS) for consistency across tools
- Tool index with categories and keywords for discovery
- Source router for federated queries

### Fixed
- `prov_get_images` HTTP 406 error - Added Accept header for IIIF manifests
- `ghap_search` returning HTML - Fixed TLCMap API endpoint handling
- NMA federated search returning empty records - Fixed record mapping in source router
- Trove empty query validation - Now returns error for missing required params

### Known Issues
- `acmi_get_creator` returns "Creator not found" for valid IDs - This is an upstream ACMI API issue. Workaround: use `acmi_list_creators()` which returns full creator details.

### Changed
- Default mode is now `dynamic` (set `MCP_MODE=legacy` for backwards compatibility)

## [0.6.0] - 2025-12-24

### Changed
- **BREAKING:** Renamed project from `australian-archives-mcp` to `australian-history-mcp`
  - npm package: `@littlebearapps/australian-archives-mcp` → `@littlebearapps/australian-history-mcp`
  - MCP server key: `australian-archives` → `australian-history`
  - MCP tool prefix: `mcp__australian-archives__*` → `mcp__australian-history__*`
  - GitHub repo: `littlebearapps/australian-archives-mcp` → `littlebearapps/australian-history-mcp`
- Name better reflects scope: 11 data sources covering museums, biodiversity, heritage, PM transcripts (not just archives)

## [0.5.0] - 2024-12-23

### Added
- 6 new Trove tools: `trove_get_work`, `trove_get_person`, `trove_get_list`, `trove_search_people`, `trove_list_magazine_titles`, `trove_get_magazine_title`
- 20 additional tools across existing sources

### Fixed
- VHD API response parsing for embedded keys
- ACMI API constellation name field handling
- Trove state abbreviation mapping to full names for search API
- `[object Object]` parsing bugs in Trove responses

## [0.4.0] - 2024-12-22

### Added
- **GA HAP source** (Geoscience Australia Historical Aerial Photography)
  - `ga_hap_search` - Search historical aerial photos by state/year/location
  - `ga_hap_get_photo` - Get photo details by OBJECTID or film/run/frame
  - `ga_hap_harvest` - Bulk download photo records
- **IIIF tools** for generic manifest and image handling
  - `iiif_get_manifest` - Fetch and parse IIIF manifest from any institution
  - `iiif_get_image_url` - Construct IIIF Image API URLs
- Trove NUC filtering for contributor-specific searches
- Trove `trove_list_contributors` tool

## [0.3.0] - 2024-12-21

### Added
- **Atlas of Living Australia (ALA) source** - 8 biodiversity tools
  - `ala_search_occurrences`, `ala_search_species`, `ala_get_species`
  - `ala_harvest`, `ala_search_images`, `ala_match_name`
  - `ala_list_species_lists`, `ala_get_species_list`
- **National Museum of Australia (NMA) source** - 9 collection tools
  - `nma_search_objects`, `nma_get_object`, `nma_search_places`
  - `nma_get_place`, `nma_search_parties`, `nma_get_party`
  - `nma_search_media`, `nma_get_media`, `nma_harvest`
- **Victorian Heritage Database (VHD) source** - 9 heritage tools
  - `vhd_search_places`, `vhd_get_place`, `vhd_search_shipwrecks`
  - `vhd_get_shipwreck`, `vhd_harvest`
  - `vhd_list_municipalities`, `vhd_list_architectural_styles`
  - `vhd_list_themes`, `vhd_list_periods`
- **ACMI source** (Australian Centre for the Moving Image) - 7 tools
  - `acmi_search_works`, `acmi_get_work`, `acmi_harvest`
  - `acmi_list_creators`, `acmi_get_creator`
  - `acmi_list_constellations`, `acmi_get_constellation`
- **PM Transcripts source** - 2 Prime Ministerial speech tools
  - `pm_transcripts_get_transcript`, `pm_transcripts_harvest`

## [0.2.0] - 2024-12-20

### Added
- **data.gov.au source** - 11 CKAN API tools
  - `datagovau_search`, `datagovau_get_dataset`, `datagovau_get_resource`
  - `datagovau_datastore_search`, `datagovau_list_organizations`
  - `datagovau_get_organization`, `datagovau_list_groups`
  - `datagovau_get_group`, `datagovau_list_tags`
  - `datagovau_harvest`, `datagovau_autocomplete`
- **Museums Victoria source** - 6 collection tools
  - `museumsvic_search`, `museumsvic_get_article`
  - `museumsvic_get_item`, `museumsvic_get_species`
  - `museumsvic_get_specimen`, `museumsvic_harvest`
- Comprehensive README for public npm package

### Fixed
- Museums Victoria API response parsing

## [0.1.0] - 2024-12-19

### Added
- Initial release
- **PROV source** (Public Record Office Victoria) - 5 tools
  - `prov_search` - Search Victorian state archives
  - `prov_get_images` - Extract image URLs from digitised records
  - `prov_harvest` - Bulk download PROV records
  - `prov_get_agency` - Get agency details by VA number
  - `prov_get_series` - Get series details by VPRS number
- **Trove source** (National Library of Australia) - 7 initial tools
  - `trove_search` - Search newspapers, images, books
  - `trove_harvest` - Bulk download Trove records
  - `trove_newspaper_article` - Get full newspaper article text
  - `trove_list_titles` - List newspaper/gazette titles
  - `trove_title_details` - Get title info with issue dates
  - `trove_get_contributor` - Get contributor details
- MCP server architecture with registry pattern
- Source module architecture for extensibility
- Shared base client with retry logic
- Harvest runner for pagination

[1.0.0]: https://github.com/littlebearapps/australian-history-mcp/compare/v0.7.0...v1.0.0
[0.7.0]: https://github.com/littlebearapps/australian-history-mcp/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/littlebearapps/australian-history-mcp/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/littlebearapps/australian-history-mcp/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/littlebearapps/australian-history-mcp/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/littlebearapps/australian-history-mcp/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/littlebearapps/australian-history-mcp/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/littlebearapps/australian-history-mcp/releases/tag/v0.1.0
