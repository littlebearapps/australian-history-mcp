# Trove Partner Data Sources

Trove aggregates content from **1,500+ partner organisations** across Australia. This guide documents how to access partner collections via the Trove API.

> [!IMPORTANT]
> **NUC Filtering Category Limitation**
> The `nuc` parameter only works for these categories: `magazine`, `image`, `research`, `book`, `diary`, `music`.
>
> **It does NOT work for `newspaper` or `gazette` categories** - these are NLA-digitised content without per-article NUC contributor data.

## How to Access Partner Content

Use the `nuc` parameter in `trove_search` or `trove_harvest` to filter by contributing organisation:

```
# Search State Library Victoria photographs
trove_search({ query: "Melbourne", category: "image", nuc: "VSL" })

# Search NLA digitised content only
trove_search({ query: "gold rush", nuc: "ANL:DL" })

# Search university institutional repositories
trove_search({ query: "climate change", category: "research", nuc: "ANU:IR" })
```

### Browsing Partners

```
# List all 1,500+ contributing libraries
trove_list_contributors()

# Search for specific types of contributors
trove_list_contributors({ query: "university" })

# Get details for a specific contributor
trove_get_contributor({ nuc: "VSL" })
```

### Seeing Partner Breakdown

Use `facetFields: ['partnerNuc']` to see which partners have results for your query:

```
trove_search({
  query: "bushrangers",
  category: "image",
  includeFacets: true,
  facetFields: ["partnerNuc"]
})
```

---

## State & National Libraries

| NUC Code | Organisation | Content Types |
|----------|-------------|---------------|
| `ANL` | National Library of Australia | Books, manuscripts, maps, pictures, oral histories |
| `ANL:DL` | NLA Digitised Library | Digitised books, journals, images, maps |
| `ANL:NED` | National eDeposit | Born-digital publications |
| `VSL` | State Library Victoria | Victorian collections, pictures, manuscripts |
| `SLNSW` | State Library NSW | NSW collections, manuscripts, pictures |
| `QSL` | State Library Queensland | Queensland collections |
| `SLSA` | State Library South Australia | SA collections |
| `SLWA` | State Library Western Australia | WA collections |
| `TLIB` | Libraries Tasmania | Tasmanian collections |
| `NTLIB` | Northern Territory Library | NT collections |
| `ACL` | ACT Library Service | ACT collections |

---

## University Libraries & Repositories

| NUC Code | Organisation | Content Types |
|----------|-------------|---------------|
| `ANU` | Australian National University | Books, theses |
| `ANU:IR` | ANU Institutional Repository | Research outputs, theses, papers |
| `UMEL` | University of Melbourne | Academic collections |
| `UMEL:IR` | Melbourne Institutional Repository | Research outputs |
| `UNSW` | UNSW Sydney | Academic collections |
| `USYD` | University of Sydney | Academic collections |
| `UQ` | University of Queensland | Academic collections |
| `MONASH` | Monash University | Academic collections |
| `RMIT` | RMIT University | Academic collections |
| `UTas` | University of Tasmania | Academic collections |
| `UniSA` | University of South Australia | Academic collections |

**Note:** Most universities have institutional repositories with `:IR` suffix (e.g., `UMEL:IR`).

---

## Archives

| NUC Code | Organisation | Content Types |
|----------|-------------|---------------|
| `NAA` | National Archives of Australia | Government records, photographs |
| `PROV` | Public Record Office Victoria | Victorian government records |
| `SRNSW` | State Records NSW | NSW government records |
| `QSA` | Queensland State Archives | QLD government records |
| `SRSA` | State Records South Australia | SA government records |
| `SRWA` | State Records WA | WA government records |
| `TAHO` | Tasmanian Archive | Tasmanian records |

---

## Museums & Galleries

| NUC Code | Organisation | Content Types |
|----------|-------------|---------------|
| `NMA` | National Museum of Australia | Objects, images, documentation |
| `AWM` | Australian War Memorial | Military history, photographs |
| `NGA` | National Gallery of Australia | Art collections |
| `NGV` | National Gallery of Victoria | Art collections |
| `MAAS` | Museum of Applied Arts & Sciences (Powerhouse) | Technology, science collections |
| `AM` | Australian Museum | Natural history, cultural collections |
| `MV` | Museums Victoria | Natural history, cultural collections |
| `QM` | Queensland Museum | Natural history collections |
| `SAM` | South Australian Museum | Natural history, cultural collections |
| `WAM` | Western Australian Museum | Natural history collections |

---

## Research & Special Collections

| NUC Code | Organisation | Content Types |
|----------|-------------|---------------|
| `CSIRO` | CSIRO | Scientific research, publications |
| `AIATSIS` | AIATSIS | Indigenous collections (restricted) |
| `NFSA` | National Film & Sound Archive | Film, sound, radio |
| `ABC:RN` | ABC Radio National | Radio program metadata |
| `ALIA` | Australian Library & Information Assoc. | Professional publications |
| `CAUL` | Council of Australian University Librarians | Academic resources |

---

## Government & Legal

| NUC Code | Organisation | Content Types |
|----------|-------------|---------------|
| `HCA` | High Court of Australia | Legal judgments |
| `FCA` | Federal Court of Australia | Legal judgments |
| `AUSTLII` | AustLII | Legal information |
| `APH` | Parliament of Australia | Parliamentary papers |
| `AGIS` | Attorney-General's Information Service | Legal publications |

---

## Historical Societies & Community

Many local historical societies contribute via aggregation:
- Royal Historical Society of Victoria
- Royal Australian Historical Society
- Various local history groups
- Genealogical societies

---

## Content Distribution by Category

| Category | Main Contributors |
|----------|------------------|
| **Newspapers & Gazettes** | NLA digitised (ANL:DL) |
| **Magazines & Newsletters** | NLA digitised journals, university publications |
| **Images** | State libraries, museums, archives, universities |
| **Books & Libraries** | All libraries (aggregated from Libraries Australia) |
| **Research & Reports** | Universities (:IR repositories), CSIRO, government |
| **Diaries & Letters** | State libraries, archives, NLA manuscripts |
| **Music & Audio** | NLA, NFSA, ABC:RN, state libraries |
| **People** | Aggregated biographical data from multiple sources |

---

## Examples

### Search State Library Victoria Photographs
```
trove_search({
  query: "Melbourne 1890s",
  category: "image",
  nuc: "VSL"
})
```

### Search War Memorial Collections
```
trove_search({
  query: "Gallipoli",
  nuc: "AWM"
})
```

### Search National Archives Photographs
```
trove_search({
  query: "immigration",
  category: "image",
  nuc: "NAA"
})
```

### Search University Research Papers
```
trove_search({
  query: "climate change",
  category: "research",
  nuc: "ANU:IR"
})
```

### Exclude NLA eDeposit (Often Restricted)
```
trove_search({
  query: "history NOT nuc:ANL:NED"
})
```

### See Holdings for a Work
```
trove_get_work({
  workId: "12345",
  include: ["holdings"]
})
```

---

## Important Notes

1. **NUC filtering only works for non-newspaper categories**: magazine, image, research, book, diary, music. Newspaper and gazette content is NLA-digitised without per-article NUC data.

2. **NUC codes with colons** require double quotes in API queries: `nuc:"ANU:IR"`. The MCP client handles this automatically.

3. **Content restrictions** vary by contributor - some require login or have no online access.

4. **Digitised vs metadata-only**: Most content is metadata pointing to external systems; only NLA digitised content (newspapers, magazines, some images) has full content in Trove.

5. **Libraries Australia**: Most library catalogue records come pre-aggregated through Libraries Australia.

6. **Use `facet=partnerNuc`** to see which contributors have results for your query.

---

## See Also

- `trove_list_contributors` - Browse all 1,500+ contributing libraries
- `trove_get_contributor` - Get details for a specific contributor by NUC
- `trove_get_work` with `includeHoldings: true` - See which libraries hold items
- `trove_get_versions` - See holdings per version of a work
