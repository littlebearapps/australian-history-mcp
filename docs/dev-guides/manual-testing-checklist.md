# Manual Testing Checklist

Verification checklist for Australian History MCP Server v1.0.0 functionality.

## Prerequisites

- [ ] Build passes: `npm run build`
- [ ] Type check passes: `npx tsc --noEmit`
- [ ] MCP server starts: `node dist/index.js`
- [ ] Tools list returns: `echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js`

## Research Planning

### plan_search

- [ ] Topic analysis extracts key themes correctly
- [ ] Historical name suggestions work for Melbourne suburbs
- [ ] Source prioritisation matches topic keywords
- [ ] plan.md file is created at correct path
- [ ] plan.md is formatted correctly with all sections
- [ ] Coverage matrix is generated with sources vs content types
- [ ] Works with simple topics (e.g., "Melbourne Olympics 1956")
- [ ] Works with complex topics (e.g., "History of North Melbourne FC ground at Arden Street from 1900 to 1930")

## Session Management

### session_start

- [ ] Creates new session with valid name
- [ ] Validates name format (alphanumeric, hyphens, underscores)
- [ ] Rejects duplicate session names
- [ ] Rejects when session already active
- [ ] Links to planId when provided
- [ ] Returns session ID and initial status

### session_status

- [ ] Returns quick status by default (token-efficient)
- [ ] Full detail includes complete query log
- [ ] Coverage tracking shows sources searched
- [ ] Duplicate count is accurate
- [ ] Works without active session (returns error)
- [ ] Works with session ID parameter

### session_end

- [ ] Marks session as completed
- [ ] Generates final statistics
- [ ] Clears active session state
- [ ] Updates plan.md if linked
- [ ] Works with status="archived" option
- [ ] Returns summary of session

### session_resume

- [ ] Resumes by session ID
- [ ] Resumes by session name
- [ ] Returns previous progress and queries
- [ ] Rejects resuming completed sessions
- [ ] Rejects resuming archived sessions
- [ ] Sets session as active

### session_list

- [ ] Lists all sessions
- [ ] Filters by status (active, paused, completed)
- [ ] Filters by topic text
- [ ] Respects limit parameter
- [ ] Excludes archived by default
- [ ] Includes archived when requested

### session_export

- [ ] JSON format includes all data
- [ ] Markdown format is readable
- [ ] CSV format is valid spreadsheet data
- [ ] Path parameter saves to file
- [ ] Returns content when path omitted
- [ ] Include parameter filters data (queries, results, coverage)

### session_note

- [ ] Adds note to active session
- [ ] Note appears in session export
- [ ] Works with session ID parameter
- [ ] Returns confirmation

### Auto-logging

- [ ] Queries logged when session active
- [ ] Fingerprints generated for results
- [ ] Duplicate results detected and counted
- [ ] Query metadata captured (tool, args, timestamp)
- [ ] No logging when no session active

## Context Compression

### compress

- [ ] Minimal level works (~20 tokens/record)
- [ ] Standard level works (~50 tokens/record)
- [ ] Full level works (~80 tokens/record)
- [ ] Token savings reported correctly
- [ ] dedupeFirst option removes duplicates before compressing
- [ ] maxTitleLength truncates correctly

### urls

- [ ] Extracts URLs from all record types
- [ ] Markdown format is valid
- [ ] includeTitle option works
- [ ] dedupeFirst option works
- [ ] Handles records with missing URLs

### dedupe

- [ ] URL matching strategy works
- [ ] Title similarity strategy works
- [ ] Both strategy works (URL first, title fallback)
- [ ] Source priority order respected
- [ ] Returns duplicate statistics
- [ ] yearProximity parameter affects matching

### checkpoint

- [ ] Save action persists to disk
- [ ] Load action restores correctly
- [ ] List action shows all checkpoints
- [ ] Delete action removes checkpoint
- [ ] Checkpoint includes fingerprints
- [ ] Checkpoint includes coverage state
- [ ] Name validation works

## Federated Search (search meta-tool)

- [ ] Auto-selects sources based on query keywords
- [ ] Respects explicit sources parameter
- [ ] Type filter works (image, newspaper, document)
- [ ] State filter works (vic, nsw, qld, etc.)
- [ ] Date filters work (dateFrom, dateTo)
- [ ] Parallel execution across sources
- [ ] Errors from one source don't block others
- [ ] Results include source attribution
- [ ] Timing information returned

## End-to-End Workflow

### Complete Research Session

1. [ ] `plan_search` generates valid plan
2. [ ] `session_start` creates session linked to plan
3. [ ] `search` executes and logs to session
4. [ ] `session_status` shows query logged
5. [ ] `compress` reduces result size
6. [ ] `checkpoint` saves progress
7. [ ] `session_end` completes session
8. [ ] `session_export` produces valid output

### Recovery Workflow

1. [ ] Start session and execute searches
2. [ ] Create checkpoint
3. [ ] Simulate context reset (new process)
4. [ ] `session_list` finds previous session
5. [ ] `session_resume` restores session
6. [ ] `checkpoint` load restores results
7. [ ] Continue research

### Persistence

- [ ] Sessions persist across server restart
- [ ] Checkpoints persist across server restart
- [ ] Saved queries persist across server restart
- [ ] Plan files persist across server restart
- [ ] All data stored in `~/.local/share/australian-history-mcp/`

## Error Handling

### Validation Errors

- [ ] Invalid session name format returns clear error
- [ ] Missing required parameters return clear error
- [ ] Invalid compression level returns clear error
- [ ] Invalid checkpoint action returns clear error

### State Errors

- [ ] No active session returns appropriate error
- [ ] Duplicate session name returns appropriate error
- [ ] Resume completed session returns appropriate error
- [ ] Delete non-existent checkpoint returns appropriate error

## Performance

- [ ] plan_search completes in < 5 seconds
- [ ] session_start completes in < 1 second
- [ ] session_status (quick) completes in < 500ms
- [ ] compress (100 records) completes in < 1 second
- [ ] checkpoint save completes in < 2 seconds

## Notes

**Test data location:** Use existing test data in `docs/search-queries/` for sample records.

**Persistence path:** `~/.local/share/australian-history-mcp/`
- `sessions.json` - Session state
- `checkpoints/` - Checkpoint files
- `plans/` - Generated plan.md files
- `saved-queries.json` - Saved query definitions
