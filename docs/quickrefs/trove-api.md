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
```
sortby: "relevance"  # Default
sortby: "datedesc"   # Newest first
sortby: "dateasc"    # Oldest first
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

---

## External Resources

- **Trove:** https://trove.nla.gov.au/
- **API Documentation:** https://trove.nla.gov.au/about/create-something/using-api/v3
- **API Console (testing):** https://troveconsole.herokuapp.com/
- **GLAM Workbench (Trove):** https://glam-workbench.net/trove/
- **Trove Help:** https://trove.nla.gov.au/help/
