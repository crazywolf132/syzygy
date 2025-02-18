import { Agent } from "./agent";
import { AgentConfig, AgentContext, Tool, ToolParams, ToolResult, StateManager } from "./types";
import { InMemoryStateManager } from "./state-manager";

/**
 * AgentBuilder helps in constructing agents with a fluent API.
 */
export class AgentBuilder<I = any, O = any> {
  private config: AgentConfig;
  private handlerFn?: (input: I, context: AgentContext) => Promise<O>;
  private tools = new Map<string, Tool<ToolParams, ToolResult>>();
  private stateManager?: StateManager;
  private logger = consoleLogger;

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
   * Set a custom state manager. If not set, uses InMemoryStateManager.
   */
  public withStateManager(stateManager: StateManager): AgentBuilder<I, O> {
    this.stateManager = stateManager;
    return this;
  }

  /**
   * Set a custom logger. If not set, uses consoleLogger.
   */
  public withLogger(logger: typeof consoleLogger): AgentBuilder<I, O> {
    this.logger = logger;
    return this;
  }

  /**
   * Build and return the agent.
   */
  public build(): Agent<I, O> {
    if (!this.handlerFn) throw new Error("Agent handler must be defined.");

    // Create the agent context with tools, logger, and state manager
    const context: AgentContext = {
      tools: this.tools,
      logger: this.logger,
      stateManager: this.stateManager || new InMemoryStateManager(),
    };

    // Create a minimal Agent subclass that uses the provided handler
    return new (class extends Agent<I, O> {
      async handle(input: I): Promise<O> {
        // Using the handler provided via the builder
        return (this.config as any).handler(input, this.context);
      }
    })(Object.assign(this.config, { handler: this.handlerFn }), context);
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