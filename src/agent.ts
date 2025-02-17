import { AgentContext, AgentConfig, ToolParams, ToolResult } from "./types";

/**
 * Base Agent class. All agents extend this.
 */
export abstract class Agent<I = any, O = any> {
  public readonly config: AgentConfig;
  public readonly context: AgentContext;

  constructor(config: AgentConfig, context: AgentContext) {
    this.config = config;
    this.context = context;
  }

  /**
   * Each agent must implement a handle method to process input.
   */
  public abstract handle(input: I): Promise<O>;

  /**
   * Utility to call a registered tool.
   */
  protected async callTool<T extends ToolParams, U extends ToolResult>(
    toolName: string,
    params: T
  ): Promise<U> {
    const tool = this.context.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" is not registered in agent "${this.config.name}".`);
    }
    this.context.logger?.log(`[${this.config.name}] Calling tool "${toolName}" with params:`, params);
    return await tool.execute(params);
  }
}

/**
 * Decorator to mark a method as a tool call handler.
 * If the method returns a tool call shape, the tool is auto-invoked.
 */
export function ToolCallHandler(toolName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (this: Agent, ...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        // If the result is flagged as a tool call, invoke the tool.
        if (result && result.__toolCall === true && result.name === toolName) {
          return await this.callTool(result.name, result.params);
        }
        return result;
      } catch (err) {
        this.context.logger?.error(`[${this.config.name}] Error in method "${propertyKey}"`, err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    };
    return descriptor;
  };
}

/**
 * Helper to create a tool call object.
 */
export function createToolCall<T extends ToolParams>(toolName: string, params: T) {
  return {
    __toolCall: true,
    name: toolName,
    params,
  };
} 