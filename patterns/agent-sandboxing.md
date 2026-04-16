# Agent Sandboxing

Coding agents execute real commands. Production coding agents will, at some point, try to do something destructive — intentional prompt injection, hallucinated `rm`, overly aggressive refactor, data-exfil via curl. Sandbox the blast radius before it matters, not after.

> _Pattern informed by Fabio Akita's ai-jail work ([akitaonrails.com](https://akitaonrails.com)), which evolved from a 170-line bubblewrap shell script into a Rust binary with per-project config and cross-platform sandbox primitives._

## When to sandbox

Not every agent run needs a sandbox. Use this heuristic:

- **Sandbox required**: the agent can execute shell, write files outside the repo, open network connections, or touch any path shared with other projects.
- **Sandbox nice-to-have**: the agent only reads the repo and emits text (review comments, summaries).
- **Skip**: pure Q&A with no tool access.

The cost of sandboxing is startup latency + configuration. The cost of not sandboxing is one bad prompt away from production impact. Default to "on" for any autonomy-enabled session.

## What a sandbox must enforce

1. **Filesystem scoping** — explicit allow-list of paths the agent can read/write. Everything outside is either invisible (no bind mount) or read-only. No `$HOME` by default.
2. **Network egress control** — deny all outbound by default, allow-list the registries + APIs the agent actually needs.
3. **Process isolation** — no access to host `/proc`, `/dev` beyond necessary devices, no host PID namespace.
4. **Ephemeral working state** — tmpfs for `/tmp` so crashes/escapes don't leave traces.
5. **Credential firewall** — `.env`, SSH keys, cloud credential files **never** mounted. If the agent needs a secret, pass it explicitly via env var after a human decision.

## Primitives to build on

- **Linux**: `bubblewrap` (unprivileged user namespaces; what Docker, Flatpak, and Akita's ai-jail all use under the hood). Faster than Docker for per-invocation sandboxes; no daemon.
- **macOS**: `sandbox-exec` (deprecated but still functional) or the newer Seatbelt API via Swift/Rust bindings. Akita's ai-jail wraps macOS native sandbox.
- **Docker/Podman**: viable but heavyweight for per-command runs; better when the agent is a long-lived service.
- **Cloud**: Firecracker microVMs, gVisor — overkill for dev-time, correct for multi-tenant agent hosting.

## Declarative per-project config

Hardcoded arrays in shell scripts don't scale. Keep sandbox policy in a checked-in file:

```toml
# .agent-sandbox.toml (conceptual)
[allow.fs]
  read_write = [".", "${HOME}/.cache/uv"]
  read_only  = ["/usr/lib", "/etc/ssl/certs"]

[allow.network]
  hosts = ["api.github.com", "registry.npmjs.org", "pypi.org"]

[deny]
  explicit = ["${HOME}/.ssh", "${HOME}/.aws", "${HOME}/.env*"]
```

Review this file as part of any PR that touches agent autonomy. It's the single artifact reviewers can audit to know the agent's worst-case reach.

## Escape-vector checklist

Before you trust a sandbox, verify it blocks:

- [ ] `cat /proc/self/mountinfo` does not list host `$HOME`.
- [ ] `curl https://example.com` fails when network is denied.
- [ ] Writing to `/usr/local/bin/malicious` returns `EACCES` or `EROFS`.
- [ ] `ls ~/.ssh` returns "No such file or directory", not the host's keys.
- [ ] A fork bomb inside the sandbox doesn't affect host processes.
- [ ] The sandbox exits cleanly when the agent returns (no leftover processes, no `/tmp` residue).

If any check fails, the sandbox is theater.

## Integration with agent autonomy levels

Map sandbox strictness to autonomy level:

| Autonomy level | Sandbox profile | Example |
|---|---|---|
| **Read-only** | No write mounts; network denied | Code review, audit, analysis |
| **Repo-scoped** | Write = repo only; network = package registries | Standard dev session |
| **Multi-repo** | Write = multiple repos; network = registries + GitHub | Cross-repo refactor |
| **Production-adjacent** | Same as multi-repo + audit logging of every command | Deploy prep, migration drafting |
| **No sandbox** | Never for a coding agent | — |

See [`patterns/permission-boundaries.md`](./permission-boundaries.md) for the broader permission model.

## What to test

Treat the sandbox itself as production code:

- **Unit-test escape vectors** — one test per item in the escape-vector checklist above. Akita's ai-jail ships with 124 such tests.
- **Test across platforms** — Linux bubblewrap and macOS sandbox have different failure modes. Run the checklist on both.
- **Test the "works for real tasks" dimension** — a sandbox that blocks everything is useless; confirm a typical dev task (install deps, run tests, commit) succeeds inside it.

## Distribution matters

An agent sandbox is only adopted if teammates can install it in minutes. A Rust binary (~1 MB) installable via `brew` / `cargo` / `go install` beats a bash script that only works on the author's machine. If you're authoring one, optimize for:

- Single-binary install
- `<5` dependencies
- Startup < 100 ms
- Clear error messages when a sandbox rule blocks something legitimate

## Anti-patterns

- **Trusting the model to self-restrict** — "I told the prompt not to access `/etc`" is not a security control.
- **Running the agent as root** — even in a sandbox. Always run as a non-root user inside the sandbox; defense in depth.
- **Copy-pasting the same sandbox into every repo** — drift is guaranteed. Use a central config (`.agent-sandbox.toml`) or an external tool (ai-jail, firejail, bwrap wrapper script) referenced by every repo.
- **Disabling the sandbox when it's in the way** — the friction usually reveals a missing allow-list entry. Fix the rule, don't disable.

## Related

- [`patterns/permission-boundaries.md`](./permission-boundaries.md) — what the agent is allowed to do at all
- [`best-practices/security.md`](../best-practices/security.md) — secrets hygiene outside the sandbox
- [`best-practices/ai-skill-stewardship.md`](../best-practices/ai-skill-stewardship.md) — human oversight layer above the sandbox
- [`patterns/prompting-discipline.md`](./prompting-discipline.md) — explicit constraints in prompts complement (but do not replace) the sandbox
