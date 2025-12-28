# SEARCH-018: PM Transcripts Full-Text Index

**Priority:** P3
**Phase:** 3 - Future Enhancements
**Status:** Not Started
**Estimated Effort:** 3-4 days
**Dependencies:** SEARCH-001 (PM Transcripts Search - title search)

---

## Overview

Implement full-text search for PM Transcripts body content via local indexing. This extends SEARCH-001 (title-only search) to search actual transcript text.

**Approach:**
- Build local SQLite/FTS5 index of transcript content
- Index on first use or via explicit command
- Search against local index for fast full-text queries

**Trade-offs:**
- Requires ~50MB local storage
- Initial indexing takes ~43 minutes (26,000 transcripts × 100ms)
- Enables comprehensive body text search

---

## Files to Create

| File | Description |
|------|-------------|
| `src/sources/pm-transcripts/index/types.ts` | Index types |
| `src/sources/pm-transcripts/index/sqlite-store.ts` | SQLite storage |
| `src/sources/pm-transcripts/index/indexer.ts` | Indexing logic |
| `src/sources/pm-transcripts/tools/search-fulltext.ts` | Full-text search tool |
| `src/sources/pm-transcripts/tools/build-index.ts` | Index management tool |

---

## Subtasks

### 1. Choose Storage Engine
- [ ] Evaluate options:
  - **SQLite + FTS5** (Recommended)
    - Pros: Built-in full-text search, portable, fast
    - Cons: Requires better-sqlite3 dependency
  - **LevelDB + search**
    - Pros: Simple key-value, no SQL
    - Cons: Need custom search implementation
  - **JSON file + in-memory**
    - Pros: No dependencies
    - Cons: Slow for 26K records, high memory
- [ ] Select SQLite + FTS5

### 2. Define Index Schema
- [ ] Create `src/sources/pm-transcripts/index/types.ts`:
  ```typescript
  interface IndexedTranscript {
    id: number;
    title: string;
    primeMinister: string;
    releaseDate: string;
    releaseType: string;
    content: string;        // Full body text
    contentHash: string;    // For change detection
    indexedAt: string;      // ISO timestamp
  }

  interface IndexStats {
    totalTranscripts: number;
    lastUpdated: string;
    sizeBytes: number;
    version: string;
  }
  ```

### 3. Create SQLite Store
- [ ] Create `src/sources/pm-transcripts/index/sqlite-store.ts`:
  ```typescript
  class PMTranscriptsStore {
    constructor(dbPath: string);

    // Schema setup
    initialize(): void;

    // CRUD
    upsertTranscript(transcript: IndexedTranscript): void;
    getTranscript(id: number): IndexedTranscript | null;
    deleteTranscript(id: number): void;

    // Search (FTS5)
    searchFullText(query: string, limit: number): IndexedTranscript[];

    // Stats
    getStats(): IndexStats;
    getLastIndexedId(): number;
  }
  ```

### 4. Create FTS5 Table
- [ ] SQLite schema:
  ```sql
  -- Main table
  CREATE TABLE IF NOT EXISTS transcripts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    prime_minister TEXT,
    release_date TEXT,
    release_type TEXT,
    content TEXT,
    content_hash TEXT,
    indexed_at TEXT
  );

  -- FTS5 virtual table for full-text search
  CREATE VIRTUAL TABLE IF NOT EXISTS transcripts_fts USING fts5(
    title,
    content,
    prime_minister,
    content='transcripts',
    content_rowid='id'
  );

  -- Triggers to keep FTS in sync
  CREATE TRIGGER transcripts_ai AFTER INSERT ON transcripts BEGIN
    INSERT INTO transcripts_fts(rowid, title, content, prime_minister)
    VALUES (new.id, new.title, new.content, new.prime_minister);
  END;
  ```

### 5. Create Indexer
- [ ] Create `src/sources/pm-transcripts/index/indexer.ts`:
  ```typescript
  class PMTranscriptsIndexer {
    constructor(store: PMTranscriptsStore, client: PMTranscriptsClient);

    // Full rebuild
    async rebuildIndex(progressCallback?: (current, total) => void): Promise<void>;

    // Incremental update
    async updateIndex(sinceId?: number): Promise<number>;

    // Index single transcript
    async indexTranscript(id: number): Promise<boolean>;
  }
  ```

### 6. Implement Indexing Logic
- [ ] Use sitemap to get all transcript IDs
- [ ] Fetch transcripts in batches (respect rate limits)
- [ ] Calculate content hash for change detection
- [ ] Support resume from last indexed ID
- [ ] Progress reporting for long operations

### 7. Create Full-Text Search Tool
- [ ] Create `src/sources/pm-transcripts/tools/search-fulltext.ts`:
  ```typescript
  interface PMTranscriptsFullTextInput {
    query: string;           // FTS5 query (supports AND, OR, NOT, phrases)
    primeMinister?: string;
    dateFrom?: string;
    dateTo?: string;
    releaseType?: string;
    limit?: number;
    highlightMatches?: boolean;  // Return snippets with highlights
  }
  ```
- [ ] Use FTS5 MATCH for search
- [ ] Support FTS5 query syntax
- [ ] Return highlighted snippets

### 8. Create Index Management Tool
- [ ] Create `src/sources/pm-transcripts/tools/build-index.ts`:
  ```typescript
  interface PMTranscriptsIndexInput {
    action: 'build' | 'update' | 'stats' | 'clear';
    force?: boolean;  // Force rebuild even if index exists
  }
  ```
- [ ] `build` - Full index rebuild
- [ ] `update` - Incremental update
- [ ] `stats` - Show index statistics
- [ ] `clear` - Delete index

### 9. Index Location
- [ ] Store in user's data directory:
  ```typescript
  const indexPath = path.join(
    os.homedir(),
    '.local/share/australian-history-mcp/pm-transcripts.db'
  );
  ```
- [ ] Create directory if not exists
- [ ] Handle permissions errors gracefully

### 10. Lazy Index Loading
- [ ] Don't load index until first search
- [ ] Auto-prompt for index build if missing
- [ ] Support running without index (fallback to title search)

### 11. Testing
- [ ] Test index creation
- [ ] Test full-text search queries
- [ ] Test FTS5 operators (AND, OR, NOT, phrases)
- [ ] Test incremental updates
- [ ] Test highlighted snippets
- [ ] Test large result sets
- [ ] Test index corruption recovery

### 12. Documentation
- [ ] Document index setup requirements
- [ ] Document FTS5 query syntax
- [ ] Add examples for common searches
- [ ] Note storage requirements (~50MB)

---

## Example Queries

```
# Build index (first time)
pm_transcripts_index: action="build"
→ "Building index... 1000/26000 (4%)"
→ "Index complete: 26,000 transcripts indexed"

# Full-text search
pm_transcripts_search_fulltext: query="climate change policy"
→ Returns transcripts containing "climate change policy" in body

# FTS5 operators
pm_transcripts_search_fulltext: query="economy AND NOT recession"
pm_transcripts_search_fulltext: query='"carbon tax"'  # Phrase search

# Combined filters
pm_transcripts_search_fulltext: query="indigenous", primeMinister="Rudd", dateFrom="2007", dateTo="2010"

# Check index status
pm_transcripts_index: action="stats"
→ { totalTranscripts: 26000, lastUpdated: "2024-01-15", sizeBytes: 52000000 }
```

---

## FTS5 Query Syntax

| Syntax | Description | Example |
|--------|-------------|---------|
| `word` | Single term | `economy` |
| `"phrase"` | Exact phrase | `"climate change"` |
| `AND` | Both terms required | `tax AND reform` |
| `OR` | Either term | `labor OR labour` |
| `NOT` | Exclude term | `budget NOT deficit` |
| `word*` | Prefix match | `econom*` |
| `NEAR` | Terms near each other | `climate NEAR/5 policy` |

---

## Acceptance Criteria

- [ ] SQLite + FTS5 index working
- [ ] Full-text search returns relevant results
- [ ] FTS5 operators work (AND, OR, NOT, phrases)
- [ ] Index build completes in reasonable time
- [ ] Incremental update works
- [ ] Index stats available
- [ ] Documentation complete

---

## Notes

- better-sqlite3 is a native module - may need compilation
- Consider bundling pre-built binaries
- Index can be rebuilt from scratch if corrupted
- FTS5 supports relevance ranking (BM25)
- Highlighted snippets help users find matches
- Index is optional - title search works without it
