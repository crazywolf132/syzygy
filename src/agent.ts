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

  /**
   * Save agent state with the given key.
   * @throws Error if no state manager is available
   */
  protected async saveState<T>(key: string, data: T): Promise<void> {
    if (!this.context.stateManager) {
      throw new Error(`No state manager available in agent "${this.config.name}".`);
    }
    const fullKey = this.getStateKey(key);
    await this.context.stateManager.set(fullKey, data);
    this.context.logger?.log(`[${this.config.name}] Saved state for key "${key}"`);
  }

  /**
   * Load agent state for the given key.
   * @throws Error if no state manager is available
   */
  protected async loadState<T>(key: string): Promise<T | null> {
    if (!this.context.stateManager) {
      throw new Error(`No state manager available in agent "${this.config.name}".`);
    }
    const fullKey = this.getStateKey(key);
    const data = await this.context.stateManager.get<T>(fullKey);
    this.context.logger?.log(`[${this.config.name}] Loaded state for key "${key}"`);
    return data;
  }

  /**
   * Delete agent state for the given key.
   * @throws Error if no state manager is available
   */
  protected async deleteState(key: string): Promise<void> {
    if (!this.context.stateManager) {
      throw new Error(`No state manager available in agent "${this.config.name}".`);
    }
    const fullKey = this.getStateKey(key);
    await this.context.stateManager.delete(fullKey);
    this.context.logger?.log(`[${this.config.name}] Deleted state for key "${key}"`);
  }

  /**
   * List all state keys for this agent.
   * @throws Error if no state manager is available
   */
  protected async listStateKeys(): Promise<string[]> {
    if (!this.context.stateManager) {
      throw new Error(`No state manager available in agent "${this.config.name}".`);
    }
    const allKeys = await this.context.stateManager.keys();
    const prefix = this.getStateKeyPrefix();
    return allKeys
      .filter(key => key.startsWith(prefix))
      .map(key => key.slice(prefix.length));
  }

  /**
   * Clear all state for this agent.
   * @throws Error if no state manager is available
   */
  protected async clearState(): Promise<void> {
    const keys = await this.listStateKeys();
    for (const key of keys) {
      await this.deleteState(key);
    }
    this.context.logger?.log(`[${this.config.name}] Cleared all state`);
  }

  /**
   * Get the full state key including agent prefix.
   */
  private getStateKey(key: string): string {
    return `${this.getStateKeyPrefix()}${key}`;
  }

  /**
   * Get the prefix used for all state keys for this agent.
   */
  private getStateKeyPrefix(): string {
    return `agent:${this.config.name}:`;
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