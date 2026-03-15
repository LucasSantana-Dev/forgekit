import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"

export interface MetricEvent {
  type:
    | "dispatched"
    | "completed"
    | "blocked"
    | "plan_created"
    | "auto_promoted"
    | "daily_limit_hit"
  taskID: string
  taskTitle: string
  directory: string
  priority: string
  timestamp: number
  durationMs?: number
}

export interface Metrics {
  events: MetricEvent[]
  startedAt: number
}

export function loadMetrics(filePath: string): Metrics {
  if (!existsSync(filePath)) {
    return { events: [], startedAt: Date.now() }
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"))
  } catch {
    return { events: [], startedAt: Date.now() }
  }
}

export function saveMetrics(filePath: string, metrics: Metrics): void {
  writeFileSync(filePath, JSON.stringify(metrics, null, 2))
}

export function recordMetric(
  filePath: string,
  event: Omit<MetricEvent, "timestamp">,
): void {
  const metrics = loadMetrics(filePath)
  metrics.events.push({ ...event, timestamp: Date.now() })
  saveMetrics(filePath, metrics)
}

export function getDispatchedToday(filePath: string): number {
  const metrics = loadMetrics(filePath)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  return metrics.events.filter(
    (e) =>
      e.type === "dispatched" && e.timestamp >= todayStart.getTime(),
  ).length
}

export function formatStats(filePath: string): string {
  const metrics = loadMetrics(filePath)
  const events = metrics.events

  if (events.length === 0) {
    return "No telemetry data yet. Run /plan to create tasks."
  }

  const dispatched = events.filter((e) => e.type === "dispatched")
  const completed = events.filter((e) => e.type === "completed")
  const blocked = events.filter((e) => e.type === "blocked")
  const promoted = events.filter((e) => e.type === "auto_promoted")
  const limitHits = events.filter((e) => e.type === "daily_limit_hit")

  const durations = completed
    .map((e) => e.durationMs)
    .filter((d): d is number => d !== undefined && d > 0)

  const avg =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0
  const median =
    durations.length > 0
      ? durations.sort((a, b) => a - b)[
          Math.floor(durations.length / 2)
        ]
      : 0

  const days = Math.max(
    1,
    (Date.now() - metrics.startedAt) / (24 * 60 * 60 * 1000),
  )
  const rate =
    dispatched.length > 0
      ? Math.round((completed.length / dispatched.length) * 100)
      : 0

  const fmt = (ms: number) => {
    const m = Math.round(ms / 60000)
    return m < 60 ? `${m}m` : `${Math.round((m / 60) * 10) / 10}h`
  }

  const byProject: Record<string, number> = {}
  for (const e of completed) {
    const p = e.directory.split("/").pop() || e.directory
    byProject[p] = (byProject[p] || 0) + 1
  }

  const lines = [
    `## Orchestrator Stats`,
    ``,
    `Tracking since: ${new Date(metrics.startedAt).toISOString().slice(0, 10)} (${Math.round(days)}d)`,
    `Today: ${getDispatchedToday(filePath)} dispatched`,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Dispatched | ${dispatched.length} |`,
    `| Completed | ${completed.length} |`,
    `| Blocked | ${blocked.length} |`,
    `| Auto-promoted | ${promoted.length} |`,
    `| Daily limits hit | ${limitHits.length} |`,
    `| Completion rate | ${rate}% |`,
    `| Tasks/day | ${Math.round((completed.length / days) * 10) / 10} |`,
    `| Avg duration | ${fmt(avg)} |`,
    `| Median duration | ${fmt(median)} |`,
  ]

  if (Object.keys(byProject).length > 0) {
    lines.push("", "### By Project")
    for (const [p, c] of Object.entries(byProject).sort(
      (a, b) => b[1] - a[1],
    )) {
      lines.push(`- ${p}: ${c}`)
    }
  }

  return lines.join("\n")
}
