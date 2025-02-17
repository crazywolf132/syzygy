import { Agent, createToolCall, ToolCallHandler } from "./agent";
import { AgentConfig } from "./types";
import { UIComponent, ComponentGenerator, DefaultComponentGenerator } from "./generative-ui";

/**
 * Options for an agent that works with UI.
 */
export interface AgenticUIOptions {
  availableComponents: UIComponent[];
  componentGenerator: ComponentGenerator;
}

/**
 * AgentWithUI extends Agent to add UI generation/selection capabilities.
 */
export abstract class AgentWithUI<I = any, O = any> extends Agent<I, O> {
  public readonly uiOptions: AgenticUIOptions;

  constructor(config: AgentConfig, context: any, uiOptions: AgenticUIOptions) {
    super(config, context);
    this.uiOptions = uiOptions;
  }

  /**
   * Select a pre-built UI component.
   */
  public selectComponent(): UIComponent {
    if (this.uiOptions.availableComponents.length === 0) {
      throw new Error("No available UI components.");
    }
    return this.uiOptions.availableComponents[0];
  }

  /**
   * Generate a new UI component.
   * The ToolCallHandler decorator auto-invokes the "componentGenerator" tool.
   */
  @ToolCallHandler("componentGenerator")
  public async generateUIComponent(description: string) {
    return createToolCall("componentGenerator", { description });
  }
} 