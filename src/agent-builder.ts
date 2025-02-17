import { Agent } from "./agent";
import { AgentConfig, AgentContext, Tool, ToolParams, ToolResult } from "./types";

/**
 * AgentBuilder helps in constructing agents with a fluent API.
 */
export class AgentBuilder<I = any, O = any> {
  private config: AgentConfig;
  private handlerFn?: (input: I, context: AgentContext) => Promise<O>;
  private tools = new Map<string, Tool<ToolParams, ToolResult>>();

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Register a tool with the agent.
   */
  public withTool<T extends ToolParams, U extends ToolResult>(tool: Tool<T, U>): AgentBuilder<I, O> {
    this.tools.set(tool.name, tool as Tool<ToolParams, ToolResult>);
    return this;
  }

  /**
   * Set the agent's handler function.
   */
  public withHandler(handler: (input: I, context: AgentContext) => Promise<O>): AgentBuilder<I, O> {
    this.handlerFn = handler;
    return this;
  }

  /**
   * Build and return the agent.
   */
  public build(): Agent<I, O> {
    if (!this.handlerFn) throw new Error("Agent handler must be defined.");
    // Create a minimal Agent subclass that uses the provided handler.
    return new (class extends Agent<I, O> {
      async handle(input: I): Promise<O> {
        // Using the handler provided via the builder.
        return (this.config as any).handler(input, this.context);
      }
    })(Object.assign(this.config, { handler: this.handlerFn }), { tools: this.tools, logger: consoleLogger });
  }
}

/**
 * A default logger that simply writes to the console.
 * Replace with a custom logger if needed.
 */
export const consoleLogger = {
  log: (message: string, data?: any) => console.log(message, data || ""),
  error: (message: string, error?: Error) => console.error(message, error),
}; 