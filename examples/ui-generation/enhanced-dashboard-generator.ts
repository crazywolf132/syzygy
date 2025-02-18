import { z } from "zod";
import { AgentBuilder, AgentWithUI, DefaultComponentGenerator, ReactComponentOption, LibraryComponent } from "../../src";

// Define some example Material UI components
const materialUIComponents: LibraryComponent[] = [
  {
    name: "Button",
    importPath: "@mui/material",
    description: "A Material UI button component",
  },
  {
    name: "Card",
    importPath: "@mui/material",
    description: "A Material UI card container",
  },
  {
    name: "Grid",
    importPath: "@mui/material",
    description: "A Material UI grid layout system",
  },
];

// Define some example React component options with Zod schemas
const buttonSchema = z.object({
  variant: z.enum(["text", "contained", "outlined"]),
  color: z.enum(["primary", "secondary", "error", "warning", "info", "success"]),
  size: z.enum(["small", "medium", "large"]),
  onClick: z.function().args().returns(z.void()).optional(),
  children: z.string(),
});

const cardSchema = z.object({
  title: z.string(),
  content: z.string(),
  elevation: z.number().min(0).max(24).optional(),
});

const componentOptions: ReactComponentOption[] = [
  {
    name: "CustomButton",
    component: {} as any, // In real code, this would be your actual React component
    propsSchema: buttonSchema,
    description: "A customizable button component with various styles and sizes",
  },
  {
    name: "CustomCard",
    component: {} as any, // In real code, this would be your actual React component
    propsSchema: cardSchema,
    description: "A card component for displaying content with a title",
  },
];

// Create a custom UI agent that can handle both approaches
class EnhancedDashboardAgent extends AgentWithUI<string, string> {
  async handle(input: string): Promise<string> {
    try {
      if (input.includes("existing component")) {
        // Approach 1: Use existing components with prop filling
        const component = await this.generateComponentFromOptions(input);
        return `Generated Component from Options:\n${component.render()}`;
      } else {
        // Approach 2: Full code generation with library components
        const component = await this.generateUIComponent(input);
        return `Generated Full Component:\n${component.render()}`;
      }
    } catch (error) {
      this.context.logger?.error(`Error generating UI: ${error}`);
      throw error;
    }
  }
}

// Create the dashboard agent using the builder
const dashboardAgent = new AgentBuilder({
  name: "EnhancedDashboardAgent",
  description: "Generates UI components using both selection and full generation approaches",
})
  .withHandler(async (input, context) => {
    const agent = new EnhancedDashboardAgent(
      {
        name: "EnhancedDashboardAgent",
        description: "Generates UI components using both approaches",
      },
      context,
      {
        availableComponents: componentOptions,
        libraryComponents: materialUIComponents,
        componentGenerator: new DefaultComponentGenerator(),
      }
    );
    return await agent.handle(input);
  })
  .build();

// Example usage
async function main() {
  try {
    // Example 1: Using existing components with prop filling
    console.log("\nGenerating a button using component selection:");
    console.log(
      await dashboardAgent.handle(
        "existing component: Create a large primary contained button that says 'Submit'"
      )
    );

    // Example 2: Full code generation with library components
    console.log("\nGenerating a dashboard layout using full generation:");
    console.log(
      await dashboardAgent.handle(`
Create a dashboard layout with:
- A header with a title
- A grid of cards showing different metrics
- A sidebar with navigation buttons
      `)
    );

  } catch (err) {
    console.error("Error:", err);
  }
}

main(); 