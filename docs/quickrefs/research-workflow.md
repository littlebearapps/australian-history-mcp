# Research Workflow Guide

Efficient research across Australian historical archives using planning, session management, and context compression tools.

## Overview

When researching a historical topic across multiple sources, you need to:
1. **Plan** - Analyse the topic and generate a search strategy
2. **Track** - Log queries and avoid duplicate searches
3. **Manage** - Compress accumulated results to stay within context limits
4. **Complete** - Export findings and preserve progress

This guide covers the 12 meta-tools designed for research workflows.

## Workflow Stages

### Stage 1: Research Planning

Use `plan_search` to analyse your topic before searching.

```
plan_search(topic="History of Arden Street Oval in the 1920s")
```

**What you get:**
- **Topic analysis** - Key themes and research questions identified
- **Historical name suggestions** - Alternative names for suburbs, streets, venues
- **Source prioritisation** - Which archives likely have relevant content
- **Search strategy** - Suggested queries with variations
- **Coverage matrix** - Sources vs content types
- **plan.md file** - Saved to `~/.local/share/australian-history-mcp/plans/`

**When to use:**
- Starting a new research topic
- Unfamiliar with historical naming conventions
- Need to search multiple sources systematically

### Stage 2: Session Management

Track your research progress with session tools.

#### Starting a Session

```
session_start(name="arden-street-1920s", topic="History of Arden Street Oval in the 1920s")
```

**What happens:**
- Creates a new research session
- Links to plan.md if available
- Begins tracking all queries automatically

#### During the Session

**Execute searches** - Queries are automatically logged when a session is active:
```
search(query="Arden Street football", sources=["trove", "prov"])
run(tool="trove_search", args={query: "North Melbourne FC", dateFrom: "1920", dateTo: "1929"})
```

**Check progress:**
```
session_status()              # Quick summary (default)
session_status(detail="full") # Complete query log
```

**Add observations:**
```
session_note(note="Found excellent photos in PROV series VPRS 12903")
```

#### Managing Multiple Sessions

```
session_list()                           # List all sessions
session_list(status="paused")            # Filter by status
session_end()                            # Complete current session
session_resume(id="session-abc123")      # Resume a previous session
```

### Stage 3: Result Management

As results accumulate, use compression tools to stay within context limits.

#### Compression Levels

| Level | Tokens/Record | Fields Kept | Use Case |
|-------|---------------|-------------|----------|
| `minimal` | ~20 | id, url, source | Bookmarking only |
| `standard` | ~50 | + title, year | Review and sorting |
| `full` | ~80 | + type, creator | Full metadata |

**Compress results:**
```
compress(records=search_results, level="standard")
```

**Token savings:** 70-85% reduction in accumulated results.

#### Remove Duplicates

When searching multiple sources, duplicates may appear:
```
dedupe(records=all_results, strategy="both")
```

**Strategies:**
- `url` - Exact URL matching
- `title` - Jaccard similarity (threshold: 0.85 same-source, 0.90 cross-source)
- `both` - URL first, then title fallback

#### Extract URLs Only

For bookmarking or external processing:
```
urls(records=search_results, includeTitle=true)
```

#### Save Progress (Checkpoints)

For long research sessions, checkpoint your progress:
```
checkpoint(action="save", name="arden-midpoint", records=compressed_results)
```

**Later, restore:**
```
checkpoint(action="load", id="checkpoint-xyz")
```

**Manage checkpoints:**
```
checkpoint(action="list")           # List all checkpoints
checkpoint(action="delete", id="checkpoint-xyz")
```

### Stage 4: Completion

#### End the Session

```
session_end()
```

**What happens:**
- Session marked as completed
- Final statistics generated
- Coverage gaps identified

#### Export Findings

```
session_export(format="markdown")   # Readable report
session_export(format="json")       # Structured data
session_export(format="csv")        # Spreadsheet format
```

**Save to file:**
```
session_export(format="markdown", path="/tmp/arden-street-research.md")
```

## Complete Example Session

Here's a full research workflow for "Melbourne Olympics 1956":

```
# Stage 1: Plan the research
plan_search(topic="Melbourne Olympics 1956 - venues, events, and legacy")
→ Suggests: "Olympic Park", "MCG 1956", "Olympic Village Heidelberg"
→ Prioritises: Trove (newspapers), PROV (government records), NMA (artefacts)

# Stage 2: Start tracking
session_start(name="olympics-1956", topic="Melbourne Olympics 1956")

# Execute searches (auto-logged)
search(query="Melbourne Olympics 1956", sources=["trove", "prov", "nma"])
→ 847 results across 3 sources

run(tool="trove_search", args={query: "Olympic torch relay", dateFrom: "1956"})
→ 234 newspaper articles

run(tool="prov_search", args={query: "Olympic Games", dateFrom: "1955", dateTo: "1957"})
→ 156 government records

# Check progress
session_status()
→ 3 queries, 1237 total results, sources: trove (3), prov (1), nma (1)

# Add observations
session_note(note="PROV series VPRS 24 contains Olympic Committee correspondence")

# Stage 3: Manage results
dedupe(records=all_results, strategy="both")
→ 1156 unique records (81 duplicates removed)

compress(records=unique_results, level="standard")
→ 1156 records compressed from ~92,480 to ~57,800 tokens

# Checkpoint before continuing
checkpoint(action="save", name="olympics-phase1", records=compressed)

# Continue with more specific searches...
run(tool="trove_search", args={query: "Ron Clarke 1956"})
run(tool="nma_search_objects", args={query: "Olympic medal 1956"})

# Stage 4: Complete
session_end()
→ Session completed: 8 queries, 1543 unique results

session_export(format="markdown", path="/tmp/olympics-1956-report.md")
```

## Tips and Best Practices

### When to Compress

- **Every 50-100 results** - Don't wait until context is exhausted
- **Before changing focus** - Compress current topic before pivoting
- **Before checkpointing** - Save compressed data, not raw results

### Session Naming Conventions

Use descriptive, hyphenated names:
- `melbourne-floods-1930s` (topic + era)
- `nmfc-arden-street` (organisation + location)
- `bushfires-victoria-1939` (event + location + year)

### Checkpoint Frequency

- **Long sessions** - Every 30-60 minutes of active research
- **Before breaks** - Always checkpoint before stepping away
- **Before risky operations** - Before bulk harvests or complex queries

### Recovery from Context Reset

If your AI context resets mid-research:

1. **List sessions:** `session_list()`
2. **Resume:** `session_resume(id="session-xyz")`
3. **Check status:** `session_status(detail="full")`
4. **Load checkpoint:** `checkpoint(action="load", id="checkpoint-xyz")`
5. **Continue:** Pick up where you left off

### Optimising Token Usage

| Scenario | Recommendation |
|----------|----------------|
| Just browsing | `compress(level="minimal")` |
| Reviewing titles | `compress(level="standard")` |
| Detailed analysis | `compress(level="full")` |
| Exporting for reference | `urls(includeTitle=true)` |

## Related Documentation

- **[Tools Reference](tools-reference.md)** - Complete parameter documentation
- **[Dynamic Loading](dynamic-loading.md)** - How meta-tools work
- **CLAUDE.md** - Quick start and common use cases
