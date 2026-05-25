# Multi-Agent Orchestration — Reference

## TypeScript Interfaces and Config Schemas

### Core Entities

```typescript
interface Agent {
  name: string;
  capabilities: string[];
  maxConcurrency: number;
  costPerTask?: number;
  execute(task: Task): Promise<unknown>;
  executeWithContext(task: Task, context: SharedContext): Promise<void>;
}

interface Task {
  id: string;
  name: string;
  type: string;
  inputs: Record<string, unknown>;
  requiredCapabilities?: string[];
}

interface TaskNode {
  id: string;
  name: string;
  agent: Agent;
  inputs: string[]; // Task IDs that must complete first
  timeout?: number;
  retryLimit?: number;
  skipOnError?: boolean;
}

interface DAGConfig {
  nodes: TaskNode[];
  exitNodes: string[];
}

interface SharedContext {
  requestId: string;
  userId?: string;
  startTime: number;
  data: Record<string, unknown>;
  breadcrumbs: string[];
  errors: Array<{ timestamp: number; message: string }>;
}

interface AgentCapability {
  name: string;
  model: string;
  specialties: string[];
  maxConcurrency: number;
  currentLoad: number;
}
```

## Detailed Pattern Explanations

### Orchestrator-Worker Pattern

**Best for:**
- Clear leader (research coordinator, project manager)
- Well-defined worker roles (researcher, critic, implementer)
- Centralized decision-making on decomposition and synthesis

**Advantages:**
- Single point of control
- Easy to debug (all decisions logged at orchestrator)
- Natural for hierarchical problem decomposition

**Disadvantages:**
- Orchestrator becomes a bottleneck
- Harder to scale beyond 5–10 workers
- Requires orchestrator to understand all worker capabilities

**Example: Research Coordinator**

```typescript
class ResearchOrchestrator {
  private workers = {
    researcher: new ResearchAgent(),
    critic: new CriticAgent(),
    implementer: new ImplementerAgent(),
  };
  
  async conductResearch(question: string) {
    // Decompose question into research subtasks
    const subtasks = [
      { type: "gather_sources", input: question },
      { type: "synthesize", input: question },
      { type: "critique", input: question },
    ];
    
    const results = [];
    for (const subtask of subtasks) {
      const worker = this.selectWorker(subtask.type);
      const result = await worker.work(subtask.input);
      results.push(result);
    }
    
    return this.synthesize(results);
  }
  
  selectWorker(type: string) {
    return this.workers[type as keyof typeof this.workers];
  }
}
```

### Peer-to-Peer Pattern

**Best for:**
- Emerging consensus (debate, peer review)
- Symmetric problem decomposition
- Lower latency (direct agent-to-agent calls)

**Advantages:**
- No bottleneck
- Natural for collaborative tasks
- Agents can specialize independently

**Disadvantages:**
- More complex to coordinate
- Harder to ensure consistency
- Circular dependencies possible

**Example: Code Review Panel**

```typescript
interface PeerAgent {
  name: string;
  solve(problem: Problem): Promise<Solution>;
  review(solution: Solution): Promise<Review>;
}

class ReviewPanel {
  constructor(private agents: PeerAgent[]) {}
  
  async reviewCode(code: string) {
    // Each agent independently reviews
    const reviews = await Promise.all(
      this.agents.map(agent => agent.review({ code }))
    );
    
    // Converge on consensus
    const consensus = this.aggregateReviews(reviews);
    return { code, consensus, reviews };
  }
  
  private aggregateReviews(reviews: Review[]) {
    // Weighted voting on findings
    const issues = new Map<string, number>();
    
    for (const review of reviews) {
      for (const issue of review.findings) {
        issues.set(issue, (issues.get(issue) || 0) + 1);
      }
    }
    
    // Keep only issues flagged by majority
    return Array.from(issues.entries())
      .filter(([_, count]) => count > this.agents.length / 2)
      .map(([issue]) => issue);
  }
}
```

### Pipeline Pattern

**Best for:**
- Linear workflows (gather → analyze → decide → implement)
- Clear data flow from stage to stage
- High throughput per stage

**Advantages:**
- Easy to understand and reason about
- Natural for sequential processes
- Easy to add, remove, or reorder stages

**Disadvantages:**
- Can't express complex dependencies
- Stages may be idle waiting for slow upstream stages
- Backpressure handling required for unbalanced throughput

**Example: Content Processing Pipeline**

```typescript
interface PipelineStage {
  name: string;
  agents: Agent[];
  inputs: string[];
  outputs: string[];
  timeout?: number;
}

class ContentPipeline {
  stages: PipelineStage[] = [
    { name: "fetch", agents: [fetchAgent], inputs: ["url"], outputs: ["content"] },
    { name: "parse", agents: [parseAgent], inputs: ["content"], outputs: ["ast"] },
    { name: "analyze", agents: [analyzeAgent], inputs: ["ast"], outputs: ["insights"] },
    { name: "format", agents: [formatAgent], inputs: ["insights"], outputs: ["report"] },
  ];
  
  async process(input: Record<string, unknown>) {
    let state = input;
    
    for (const stage of this.stages) {
      const stageInputs = stage.inputs.map(key => state[key]);
      
      const results = await Promise.allSettled(
        stage.agents.map(agent => agent.execute(...stageInputs))
      );
      
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "fulfilled") {
          const output = results[i].value;
          stage.outputs.forEach((key, j) => {
            state[key] = output[j];
          });
        }
      }
    }
    
    return state;
  }
}
```

### Fan-Out/Fan-In Pattern

**Best for:**
- Embarrassingly parallel tasks (many independent subtasks)
- Throughput optimization
- Large batches with independent workers

**Advantages:**
- High parallelism
- Easy to scale
- Natural for batch processing

**Disadvantages:**
- Unbounded fan-out can overwhelm system
- Risk of thundering herd on result aggregation
- Hard to handle partial failures fairly

**Example: Batch Processing**

```typescript
class BatchProcessor {
  async mapReduce(
    items: unknown[],
    mapFn: (item: unknown, worker: Agent) => Promise<unknown>,
    reduceFn: (results: unknown[]) => unknown,
    maxConcurrency: number = 5
  ) {
    const workers = Array.from({ length: maxConcurrency }, () => new WorkerAgent());
    const queue = items.map((item, i) => ({ item, index: i }));
    const results = new Array(items.length);
    
    const processQueue = async (worker: Agent) => {
      while (queue.length > 0) {
        const { item, index } = queue.shift()!;
        try {
          results[index] = await mapFn(item, worker);
        } catch (err) {
          results[index] = { error: (err as Error).message };
        }
      }
    };
    
    await Promise.all(workers.map(w => processQueue(w)));
    return reduceFn(results.filter(r => !r.error));
  }
}
```

## DAG Node and Edge Design Details

### Topological Sorting (DFS-based)

```typescript
class DAG {
  topologicalSort(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = this.nodes.get(nodeId)!;
      for (const depId of node.inputs) {
        visit(depId);
      }
      
      order.push(nodeId);
    };
    
    for (const nodeId of this.nodes.keys()) {
      visit(nodeId);
    }
    
    return order;
  }
  
  // Detect cycles
  hasCycle(): boolean {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const colors = new Map<string, number>();
    
    const visit = (nodeId: string): boolean => {
      if (colors.get(nodeId) === GRAY) return true; // Back edge = cycle
      if (colors.get(nodeId) === BLACK) return false;
      
      colors.set(nodeId, GRAY);
      const node = this.nodes.get(nodeId)!;
      
      for (const depId of node.inputs) {
        if (visit(depId)) return true;
      }
      
      colors.set(nodeId, BLACK);
      return false;
    };
    
    for (const nodeId of this.nodes.keys()) {
      if (colors.get(nodeId) === WHITE) {
        if (visit(nodeId)) return true;
      }
    }
    
    return false;
  }
}
```

### Partition Into Parallel Levels

Identifies which tasks can run concurrently:

```typescript
partitionIntoLevels(order: string[]): string[][] {
  const completed = new Set<string>();
  const levels: string[][] = [];
  
  while (completed.size < this.nodes.size) {
    const level = [];
    
    for (const nodeId of order) {
      if (completed.has(nodeId)) continue;
      
      const node = this.nodes.get(nodeId)!;
      // Can execute if all dependencies are completed
      if (node.inputs.every(depId => completed.has(depId))) {
        level.push(nodeId);
      }
    }
    
    if (level.length === 0) {
      throw new Error("Circular dependency detected");
    }
    
    levels.push(level);
    level.forEach(id => completed.add(id));
  }
  
  return levels;
}
```

## Load Balancing Algorithms

### Least-Load Strategy

```typescript
class LeastLoadDispatcher {
  async selectAgent(task: Task): Promise<Agent> {
    const candidates = this.agents.filter(a =>
      task.requiredCapabilities?.every(c => a.capabilities.includes(c))
    );
    
    if (candidates.length === 0) {
      throw new Error(`No agent for task: ${task.name}`);
    }
    
    // Prefer agent with fewest active tasks
    return candidates.reduce((best, candidate) =>
      candidate.currentLoad < best.currentLoad ? candidate : best
    );
  }
}
```

### Cost-Aware Strategy

```typescript
class CostAwareDispatcher {
  async selectAgent(task: Task): Promise<Agent> {
    const candidates = this.agents.filter(a =>
      task.requiredCapabilities?.every(c => a.capabilities.includes(c))
    );
    
    if (candidates.length === 0) {
      throw new Error(`No agent for task: ${task.name}`);
    }
    
    // Prefer agent with lowest cost-per-task
    return candidates.reduce((best, candidate) =>
      (candidate.costPerTask || 0) < (best.costPerTask || 0) ? candidate : best
    );
  }
}
```

### Round-Robin Strategy

```typescript
class RoundRobinDispatcher {
  private nextIndex = 0;
  
  async selectAgent(task: Task): Promise<Agent> {
    const candidates = this.agents.filter(a =>
      task.requiredCapabilities?.every(c => a.capabilities.includes(c))
    );
    
    if (candidates.length === 0) {
      throw new Error(`No agent for task: ${task.name}`);
    }
    
    const selected = candidates[this.nextIndex % candidates.length];
    this.nextIndex++;
    return selected;
  }
}
```

## Retry and Backoff Implementation Details

### Exponential Backoff with Jitter

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFraction?: number; // 0-1, default 0.1
}

class Retryable {
  async executeWithRetry(
    fn: () => Promise<unknown>,
    config: RetryConfig = {
      maxRetries: 3,
      baseDelayMs: 100,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      jitterFraction: 0.1,
    }
  ): Promise<unknown> {
    let lastError;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        
        if (attempt === config.maxRetries) break;
        
        // Exponential backoff with jitter
        let delayMs = Math.min(
          config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelayMs
        );
        
        // Add jitter: random factor between 1-1.1x
        const jitter = 1 + Math.random() * (config.jitterFraction || 0.1);
        delayMs = Math.round(delayMs * jitter);
        
        console.log(`Retry ${attempt + 1}/${config.maxRetries} after ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw lastError;
  }
}
```

### Conditional Retry Predicate

```typescript
class ConditionalRetryable {
  async executeWithRetry(
    fn: () => Promise<unknown>,
    isRetryable: (err: Error) => boolean,
    config: RetryConfig
  ): Promise<unknown> {
    let lastError;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        
        // Check if error is retryable
        if (!isRetryable(err as Error)) {
          throw err; // Non-retryable, fail immediately
        }
        
        if (attempt === config.maxRetries) break;
        
        const delayMs = this.calculateBackoff(attempt, config);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw lastError;
  }
  
  private calculateBackoff(attempt: number, config: RetryConfig): number {
    let delay = Math.min(
      config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt),
      config.maxDelayMs
    );
    
    const jitter = 1 + Math.random() * (config.jitterFraction || 0.1);
    return Math.round(delay * jitter);
  }
}
```

## Testing Strategies

### Unit Testing Individual Agents

```typescript
describe("Agent: ResearchAgent", () => {
  it("executes task and returns results", async () => {
    const agent = new ResearchAgent();
    const task = { name: "find sources", input: "machine learning" };
    
    const result = await agent.execute(task);
    
    expect(result).toHaveProperty("sources");
    expect(Array.isArray(result.sources)).toBe(true);
  });
  
  it("throws structured error on invalid input", async () => {
    const agent = new ResearchAgent();
    
    await expect(agent.execute({ name: "find sources", input: "" }))
      .rejects.toThrow("Input is required");
  });
});
```

### Integration Testing DAG Execution

```typescript
describe("DAG Execution", () => {
  let dag: DAG;
  
  beforeEach(() => {
    dag = new DAG();
    dag.addNode({
      id: "fetch",
      name: "Fetch data",
      agent: new FetchAgent(),
      inputs: [],
    });
    dag.addNode({
      id: "process",
      name: "Process data",
      agent: new ProcessAgent(),
      inputs: ["fetch"],
    });
  });
  
  it("executes DAG in correct order", async () => {
    const result = await dag.execute({});
    
    expect(result).toBeDefined();
    expect(dag.results.get("fetch")).toBeDefined();
    expect(dag.results.get("process")).toBeDefined();
  });
  
  it("skips non-critical nodes on failure", async () => {
    dag.nodes.get("fetch")!.skipOnError = true;
    
    jest.spyOn(FetchAgent.prototype, "execute").mockRejectedValue(new Error("Network error"));
    
    const result = await dag.execute({});
    expect(dag.results.get("fetch")).toEqual({ skipped: true });
  });
  
  it("detects circular dependencies", () => {
    dag.addNode({
      id: "loop",
      name: "Loop back",
      agent: new TestAgent(),
      inputs: ["process", "fetch"],
    });
    dag.nodes.get("fetch")!.inputs = ["loop"];
    
    expect(dag.hasCycle()).toBe(true);
  });
});
```

### Mocking Workers

```typescript
describe("Orchestrator with Mocked Workers", () => {
  it("distributes tasks to capable workers", async () => {
    const mockResearcher = jest.fn().mockResolvedValue({ sources: [] });
    const mockCritic = jest.fn().mockResolvedValue({ feedback: [] });
    
    const orchestrator = new Orchestrator({
      researcher: { work: mockResearcher },
      critic: { work: mockCritic },
    });
    
    await orchestrator.conductResearch("What is AI?");
    
    expect(mockResearcher).toHaveBeenCalledWith("What is AI?");
    expect(mockCritic).toHaveBeenCalled();
  });
});
```
