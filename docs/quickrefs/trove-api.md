# Trove API Quick Reference

National Library of Australia Trove API v3 details and tips.

> [!NOTE]
> This is a third-party API. Terms and access may change at any time. See the [Important Notice](../../README.md#important-notice---third-party-data-sources) in the README.

---

## API Details

| Property | Value |
|----------|-------|
| Base URL | `https://api.trove.nla.gov.au/v3` |
| Authentication | API key in `X-API-KEY` header |
| Format | JSON (default) or XML |
| Rate Limit | 200 calls/minute |
| Max Results | 100 per page |

---

## Getting an API Key

1. Go to https://trove.nla.gov.au/about/create-something/using-api
2. Create an account or log in
3. Apply for API access (Level 1 = personal/research)
4. Approval typically takes 1 week

**Store key:**
```bash
source ~/bin/kc.sh
kc_set trove-api-key "YOUR_KEY"
```

---

## Categories

| Category | Description | Key Content |
|----------|-------------|-------------|
| `newspaper` | Digitised newspapers | 1803-1954 (copyright limit) |
| `gazette` | Government gazettes | Official notices, appointments |
| `magazine` | Magazines, journals | Historical periodicals |
| `image` | Photographs, pictures | Library/museum collections |
| `book` | Books, pamphlets | Digitised and catalogued |
| `diary` | Diaries, letters | Personal papers |
| `music` | Sheet music, audio | Musical works |
| `research` | Research datasets | Academic repositories |

---

## State Codes

| Code | State |
|------|-------|
| `vic` | Victoria |
| `nsw` | New South Wales |
| `qld` | Queensland |
| `sa` | South Australia |
| `wa` | Western Australia |
| `tas` | Tasmania |
| `nt` | Northern Territory |
| `act` | Australian Capital Territory |
| `national` | National/multi-state |

**Note:** Use abbreviations (e.g., `vic`) in tool parameters. The MCP server automatically maps these to full names (e.g., `Victoria`) as required by the Trove search API.

---

## NUC Codes (Contributor Filtering)

Filter search results by contributing institution using the `nuc` parameter.

### Common NUC Codes

| Code | Institution |
|------|-------------|
| `VSL` | State Library Victoria |
| `SLNSW` | State Library NSW |
| `QSL` | State Library Queensland |
| `SLSA` | State Library South Australia |
| `SLWA` | State Library Western Australia |
| `SLT` | State Library Tasmania |
| `ANL` | National Library of Australia |
| `ANL:DL` | NLA Digital Library |
| `AIATSIS` | Australian Institute of Aboriginal and Torres Strait Islander Studies |
| `AWM` | Australian War Memorial |

### Usage Example

```
Use trove_search with:
  query: "Melbourne photograph"
  category: "image"
  nuc: "VSL"
```

This returns only State Library Victoria images matching "Melbourne photograph".

### Finding NUC Codes

To find a contributor's NUC code:
1. Search Trove for content you know is from that institution
2. Look at the contributor field in results
3. Use that code in the `nuc` parameter

---

## Newspaper Coverage

**Digitised period:** Primarily 1803-1954 (out of copyright)

**Major newspapers by state:**
- **VIC:** The Age, The Argus, The Herald
- **NSW:** Sydney Morning Herald, The Sun
- **QLD:** The Courier-Mail, Brisbane Courier
- **SA:** The Advertiser, Chronicle
- **WA:** The West Australian
- **TAS:** The Mercury, Examiner

---

## Search Tips

### Date Filtering
```
dateFrom: "1890"
dateTo: "1899"
```
Returns content from the 1890s.

### Sorting Results

Available sort options for `trove_search` and `trove_harvest`:

| Sort Option | Description | Best For |
|-------------|-------------|----------|
| `relevance` | Default. Best match first (uses TF-IDF scoring) | General searches, keyword queries |
| `datedesc` | Newest first (most recent date) | Finding latest articles on a topic |
| `dateasc` | Oldest first (earliest date) | Historical research, chronological review |

**Category Compatibility:**
- All sort options work with all categories (newspaper, magazine, image, book, etc.)
- For undated works (some images, objects), items sort to the end with date sorting

**Pagination Stability:**
When using `sortby=dateasc` or `sortby=datedesc` for bulk harvesting:
- Cursor position may shift if new records are added during harvest
- Records modified during harvest may appear in different positions
- For stable pagination, use `bulkHarvest=true` which sorts by identifier

**Recommendation for Harvesting:**
```
# For stable bulk harvesting (recommended)
trove_harvest with bulkHarvest: true

# For date-ordered results (may have cursor drift)
trove_harvest with sortby: "dateasc", bulkHarvest: false
```

### Full Text Search
For newspapers, use `includeFullText: true` to get OCR text in results.

### Category-Specific Searches
Searching `newspaper` category is faster than `all`.

### Phrase Searching
Use quotes in query for exact phrases:
```
query: '"Melbourne flood"'
```

### Search by Creator/Author
```
creator: "Lawson"    # Find works by Henry Lawson
subject: "bushrangers"  # Find works about bushrangers
```

### Filter by Decade
```
decade: "188"   # 1880s
decade: "192"   # 1920s
```

### Online Availability
```
availability: "online"      # Any online
availability: "free"        # Free access
availability: "restricted"  # Requires payment/membership
availability: "subscription"  # Subscription required
```

### Include Library Holdings
```
includeHoldings: true  # Returns NUC codes, library names, call numbers
includeLinks: true     # Returns external access links
```

---

## New Parameters (v0.8.0)

### Newspaper-Specific Filters

#### Illustration Types
Filter newspaper articles by illustration type:
```
illustrationTypes: ["Photo", "Cartoon", "Map"]
```
**Options:** `Photo`, `Cartoon`, `Map`, `Illustration`, `Graph`

#### Word Count
Filter by article length:
```
wordCount: "<100 Words"       # Short articles
wordCount: "100 - 1000 Words" # Medium articles
wordCount: "1000+ Words"      # Long articles
```

#### Article Category
Filter by newspaper article category:
```
articleCategory: "Article"              # News articles
articleCategory: "Advertising"          # Advertisements
articleCategory: "Family Notices"       # Births, deaths, marriages
articleCategory: "Literature"           # Fiction, poetry
articleCategory: "Detailed lists, results, guides"  # Sports, shipping
```

### User-Contributed Content

#### Include Tags & Comments
Get user-contributed tags and corrections:
```
includeTags: true      # Include user-added tags
includeComments: true  # Include user corrections/comments
```

#### Filter by Tags & Comments
Only return items that have user contributions:
```
hasTags: true      # Only items with user tags
hasComments: true  # Only items with user comments
```

### Rights & Content Availability

#### Rights Filter
Filter by copyright/rights status for reusable content:
```
rights: "Free"             # Freely reusable
rights: "Out of Copyright" # Out of copyright
rights: "Creative Commons" # CC licensed
```

#### Content Availability
```
fullTextAvailable: true  # Only items with downloadable full text
hasThumbnail: true       # Only items with preview images
```

### Advanced Date Filtering

#### Year & Month (with decade)
For precise date filtering, first set a decade, then add year/month:
```
decade: "193"    # 1930s
year: "1934"     # Specific year
month: 6         # June (1-12)
```

### Collection/Series Filtering

#### Search Within Collections
```
series: "oral history"  # Partial match, case-insensitive
```

#### Filter by Journal/Magazine Title

For magazine category, filter by publication title. Partial matching is supported.

```
# Search The Bulletin magazine for photography articles
trove_search with:
  query: "photography"
  category: "magazine"
  journalTitle: "The Bulletin"

# Search Australian Women's Weekly for recipes
trove_search with:
  query: "recipe"
  category: "magazine"
  journalTitle: "Women's Weekly"
```

**Popular Historical Magazines:**
- The Bulletin (1880-2008) - News, politics, literature
- Australian Women's Weekly (1933-present) - Lifestyle, cooking, fashion
- Pix (1938-1972) - News photography, current affairs
- The Home (1920-1942) - Interior design, homemaking
- Walkabout (1934-1974) - Travel, geography, Indigenous Australia

**Note:** The `journalTitle` filter only applies to the `magazine` category. For newspaper searches, use `trove_list_titles` to find specific newspaper IDs.

### Partner Facet

Request `partnerNuc` in facets to see which institutions have results:
```
includeFacets: true
facetFields: ["partnerNuc", "decade", "state"]
```

See [Trove Partners](trove-partners.md) for complete partner documentation.

---

## Facet Fields Reference

When using `includeFacets: true` with `trove_search`, specify facet fields via `facetFields`:

```
trove_search({
  query: "Melbourne",
  category: "image",
  includeFacets: true,
  facetFields: ["decade", "format", "partnerNuc"]
})
```

### Available Facet Fields

| Facet Field | Description | Applicable Categories |
|-------------|-------------|----------------------|
| `decade` | Publication decade (e.g., "190" for 1900s) | All categories |
| `year` | Publication year (e.g., "1923") | All categories |
| `state` | Australian state/territory | `newspaper` only |
| `format` | Format/type (Photo, Book, Map, etc.) | magazine, image, research, book, diary, music |
| `category` | Article category (Article, Advertising, etc.) | `newspaper` only |
| `audience` | Target audience (General, Academic, etc.) | Non-newspaper categories |
| `language` | Language of content | All categories |
| `availability` | Online availability status | All categories |
| `nuc` | Contributing library (holdings) | Non-newspaper categories |
| `partnerNuc` | Partner organisation | magazine, image, research, book, diary, music |

### Category-Specific Notes

**Newspaper Category:**
- Use `state` for geographic filtering
- Use `category` for article type (Article, Advertising, Family Notices, etc.)
- `partnerNuc` and `nuc` facets don't apply (NLA-digitised content)

**Non-Newspaper Categories:**
- Use `format` to see format breakdown (Photo, Book, Map, etc.)
- Use `partnerNuc` to see which institutions have results
- Use `nuc` to see holding library distribution

### Facet Response Example

```json
{
  "facets": [
    {
      "name": "decade",
      "displayname": "Decade",
      "term": [
        { "display": "190", "count": 1234 },
        { "display": "191", "count": 567 }
      ]
    }
  ]
}
```

---

## New Tools (v0.6.0)

### trove_get_work
Get book/image/map/music details by ID with holdings, links, and versions.
```
workId: "12345678"
include: ["holdings", "links", "workversions"]
```

### trove_list_contributors
List/search all 1500+ contributing libraries.
```
query: "university"    # Optional filter
reclevel: "full"       # Full contact details
```

### trove_get_magazine_title
Get magazine title details with available years and issues.
```
titleId: "12345"
includeYears: true
```

### trove_get_person
Get person/organisation biographical data.
```
personId: "12345678"
reclevel: "full"
```

### trove_get_list
Get user-curated research lists.
```
listId: "12345678"
includeItems: true
```

### trove_search_people
Search people and organisations.
```
query: "Henry Lawson"
type: "Person"        # Person, Organisation, or Family
```

---

## Bulk Harvesting

Use `trove_harvest` with `bulkHarvest=true` (automatic) for stable pagination.

**Workflow:**
1. Initial harvest with `maxRecords`
2. Check `hasMore` in response
3. Use `nextCursor` for subsequent calls
4. Repeat until `hasMore: false`

**Rate limiting:** The harvest tool respects the 200/min limit automatically.

---

## Response Fields

### Newspaper Articles

| Field | Description |
|-------|-------------|
| `id` | Article identifier |
| `heading` | Article headline |
| `title` | Newspaper name |
| `date` | Publication date |
| `page` | Page number |
| `category` | Article/Advertising/Family Notices/etc. |
| `snippet` | Text excerpt |
| `articleText` | Full OCR text (if requested) |
| `troveUrl` | Link to Trove page |
| `illustrated` | Has images (boolean) |

### Works (Books, Images, etc.)

| Field | Description |
|-------|-------------|
| `id` | Work identifier |
| `title` | Work title |
| `contributor` | Author/creator |
| `issued` | Publication year |
| `type` | Format/type |
| `abstract` | Description |
| `troveUrl` | Link to Trove |
| `thumbnailUrl` | Preview image |

---

## Article Categories

Newspaper articles are classified:

| Category | Description |
|----------|-------------|
| `Article` | News articles, features |
| `Advertising` | Advertisements |
| `Detailed lists, results, guides` | Sports results, shipping, etc. |
| `Family Notices` | Births, deaths, marriages |
| `Literature` | Fiction, poetry, serialised novels |

**Usage:** Use `articleCategory` parameter to filter results.

```javascript
// Find classified ads
trove_search(query="wanted", category="newspaper", articleCategory="Advertising")
```

> [!NOTE]
> **API Quirk:** The `articleCategory` filter correctly limits result counts (verifiable via facets), but individual records may still display `category: "Article"` in the API response. This is a Trove API behaviour - the filter is working; the returned `category` field just doesn't always reflect the classification used for filtering.

---

## Known Quirks

### 1. NUC Filter Only Works for Non-Newspaper Categories

The `nuc` parameter (contributor/library filter) only works for: magazine, image, research, book, diary, music. **It does NOT work for newspaper category** - newspapers don't have NUC contributor data.

### 2. Holdings/Links Include Only for Individual Works

The `includeHoldings` and `includeLinks` parameters are only valid for `trove_get_work` (individual work lookups). Using them with `trove_search` will be ignored. Use `trove_get_work` with the work ID to get holdings information.

### 3. Cursor Stability with Date Sorting

When using `sortby=dateasc` or `sortby=datedesc` for bulk harvesting, the pagination cursor may become unstable if:
- New records are added to Trove during the harvest
- Records are modified during the harvest

**Recommendation:** Use `bulkHarvest=true` for most reliable pagination. This sorts by identifier instead of relevance/date, preventing result order changes during harvest.

### 4. State Filter Requires Full Names (Handled Automatically)

The API `l-state` parameter requires full state names (e.g., "Victoria" not "vic"). The MCP client automatically converts abbreviations to full names.

### 5. No Series Browsing/Listing Endpoint

The Trove API does **not** have a dedicated endpoint for browsing or listing series/collections.

**Workarounds:**
- Use `series` parameter in `trove_search` to find items within a specific series: `series: "oral history"`
- Use `contribcollection` facet to discover collection names in your results
- Browse series names manually on the Trove website

---

## External Resources

- **Trove:** https://trove.nla.gov.au/
- **API Documentation:** https://trove.nla.gov.au/about/create-something/using-api/v3
- **API Console (testing):** https://troveconsole.herokuapp.com/
- **GLAM Workbench (Trove):** https://glam-workbench.net/trove/
- **Trove Help:** https://trove.nla.gov.au/help/
