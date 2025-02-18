import { z } from 'zod';
import {
  AgentBuilder,
  AgentWithUI,
  ReactComponentGenerator,
  LocalStorageStateManager,
  LibraryComponent,
  LivePreview,
} from '../../src';

// Define Material UI components we'll use
const materialUIComponents: LibraryComponent[] = [
  {
    name: 'Card',
    importPath: '@mui/material',
    description: 'A Material UI card component',
  },
  {
    name: 'Grid',
    importPath: '@mui/material',
    description: 'A Material UI grid layout system',
  },
  {
    name: 'Typography',
    importPath: '@mui/material',
    description: 'A Material UI typography component',
  },
  {
    name: 'Button',
    importPath: '@mui/material',
    description: 'A Material UI button component',
  },
];

// Define widget types
type WidgetType = 'chart' | 'table' | 'metric';

// Define our dashboard state schema
const dashboardStateSchema = z.object({
  theme: z.enum(['light', 'dark']),
  layout: z.array(z.object({
    id: z.string(),
    type: z.enum(['chart', 'table', 'metric']),
    title: z.string(),
    data: z.any(),
    position: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
  })),
  lastUpdated: z.string(),
});

type DashboardState = z.infer<typeof dashboardStateSchema>;

/**
 * A stateful dashboard agent that persists layout and preferences.
 */
class StatefulDashboardAgent extends AgentWithUI<string, string> {
  private readonly reactGenerator: ReactComponentGenerator;
  private preview?: LivePreview;

  constructor(config: any, context: any, uiOptions: any) {
    super(config, context, uiOptions);

    // Initialize React component generator with Material UI
    this.reactGenerator = new ReactComponentGenerator({
      libraryComponents: materialUIComponents,
      useTypeScript: true,
      cssStrategy: 'styled-components',
    });
  }

  async handle(input: string): Promise<string> {
    try {
      // Load or initialize dashboard state
      let state = await this.loadState<DashboardState>('dashboard');
      if (!state) {
        state = this.getInitialState();
        await this.saveState('dashboard', state);
      }

      if (input.includes('toggle theme')) {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        await this.saveState('dashboard', state);
        return `Theme switched to ${state.theme} mode`;
      }

      if (input.includes('add widget')) {
        const newWidget: DashboardState['layout'][0] = {
          id: `widget-${Date.now()}`,
          type: 'metric',
          title: 'New Widget',
          data: { value: 0 },
          position: { x: 0, y: 0, width: 1, height: 1 },
        };
        state.layout.push(newWidget);
        state.lastUpdated = new Date().toISOString();
        await this.saveState('dashboard', state);
      }

      // Generate the dashboard component
      const component = await this.reactGenerator.generateComponent(`
        <Grid container spacing={2}>
          ${state.layout.map(widget => `
            <Grid item xs={${widget.position.width * 3}}>
              <Card>
                <Typography variant="h6">${widget.title}</Typography>
                ${this.renderWidgetContent(widget)}
              </Card>
            </Grid>
          `).join('\n')}
        </Grid>
      `);

      // If we're in a browser environment and have a preview target
      if (this.preview) {
        await this.preview.update(component);
        return 'Dashboard updated in preview';
      }

      return component.render();
    } catch (error) {
      this.context.logger?.error(`Error in StatefulDashboardAgent: ${error}`);
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
      customCSS: `
        body { background: #f5f5f5; }
        .preview-root { padding: 20px; }
      `,
    });
  }

  private getInitialState(): DashboardState {
    return {
      theme: 'light',
      layout: [
        {
          id: 'welcome',
          type: 'metric',
          title: 'Welcome',
          data: { message: 'Welcome to your dashboard!' },
          position: { x: 0, y: 0, width: 4, height: 1 },
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  private renderWidgetContent(widget: DashboardState['layout'][0]): string {
    switch (widget.type) {
      case 'metric':
        return `
          <Typography variant="body1">
            ${JSON.stringify(widget.data)}
          </Typography>
        `;
      case 'chart':
        return '/* Chart implementation */';
      case 'table':
        return '/* Table implementation */';
      default:
        return '/* Unknown widget type */';
    }
  }
}

// Create the dashboard agent
const dashboardAgent = new AgentBuilder({
  name: 'StatefulDashboardAgent',
  description: 'Generates and manages a stateful dashboard UI',
})
  .withStateManager(new LocalStorageStateManager())
  .withHandler(async (input, context) => {
    const agent = new StatefulDashboardAgent(
      {
        name: 'StatefulDashboardAgent',
        description: 'Generates and manages a stateful dashboard UI',
      },
      context,
      {
        libraryComponents: materialUIComponents,
      }
    );
    return await agent.handle(input);
  })
  .build();

// Example usage
async function main() {
  try {
    // Initialize dashboard
    console.log('\nInitializing dashboard:');
    console.log(await dashboardAgent.handle('initialize'));

    // Add a new widget
    console.log('\nAdding a new widget:');
    console.log(await dashboardAgent.handle('add widget'));

    // Toggle theme
    console.log('\nToggling theme:');
    console.log(await dashboardAgent.handle('toggle theme'));

    // If we're in a browser environment, set up live preview
    if (typeof window !== 'undefined') {
      const previewContainer = document.getElementById('preview');
      if (previewContainer) {
        (dashboardAgent as any).setPreviewTarget(previewContainer);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 