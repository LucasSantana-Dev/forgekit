---
name: tdd
description: Test-driven development — write tests first, implement second, refactor third
triggers:
  - tdd
  - test first
  - write tests
  - test driven
  - red green refactor
---

# TDD

Write the test before the implementation. Always.

## Cycle

```text
RED    → Write a failing test that captures expected behavior
GREEN  → Write the minimum code to make it pass
REFACTOR → Clean up while tests stay green
```

## Steps

1. Understand the requirement
2. Write one failing test for the happy path
3. Run it — confirm it fails for the right reason
4. Write minimum implementation to pass
5. Run it — confirm green
6. Refactor if needed (tests must stay green)
7. Add edge case tests after happy path works

## Rules

- Never write implementation before the test exists
- Test behavior, not implementation details
- One assertion focus per test
- If you cannot write a test, clarify the requirement first
- Mock external dependencies; do not mock internal logic
- Coverage is a signal, not a target — test business value
