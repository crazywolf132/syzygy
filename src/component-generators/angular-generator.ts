import { ComponentGenerator, UIComponent, LibraryComponent } from '../generative-ui';

/**
 * Configuration for the Angular component generator.
 */
export interface AngularGeneratorConfig {
  /**
   * Optional library components that can be used in generation.
   */
  libraryComponents?: LibraryComponent[];

  /**
   * Whether to use standalone components.
   * @default true
   */
  useStandalone?: boolean;

  /**
   * Whether to use signals for state management.
   * @default true
   */
  useSignals?: boolean;

  /**
   * CSS encapsulation mode.
   * @default 'ViewEncapsulation.Emulated'
   */
  encapsulation?: 'ViewEncapsulation.Emulated' | 'ViewEncapsulation.ShadowDom' | 'ViewEncapsulation.None';
}

/**
 * Default configuration for the Angular component generator.
 */
const DEFAULT_CONFIG: Required<AngularGeneratorConfig> = {
  libraryComponents: [],
  useStandalone: true,
  useSignals: true,
  encapsulation: 'ViewEncapsulation.Emulated',
};

/**
 * Generates Angular components with optional library integration.
 */
export class AngularComponentGenerator implements ComponentGenerator {
  private config: Required<AngularGeneratorConfig>;

  constructor(config: AngularGeneratorConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  async generateComponent(description: string): Promise<UIComponent> {
    // Extract component requirements from the description
    const requirements = this.parseRequirements(description);

    // Generate the component files
    const files = this.generateFiles(requirements);

    // Combine files into a single string for rendering
    const code = Object.entries(files)
      .map(([filename, content]) => `// ${filename}\n${content}`)
      .join('\n\n');

    return {
      framework: 'angular',
      render: () => code,
    };
  }

  private parseRequirements(description: string): any {
    // In a real implementation, this would use AI/LLM to:
    // 1. Parse the description into structured requirements
    // 2. Identify needed library components
    // 3. Determine layout and styling needs
    return {
      name: 'generated',
      selector: 'app-generated',
      props: [],
      libraryImports: [],
      layout: description,
    };
  }

  private generateFiles(requirements: any): Record<string, string> {
    const {
      useStandalone,
      useSignals,
      encapsulation,
      libraryComponents,
    } = this.config;

    return {
      'generated.component.ts': this.generateComponentFile(requirements),
      'generated.component.html': this.generateTemplateFile(requirements),
      'generated.component.scss': this.generateStyleFile(requirements),
    };
  }

  private generateComponentFile(requirements: any): string {
    const {
      useStandalone,
      useSignals,
      encapsulation,
      libraryComponents,
    } = this.config;

    const imports = [
      'import { Component, ViewEncapsulation } from "@angular/core";',
      ...(useSignals ? ['import { signal } from "@angular/core";'] : []),
      ...libraryComponents.map(comp => 
        `import { ${comp.name} } from "${comp.importPath}";`
      ),
    ].join('\n');

    const decoratorImports = [
      ...(useStandalone ? libraryComponents.map(comp => comp.name) : []),
    ];

    const decorator = `
@Component({
  selector: '${requirements.selector}',
  templateUrl: './generated.component.html',
  styleUrls: ['./generated.component.scss'],
  ${useStandalone ? `standalone: true,` : ''}
  ${decoratorImports.length > 0 ? `imports: [${decoratorImports.join(', ')}],` : ''}
  encapsulation: ${encapsulation},
})`.trim();

    const classContent = useSignals
      ? this.generateSignalsClass(requirements)
      : this.generateTraditionalClass(requirements);

    return `
${imports}

${decorator}
${classContent}
    `.trim();
  }

  private generateSignalsClass(requirements: any): string {
    return `
export class GeneratedComponent {
  // Signal declarations
  private stateSignal = signal<any>({});

  // Component logic here
}
    `.trim();
  }

  private generateTraditionalClass(requirements: any): string {
    return `
export class GeneratedComponent {
  // Property declarations
  
  // Component logic here
}
    `.trim();
  }

  private generateTemplateFile(requirements: any): string {
    return `
<div class="generated-component">
  ${requirements.layout}
</div>
    `.trim();
  }

  private generateStyleFile(requirements: any): string {
    return `
.generated-component {
  /* Generated styles would go here */
}
    `.trim();
  }
} 