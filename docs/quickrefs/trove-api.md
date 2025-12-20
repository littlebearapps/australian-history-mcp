# Trove API Quick Reference

National Library of Australia Trove API v3 details and tips.

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

### Full Text Search
For newspapers, use `includeFullText: true` to get OCR text in results.

### Category-Specific Searches
Searching `newspaper` category is faster than `all`.

### Phrase Searching
Use quotes in query for exact phrases:
```
query: '"Melbourne flood"'
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
