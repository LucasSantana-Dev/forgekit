import type { Plugin, PluginInput } from "@opencode-ai/plugin"
import { mkdirSync, existsSync } from "fs"
import { join } from "path"
import { loadConfig, type AutopilotConfig } from "./config.js"
import {
  loadBacklog,
  saveBacklog,
  getNextTask,
  getActiveTasks,
  promoteNext,
  type Task,
} from "./backlog.js"
import {
  recordMetric,
  getDispatchedToday,
} from "./metrics.js"

const STATE_DIR = join(
  process.env.HOME || "~",
  ".local",
  "share",
  "opencode",
  "orchestrator",
)
const BACKLOG_FILE = join(STATE_DIR, "backlog.json")
const METRICS_FILE = join(STATE_DIR, "metrics.json")

async function dispatchTask(
  client: any,
  task: Task,
  config: AutopilotConfig,
): Promise<void> {
  // Guard: daily limit
  const today = getDispatchedToday(METRICS_FILE)
  if (today >= config.dailyTaskLimit) {
    recordMetric(METRICS_FILE, {
      type: "daily_limit_hit",
      taskID: task.id,
      taskTitle: task.title,
      directory: task.directory,
      priority: task.priority,
    })
    return
  }

  const backlog = loadBacklog(BACKLOG_FILE)
  const t = backlog.tasks.find((x) => x.id === task.id)
  if (!t || t.status !== "ready") return

  const session = await client.session.create({
    body: { title: task.title },
    query: { directory: task.directory },
  })

  if (!session.data) return
  const sessionID = (session.data as any).id

  t.status = "in_progress"
  t.sessionID = sessionID
  t.updatedAt = Date.now()
  saveBacklog(BACKLOG_FILE, backlog)

  recordMetric(METRICS_FILE, {
    type: "dispatched",
    taskID: t.id,
    taskTitle: t.title,
    directory: t.directory,
    priority: t.priority,
  })

  const scopeLines: string[] = []
  if (t.scope) {
    if (t.scope.files?.length) {
      scopeLines.push(
        "### Scope — Files",
        ...t.scope.files.map((f) => `- ${f}`),
        "",
      )
    }
    if (t.scope.directories?.length) {
      scopeLines.push(
        "### Scope — Directories",
        ...t.scope.directories.map((d) => `- ${d}`),
        "",
      )
    }
    if (t.scope.acceptanceCriteria?.length) {
      scopeLines.push(
        "### Acceptance Criteria",
        ...t.scope.acceptanceCriteria.map((c) => `- [ ] ${c}`),
        "",
      )
    }
    if (t.scope.outOfScope?.length) {
      scopeLines.push(
        "### Out of Scope (DO NOT touch)",
        ...t.scope.outOfScope.map((o) => `- ${o}`),
        "",
      )
    }
  }

  const prompt = [
    `## Task: ${t.title}`,
    "",
    t.description,
    "",
    ...scopeLines,
    "### Constraints",
    "- Stay focused on THIS task only — do not expand scope",
    "- Only modify files listed in scope. If no scope is defined, limit changes to what the task description requires",
    "- Do not refactor surrounding code unless the task requires it",
    "- Do not add features, tests, or docs beyond what is specified",
    "- Do not scan for tech debt, TODOs, or improvements outside this task",
    "- Commit with conventional commits after each functional step",
    "- Run lint + tests before considering done",
    "- When complete, summarize what you did in 2-3 sentences",
    "",
    `Priority: ${t.priority} | Task ID: ${t.id}`,
  ].join("\n")

  await client.session.promptAsync({
    path: { id: sessionID },
    body: {
      agent: t.agent,
      parts: [{ type: "text" as const, text: prompt }],
    },
  })
}

async function checkCompletions(
  client: any,
  config: AutopilotConfig,
): Promise<void> {
  const backlog = loadBacklog(BACKLOG_FILE)
  const active = getActiveTasks(backlog)

  for (const task of active) {
    if (!task.sessionID) continue

    try {
      const status = await client.session.status({
        path: { id: task.sessionID },
      })

      if ((status.data as any)?.type === "idle") {
        let allDone = true
        try {
          const todos = await client.session.todo({
            path: { id: task.sessionID },
          })
          const items = (todos.data as any[]) || []
          allDone = items.every(
            (t: any) =>
              t.status === "completed" || t.status === "cancelled",
          )
        } catch {}

        if (allDone) {
          task.status = "done"
          task.completedAt = Date.now()
          const startedAt = task.updatedAt
          task.updatedAt = Date.now()
          saveBacklog(BACKLOG_FILE, backlog)

          recordMetric(METRICS_FILE, {
            type: "completed",
            taskID: task.id,
            taskTitle: task.title,
            directory: task.directory,
            priority: task.priority,
            durationMs: task.completedAt - startedAt,
          })

          if (task.parentID) {
            const promoted = promoteNext(BACKLOG_FILE, task.parentID)
            if (promoted) {
              recordMetric(METRICS_FILE, {
                type: "auto_promoted",
                taskID: task.parentID,
                taskTitle: "next subtask promoted",
                directory: task.directory,
                priority: task.priority,
              })
            }
          }
        }
      }
    } catch {
      task.status = "blocked"
      task.updatedAt = Date.now()
      saveBacklog(BACKLOG_FILE, backlog)

      recordMetric(METRICS_FILE, {
        type: "blocked",
        taskID: task.id,
        taskTitle: task.title,
        directory: task.directory,
        priority: task.priority,
      })
    }
  }
}

async function orchestrate(
  client: any,
  config: AutopilotConfig,
): Promise<void> {
  if (!config.autoDispatch) return

  await checkCompletions(client, config)

  const backlog = loadBacklog(BACKLOG_FILE)
  const active = getActiveTasks(backlog)

  if (active.length < config.maxConcurrent) {
    const next = getNextTask(backlog)
    if (next) {
      await dispatchTask(client, next, config)
    }
  }
}

// ── Session lifecycle management ────────────────────────────────
async function cleanSessions(
  client: any,
  config: AutopilotConfig,
): Promise<void> {
  const sessions = await client.session.list()
  if (!sessions.data) return

  const now = Date.now()
  const items = (sessions.data as any[]).sort(
    (a: any, b: any) =>
      (b.time?.updated || b.time?.created || 0) -
      (a.time?.updated || a.time?.created || 0),
  )

  // Delete stale empty sessions
  for (const s of items) {
    const age = now - (s.time?.updated || s.time?.created || 0)
    const hasChanges = s.summary?.files > 0
    if (age > config.staleThresholdMs && !hasChanges) {
      await client.session.delete({ path: { id: s.id } })
    }
  }

  // Enforce per-project limit
  const remaining = await client.session.list()
  if (!remaining.data) return
  const sorted = (remaining.data as any[]).sort(
    (a: any, b: any) =>
      (b.time?.updated || b.time?.created || 0) -
      (a.time?.updated || a.time?.created || 0),
  )
  const byProject = new Map<string, any[]>()
  for (const s of sorted) {
    const key = s.projectID || "unknown"
    if (!byProject.has(key)) byProject.set(key, [])
    byProject.get(key)!.push(s)
  }
  for (const [, list] of byProject) {
    if (list.length > config.maxSessionsPerProject) {
      for (const s of list.slice(config.maxSessionsPerProject)) {
        if (!s.summary?.files) {
          await client.session.delete({ path: { id: s.id } })
        }
      }
    }
  }
}

// ── Plugin Export ────────────────────────────────────────────────
export const Autopilot: Plugin = async ({ client }: PluginInput) => {
  mkdirSync(STATE_DIR, { recursive: true })
  const config = loadConfig(STATE_DIR)

  if (!existsSync(BACKLOG_FILE)) {
    saveBacklog(BACKLOG_FILE, { tasks: [], version: 1 })
  }

  // Boot: orchestrate + clean
  setTimeout(async () => {
    try {
      await orchestrate(client, config)
      await cleanSessions(client, config)
    } catch {}
  }, config.bootDelayMs)

  // Poll loop
  setInterval(async () => {
    try {
      await orchestrate(client, config)
    } catch {}
  }, config.pollIntervalMs)

  // Session cleanup every 30 min
  setInterval(async () => {
    try {
      await cleanSessions(client, config)
    } catch {}
  }, 30 * 60 * 1000)

  return {
    async event(input) {
      const event = input.event

      // On idle: check completions, tag session
      if (event.type === "session.idle") {
        const props = (event as any).properties
        const sessionID = props?.sessionID

        setTimeout(async () => {
          try {
            await orchestrate(client, config)
          } catch {}
        }, 3000)

        // Tag idle sessions
        if (sessionID) {
          try {
            const session = await client.session.get({
              path: { id: sessionID },
            })
            if (!session.data) return
            const title = (session.data as any).title
            if (
              !title ||
              title.startsWith("[") ||
              title.startsWith("local")
            )
              return

            const hasChanges = (session.data as any).summary?.files > 0
            const prefix = hasChanges ? "[WIP]" : "[IDLE]"
            await client.session.update({
              path: { id: sessionID },
              body: { title: `${prefix} ${title}` },
            })

            // Auto-compact large sessions
            if (config.compactAfterMessages > 0) {
              const msgs = await client.session.messages({
                path: { id: sessionID },
              })
              if (
                ((msgs.data as any[])?.length || 0) >
                config.compactAfterMessages
              ) {
                await client.session.summarize({
                  path: { id: sessionID },
                })
              }
            }
          } catch {}
        }

        // Notify
        if (config.notifications.onComplete) {
          try {
            const { $ } = input as any
            if ($) {
              await $`osascript -e 'display notification "Session idle — ready for next task" with title "OpenCode Autopilot"'`
            }
          } catch {}
        }
      }

      // Remove status tags on activity
      if (event.type === "message.updated") {
        const props = (event as any).properties
        const sessionID = props?.info?.sessionID
        if (!sessionID) return
        try {
          const session = await client.session.get({
            path: { id: sessionID },
          })
          if (!session.data) return
          const title = (session.data as any).title
          if (
            title?.startsWith("[IDLE] ") ||
            title?.startsWith("[WIP] ")
          ) {
            await client.session.update({
              path: { id: sessionID },
              body: {
                title: title.replace(/^\[(IDLE|WIP)\] /, ""),
              },
            })
          }
        } catch {}
      }
    },
  }
}

export { loadConfig, type AutopilotConfig } from "./config.js"
export {
  loadBacklog,
  saveBacklog,
  genID,
  getNextTask,
  getActiveTasks,
  promoteNext,
  type Task,
  type Backlog,
} from "./backlog.js"
export {
  loadMetrics,
  saveMetrics,
  recordMetric,
  getDispatchedToday,
  formatStats,
  type MetricEvent,
  type Metrics,
} from "./metrics.js"
export {
  validateTask,
  formatValidationQuestions,
  type ValidationIssue,
} from "./validate.js"
