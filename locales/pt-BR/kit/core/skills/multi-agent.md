---
name: multi-agent
description: Orchestrate teams of specialized agents — DAG execution, task distribution, state sharing, failure recovery
triggers:
  - multi-agent
  - parallel agents
  - agent orchestration
  - dag execution
  - task distribution
  - worker agents
  - agent teams
---

# Multi-Agent Orchestration

## When to Use

Apply this skill when:
- Coordinating work across multiple specialized agents
- Building parallel agent teams (orchestrator-worker, peer-to-peer)
- Designing DAG-based task execution with dependencies
- Distributing tasks by agent capability or load
- Sharing state across agent boundaries
- Recovering from agent failures (retries, escalation)
- Defining when to spawn agents vs inline execution

## When to Use

**This skill applies to:**
- Agent team patterns (orchestrator, worker, peer coordination)
- Task DAG design (nodes, edges, parallel execution, joins)
- Task routing (capability-based dispatch, load balancing)
- State management (context passing, versioned checkpoints)
- Failure handling (retries, skips, escalation)
- Agent boundaries (responsibilities, contracts, isolation)
- Spawn/inline decision logic (latency, complexity, parallelism)

**Do NOT use this for:**
- Single-agent reasoning (that's in general agent patterns)
- Prompt engineering (that's in prompt optimization skills)
- Agent architecture design from scratch (that's an architect decision)
- Asynchronous job queues or workflow engines (that's infrastructure)

---

## 1. Agent Team Patterns

### Orchestrator-Worker Pattern

One central orchestrator delegates to specialized workers. Best for:
- Clear leader (e.g., a research coordinator)
- Well-defined worker roles (researcher, critic, implementer)
- High coordination overhead acceptable

```typescript
interface OrchestrationConfig {
  orchestratorName: string;
  workerCapabilities: {
    name: string;
    capabilities: string[]; // e.g., ["code_generation", "testing"]
    context?: Record<string, unknown>;
  }[];
}

class Orchestrator {
  async executeTask(task: Task) {
    // Decompose task into subtasks
    const subtasks = this.decompose(task);
    
    // Route each subtask to best-fit worker
    const results = [];
    for (const subtask of subtasks) {
      const worker = this.selectWorker(subtask);
      const result = await this.sendToWorker(worker, subtask);
      results.push(result);
      
      // Validate result before proceeding
      if (!this.validateResult(result, subtask)) {
        // Escalate or retry
        const escalated = await this.escalateToOrchestratorLogic(subtask);
        results[results.length - 1] = escalated;
      }
    }
    
    // Synthesize final output
    return this.synthesize(results, task);
  }
  
  selectWorker(subtask: Task) {
    // Match task requirements to worker capabilities
    const required = this.extractCapabilities(subtask);
    return this.workers.find(w => 
      required.every(cap => w.capabilities.includes(cap))
    );
  }
}
```

### Peer-to-Peer Delegation Pattern

Agents collaborate as equals, no central coordinator. Best for:
- Emerging consensus (e.g., debate, peer review)
- Symmetric problem decomposition
- Lower latency (direct agent-to-agent calls)

```typescript
interface PeerAgent {
  name: string;
  sendMessage(to: PeerAgent, message: Message): Promise<Response>;
  capabilities: string[];
}

class PeerCoordinator {
  async collaborativeTask(agents: PeerAgent[], problem: Problem) {
    // Each agent works on problem independently
    const proposals = await Promise.all(
      agents.map(agent => agent.solve(problem))
    );
    
    // Agents peer-review each other's proposals
    const reviews = await Promise.all(
      agents.map((agent, i) =>
        Promise.all(
          proposals.map((prop, j) =>
            i !== j ? agent.review(prop) : null
          )
        )
      )
    );
    
    // Converge on best solution
    return this.selectConsensus(proposals, reviews);
  }
}
```

### Pipeline Pattern

Sequential stages, each with one or more agents. Best for:
- Linear workflows (gather → analyze → decide → implement)
- Clear data flow from stage to stage
- High throughput per stage

```typescript
interface PipelineStage {
  name: string;
  agents: Agent[];
  inputs: string[];        // Input field names
  outputs: string[];       // Output field names
  timeout?: number;
}

class Pipeline {
  stages: PipelineStage[] = [];
  
  async execute(initialInput: Record<string, unknown>) {
    let state = initialInput;
    
    for (const stage of this.stages) {
      // Execute all agents in stage in parallel (or serialize if needed)
      const stageInputs = stage.inputs.map(key => state[key]);
      
      try {
        const results = await Promise.allSettled(
          stage.agents.map(agent => 
            agent.execute(...stageInputs)
          )
        );
        
        // Merge successful results back into state
        for (let i = 0; i < results.length; i++) {
          if (results[i].status === "fulfilled") {
            const output = results[i].value;
            stage.outputs.forEach((key, j) => {
              state[key] = output[j];
            });
          } else {
            // Handle failure: log, retry, or skip
            console.error(`Stage ${stage.name} agent ${i} failed`, results[i].reason);
          }
        }
      } catch (err) {
        throw new Error(`Pipeline failed at stage ${stage.name}`, { cause: err });
      }
    }
    
    return state;
  }
}
```

### Fan-Out/Fan-In Pattern

Spawn many workers in parallel, collect results. Best for:
- Embarrassingly parallel tasks (many independent subtasks)
- Throughput optimization
- Risk: unbounded fan-out can overwhelm system

```typescript
class FanOutFanIn {
  async mapReduce(
    input: unknown[],
    mapFn: (item: unknown, agent: Agent) => Promise<unknown>,
    reduceFn: (results: unknown[]) => unknown,
    maxConcurrency: number = 5
  ) {
    // Spawn up to maxConcurrency workers
    const workers = this.createWorkerPool(maxConcurrency);
    
    // Distribute work
    const queue = input.map((item, i) => ({ item, index: i }));
    const results = new Array(input.length);
    
    const processQueue = async (worker: Agent) => {
      while (queue.length > 0) {
        const { item, index } = queue.shift()!;
        try {
          results[index] = await mapFn(item, worker);
        } catch (err) {
          // Retry or mark as failed
          results[index] = { error: err.message };
        }
      }
    };
    
    // Wait for all workers to finish
    await Promise.all(
      workers.map(worker => processQueue(worker))
    );
    
    // Reduce results
    return reduceFn(results.filter(r => !r.error));
  }
}
```

---

## 2. DAG Task Execution

Define tasks as nodes in a directed acyclic graph. Edges represent dependencies.

### DAG Definition

```typescript
interface TaskNode {
  id: string;
  name: string;
  agent: Agent;
  inputs: string[];        // Task IDs that must complete first
  timeout?: number;
  retryLimit?: number;
  skipOnError?: boolean;   // Skip this task if dependency fails
}

interface DAGConfig {
  nodes: TaskNode[];
  exitNodes: string[];     // Tasks whose outputs are final results
}

class DAG {
  private nodes: Map<string, TaskNode> = new Map();
  private results: Map<string, unknown> = new Map();
  
  addNode(node: TaskNode) {
    this.nodes.set(node.id, node);
  }
  
  async execute(input: Record<string, unknown>) {
    // Topological sort to find execution order
    const order = this.topologicalSort();
    
    for (const nodeId of order) {
      const node = this.nodes.get(nodeId)!;
      
      // Check if all dependencies are ready
      const deps = node.inputs.map(id => this.results.get(id));
      if (deps.some(d => d === undefined)) {
        throw new Error(`Dependency missing for task ${nodeId}`);
      }
      
      // Execute task with retry
      let result;
      for (let attempt = 0; attempt <= (node.retryLimit || 0); attempt++) {
        try {
          result = await node.agent.execute(...deps);
          this.results.set(nodeId, result);
          break;
        } catch (err) {
          if (attempt === (node.retryLimit || 0)) {
            if (node.skipOnError) {
              console.warn(`Task ${nodeId} skipped after ${attempt + 1} failures`);
              this.results.set(nodeId, null);
            } else {
              throw new Error(`Task ${nodeId} failed: ${err.message}`);
            }
          }
        }
      }
    }
    
    // Return results from exit nodes
    return this.exitNodes.map(id => this.results.get(id));
  }
  
  private topologicalSort(): string[] {
    // DFS-based topological sort
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
}
```

### Parallel Execution at Convergence Points

When multiple tasks have no dependencies on each other, execute in parallel:

```typescript
class ParallelDAG extends DAG {
  async execute(input: Record<string, unknown>) {
    const order = this.topologicalSort();
    const levels = this.partitionIntoLevels(order);
    
    // Execute level by level
    for (const level of levels) {
      // All tasks in this level can run in parallel
      const promises = level.map(nodeId => 
        this.executeTask(nodeId)
      );
      
      const results = await Promise.allSettled(promises);
      
      // Check for failures
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "rejected") {
          const nodeId = level[i];
          const node = this.nodes.get(nodeId)!;
          
          if (!node.skipOnError) {
            throw results[i].reason;
          }
        }
      }
    }
    
    return this.exitNodes.map(id => this.results.get(id));
  }
  
  private partitionIntoLevels(order: string[]): string[][] {
    // Group tasks that can execute in parallel
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
}
```

---

## 3. Task Distribution

### Capability-Based Routing

Match task requirements to agent specializations:

```typescript
interface AgentCapability {
  name: string;
  model: string;
  specialties: string[];  // e.g., ["code_generation", "testing", "debugging"]
  maxConcurrency: number;
  costPerTask?: number;
}

class CapabilityRouter {
  private agents: Map<string, AgentCapability> = new Map();
  
  async selectAgent(task: Task): Promise<AgentCapability> {
    const required = this.extractRequirements(task);
    
    // Find agents that match ALL required capabilities
    const candidates = Array.from(this.agents.values()).filter(agent =>
      required.every(req => agent.specialties.includes(req))
    );
    
    if (candidates.length === 0) {
      throw new Error(`No agent available for task: ${task.name}`);
    }
    
    // Prefer agent with least current load
    return candidates.reduce((best, candidate) => {
      const bestLoad = best.maxConcurrency || Infinity;
      const candidateLoad = candidate.maxConcurrency || Infinity;
      return candidateLoad < bestLoad ? candidate : best;
    });
  }
  
  private extractRequirements(task: Task): string[] {
    // Parse task name/type to infer required capabilities
    // e.g., "generate-unit-tests" -> ["testing", "code_generation"]
    const typeMap: Record<string, string[]> = {
      "generate-code": ["code_generation"],
      "test": ["testing"],
      "debug": ["debugging"],
      "review": ["code_review"],
    };
    
    for (const [type, caps] of Object.entries(typeMap)) {
      if (task.name.includes(type)) return caps;
    }
    
    return [];
  }
}
```

### Load-Aware Dispatch

Track active tasks per agent and distribute fairly:

```typescript
class LoadAwareDispatcher {
  private agentLoads: Map<string, number> = new Map();
  private maxLoad: number = 5; // Max concurrent tasks per agent
  
  async dispatch(task: Task, agent: AgentCapability): Promise<void> {
    // Check current load
    const currentLoad = this.agentLoads.get(agent.name) || 0;
    
    if (currentLoad >= this.maxLoad) {
      // Wait for a task to complete, then retry
      await this.waitForSlot(agent.name);
      return this.dispatch(task, agent);
    }
    
    // Increment load
    this.agentLoads.set(agent.name, currentLoad + 1);
    
    try {
      await agent.executeTask(task);
    } finally {
      // Decrement load when done
      const load = this.agentLoads.get(agent.name) || 0;
      this.agentLoads.set(agent.name, Math.max(0, load - 1));
    }
  }
  
  private async waitForSlot(agentName: string): Promise<void> {
    // In production, use an event queue or pub/sub
    while ((this.agentLoads.get(agentName) || 0) >= this.maxLoad) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
```

---

## 4. State Sharing Across Agent Boundaries

### Shared Context Object

Pass a mutable context through the DAG. Each agent can read and update it:

```typescript
interface SharedContext {
  requestId: string;
  userId: string;
  startTime: number;
  data: Record<string, unknown>;
  breadcrumbs: string[];
  errors: Array<{ timestamp: number; message: string }>;
}

class ContextualAgent {
  async executeWithContext(task: Task, context: SharedContext) {
    // Read from context
    const { userId, data } = context;
    
    // Add breadcrumb
    context.breadcrumbs.push(`${this.name}:start`);
    
    try {
      // Execute task
      const result = await this.execute(task, data);
      
      // Update context with results
      context.data[`${this.name}_output`] = result;
      
      context.breadcrumbs.push(`${this.name}:success`);
      return result;
    } catch (err) {
      // Log error in context
      context.errors.push({
        timestamp: Date.now(),
        message: `${this.name}: ${err.message}`,
      });
      
      context.breadcrumbs.push(`${this.name}:error`);
      throw err;
    }
  }
}

// Usage in DAG
class ContextualDAG {
  async execute(input: Record<string, unknown>) {
    const context: SharedContext = {
      requestId: crypto.randomUUID(),
      userId: input.userId as string,
      startTime: Date.now(),
      data: input,
      breadcrumbs: [],
      errors: [],
    };
    
    for (const nodeId of this.topologicalSort()) {
      const node = this.nodes.get(nodeId)!;
      await node.agent.executeWithContext(
        { name: nodeId, ...node },
        context
      );
    }
    
    return context;
  }
}
```

### Versioned Checkpoints

Save state at key points to enable resumption:

```typescript
interface Checkpoint {
  taskId: string;
  timestamp: number;
  state: Record<string, unknown>;
  results: Map<string, unknown>;
}

class CheckpointedDAG {
  private checkpoints: Checkpoint[] = [];
  
  async execute(input: Record<string, unknown>, resumeFrom?: string) {
    let results = new Map<string, unknown>();
    const order = this.topologicalSort();
    
    // If resuming, restore state from checkpoint
    if (resumeFrom) {
      const checkpoint = this.checkpoints.find(c => c.taskId === resumeFrom);
      if (checkpoint) {
        results = new Map(checkpoint.results);
        // Skip tasks already completed
      }
    }
    
    for (const nodeId of order) {
      // Skip if already completed (from checkpoint)
      if (results.has(nodeId)) continue;
      
      const node = this.nodes.get(nodeId)!;
      const result = await node.agent.execute();
      results.set(nodeId, result);
      
      // Save checkpoint after each task
      this.checkpoints.push({
        taskId: nodeId,
        timestamp: Date.now(),
        state: input,
        results: new Map(results),
      });
    }
    
    return results;
  }
  
  resume(checkpointId: string) {
    return this.execute({}, checkpointId);
  }
}
```

---

## 5. Failure Handling

### Retry Logic

Retry failed tasks with exponential backoff:

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

class RetryableTask {
  async executeWithRetry(
    fn: () => Promise<unknown>,
    config: RetryConfig = {
      maxRetries: 3,
      baseDelayMs: 100,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
    }
  ): Promise<unknown> {
    let lastError;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        
        if (attempt === config.maxRetries) {
          break; // No more retries
        }
        
        // Calculate backoff
        const delayMs = Math.min(
          config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelayMs
        );
        
        console.log(`Retry attempt ${attempt + 1} after ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw lastError;
  }
}
```

### Skip Non-Critical Nodes

Mark nodes as skippable if they fail:

```typescript
class SkippableDAG {
  async execute(input: Record<string, unknown>) {
    const order = this.topologicalSort();
    const results = new Map<string, unknown>();
    
    for (const nodeId of order) {
      const node = this.nodes.get(nodeId)!;
      
      try {
        const result = await node.agent.execute();
        results.set(nodeId, result);
      } catch (err) {
        if (node.skipOnError) {
          console.warn(`Skipping ${nodeId}: ${err.message}`);
          results.set(nodeId, { skipped: true });
        } else {
          throw err;
        }
      }
    }
    
    return results;
  }
}
```

### Escalation to Orchestrator

When a worker fails, escalate to orchestrator for decision-making:

```typescript
class EscalatingDAG {
  private orchestrator: Orchestrator;
  
  async executeWithEscalation(task: Task) {
    try {
      const worker = this.selectWorker(task);
      return await worker.execute(task);
    } catch (err) {
      console.error(`Worker failed: ${err.message}`);
      
      // Escalate to orchestrator
      const escalatedResult = await this.orchestrator.handleFailure(task, err);
      return escalatedResult;
    }
  }
}
```

---

## 6. Agent Boundaries

### Single Responsibility

Each agent has one clear job:

```typescript
// Bad: Agent tries to do everything
class UniversalAgent {
  async execute(task: Task) {
    if (task.type === "generate-code") {
      return this.generateCode(task);
    } else if (task.type === "test") {
      return this.runTests(task);
    } else if (task.type === "review") {
      return this.reviewCode(task);
    }
    // ...
  }
}

// Good: Each agent has one job
class CodeGenerationAgent {
  async execute(task: GenerateCodeTask) {
    return this.generateCode(task);
  }
}

class TestingAgent {
  async execute(task: TestTask) {
    return this.runTests(task);
  }
}
```

### Explicit Input/Output Contracts

Define what each agent expects and returns:

```typescript
interface AgentContract {
  name: string;
  inputSchema: JSONSchema;   // What inputs are expected
  outputSchema: JSONSchema;  // What outputs are guaranteed
  errors: string[];          // Possible error types
}

class ContractEnforcingAgent {
  private contract: AgentContract;
  
  async execute(input: unknown): Promise<unknown> {
    // Validate input against contract
    if (!this.validateInput(input)) {
      throw new Error(
        `Invalid input for ${this.contract.name}: ${JSON.stringify(input)}`
      );
    }
    
    const output = await this.doWork(input);
    
    // Validate output against contract
    if (!this.validateOutput(output)) {
      throw new Error(
        `Invalid output from ${this.contract.name}: ${JSON.stringify(output)}`
      );
    }
    
    return output;
  }
}
```

### No Shared Mutable State

Agents share data only via explicit context passing:

```typescript
// Bad: Shared mutable object
const sharedState = { counter: 0 };

class CounterAgent {
  async execute() {
    sharedState.counter++;  // Hidden side effect
    return sharedState.counter;
  }
}

// Good: Explicit input/output
interface CounterContext {
  counter: number;
}

class CounterAgent {
  async execute(context: CounterContext): Promise<CounterContext> {
    return { counter: context.counter + 1 };
  }
}
```

---

## 7. Spawn vs Inline Decision Logic

### Decision Matrix

| Metric | Spawn Agent | Inline |
|--------|-------------|--------|
| **Execution time** | >30 seconds | <30 seconds |
| **Independence** | Isolated task | Dependent on caller context |
| **Parallelism** | Need concurrent execution | Sequential is fine |
| **Context size** | Different context | Share caller context |
| **Failure isolation** | Fail independently | Caller handles failure |

### Implementation

```typescript
class SpawnDecider {
  shouldSpawn(task: Task, context: ExecutionContext): boolean {
    // Estimate execution time
    const estimatedTime = this.estimateTime(task);
    if (estimatedTime > 30000) return true; // Spawn for long tasks
    
    // Check for parallelism opportunity
    const otherTasks = context.pendingTasks;
    if (otherTasks.length > 0) return true; // Spawn to run in parallel
    
    // Check if task needs different context
    if (task.requiredContext !== context.type) return true;
    
    // Otherwise inline
    return false;
  }
  
  async execute(task: Task, context: ExecutionContext) {
    if (this.shouldSpawn(task, context)) {
      return await this.spawnAgent(task);
    } else {
      return await this.executeInline(task, context);
    }
  }
  
  private async spawnAgent(task: Task) {
    // Create isolated execution environment
    return new Promise((resolve, reject) => {
      const worker = new Agent();
      worker.on("complete", resolve);
      worker.on("error", reject);
      worker.execute(task);
    });
  }
  
  private async executeInline(task: Task, context: ExecutionContext) {
    // Run in current context
    return await task.handler(context);
  }
}
```

---

## 8. Anti-Patterns to Avoid

### Over-Orchestration

**Problem**: Spawning agents for trivial tasks adds latency without benefit.

**Solution**: Inline tasks <10s, spawn only when parallelism or isolation is needed.

```typescript
// Bad: Spawning for everything
await Promise.all([
  spawnAgent("add", { a: 1, b: 2 }),
  spawnAgent("multiply", { a: 1, b: 2 }),
]);

// Good: Inline trivial tasks, spawn only when needed
const sum = 1 + 2;
const product = 1 * 2;

if (complexAnalysis.length > 1000) {
  // Spawn agents for parallel processing
  const results = await Promise.all(
    complexAnalysis.map(item => spawnAgent("analyze", item))
  );
}
```

### Circular Dependencies

**Problem**: Task A depends on Task B, Task B depends on Task A. DAG becomes invalid.

**Solution**: Redesign to break cycles.

```typescript
// Bad: Circular dependency
tasks = {
  "build": { deps: ["test"] },
  "test": { deps: ["build"] },
};

// Good: Separate concerns, test first
tasks = {
  "lint": { deps: [] },
  "test": { deps: ["lint"] },
  "build": { deps: ["test"] },
};
```

### Unbounded Fan-Out

**Problem**: Spawning one agent per input item without limiting concurrency.

**Solution**: Cap concurrency with a worker pool.

```typescript
// Bad: Unbounded concurrency
const results = await Promise.all(
  items.map(item => spawnAgent("process", item))
);

// Good: Limit concurrency
const maxConcurrency = 5;
const results = [];
for (let i = 0; i < items.length; i += maxConcurrency) {
  const batch = items.slice(i, i + maxConcurrency);
  const batchResults = await Promise.all(
    batch.map(item => spawnAgent("process", item))
  );
  results.push(...batchResults);
}
```

---

## Debugging Checklist

When multi-agent execution fails:

- [ ] Are all task dependencies declared? Check DAG for missing edges
- [ ] Are agents receiving correct inputs? Validate context passing
- [ ] Are state updates visible to dependent tasks? Check shared context
- [ ] Are retry limits being exceeded? Increase or fix root cause
- [ ] Are agents timing out? Increase timeout or split task
- [ ] Is load balanced fairly? Check concurrency limits
- [ ] Are agents logging breadcrumbs? Enable context.breadcrumbs
- [ ] Is the DAG acyclic? Run cycle detection algorithm

---

## Rules

1. **One agent, one job** — avoid multi-purpose agents
2. **Explicit contracts** — define input/output schemas, error types
3. **Shared context only** — no shared mutable state between agents
4. **Versioned checkpoints** — enable resumption from failures
5. **Exponential backoff** — retry transient failures, don't hammer
6. **Escalate non-recoverable errors** — orchestrator decides next step
7. **Spawn only when it matters** — parallelism, isolation, or long-running tasks
8. **Detect cycles** — run topological sort at DAG initialization
9. **Cap concurrency** — prevent resource exhaustion from unbounded fan-out
10. **Log context transitions** — breadcrumbs enable debugging at scale

