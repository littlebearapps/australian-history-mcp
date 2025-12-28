# Atlas of Living Australia (ALA) API Quick Reference

> [!NOTE]
> This is a third-party API. Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

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
| `basisOfRecord` | string | How recorded: PRESERVED_SPECIMEN, HUMAN_OBSERVATION, MACHINE_OBSERVATION, FOSSIL_SPECIMEN, LIVING_SPECIMEN |
| `coordinateUncertaintyMax` | number | Max coordinate uncertainty in metres |
| `occurrenceStatus` | string | "present" or "absent" |
| `dataResourceName` | string | Contributing dataset name |
| `collector` | string | Collector name (matches recordedBy or collectors) |
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

## Historical Research Filters

Use these parameters to find historical museum specimens:

| Use Case | Parameters |
|----------|------------|
| 19th century specimens | `basisOfRecord: "PRESERVED_SPECIMEN"`, `endYear: 1899` |
| Specimens by collector | `collector: "Baldwin Spencer"` |
| Precise location data | `coordinateUncertaintyMax: 1000` (within 1km) |
| Specific museum | `dataResourceName: "Museums Victoria provider"` |

### Basis of Record Values

| Value | Description |
|-------|-------------|
| `PRESERVED_SPECIMEN` | Museum specimens (skins, bones, pressed plants) |
| `HUMAN_OBSERVATION` | Direct sightings, citizen science |
| `MACHINE_OBSERVATION` | Camera traps, acoustic sensors |
| `FOSSIL_SPECIMEN` | Fossils and palaeontological specimens |
| `LIVING_SPECIMEN` | Zoo, botanical garden records |

## Key Quirks

- Uses two separate APIs: biocache-ws (occurrences) and bie-ws (species)
- Species identified by LSID GUIDs (e.g., `https://biodiversity.org.au/afd/taxa/...`)
- BIE API uses `nameString` for scientific name, taxonomy in `classification` object
- Occurrence records include citizen science observations
- Use `basisOfRecord: "PRESERVED_SPECIMEN"` for historical research (museum specimens)
- Collector names searched across both `recordedBy` and `collectors` fields

## Example GUIDs

- Koala: `https://biodiversity.org.au/afd/taxa/e9e7db31-04df-41fb-bd8d-e0b0f3c332d6`
- Platypus: `https://biodiversity.org.au/afd/taxa/ac61fd14-4950-4566-b384-304bd99ca75f`

## Resources

- [ALA Web Services](https://api.ala.org.au/)
- [Biocache API](https://biocache-ws.ala.org.au/)
- [BIE API](https://bie-ws.ala.org.au/)
