import { z } from 'zod';
import { AgentBuilder, AgentWithUI, ReactComponentOption, LibraryComponent } from '../../src';

// Define chart data schemas
const dataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
});

const chartDataSchema = z.object({
  title: z.string(),
  data: z.array(dataPointSchema),
  type: z.enum(["bar", "line", "pie", "scatter"]),
});

// Define visualization components (using Material UI and Chart.js as examples)
const chartComponents: LibraryComponent[] = [
  {
    name: "BarChart",
    importPath: "@mui/x-charts",
    description: "Bar chart component for numerical comparisons",
  },
  {
    name: "LineChart",
    importPath: "@mui/x-charts",
    description: "Line chart component for trend visualization",
  },
  {
    name: "PieChart",
    importPath: "@mui/x-charts",
    description: "Pie chart component for part-to-whole relationships",
  },
];

// Define component options with Zod schemas
const visualizationOptions: ReactComponentOption[] = [
  {
    name: "ChartCard",
    component: {} as any, // In real code, this would be a custom chart wrapper
    propsSchema: z.object({
      title: z.string(),
      chartType: z.enum(["bar", "line", "pie", "scatter"]),
      data: z.array(dataPointSchema),
      width: z.number().optional(),
      height: z.number().optional(),
      animate: z.boolean().optional(),
    }),
    description: "A card component containing a chart visualization",
  },
  {
    name: "DataGrid",
    component: {} as any, // In real code, this would be MUI DataGrid
    propsSchema: z.object({
      columns: z.array(z.object({
        field: z.string(),
        headerName: z.string(),
        width: z.number().optional(),
      })),
      rows: z.array(z.record(z.any())),
      pageSize: z.number().optional(),
      autoHeight: z.boolean().optional(),
    }),
    description: "A data grid for tabular data display",
  },
];

// Sample data for visualization
const sampleData = {
  salesData: [
    { label: "Q1", value: 1200 },
    { label: "Q2", value: 1800 },
    { label: "Q3", value: 1400 },
    { label: "Q4", value: 2200 },
  ],
  productData: [
    { label: "Product A", value: 30 },
    { label: "Product B", value: 25 },
    { label: "Product C", value: 20 },
    { label: "Product D", value: 15 },
    { label: "Others", value: 10 },
  ],
};

// Create a custom visualization agent
class VisualizationAgent extends AgentWithUI<string, string> {
  async handle(input: string): Promise<string> {
    try {
      if (input.includes("sales chart")) {
        // Generate a sales trend chart using full code generation
        const component = await this.generateUIComponent(`
          Create a line chart showing quarterly sales trends with:
          - Title: "Quarterly Sales Performance"
          - Data: ${JSON.stringify(sampleData.salesData)}
          - Animated transitions
          - Responsive width
        `);
        return `Generated Sales Chart:\n${component.render()}`;
      }

      if (input.includes("product distribution")) {
        // Generate a pie chart using component selection
        const component = await this.generateComponentFromOptions(
          "Create a pie chart showing product distribution"
        );
        return `Generated Product Distribution Chart:\n${component.render()}`;
      }

      if (input.includes("dashboard")) {
        // Generate a complete dashboard layout with multiple charts
        const component = await this.generateUIComponent(`
          Create a dashboard layout with:
          - A header with title "Sales Analytics Dashboard"
          - A grid layout with two charts:
            1. Sales trend line chart
            2. Product distribution pie chart
          - A data grid showing detailed numbers
          - Responsive design for all screen sizes
        `);
        return `Generated Dashboard:\n${component.render()}`;
      }

      return "Unknown command. Try 'sales chart', 'product distribution', or 'dashboard'";
    } catch (error) {
      this.context.logger?.error(`Error in VisualizationAgent: ${error}`);
      throw error;
    }
  }
}

// Create the visualization agent using the builder
const visualizationAgent = new AgentBuilder({
  name: "VisualizationAgent",
  description: "Generates data visualization components and dashboards",
})
  .withHandler(async (input, context) => {
    const agent = new VisualizationAgent(
      {
        name: "VisualizationAgent",
        description: "Generates data visualization components and dashboards",
      },
      context,
      {
        availableComponents: visualizationOptions,
        libraryComponents: chartComponents,
        componentGenerator: undefined, // Will be created by AgentWithUI
      }
    );
    return await agent.handle(input);
  })
  .build();

// Example usage
async function main() {
  try {
    // Generate individual charts
    console.log("\nGenerating sales trend chart:");
    console.log(await visualizationAgent.handle("sales chart"));

    console.log("\nGenerating product distribution chart:");
    console.log(await visualizationAgent.handle("product distribution"));

    // Generate complete dashboard
    console.log("\nGenerating complete dashboard:");
    console.log(await visualizationAgent.handle("dashboard"));
  } catch (err) {
    console.error("Error:", err);
  }
}

main(); 