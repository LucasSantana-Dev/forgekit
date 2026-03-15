import type { Task } from "./backlog.js"

export interface ValidationIssue {
  field: string
  question: string
}

export function validateTask(task: Partial<Task>): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!task.title || task.title.length < 10) {
    issues.push({
      field: "title",
      question:
        "What specifically needs to be done? The title should describe the deliverable, not just the area.",
    })
  }

  if (!task.description || task.description.length < 50) {
    issues.push({
      field: "description",
      question:
        "What is the expected behavior after this task is done? Include: what changes, where, and how to verify it works.",
    })
  }

  const desc = (task.description || "").toLowerCase()

  // Vague descriptions
  const vaguePatterns = [
    { pattern: /\bfix\b.*\bbug\b/i, without: /\b(when|if|because|error|crash|fails?)\b/i },
    { pattern: /\bimprove\b/i, without: /\b(by|from|to|currently|should)\b/i },
    { pattern: /\brefactor\b/i, without: /\b(extract|split|merge|move|rename|into|from)\b/i },
    { pattern: /\bupdate\b/i, without: /\b(from|to|version|because|add|remove)\b/i },
    { pattern: /\bclean\s?up\b/i, without: /\b(remove|delete|extract|replace)\b/i },
  ]

  for (const { pattern, without } of vaguePatterns) {
    if (pattern.test(desc) && !without.test(desc)) {
      issues.push({
        field: "description",
        question: `"${task.title}" is vague. What is the current behavior vs expected behavior? What concrete change should be made?`,
      })
      break
    }
  }

  // Missing scope for implementation tasks
  const isImplementation =
    /\b(add|create|build|implement|write)\b/i.test(desc)
  if (isImplementation && !task.scope?.files?.length && !task.scope?.directories?.length) {
    issues.push({
      field: "scope.files",
      question:
        "Which files or directories should be modified? Defining file scope prevents the agent from touching unrelated code.",
    })
  }

  // Missing acceptance criteria
  if (!task.scope?.acceptanceCriteria?.length) {
    issues.push({
      field: "scope.acceptanceCriteria",
      question:
        "How do you verify this task is done? List 1-3 concrete acceptance criteria (e.g., 'API returns 429 after 100 requests', 'existing tests pass').",
    })
  }

  // Overly broad scope
  if (task.scope?.directories?.length && task.scope.directories.some((d) => d === "." || d === "src" || d === "/")) {
    issues.push({
      field: "scope.directories",
      question:
        'The scope includes the entire project. Which specific subdirectory does this task affect? (e.g., "src/api/routes" not "src")',
    })
  }

  return issues
}

export function formatValidationQuestions(
  task: Partial<Task>,
  issues: ValidationIssue[],
): string {
  if (issues.length === 0) return ""

  const lines = [
    `### Clarification needed for: "${task.title || "Untitled task"}"`,
    "",
    "Before adding this to the backlog, please clarify:",
    "",
  ]

  for (let i = 0; i < issues.length; i++) {
    lines.push(`${i + 1}. ${issues[i].question}`)
  }

  return lines.join("\n")
}
