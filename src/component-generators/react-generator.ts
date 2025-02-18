import { ComponentGenerator, UIComponent, LibraryComponent } from '../generative-ui';

/**
 * Configuration for the React component generator.
 */
export interface ReactGeneratorConfig {
  /**
   * Optional library components that can be used in generation.
   */
  libraryComponents?: LibraryComponent[];

  /**
   * Whether to use TypeScript for generated components.
   * @default true
   */
  useTypeScript?: boolean;

  /**
   * Whether to include prop types.
   * @default true
   */
  includePropTypes?: boolean;

  /**
   * CSS-in-JS solution to use.
   * @default 'styled-components'
   */
  cssStrategy?: 'styled-components' | 'emotion' | 'css-modules' | 'inline';
}

/**
 * Default configuration for the React component generator.
 */
const DEFAULT_CONFIG: Required<ReactGeneratorConfig> = {
  libraryComponents: [],
  useTypeScript: true,
  includePropTypes: true,
  cssStrategy: 'styled-components',
};

/**
 * Generates React components with optional Material UI integration.
 */
export class ReactComponentGenerator implements ComponentGenerator {
  private config: Required<ReactGeneratorConfig>;

  constructor(config: ReactGeneratorConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  async generateComponent(description: string): Promise<UIComponent> {
    // Extract component requirements from the description
    const requirements = this.parseRequirements(description);

    // Generate the component code
    const code = this.generateCode(requirements);

    return {
      framework: 'react',
      render: () => code,
    };
  }

  private parseRequirements(description: string): any {
    // In a real implementation, this would use AI/LLM to:
    // 1. Parse the description into structured requirements
    // 2. Identify needed library components
    // 3. Determine layout and styling needs
    return {
      name: 'GeneratedComponent',
      props: [],
      libraryImports: [],
      layout: description,
    };
  }

  private generateCode(requirements: any): string {
    const {
      useTypeScript,
      includePropTypes,
      cssStrategy,
      libraryComponents,
    } = this.config;

    // Generate imports
    const imports = this.generateImports(requirements, libraryComponents);

    // Generate props interface if using TypeScript
    const propsInterface = useTypeScript ? this.generatePropsInterface(requirements) : '';

    // Generate styled components if using CSS-in-JS
    const styles = this.generateStyles(requirements, cssStrategy);

    // Generate the component
    const component = this.generateComponentCode(requirements, {
      useTypeScript,
      includePropTypes,
      cssStrategy,
    });

    return `
${imports}

${propsInterface}

${styles}

${component}
    `.trim();
  }

  private generateImports(requirements: any, libraryComponents: LibraryComponent[]): string {
    const imports = ['import React from "react";'];

    // Add CSS-in-JS imports
    if (this.config.cssStrategy === 'styled-components') {
      imports.push('import styled from "styled-components";');
    }

    // Add library component imports
    const libraryImports = libraryComponents.map(comp => 
      `import { ${comp.name} } from "${comp.importPath}";`
    );

    return [...imports, ...libraryImports].join('\n');
  }

  private generatePropsInterface(requirements: any): string {
    if (!this.config.useTypeScript) return '';

    // In a real implementation, generate proper prop types
    return `
interface Props {
  // Generated prop types would go here
}
    `.trim();
  }

  private generateStyles(requirements: any, cssStrategy: string): string {
    switch (cssStrategy) {
      case 'styled-components':
        return `
const StyledContainer = styled.div\`
  // Generated styles would go here
\`;
        `.trim();
      case 'css-modules':
        return `
import styles from './styles.module.css';
        `.trim();
      default:
        return '';
    }
  }

  private generateComponentCode(
    requirements: any,
    options: { useTypeScript: boolean; includePropTypes: boolean; cssStrategy: string }
  ): string {
    const { useTypeScript } = options;
    const propsType = useTypeScript ? ': Props' : '';

    return `
const ${requirements.name} = (props${propsType}) => {
  return (
    <StyledContainer>
      ${requirements.layout}
    </StyledContainer>
  );
};

export default ${requirements.name};
    `.trim();
  }
} 