# Plan: AWS Kiro IDE Workflow Collection

## Goal

Create a new catalog collection `aws-kiro-ide-workflow.yaml` curating the best existing toolkit skills, agents, servers, and hooks for developers using **AWS Kiro IDE** in a corporate/work environment.

**Constraints:**
- Only curate existing catalog entries — no new skills to be created in this plan
- Prioritize tools that do NOT require homologation (internal security approval)
- Work-safe: no personal-account, creative-AI, or entertainment tools

## In-scope

- New file: `packages/catalog/catalog/collections/aws-kiro-ide-workflow.yaml`
- pt-BR translation block required (as per all collections)
- Run `pnpm catalog:validate` to confirm schema is clean

## Out-of-scope

- Creating new skills for Kiro-specific workflows
- Modifying existing manifests
- Changes to the web UI

## Replanning triggers

- Validation fails because a referenced skill/agent/server/hook ID does not exist → remove or correct the ID
- A skill has no manifest yet (ID found via directory listing but manifest is empty) → skip it

---

## Phase 1 — Write collection YAML

**File:** `packages/catalog/catalog/collections/aws-kiro-ide-workflow.yaml`

**Curated items (rationale in parentheses):**

### Skills
| ID | Rationale |
|----|-----------|
| `adt-context` | Feeds Kiro's context window with the right repo state |
| `adt-context-hygiene` | Keeps context lean; important in long Kiro sessions |
| `adt-rag` | RAG-powered recall — maps directly to Kiro's doc-aware completions |
| `adt-rag-context-pack` | Packs dense context for Kiro prompts |
| `adt-rag-recall` | Retrieves relevant prior knowledge in-session |
| `adt-plan` | Structured planning before Kiro generates code |
| `spec-driven-development` | Spec-first approach; reduces Kiro hallucinations |
| `adt-specs-spec-new` | Creates new spec files Kiro can use as grounding |
| `code-review` | Post-Kiro generation code review |
| `systematic-debugging` | Structured debug flow when Kiro output fails |
| `adt-tdd` | Drive Kiro to write test-first code |
| `verification-before-completion` | Gate before accepting Kiro suggestions |
| `eng-focused-fix` | Narrow targeted fix — prevents Kiro scope creep |
| `adt-mcp-doctor` | Diagnose MCP server health in Kiro |
| `adt-mcp-readiness` | Pre-flight check before attaching MCP servers to Kiro |
| `adt-smart-commands` | Best-fit command suggestions |
| `eng-codebase-onboarding` | Orient Kiro to an unfamiliar codebase |
| `eng-code-tour` | Walk Kiro through architecture before generating |
| `adt-verify` | Verify outputs before committing |
| `adt-research` | Research-backed answers for Kiro prompts |
| `adt-smart-model-route` | Route to the right model for each sub-task |
| `eng-focused-fix` | Precise surgical fixes (no runaway edits) |
| `prompting-discipline` | Disciplined prompting for Kiro's chat interface |
| `prompt-injection-defense` | Guard against prompt injection in Kiro suggestions |
| `adt-secure` | Security checks on Kiro-generated code |
| `eng-dependency-auditor` | Audit deps Kiro might introduce |
| `eng-env-secrets-manager` | Prevent Kiro from leaking secrets in generated code |

### Agents
| ID | Rationale |
|----|-----------|
| `code-reviewer` | Review Kiro-generated code |
| `adt-systematic-debugger` | Structured debug agent for Kiro failures |
| `adt-security-auditor` | Security audit agent for Kiro output |

### Servers
| ID | Rationale |
|----|-----------|
| `github` | Version control integration — AWS-workplace safe |
| `context7` | Docs lookup in Kiro sessions; no homologation |
| `linear` | Work ticket context piped into Kiro |

### Hooks
| ID | Rationale |
|----|-----------|
| `pre-commit-validation` | Block bad Kiro-generated code from reaching git |
| `block-destructive` | Prevent Kiro from running destructive commands |
| `secret-detection` | Catch secrets in Kiro-generated code before commit |

**Validation step:** `pnpm catalog:validate` — must exit 0

---

## Phase 2 — Validate

Run `pnpm catalog:validate`. If any item ID is unknown, remove it from the collection and re-run.

**Validation step:** green CI equivalent — no errors in stdout

---

## Phase 3 — Verify in catalog

Run `pnpm catalog:index` if needed. Confirm the new collection appears when listing collections.

**Validation step:** `grep -r "aws-kiro-ide-workflow" packages/catalog/` returns the file.
