import { z, ZodType } from "zod";

/**
 * Supported UI frameworks.
 */
export type Framework = "react" | "vue" | "svelte" | "angular";

/**
 * Represents a UI component.
 * The render() method returns component code as a string.
 */
export interface UIComponent {
  framework: Framework;
  render(): string;
}

/**
 * Interface for a component generator that produces a UIComponent.
 */
export interface ComponentGenerator {
  generateComponent: (description: string) => Promise<UIComponent>;
}

/**
 * A default component generator that returns a React component.
 * (This is the fully generated code approach.)
 */
export class DefaultComponentGenerator implements ComponentGenerator {
  async generateComponent(description: string): Promise<UIComponent> {
    // In production, this might call an AI service.
    return {
      framework: "react",
      render: () => `
import React from 'react';
const GeneratedComponent = () => (
  <div>${description}</div>
);
export default GeneratedComponent;
      `.trim(),
    };
  }
}

/**
 * ----- Advanced UI Generation (Approach 1): Component Selection & Prop Filling -----
 */

/**
 * Represents an available React component option.
 * - `component`: the actual React component (could be a lazy-loaded component)
 * - `propsSchema`: a Zod schema defining the props for this component.
 */
export interface ReactComponentOption {
  name: string;
  component: React.ComponentType<any>;
  propsSchema: ZodType<any>;
  description?: string; // Optional description to help with component selection
}

/**
 * A function that selects one of the provided React component options based on the prompt,
 * generates the props (this could be powered by AI or by some heuristic), and returns a UIComponent.
 */
export async function chooseAndFillReactComponent(
  prompt: string,
  options: ReactComponentOption[]
): Promise<UIComponent> {
  // In a real implementation, you would:
  // 1. Use AI/LLM to select the best component based on the prompt and component descriptions
  // 2. Generate props that conform to the chosen component's schema
  // 3. Return a properly formatted component with the generated props
  
  // Dummy implementation for now
  const chosen = options[0];
  
  // Generate example props that conform to the schema
  const exampleProps = chosen.propsSchema.parse({
    // You would use AI to generate appropriate props here
    example: "value"
  });

  return {
    framework: "react",
    render: () => `
import React from 'react';
import { ${chosen.name} } from 'my-component-library';

const GeneratedComponent = () => (
  <${chosen.name} {...${JSON.stringify(exampleProps, null, 2)}} />
);

export default GeneratedComponent;
    `.trim(),
  };
}

/**
 * ----- Advanced UI Generation (Approach 2): Full Code Generation with Library Components -----
 */

/**
 * Configuration for library components that can be used in full code generation
 */
export interface LibraryComponent {
  name: string;
  importPath: string;
  description: string;
}

/**
 * Enhanced component generator that can use library components
 */
export class EnhancedComponentGenerator implements ComponentGenerator {
  constructor(private libraryComponents: LibraryComponent[] = []) {}

  async generateComponent(description: string): Promise<UIComponent> {
    // In production, this would:
    // 1. Parse the description to understand the requirements
    // 2. Select appropriate library components to use
    // 3. Generate code that composes these components
    // 4. Return the complete component

    // Example implementation showing library component usage
    const imports = this.libraryComponents
      .map(comp => `import { ${comp.name} } from '${comp.importPath}';`)
      .join('\n');

    return {
      framework: "react",
      render: () => `
import React from 'react';
${imports}

const GeneratedComponent = () => (
  <div className="generated-component">
    ${description}
    {/* Library components would be used here */}
  </div>
);

export default GeneratedComponent;
      `.trim(),
    };
  }
} 