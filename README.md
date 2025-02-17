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

Generate UI components for different frameworks:

```typescript
const generator = new DefaultComponentGenerator();
const component = await generator.generateComponent("A modern dashboard");
console.log(component.render());
```

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