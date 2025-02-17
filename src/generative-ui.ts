/**
 * Supported UI frameworks.
 */
export type Framework = 'react' | 'vue' | 'svelte' | 'angular';

/**
 * Represents a UI component. The render() method returns component code as a string.
 */
export interface UIComponent {
  framework: Framework;
  render(): string;
}

/**
 * Interface for a component generator.
 */
export interface ComponentGenerator {
  generateComponent: (description: string) => Promise<UIComponent>;
}

/**
 * A default component generator that returns a React component.
 */
export class DefaultComponentGenerator implements ComponentGenerator {
  async generateComponent(description: string): Promise<UIComponent> {
    // In a production environment, this could call an AI service.
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