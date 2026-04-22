import { readFileSync, writeFileSync, existsSync } from "fs"

export interface TaskScope {
  files?: string[]
  directories?: string[]
  acceptanceCriteria?: string[]
  outOfScope?: string[]
}

export interface Task {
  id: string
  title: string
  description: string
  directory: string
  priority: "critical" | "high" | "medium" | "low"
  status:
    | "backlog"
    | "ready"
    | "review"
    | "in_progress"
    | "done"
    | "blocked"
    | "expired"
  scope?: TaskScope
  requiresReview?: boolean
  timeLimitMs?: number
  dispatchedAt?: number
  context?: string
  dependsOn?: string
  sessionID?: string
  agent?: string
  createdAt: number
  updatedAt: number
  completedAt?: number
  parentID?: string
  subtasks?: string[]
  tags?: string[]
}

export interface Backlog {
  tasks: Task[]
  paused: boolean
  lastPlanAt?: number
  version: number
}

export function loadBacklog(filePath: string): Backlog {
  if (!existsSync(filePath)) return { tasks: [], paused: false, version: 1 }
  try {
    const data = JSON.parse(readFileSync(filePath, "utf-8"))
    if (data.paused === undefined) data.paused = false
    return data
  } catch {
    return { tasks: [], paused: false, version: 1 }
  }
}

export function saveBacklog(filePath: string, backlog: Backlog): void {
  writeFileSync(filePath, JSON.stringify(backlog, null, 2))
}

export function genID(): string {
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

export function getNextTask(backlog: Backlog): Task | undefined {
  return backlog.tasks
    .filter((t) => t.status === "ready")
    .filter((t) => {
      if (!t.dependsOn) return true
      const dep = backlog.tasks.find((d) => d.id === t.dependsOn)
      return !dep || dep.status === "done"
    })
    .sort(
      (a, b) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        a.createdAt - b.createdAt,
    )[0]
}

export function getActiveTasks(backlog: Backlog): Task[] {
  return backlog.tasks.filter((t) => t.status === "in_progress")
}

export function promoteNext(
  filePath: string,
  parentID: string,
): boolean {
  const backlog = loadBacklog(filePath)
  const parent = backlog.tasks.find((t) => t.id === parentID)
  if (!parent?.subtasks) return false

  for (const subID of parent.subtasks) {
    const sub = backlog.tasks.find((t) => t.id === subID)
    if (sub && sub.status === "backlog") {
      sub.status = sub.requiresReview ? "review" : "ready"
      sub.updatedAt = Date.now()
      saveBacklog(filePath, backlog)
      return true
    }
  }

  parent.status = "done"
  parent.completedAt = Date.now()
  parent.updatedAt = Date.now()
  saveBacklog(filePath, backlog)
  return false
}

export function expireStale(
  filePath: string,
  maxAgeMs: number,
): number {
  const backlog = loadBacklog(filePath)
  const now = Date.now()
  let expired = 0

  for (const t of backlog.tasks) {
    if (
      t.status === "backlog" &&
      now - t.createdAt > maxAgeMs
    ) {
      t.status = "expired"
      t.updatedAt = now
      expired++
    }
  }

  if (expired > 0) saveBacklog(filePath, backlog)
  return expired
}
