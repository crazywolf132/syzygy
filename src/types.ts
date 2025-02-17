/**
 * Basic types for tool parameters and results.
 */
export type ToolParams = Record<string, any>;
export type ToolResult = any;

/**
 * Every tool must have a name and an execute method.
 */
export interface Tool<T = ToolParams, U = ToolResult> {
  name: string;
  execute: (params: T) => Promise<U>;
}

/**
 * The AgentContext holds registered tools and an optional logger.
 */
export interface AgentContext {
  tools: Map<string, Tool>;
  logger?: Logger;
}

/**
 * Agent configuration includes a name and an optional description.
 */
export interface AgentConfig {
  name: string;
  description?: string;
}

/**
 * A simple logging interface.
 */
export interface Logger {
  log: (message: string, data?: any) => void;
  error: (message: string, error?: Error) => void;
} 