# Contributing a Skill

A **Skill** is an actionable procedure that installs into `~/.claude/skills/<id>/`. Skills ship procedure — if you only want to share reading material, see [`ADD_A_DOC.md`](ADD_A_DOC.md) instead.

## 1. Create the directory

```bash
mkdir catalog/skills/my-skill-id
cd catalog/skills/my-skill-id
```

`id` rules: lowercase, hyphen-separated, 2–64 chars.

## 2. Write `SKILL.md`

Use the Claude skill format — YAML frontmatter + markdown body:

```markdown
---
name: my-skill-id
description: One sentence that names the actual trigger (not just the topic) so the skill doesn't fire on unrelated requests.
---

# My Skill

Body content. Focus on when to use, concrete steps, and common failure modes.
```

**Tight descriptions trigger correctly.** A skill named `git-worktrees` with description "Use worktrees when you need parallel branches" is better than "Tips for git." See the `skill-md-adoption` skill in the catalog.

## 3. Write `manifest.json`

```json
{
  "id": "my-skill-id",
  "name": "My Skill",
  "description": "One-line summary used on the site and in `forge-kit list`.",
  "version": "0.1.0",
  "tags": ["workflow", "skill-md"],
  "editors": ["claude-code", "codex"],
  "source": { "type": "local", "path": "where-it-came-from" },
  "license": "MIT",
  "author": "Your Name"
}
```

Required fields: `id`, `name`, `description`, `version`, `tags`. Schema: [`schemas/skill.schema.json`](../schemas/skill.schema.json).

## 4. Validate

```bash
pnpm run validate
pnpm run index    # regenerates catalog/index.json
```

Both must pass. CI enforces both on every PR.

## 5. Commit + PR

```
feat(catalog): add <my-skill-id> skill
```

One skill per PR keeps reviews tight. Include in the PR description:
- The source (if it's a derivative)
- Which editors you've tested it on
- Anything non-obvious about when the skill should trigger

## Tips

- **Don't embed secrets.** The importer's secrets scan runs in CI. Anything caught blocks the merge.
- **Prefer prose over lists** in the first paragraph — that's what the site and `forge-kit list` use as the description.
- **Keep `SKILL.md` scannable**, not exhaustive. Link to deeper docs under `catalog/docs/` if needed.
