import { AgentBuilder, AgentWithUI, DefaultComponentGenerator, UIComponent } from '../../src';

// Create a custom UI agent that generates dashboard components
class DashboardAgent extends AgentWithUI<string, string> {
  async handle(input: string): Promise<string> {
    // Generate different components based on input
    if (input.includes('chart')) {
      const result = await this.generateUIComponent(`
        <div class="dashboard-chart">
          <h2>Analytics Chart</h2>
          <div class="chart-container">
            {/* Chart implementation */}
          </div>
        </div>
      `);
      // The tool call is handled by the decorator and returns a UIComponent
      const component = await this.context.tools.get('componentGenerator')?.execute(result.params);
      return `Generated Chart Component:\n${component?.render()}`;
    }

    if (input.includes('table')) {
      const result = await this.generateUIComponent(`
        <div class="dashboard-table">
          <h2>Data Table</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {/* Table data */}
            </tbody>
          </table>
        </div>
      `);
      const component = await this.context.tools.get('componentGenerator')?.execute(result.params);
      return `Generated Table Component:\n${component?.render()}`;
    }

    // Default to a basic dashboard container
    const result = await this.generateUIComponent(`
      <div class="dashboard">
        <header>
          <h1>Dashboard</h1>
          <nav>{/* Navigation */}</nav>
        </header>
        <main>
          {/* Dashboard content */}
        </main>
      </div>
    `);
    const component = await this.context.tools.get('componentGenerator')?.execute(result.params);
    return `Generated Dashboard Component:\n${component?.render()}`;
  }
}

// Create the dashboard agent using the builder
const dashboardAgent = new AgentBuilder({ 
  name: 'DashboardAgent',
  description: 'Generates dashboard UI components'
})
  .withTool({
    name: 'componentGenerator',
    execute: async ({ description }: { description: string }) => {
      const generator = new DefaultComponentGenerator();
      return await generator.generateComponent(description);
    },
  })
  .withHandler(async (input, context) => {
    const agent = new DashboardAgent(
      { name: 'DashboardAgent', description: 'Generates dashboard UI components' },
      context,
      {
        availableComponents: [],
        componentGenerator: new DefaultComponentGenerator(),
      }
    );
    return await agent.handle(input);
  })
  .build();

// Use the agent to generate different dashboard components
async function main() {
  try {
    // Generate a chart component
    console.log(await dashboardAgent.handle('generate a chart component'));

    // Generate a table component
    console.log(await dashboardAgent.handle('generate a table component'));

    // Generate a basic dashboard
    console.log(await dashboardAgent.handle('generate a dashboard'));
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 