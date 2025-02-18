# Syzygy (pronounced *siz-ij-ee*)

A unified TypeScript library for creating and orchestrating AI agents with tool and generative UI support.

> **Name Origin**: Syzygy refers to the alignment of celestial bodies. In this library, it represents the perfect alignment of agents, tools, and UI components working together harmoniously.

## Features

- 🤖 **Agent-Based Architecture**: Create and compose AI agents with a fluent API
- 🔧 **Tool Support**: Easily integrate tools and capabilities into your agents
- 🎨 **UI Generation**: Built-in support for generating UI components across frameworks
- 🔄 **Orchestration**: Run agents sequentially or in parallel with error handling
- 🌐 **Cross-Platform**: Works in both Node.js and browser environments

## Installation

```bash
# Using pnpm (recommended)
pnpm add syzygy

# Using npm
npm install syzygy

# Using yarn
yarn add syzygy
```

## Quick Start

```typescript
import { AgentBuilder, AgentOrchestrator, DefaultComponentGenerator } from 'syzygy';

// Create an agent that generates UI components
const uiAgent = new AgentBuilder({ name: "UIAgent" })
  .withTool({
    name: "componentGenerator",
    execute: async ({ description }) => {
      const generator = new DefaultComponentGenerator();
      return await generator.generateComponent(description);
    },
  })
  .withHandler(async (input, context) => {
    // Handle input and return output
    return `Processed: ${input}`;
  })
  .build();

// Create an orchestrator and run agents
const orchestrator = AgentOrchestrator.create()
  .add(uiAgent)
  .onError(console.error);

// Run sequentially
const result = await orchestrator.runSequential("Generate a dashboard");
console.log(result);
```

## Documentation

### Creating Agents

Agents are the core building blocks of Syzygy. Create them using the fluent builder API:

```typescript
const agent = new AgentBuilder(config)
  .withTool(tool)
  .withHandler(handler)
  .build();
```

### Adding Tools

Tools extend agent capabilities:

```typescript
const tool = {
  name: "myTool",
  execute: async (params) => {
    // Tool implementation
    return result;
  }
};

agent.withTool(tool);
```

### UI Generation

Syzygy supports two powerful approaches for UI generation:

1. **Component Selection & Prop Filling**  
   Provide a list of React component options (or components for another framework) along with their props definitions (using Zod schemas). Based on a prompt, Syzygy will choose the best component and generate the props. For example:

   ```typescript
   import { z } from "zod";
   import { ReactComponentOption } from "syzygy";

   // Define a React component option:
   const ButtonOption: ReactComponentOption = {
     name: "Button",
     component: require("my-component-library").Button,
     propsSchema: z.object({
       label: z.string(),
       onClick: z.function().args().returns(z.void()),
     }),
   };

   // Pass the options into your AgentWithUI instance:
   const uiAgent = new MyUIAgent(..., {
     availableComponents: [ButtonOption],
     componentGenerator: new DefaultComponentGenerator(),
   });

   // Later, choose a component based on a prompt:
   const uiComponent = await uiAgent.generateComponentFromOptions(
     "Create a primary button labeled 'Submit'"
   );
   console.log(uiComponent.render());
   ```

2. **Full Code Generation**  
   Use the full component generator to create new UI code based on a description. You can also provide library components (e.g., from Material UI) that the generator can use to compose larger components:

   ```typescript
   import { LibraryComponent, EnhancedComponentGenerator } from "syzygy";

   // Define available library components
   const materialUIComponents: LibraryComponent[] = [
     {
       name: "Button",
       importPath: "@mui/material",
       description: "A Material UI button component",
     },
     // ... more components
   ];

   // Create an agent with library components
   const uiAgent = new MyUIAgent(..., {
     libraryComponents: materialUIComponents,
     componentGenerator: new EnhancedComponentGenerator(materialUIComponents),
   });

   // Generate a complete component
   const uiComponent = await uiAgent.generateUIComponent(`
     Create a dashboard layout with:
     - A header with a title
     - A grid of cards showing different metrics
     - A sidebar with navigation buttons
   `);
   console.log(uiComponent.render());
   ```

You can mix both approaches as needed, even composing larger composite components (for instance, a complete dashboard) by combining your pre-defined component options with fully generated code.

For more examples, check out the `examples/ui-generation` directory, particularly `enhanced-dashboard-generator.ts` which demonstrates both approaches.

### Orchestration

Run agents in various patterns:

```typescript
// Sequential execution
const seqResult = await orchestrator.runSequential(input);

// Parallel execution
const parResults = await orchestrator.runParallel(input);
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC License - See [LICENSE](LICENSE) for details. 