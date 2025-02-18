import { z } from 'zod';
import { AgentBuilder, AgentWithUI, ReactComponentOption, LibraryComponent } from '../../src';

// Define theme schema
const themeSchema = z.object({
  mode: z.enum(["light", "dark"]),
  primary: z.object({
    main: z.string(),
    light: z.string(),
    dark: z.string(),
    contrastText: z.string(),
  }),
  secondary: z.object({
    main: z.string(),
    light: z.string(),
    dark: z.string(),
    contrastText: z.string(),
  }),
  typography: z.object({
    fontFamily: z.string(),
    fontSize: z.number(),
    h1: z.object({ fontSize: z.string() }),
    h2: z.object({ fontSize: z.string() }),
    body1: z.object({ fontSize: z.string() }),
  }),
  spacing: z.function().args(z.number()).returns(z.number()),
});

// Sample themes
const themes = {
  light: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
      contrastText: "#ffffff",
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontSize: 14,
      h1: { fontSize: "2.5rem" },
      h2: { fontSize: "2rem" },
      body1: { fontSize: "1rem" },
    },
    spacing: (factor: number) => factor * 8,
  },
  dark: {
    mode: "dark",
    primary: {
      main: "#90caf9",
      light: "#e3f2fd",
      dark: "#42a5f5",
      contrastText: "#000000",
    },
    secondary: {
      main: "#ce93d8",
      light: "#f3e5f5",
      dark: "#ab47bc",
      contrastText: "#000000",
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontSize: 14,
      h1: { fontSize: "2.5rem" },
      h2: { fontSize: "2rem" },
      body1: { fontSize: "1rem" },
    },
    spacing: (factor: number) => factor * 8,
  },
};

// Define theme-aware component options
const themeAwareComponents: ReactComponentOption[] = [
  {
    name: "ThemedButton",
    component: {} as any, // In real code, this would be a themed button component
    propsSchema: z.object({
      variant: z.enum(["contained", "outlined", "text"]),
      color: z.enum(["primary", "secondary"]),
      size: z.enum(["small", "medium", "large"]),
      children: z.string(),
      fullWidth: z.boolean().optional(),
    }),
    description: "A theme-aware button component",
  },
  {
    name: "ThemedCard",
    component: {} as any, // In real code, this would be a themed card component
    propsSchema: z.object({
      elevation: z.number().min(0).max(24),
      variant: z.enum(["elevation", "outlined"]),
      title: z.string(),
      content: z.string(),
      actions: z.array(z.object({
        label: z.string(),
        onClick: z.function().optional(),
      })).optional(),
    }),
    description: "A theme-aware card component",
  },
];

// Define Material UI theme components
const themeComponents: LibraryComponent[] = [
  {
    name: "ThemeProvider",
    importPath: "@mui/material/styles",
    description: "MUI theme provider component",
  },
  {
    name: "CssBaseline",
    importPath: "@mui/material",
    description: "MUI CSS baseline component",
  },
];

// Create a theme-aware UI agent
class ThemeAwareAgent extends AgentWithUI<string, string> {
  private currentTheme: "light" | "dark" = "light";

  async handle(input: string): Promise<string> {
    try {
      if (input.includes("toggle theme")) {
        this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
        return `Theme switched to ${this.currentTheme} mode`;
      }

      if (input.includes("themed button")) {
        // Generate a themed button using component selection
        const component = await this.generateComponentFromOptions(
          `Create a ${this.currentTheme} mode themed button with primary color`
        );
        return `Generated Themed Button:\n${component.render()}`;
      }

      if (input.includes("themed card")) {
        // Generate a themed card using component selection
        const component = await this.generateComponentFromOptions(
          `Create a ${this.currentTheme} mode themed card with elevation`
        );
        return `Generated Themed Card:\n${component.render()}`;
      }

      if (input.includes("themed page")) {
        // Generate a complete themed page using full code generation
        const component = await this.generateUIComponent(`
          Create a ${this.currentTheme} mode themed page with:
          - A responsive app bar
          - A grid of themed cards
          - A themed footer
          Using theme values: ${JSON.stringify(themes[this.currentTheme], null, 2)}
        `);
        return `Generated Themed Page:\n${component.render()}`;
      }

      return "Unknown command. Try 'toggle theme', 'themed button', 'themed card', or 'themed page'";
    } catch (error) {
      this.context.logger?.error(`Error in ThemeAwareAgent: ${error}`);
      throw error;
    }
  }
}

// Create the theme-aware agent using the builder
const themeAgent = new AgentBuilder({
  name: "ThemeAwareAgent",
  description: "Generates theme-aware UI components",
})
  .withHandler(async (input, context) => {
    const agent = new ThemeAwareAgent(
      {
        name: "ThemeAwareAgent",
        description: "Generates theme-aware UI components",
      },
      context,
      {
        availableComponents: themeAwareComponents,
        libraryComponents: themeComponents,
        componentGenerator: undefined, // Will be created by AgentWithUI
      }
    );
    return await agent.handle(input);
  })
  .build();

// Example usage
async function main() {
  try {
    // Generate themed components in light mode
    console.log("\nGenerating light mode components:");
    console.log(await themeAgent.handle("themed button"));
    console.log(await themeAgent.handle("themed card"));

    // Switch to dark mode
    console.log("\nSwitching theme:");
    console.log(await themeAgent.handle("toggle theme"));

    // Generate themed components in dark mode
    console.log("\nGenerating dark mode components:");
    console.log(await themeAgent.handle("themed button"));
    console.log(await themeAgent.handle("themed card"));

    // Generate a complete themed page
    console.log("\nGenerating complete themed page:");
    console.log(await themeAgent.handle("themed page"));
  } catch (err) {
    console.error("Error:", err);
  }
}

main(); 