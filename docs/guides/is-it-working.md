---
status: active
audience: all
reading_time: 7 min
---

# Is it working?

Adopting AI tools has a peculiar failure mode: **you feel faster without being faster**. The feedback loop is warm and instant — a screen full of generated code looks like progress — but when you measure across a week or a sprint, nothing ships sooner.

This guide is a pragmatic check: a short list of questions to ask yourself honestly, and a handful of measurements that will tell you the truth.

Run this check after your **first week**, then again after your **first month**. Don't skip the first one — the effects are strongest early, in both directions.

---

## The five honest questions

Answer each with **yes / no / unsure**. Don't overthink. First gut answer.

1. **Am I shipping more finished work per week than before?**
   (Measured in PRs merged, tickets closed, docs written — whichever maps to your job.)
2. **Has the proportion of my time spent *thinking* vs. *typing* shifted toward thinking?**
   (If the answer is "I type even more now, because I'm iterating with the agent," that's not a win.)
3. **Am I producing work I understand well enough to debug later?**
   (If a bug in code the agent wrote would be harder for you to fix than the same bug in your own code, you've offloaded too much.)
4. **Am I catching the agent's mistakes before they land?**
   (Hallucinated APIs, invented function signatures, confident-but-wrong test coverage. If these slip through, your review loop is too loose.)
5. **Do I still enjoy the parts of the job I used to enjoy?**
   (This one matters more than people admit. Sustained productivity runs on enjoyment.)

**If you answered yes to 4 or 5**: the tool is earning its keep. Keep going, expand carefully.

**If you answered yes to 2 or 3**: mixed. Slow down, narrow the surface, re-measure next week.

**If you answered yes to 0 or 1**: stop adding tools. Either your workflow isn't a fit, or the specific tools aren't a fit. Trying more won't help — less might.

---

## Cheap measurements that reveal the truth

You don't need a dashboard. These take minutes.

### Measurement 1 — ship-rate delta

Count the PRs you merged (or tickets closed, or decks written) in the **two weeks before** you started using AI tools. Count the same thing for the **two weeks after**. Compare.

- **Stay skeptical of single-week spikes.** New-tool enthusiasm inflates the first week.
- **Look for the second-week number.** If week 2 dips below your old baseline, the week-1 spike was sugar.

### Measurement 2 — rework rate

How much of what you shipped last week **came back** — reopened tickets, bug reports, hotfixes on your own PRs?

- Rework going **down** → the tool is helping you ship quality.
- Rework **unchanged** → neutral. You're faster but not better.
- Rework going **up** → the tool is helping you ship *more bugs faster*. Pause.

### Measurement 3 — unaided fluency

Once a week, for one task, **turn the AI off**. Just you, the editor, and the docs. Time yourself honestly.

- If unaided-you is ~as fast as aided-you, great — the skill is real.
- If unaided-you is dramatically slower and more painful, the tool has become a crutch. That's a risk, not a win. Schedule more unaided sessions.

### Measurement 4 — agreement fatigue

Keep a tiny note (literally a text file) every time the agent proposes something and you think "eh, close enough" and accept it without pushing back.

- One or two a day: fine.
- Five or more a day: your review loop has collapsed. The agent is shipping your work unchallenged.

---

## Common traps

- **Throughput ≠ progress.** Writing 3000 lines of test code per day isn't progress if the tests don't catch regressions. Count *what the tests catch*, not how many exist.
- **"I feel faster" is not a measurement.** It's a feeling. Feelings about speed are miscalibrated in both directions. Measure something you can count.
- **Novelty bias.** The first week with a new tool always feels amazing. Re-score after week 3 when the novelty has worn off.
- **Sunk-cost escalation.** You spent a weekend configuring skills, hooks, and MCP servers. You will be tempted to justify that investment by reporting improvements. Ask a trusted colleague to audit your honest answers.
- **Unstructured tool addition.** Every tool you add widens the review surface. If you add three things in one week, you can't tell which helped.

---

## What "working" actually looks like

After a clean month, a working AI-assisted setup tends to look like this:

- You ship **roughly the same number of things**, but the things are **larger** or **harder** than before.
- Your rework rate is **flat or down**.
- You can still **work without the tool** at baseline speed.
- You **stopped adding tools** at some point and settled into a small steady kit.
- You're using the time you saved on **things that weren't on the list before** — bigger cleanups, deeper research, second-opinion reviews for teammates.

If one or two of those aren't true yet, that's normal — it takes 4–8 weeks to stabilize. If none of them are true after two months, something is misconfigured — not the tools, the *fit*. That's a valid outcome. Reset.

---

## If you decide it's not working

Not a failure. A finding. Options:

1. **Narrow.** Drop everything except *one* piece that you can name a concrete win from. Use that for a month. Re-expand carefully.
2. **Swap the surface.** If you've been in a terminal CLI, try an editor extension. If you've been in an editor, try web chat. Different surfaces fit different brains.
3. **Change the task shape.** If you adopted AI for code writing and it's not helping, try it for code *reading* (explaining unfamiliar code, scanning logs). Or for writing that isn't code (docs, emails, PR descriptions).
4. **Step away for a month.** The tools will still be here. Come back with a concrete problem, not a goal of "use AI more."

The honest check matters more than the optimistic one. Schedule it.
