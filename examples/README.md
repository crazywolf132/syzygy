# Syzygy Examples

This directory contains example implementations showcasing various features of the Syzygy library.

## Structure

- `basic/`: Simple examples to get started
  - `simple-agent.ts`: A basic calculator agent demonstrating core concepts

- `ui-generation/`: UI generation examples
  - `dashboard-generator.ts`: Generates React dashboard components

- `orchestration/`: Agent orchestration examples
  - `multi-agent-workflow.ts`: Demonstrates sequential and parallel agent workflows

- `custom-tools/`: Custom tool integration examples
  - `openai-agent.ts`: Shows how to integrate OpenAI (mock implementation)

## Running the Examples

1. Make sure you have the dependencies installed:
   ```bash
   pnpm install
   ```

2. Build the library:
   ```bash
   pnpm build
   ```

3. Run an example:
   ```bash
   # Run the basic calculator example
   ts-node examples/basic/simple-agent.ts

   # Run the UI generation example
   ts-node examples/ui-generation/dashboard-generator.ts

   # Run the orchestration example
   ts-node examples/orchestration/multi-agent-workflow.ts

   # Run the custom tools example
   ts-node examples/custom-tools/openai-agent.ts
   ```

## Example Descriptions

### Basic Calculator Agent
Demonstrates the core concepts of Syzygy by implementing a simple calculator agent that can perform basic math operations. Shows how to:
- Create an agent using the builder pattern
- Register and use tools
- Handle input and produce output

### Dashboard Generator
Shows how to use Syzygy's UI generation capabilities to create React components. Demonstrates:
- Using the `AgentWithUI` base class
- Generating different types of UI components
- Working with the component generator

### Multi-Agent Workflow
Illustrates how to orchestrate multiple agents to work together. Features:
- Sequential and parallel execution
- Data transformation pipeline
- Error handling

### OpenAI Integration
Shows how to integrate external services (using OpenAI as an example). Demonstrates:
- Creating custom tools
- Working with external APIs
- Handling structured responses

## Best Practices

1. **Error Handling**: Always wrap your agent executions in try-catch blocks
2. **Type Safety**: Use TypeScript types for tool parameters and results
3. **Modularity**: Create specialized agents for specific tasks
4. **Composition**: Use the orchestrator to combine agents into workflows

## Contributing

Feel free to add more examples! When contributing:
1. Create a new directory if your example represents a new category
2. Include clear documentation and comments
3. Follow the existing code style
4. Update this README with your example's description 