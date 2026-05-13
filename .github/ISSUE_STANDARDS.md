# Issue card standards

## Title convention

```
<type>(<scope>): <short imperative description>
```

| `type`        | Use when                                          |
|---------------|---------------------------------------------------|
| `feat`        | New feature or catalog entry                      |
| `fix`         | Bug fix                                           |
| `chore`       | Maintenance, rename, cleanup — no behavior change |
| `docs`        | Documentation or `llms.txt` updates               |
| `refactor`    | Code restructure with no behavior change          |
| `ci`          | CI/CD pipeline changes                            |
| `test`        | Tests only                                        |

Common `scope` values: `web`, `catalog`, `cli`, `core`, `i18n`, `ci`, `release`

Examples:
- `fix(web): pt-BR tutorial pages returning 404`
- `feat(catalog): AWS Kiro collection`
- `chore(i18n): complete pt-BR locale rename`

## Required labels

Every issue must carry **one label from each group**:

| Group      | Labels                                                      |
|------------|-------------------------------------------------------------|
| Type       | `bug` · `enhancement` · `chore` · `documentation` · `refactor` · `security` |
| Priority   | `priority: critical` · `priority: high` · `priority: medium` · `priority: low` |
| Effort     | `effort: xs` · `effort: s` · `effort: m` · `effort: l` · `effort: xl` |

Area labels are optional but recommended:
`area: web` · `area: catalog` · `area: cli` · `area: core`

## Priority definitions

| Label              | Meaning                                      |
|--------------------|----------------------------------------------|
| `priority: critical` | Blocking release or production incident    |
| `priority: high`     | Must be in the next sprint                 |
| `priority: medium`   | Important, schedule within 2 sprints       |
| `priority: low`      | Nice to have, no deadline                  |

## Effort estimates

| Label       | Typical scope                     |
|-------------|-----------------------------------|
| `effort: xs` | < 1 hour — single-file tweak     |
| `effort: s`  | ~2–4 hours — focused task        |
| `effort: m`  | ~1 day — multiple files/tests    |
| `effort: l`  | 2–3 days — new feature           |
| `effort: xl` | 1 week+ — design + implementation|

## Project board fields

The [forgekit backlog board](https://github.com/users/LucasSantana-Dev/projects/3) has matching
`Priority` and `Effort` single-select fields. Set them when adding an issue to the board.

## Description template

```markdown
## Summary
One or two sentences. What is broken, missing, or being added?

## Context / Why
Why does this matter? Link to related issues or PRs if relevant.

## Acceptance Criteria
- [ ] specific, testable condition
- [ ] specific, testable condition

## Notes
Implementation hints, constraints, or leave blank.
```
