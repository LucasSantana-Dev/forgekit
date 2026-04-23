# Tool Registry Patterns

> Separate what tools exist from how to invoke them. Register once, filter anywhere.

## The Problem

As tool counts grow, you hit three problems:

1. **Coupling**: Tool lists are hard-coded in prompts or configs. Adding a tool means touching multiple files.
2. **Testing**: You can't test routing logic without invoking real tools.
3. **Trust boundaries**: You want different tool sets in different contexts (read-only audit mode vs. full execution mode) without duplicating code.

## The Pattern

Maintain a **tool registry** — a central map of name → metadata. Load it once at startup. Filter it per context. Pass only the allowed subset to the model.

### Tool Entry Schema

```json
{
  "name": "write_file",
  "description": "Write content to a file on disk",
  "category": "filesystem",
  "source": "mcp:filesystem",
  "destructive": true,
  "requires_confirmation": false
}
```

The registry stores metadata, not implementations. Implementations live elsewhere and are looked up by name at execution time.

### Registry Snapshot (JSON)

Capture the registry to a file. This snapshot becomes a stable reference surface for testing, auditing, and documentation generation.

```json
{
  "version": "1.0.0",
  "captured_at": "2026-03-31T10:00:00Z",
  "tools": [
    { "name": "read_file", "category": "filesystem", "destructive": false },
    { "name": "write_file", "category": "filesystem", "destructive": true },
    { "name": "run_bash", "category": "shell", "destructive": true },
    { "name": "search_web", "category": "external", "destructive": false }
  ]
}
```

Commit this snapshot. Diffs make tool additions/removals visible in PRs.

### Loading and Filtering

```python
class ToolRegistry:
    def __init__(self, snapshot_path: str):
        with open(snapshot_path) as f:
            data = json.load(f)
        self._tools = {t["name"]: t for t in data["tools"]}

    def get(self, name: str) -> dict | None:
        return self._tools.get(name.lower())

    def filter(self, *, exclude_destructive=False, categories=None) -> list[dict]:
        tools = list(self._tools.values())
        if exclude_destructive:
            tools = [t for t in tools if not t.get("destructive")]
        if categories:
            tools = [t for t in tools if t.get("category") in categories]
        return tools
```

### Permission Context

Layer permissions on top of the registry without modifying it.

```python
@dataclass
class PermissionContext:
    deny_names: set[str] = field(default_factory=set)
    deny_prefixes: set[str] = field(default_factory=set)

    def blocks(self, tool_name: str) -> bool:
        name = tool_name.lower()
        if name in self.deny_names:
            return True
        return any(name.startswith(p) for p in self.deny_prefixes)

# Read-only context: block all write/execute tools
READ_ONLY = PermissionContext(
    deny_names={"write_file", "run_bash", "delete_file"},
    deny_prefixes={"write_", "create_", "delete_", "execute_"}
)

# Filesystem-only context: allow only file reads
FILESYSTEM_READONLY = PermissionContext(
    deny_prefixes={"run_", "search_", "create_", "write_", "delete_", "execute_"}
)
```

### Trust-Gated Initialization

Load different tool subsets depending on the trust level of the session.

```python
def build_tool_list(registry, trust_level: str) -> list[dict]:
    match trust_level:
        case "untrusted":
            return registry.filter(exclude_destructive=True, categories=["filesystem"])
        case "standard":
            return registry.filter(exclude_destructive=True)
        case "elevated":
            return registry.filter()
        case _:
            raise ValueError(f"Unknown trust level: {trust_level}")
```

Pass only the filtered list to the model. The model cannot call tools it doesn't know about.

### Deferred Registration

Register tools lazily — only when the category is activated.

```python
class DeferredRegistry:
    def __init__(self):
        self._registered: dict[str, dict] = {}
        self._deferred: list[callable] = []

    def defer(self, loader: callable):
        self._deferred.append(loader)

    def activate(self):
        for loader in self._deferred:
            for tool in loader():
                self._registered[tool["name"]] = tool
        self._deferred.clear()
```

Use this for MCP servers that are slow to start — defer their registration until the first turn that needs them.

### Parity Checking

When adding or removing tools, verify the live tool set matches the snapshot.

```python
def check_parity(registry: ToolRegistry, live_tools: list[str]) -> dict:
    snapshot_names = set(registry._tools.keys())
    live_names = set(t.lower() for t in live_tools)
    return {
        "added": live_names - snapshot_names,    # in live, not in snapshot
        "removed": snapshot_names - live_names,  # in snapshot, not in live
    }
```

Flag divergences in CI. `added` tools need to be documented before merging. `removed` tools should be intentional.

## When to Use This Pattern

- Custom agent harnesses where tool lists change across environments
- Multi-tenant systems where different users get different tool access
- Testing: inject a read-only registry to test routing without side effects
- Audit workflows: generate tool manifests from snapshots, not live code
- Environments where MCP server availability varies (local vs. CI vs. prod)

## When Not to Use This Pattern

Standard Claude Code setups with a fixed `~/.claude/.mcp.json` don't need a registry layer. This pattern adds value when tool sets are dynamic, trust levels vary, or you're building tooling *about* tools (audit reports, coverage checks, documentation generation).
