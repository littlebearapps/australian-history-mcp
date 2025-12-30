/**
 * Meta-Tools Barrel Export
 *
 * Exports all 18 meta-tools for the dynamic loading architecture.
 * These are the only tools exposed via ListToolsRequest.
 */

import type { SourceTool } from '../base-source.js';
import { toolsMetaTool } from './tools.js';
import { schemaMetaTool } from './schema.js';
import { runMetaTool } from './run.js';
import { searchMetaTool } from './search.js';
import { openMetaTool } from './open.js';
import { exportMetaTool } from './export.js';
// SEARCH-019: Saved query meta-tools
import { saveQueryMetaTool } from './save-query.js';
import { listQueriesMetaTool } from './list-queries.js';
import { runQueryMetaTool } from './run-query.js';
import { deleteQueryMetaTool } from './delete-query.js';
// Phase 1: Research planning meta-tool
import { planSearchMetaTool } from './plan-search.js';
// Phase 2: Session management meta-tools
import { sessionStartMetaTool } from './session-start.js';
import { sessionEndMetaTool } from './session-end.js';
import { sessionResumeMetaTool } from './session-resume.js';
import { sessionStatusMetaTool } from './session-status.js';
import { sessionListMetaTool } from './session-list.js';
import { sessionExportMetaTool } from './session-export.js';
import { sessionNoteMetaTool } from './session-note.js';

/**
 * All meta-tools in order of typical usage:
 * 1. tools - discover available data tools
 * 2. schema - get parameters for a specific tool
 * 3. run - execute a data tool
 * 4. search - federated search across multiple sources
 * 5. open - open URL in browser
 * 6. export - export records to various formats
 * 7. save_query - save a query for later reuse
 * 8. list_queries - list saved queries
 * 9. run_query - execute a saved query
 * 10. delete_query - remove a saved query
 * 11. plan_search - analyse topic and generate research plan
 * 12. session_start - start a research session
 * 13. session_end - end a research session
 * 14. session_resume - resume a paused session
 * 15. session_status - check session progress and coverage
 * 16. session_list - list all sessions
 * 17. session_export - export session data
 * 18. session_note - add notes to a session
 */
export const metaTools: SourceTool[] = [
  toolsMetaTool,
  schemaMetaTool,
  runMetaTool,
  searchMetaTool,
  openMetaTool,
  exportMetaTool,
  // SEARCH-019: Saved query meta-tools
  saveQueryMetaTool,
  listQueriesMetaTool,
  runQueryMetaTool,
  deleteQueryMetaTool,
  // Phase 1: Research planning meta-tool
  planSearchMetaTool,
  // Phase 2: Session management meta-tools
  sessionStartMetaTool,
  sessionEndMetaTool,
  sessionResumeMetaTool,
  sessionStatusMetaTool,
  sessionListMetaTool,
  sessionExportMetaTool,
  sessionNoteMetaTool,
];

// Named exports for direct access
export { toolsMetaTool } from './tools.js';
export { schemaMetaTool } from './schema.js';
export { runMetaTool } from './run.js';
export { searchMetaTool } from './search.js';
export { openMetaTool } from './open.js';
export { exportMetaTool } from './export.js';
// SEARCH-019: Saved query meta-tools
export { saveQueryMetaTool } from './save-query.js';
export { listQueriesMetaTool } from './list-queries.js';
export { runQueryMetaTool } from './run-query.js';
export { deleteQueryMetaTool } from './delete-query.js';
// Phase 1: Research planning meta-tool
export { planSearchMetaTool } from './plan-search.js';
// Phase 2: Session management meta-tools
export { sessionStartMetaTool } from './session-start.js';
export { sessionEndMetaTool } from './session-end.js';
export { sessionResumeMetaTool } from './session-resume.js';
export { sessionStatusMetaTool } from './session-status.js';
export { sessionListMetaTool } from './session-list.js';
export { sessionExportMetaTool } from './session-export.js';
export { sessionNoteMetaTool } from './session-note.js';
