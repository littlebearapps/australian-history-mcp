/**
 * Tool Registry
 *
 * Central registry for all tools from all sources.
 * Replaces the monolithic switch statement with Map-based dispatch.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { Source, SourceTool } from './core/base-source.js';
import type { MCPToolResponse } from './core/types.js';
import { errorResponse } from './core/types.js';

/**
 * Source registration status
 */
export interface SourceStatus {
  name: string;
  displayName: string;
  toolCount: number;
  authRequired: boolean;
  authConfigured: boolean;
}

/**
 * Central tool registry that manages all sources and their tools
 */
class ToolRegistry {
  private sources: Map<string, Source> = new Map();
  private tools: Map<string, SourceTool> = new Map();

  /**
   * Register a source and all its tools
   */
  register(source: Source): void {
    // Validate source
    if (this.sources.has(source.name)) {
      console.error(`Warning: Source '${source.name}' already registered, replacing`);
    }

    // Check for tool name conflicts
    for (const tool of source.tools) {
      if (this.tools.has(tool.schema.name)) {
        const existing = this.getSourceForTool(tool.schema.name);
        console.error(
          `Warning: Tool '${tool.schema.name}' from '${source.name}' ` +
          `conflicts with existing tool from '${existing}'`
        );
      }
    }

    // Register source
    this.sources.set(source.name, source);

    // Register all tools
    for (const tool of source.tools) {
      this.tools.set(tool.schema.name, tool);
    }
  }

  /**
   * Get all registered tool schemas for ListToolsRequest
   */
  listTools(): Tool[] {
    return Array.from(this.tools.values()).map(t => t.schema);
  }

  /**
   * Execute a tool by name
   */
  async executeTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<MCPToolResponse> {
    const tool = this.tools.get(name);

    if (!tool) {
      return errorResponse(`Unknown tool: ${name}`, name);
    }

    try {
      return await tool.execute(args);
    } catch (error) {
      return errorResponse(error, name);
    }
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get the schema for a specific tool (for dynamic loading)
   */
  getToolSchema(name: string): Tool | undefined {
    const sourceTool = this.tools.get(name);
    return sourceTool?.schema;
  }

  /**
   * Get status of all registered sources
   */
  getSourcesStatus(): SourceStatus[] {
    return Array.from(this.sources.values()).map(source => ({
      name: source.name,
      displayName: source.displayName,
      toolCount: source.tools.length,
      authRequired: source.requiresAuth ?? false,
      authConfigured: source.checkAuth?.() ?? true,
    }));
  }

  /**
   * Get list of tools grouped by source
   */
  getToolsBySource(): Map<string, string[]> {
    const result = new Map<string, string[]>();

    for (const source of this.sources.values()) {
      result.set(
        source.name,
        source.tools.map(t => t.schema.name)
      );
    }

    return result;
  }

  /**
   * Get the source name for a given tool
   */
  private getSourceForTool(toolName: string): string | undefined {
    for (const source of this.sources.values()) {
      if (source.tools.some(t => t.schema.name === toolName)) {
        return source.name;
      }
    }
    return undefined;
  }

  /**
   * Get total tool count
   */
  get toolCount(): number {
    return this.tools.size;
  }

  /**
   * Get total source count
   */
  get sourceCount(): number {
    return this.sources.size;
  }
}

// Export singleton registry instance
export const registry = new ToolRegistry();
