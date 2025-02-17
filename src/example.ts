import { AgentBuilder, consoleLogger } from "./agent-builder";
import { AgentOrchestrator } from "./orchestrator";
import { DefaultComponentGenerator } from "./generative-ui";
import { AgentConfig } from "./types";
import { AgentWithUI } from "./agentic-ui";

/**
 * UIAgent extends AgentWithUI to process inputs for generating UI code.
 */
class UIAgent extends AgentWithUI<string, string> {
  async handle(input: string): Promise<string> {
    if (input.includes("generate UI")) {
      // The decorator on generateUIComponent triggers a tool call automatically.
      // The tool call is handled by the decorator and returns a UIComponent
      const component = await this.generateUIComponent("A sleek dashboard component") as any;
      return `Generated UI:\n${component.render()}`;
    }
    return `UIAgent processed: ${input}`;
  }
}

// Build the UI agent using the fluent AgentBuilder.
const uiAgent = new AgentBuilder<string, string>({ name: "UIAgent", description: "Generates UI code" })
  // Register the component generator tool.
  .withTool({
    name: "componentGenerator",
    execute: async ({ description }: { description: string }) => {
      const generator = new DefaultComponentGenerator();
      return await generator.generateComponent(description);
    },
  })
  // Provide a handler that instantiates our UIAgent.
  .withHandler(async (input, context) => {
    const agentInstance = new UIAgent({ name: "UIAgent", description: "Generates UI code" }, context, {
      availableComponents: [],
      componentGenerator: new DefaultComponentGenerator(),
    });
    return await agentInstance.handle(input);
  })
  .build();

// Build an orchestrator that runs agents sequentially and in parallel.
const orchestrator = AgentOrchestrator.create()
  .add(uiAgent) // A sequential call.
  .add(
    AgentOrchestrator.create() // A nested orchestrator for parallel execution.
      .add(uiAgent)
      .add(uiAgent)
  )
  .onError((err) => consoleLogger.error("Orchestration error:", err));

// Run the orchestrator.
(async () => {
  try {
    const seqResult = await orchestrator.runSequential("Please generate UI");
    console.log("Sequential Result:", seqResult);

    const parResults = await orchestrator.runParallel("Parallel UI request");
    console.log("Parallel Results:", parResults);
  } catch (err) {
    console.error("Execution failed:", err);
  }
})(); 