import { Agent } from "./agent";
import { consoleLogger } from "./agent-builder";

/**
 * A node in the orchestration graph: either an Agent or a nested orchestrator.
 */
type AgentOrchestratorNode = Agent | AgentOrchestrator;

/**
 * AgentOrchestrator allows complex flows with sequential and parallel execution.
 */
export class AgentOrchestrator {
  private nodes: AgentOrchestratorNode[] = [];
  private logger = consoleLogger;
  private errorHandler?: (error: Error) => void;

  public static create() {
    return new AgentOrchestrator();
  }

  /**
   * Add an agent or nested orchestrator to the flow.
   */
  public add(node: AgentOrchestratorNode): AgentOrchestrator {
    this.nodes.push(node);
    return this;
  }

  /**
   * Set a global error handler.
   */
  public onError(handler: (error: Error) => void): AgentOrchestrator {
    this.errorHandler = handler;
    return this;
  }

  /**
   * Run nodes sequentially.
   */
  public async runSequential(input: any): Promise<any> {
    let result = input;
    try {
      for (const node of this.nodes) {
        result = await this.executeNode(node, result);
      }
      return result;
    } catch (err) {
      this.errorHandler?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Run all nodes in parallel and return an array of results.
   */
  public async runParallel(input: any): Promise<any[]> {
    try {
      const promises = this.nodes.map((node) => this.executeNode(node, input));
      return await Promise.all(promises);
    } catch (err) {
      this.errorHandler?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Helper method to execute a node.
   */
  private async executeNode(node: AgentOrchestratorNode, input: any): Promise<any> {
    if (node instanceof AgentOrchestrator) {
      return await node.runSequential(input);
    } else {
      this.logger.log(`Executing agent: ${node.config.name}`);
      return await node.handle(input);
    }
  }
} 