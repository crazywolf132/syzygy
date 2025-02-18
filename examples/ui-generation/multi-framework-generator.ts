import {
  AgentBuilder,
  AgentWithUI,
  ReactComponentGenerator,
  VueComponentGenerator,
  SvelteComponentGenerator,
  AngularComponentGenerator,
  LibraryComponent,
  LivePreview,
  Framework,
  UIComponent,
  ComponentGenerator,
} from '../../src';

// Define common UI components that we'll use across frameworks
const commonComponents: LibraryComponent[] = [
  {
    name: 'Button',
    importPath: '@mui/material',
    description: 'A button component',
  },
  {
    name: 'Card',
    importPath: '@mui/material',
    description: 'A card container component',
  },
  {
    name: 'TextField',
    importPath: '@mui/material',
    description: 'A text input component',
  },
];

/**
 * An agent that can generate UI components for multiple frameworks.
 */
class MultiFrameworkAgent extends AgentWithUI<string, string> {
  private generators: Map<Framework, ComponentGenerator>;
  private preview?: LivePreview;

  constructor(config: any, context: any, uiOptions: any) {
    super(config, context, uiOptions);

    // Initialize generators for each framework
    this.generators = new Map<Framework, ComponentGenerator>([
      ['react', new ReactComponentGenerator({
        libraryComponents: commonComponents,
        useTypeScript: true,
        cssStrategy: 'styled-components',
      })],
      ['vue', new VueComponentGenerator({
        libraryComponents: commonComponents,
        useTypeScript: true,
        useCompositionAPI: true,
      })],
      ['svelte', new SvelteComponentGenerator({
        libraryComponents: commonComponents,
        useTypeScript: true,
      })],
      ['angular', new AngularComponentGenerator({
        libraryComponents: commonComponents,
        useStandalone: true,
        useSignals: true,
      })],
    ]);
  }

  async handle(input: string): Promise<string> {
    try {
      // Parse the input to determine which framework to use
      const framework = this.parseFramework(input);
      const generator = this.generators.get(framework);
      
      if (!generator) {
        throw new Error(`Unsupported framework: ${framework}`);
      }

      // Generate a form component as an example
      const component = await generator.generateComponent(`
        A form with:
        - Text input for email
        - Text input for password
        - Submit button
        - Validation feedback
        - Responsive layout
      `);

      // If we're in a browser environment and have a preview target
      if (this.preview) {
        await this.preview.update(component);
        return 'Component updated in preview';
      }

      return `Generated ${framework} component:\n\n${component.render()}`;
    } catch (error) {
      this.context.logger?.error(`Error in MultiFrameworkAgent: ${error}`);
      throw error;
    }
  }

  /**
   * Set up live preview in a browser environment.
   */
  public setPreviewTarget(element: HTMLElement): void {
    this.preview = new LivePreview(element, {
      includeFrameworkDependencies: true,
      includeLibraryDependencies: true,
    });
  }

  private parseFramework(input: string): Framework {
    const frameworks: Framework[] = ['react', 'vue', 'svelte', 'angular'];
    for (const framework of frameworks) {
      if (input.toLowerCase().includes(framework)) {
        return framework;
      }
    }
    return 'react'; // Default to React if no framework specified
  }
}

// Create the multi-framework agent
const multiFrameworkAgent = new AgentBuilder({
  name: 'MultiFrameworkAgent',
  description: 'Generates UI components for multiple frameworks',
})
  .withHandler(async (input, context) => {
    const agent = new MultiFrameworkAgent(
      {
        name: 'MultiFrameworkAgent',
        description: 'Generates UI components for multiple frameworks',
      },
      context,
      {
        libraryComponents: commonComponents,
      }
    );
    return await agent.handle(input);
  })
  .build();

// Example usage
async function main() {
  try {
    // Generate components for different frameworks
    console.log('\nGenerating React component:');
    console.log(await multiFrameworkAgent.handle('generate a React form'));

    console.log('\nGenerating Vue component:');
    console.log(await multiFrameworkAgent.handle('generate a Vue form'));

    console.log('\nGenerating Svelte component:');
    console.log(await multiFrameworkAgent.handle('generate a Svelte form'));

    console.log('\nGenerating Angular component:');
    console.log(await multiFrameworkAgent.handle('generate an Angular form'));

    // If we're in a browser environment, set up live preview
    if (typeof window !== 'undefined') {
      const previewContainer = document.getElementById('preview');
      if (previewContainer) {
        (multiFrameworkAgent as any).setPreviewTarget(previewContainer);
        
        // Generate and preview components for each framework
        const frameworks: Framework[] = ['react', 'vue', 'svelte', 'angular'];
        for (const framework of frameworks) {
          console.log(`\nPreviewing ${framework} component...`);
          await multiFrameworkAgent.handle(`generate a ${framework} form`);
          // Wait a bit between previews
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 