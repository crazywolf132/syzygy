import { Agent, createToolCall, ToolCallHandler } from "./agent";
import { AgentConfig } from "./types";
import {
  UIComponent,
  ComponentGenerator,
  DefaultComponentGenerator,
  ReactComponentOption,
  chooseAndFillReactComponent,
  LibraryComponent,
  EnhancedComponentGenerator,
} from "./generative-ui";

/**
 * Options for an agent that works with UI.
 */
export interface AgenticUIOptions {
  // For approach 1: Component selection & prop filling
  availableComponents?: ReactComponentOption[];
  
  // For approach 2: Full code generation
  componentGenerator?: ComponentGenerator;
  
  // Optional library components that can be used in full code generation
  libraryComponents?: LibraryComponent[];
}

/**
 * AgentWithUI extends Agent to add UI generation/selection capabilities.
 */
export abstract class AgentWithUI<I = any, O = any> extends Agent<I, O> {
  public readonly uiOptions: AgenticUIOptions;
  private readonly componentGenerator: ComponentGenerator;

  constructor(config: AgentConfig, context: any, uiOptions: AgenticUIOptions) {
    super(config, context);
    this.uiOptions = uiOptions;

    // Initialize the component generator
    if (uiOptions.componentGenerator) {
      this.componentGenerator = uiOptions.componentGenerator;
    } else if (uiOptions.libraryComponents) {
      this.componentGenerator = new EnhancedComponentGenerator(uiOptions.libraryComponents);
    } else {
      this.componentGenerator = new DefaultComponentGenerator();
    }
  }

  /**
   * Approach 1: Select an existing React component from a provided list and fill in props.
   */
  public async generateComponentFromOptions(prompt: string): Promise<UIComponent> {
    if (!this.uiOptions.availableComponents || this.uiOptions.availableComponents.length === 0) {
      throw new Error("No available React components provided for selection.");
    }
    return await chooseAndFillReactComponent(prompt, this.uiOptions.availableComponents);
  }

  /**
   * Approach 2: Fully generate a new UI component using the component generator.
   */
  public async generateUIComponent(description: string): Promise<UIComponent> {
    return await this.componentGenerator.generateComponent(description);
  }

  /**
   * Helper method to check if a component exists in the available options.
   */
  protected hasComponent(componentName: string): boolean {
    return !!this.uiOptions.availableComponents?.some(c => c.name === componentName);
  }

  /**
   * Helper method to get available component descriptions.
   */
  protected getAvailableComponentDescriptions(): string[] {
    return (this.uiOptions.availableComponents || []).map(
      c => `${c.name}${c.description ? `: ${c.description}` : ""}`
    );
  }
} 