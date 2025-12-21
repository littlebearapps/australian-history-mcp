# Atlas of Living Australia (ALA) API Quick Reference

## API Endpoints

- **Occurrences:** `https://biocache-ws.ala.org.au/ws/`
- **Species (BIE):** `https://bie-ws.ala.org.au/ws/`

## Authentication

None required for read-only access.

## Tools

### ala_search_occurrences
Search species occurrence records.

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Free-text query |
| `scientificName` | string | Scientific name (e.g., "Phascolarctos cinereus") |
| `vernacularName` | string | Common name (e.g., "Koala") |
| `family` | string | Taxonomic family |
| `genus` | string | Taxonomic genus |
| `stateProvince` | string | Australian state (e.g., "Victoria") |
| `startYear` | number | Filter by year range start |
| `endYear` | number | Filter by year range end |
| `hasImages` | boolean | Only records with images |
| `limit` | number | Max results (default 20, max 100) |

### ala_search_species
Search species by name.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search term (common or scientific name) |
| `limit` | number | Max results (default 20) |

### ala_get_species
Get detailed species profile.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `guid` | string | Yes | Species GUID from search results |

Returns: taxonomy, common names, synonyms, conservation status, images.

### ala_harvest
Bulk download occurrence records.

| Parameter | Type | Description |
|-----------|------|-------------|
| `scientificName` | string | Scientific name filter |
| `vernacularName` | string | Common name filter |
| `stateProvince` | string | State filter |
| `maxRecords` | number | Max records (1-1000, default 100) |
| `startIndex` | number | Pagination offset |

## Key Quirks

- Uses two separate APIs: biocache-ws (occurrences) and bie-ws (species)
- Species identified by LSID GUIDs (e.g., `https://biodiversity.org.au/afd/taxa/...`)
- BIE API uses `nameString` for scientific name, taxonomy in `classification` object
- Occurrence records include citizen science observations

## Example GUIDs

- Koala: `https://biodiversity.org.au/afd/taxa/e9e7db31-04df-41fb-bd8d-e0b0f3c332d6`
- Platypus: `https://biodiversity.org.au/afd/taxa/ac61fd14-4950-4566-b384-304bd99ca75f`

## Resources

- [ALA Web Services](https://api.ala.org.au/)
- [Biocache API](https://biocache-ws.ala.org.au/)
- [BIE API](https://bie-ws.ala.org.au/)
