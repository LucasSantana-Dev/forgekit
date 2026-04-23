# Prompting Discipline

How you ask the model matters more than which model you ask. Two disciplines stop most AI coding failures before they start.

> _This pattern distills public writing by Fabio Akita ([akitaonrails.com](https://akitaonrails.com)), who argues the real bottleneck is communication, not model quality._

## The Four-Block Prompt

Every non-trivial request to a coding agent should carry four explicit blocks:

| Block | Question it answers |
|---|---|
| **Goal** | What outcome do I want? |
| **Method** | Roughly how should the agent approach it? |
| **Constraints** | What must it NOT do? |
| **Validation** | How do we know it worked? |

A prompt missing any of these produces output proportional to the vagueness. "Fix this bug" gets a fix-shaped blob; "Fix this auth bug by extending the existing guard in `auth/session.ts`, do not add a new middleware, and verify by running `npm test -- auth/`" gets a landable patch.

### Template

```
Goal: <one sentence>

Method: <1-3 sentences describing the approach — which file, which pattern, which layer>

Constraints:
- do NOT <banned approach 1>
- do NOT <banned approach 2>
- keep <existing contract>

Validation:
- run <command>
- check <observable>
```

### When to relax

One-liners ("rename this var", "add a console.log") don't need the full structure. The four-block discipline kicks in when the request could be misunderstood or could cause rework.

### Why it works

- **Goal** prevents the agent from optimizing for a different objective than yours.
- **Method** anchors the agent in your codebase's idioms rather than its training-data average.
- **Constraints** are the single highest-leverage block — they forbid the common wrong paths the model would otherwise drift toward.
- **Validation** turns "done" into a checkable claim, not a vibe.

## Pair Programming, Not Fire-and-Forget

Long autonomous runs without check-ins produce off-target output at industrial speed. Treat agent sessions like real pair programming:

- **Stay in the chair.** Submitting a large task and walking away wastes the cheap thing (tokens) to save the expensive thing (your attention) — but you pay in rework.
- **Interrupt on slop.** If the agent's status updates stop matching the work, interrupt. Don't let it debug itself into a worse state.
- **Re-estimate mid-flight.** Ask "how far along are you, and what's left?" when you sense drift. The answer diagnoses whether the plan is still valid.
- **Demand in-flight validation.** "Before you write the next function, show me the test that will fail and the assertion that will pass." This forces the agent to commit to a verifiable step, not a speculative one.

### Indicators that you should interrupt

- The agent has been running >5 minutes on a task it originally sized at 1.
- Diff size has crossed a threshold you didn't approve (e.g. files outside the scope you described).
- Error messages the agent is "working around" start repeating.
- You catch yourself hoping it will figure it out. That's the tell.

## Anti-patterns

- **Vague goal, no constraints** — "improve performance here" without a measurable target or forbidden changes. Expect a rewrite you didn't ask for.
- **Implicit constraints** — assuming the agent knows your codebase conventions because you do. If it isn't in the prompt or the rule file, it's not a constraint.
- **No validation clause** — letting the agent self-declare completion. Always attach a concrete check the human (or CI) can run.
- **"Trust me, just do it" delegation** — accepting large changes without skimming the diff. AI-scale slop compounds if unmonitored.

## Related

- [`code-review.md`](./code-review.md) — what to catch when reading an AI-generated diff
- [`task-orchestration.md`](./task-orchestration.md) — splitting bigger jobs into ranges where four-block prompts still fit
- [`kit/core/skills/plan.md`](../kit/core/skills/plan.md) — planning skill that enforces explicit phases + verification steps
- [`best-practices/ai-skill-stewardship.md`](../best-practices/ai-skill-stewardship.md) — keeping the human half of the pair sharp
