import type { Plugin } from "@opencode-ai/plugin"

const IDLE_THRESHOLD_MS = 2 * 60 * 60 * 1000 // 2 hours
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_SESSIONS_PER_PROJECT = 3
const AUTO_CLEAN_INTERVAL_MS = 30 * 60 * 1000 // every 30 min

export const SessionManager: Plugin = async ({ client }) => {
  // Background auto-cleanup: prune stale empty sessions every 30 min
  const interval = setInterval(async () => {
    try {
      await autoClean(client)
    } catch {}
  }, AUTO_CLEAN_INTERVAL_MS)

  // Run once on startup after a short delay
  setTimeout(async () => {
    try {
      await autoClean(client)
    } catch {}
  }, 5000)

  return {
    async event(input) {
      const event = input.event

      // Auto-prefix session titles on idle
      if (event.type === "session.idle") {
        const props = (event as any).properties
        if (!props?.sessionID) return

        try {
          const session = await client.session.get({
            path: { id: props.sessionID },
          })
          if (!session.data) return

          const title = session.data.title
          if (!title || title.startsWith("[") || title.startsWith("local"))
            return

          const hasChanges =
            session.data.summary && session.data.summary.files > 0
          const prefix = hasChanges ? "[WIP]" : "[IDLE]"
          await client.session.update({
            path: { id: props.sessionID },
            body: { title: `${prefix} ${title}` },
          })
        } catch {}
      }

      // Remove status prefix when session becomes active again
      if (event.type === "message.updated") {
        const props = (event as any).properties
        const sessionID = props?.info?.sessionID
        if (!sessionID) return

        try {
          const session = await client.session.get({
            path: { id: sessionID },
          })
          if (!session.data) return

          const title = session.data.title
          if (title?.startsWith("[IDLE] ") || title?.startsWith("[WIP] ")) {
            await client.session.update({
              path: { id: sessionID },
              body: { title: title.replace(/^\[(IDLE|WIP)\] /, "") },
            })
          }
        } catch {}
      }
    },
  }
}

async function autoClean(client: any) {
  const sessions = await client.session.list()
  if (!sessions.data) return

  const now = Date.now()
  const items = (sessions.data as any[]).sort(
    (a: any, b: any) =>
      (b.time?.updated || b.time?.created || 0) -
      (a.time?.updated || a.time?.created || 0),
  )

  let cleaned = 0

  // 1. Delete sessions older than 24h with no file changes
  for (const s of items) {
    const age = now - (s.time?.updated || s.time?.created || 0)
    const hasChanges = s.summary?.files > 0

    if (age > STALE_THRESHOLD_MS && !hasChanges) {
      await client.session.delete({ path: { id: s.id } })
      cleaned++
    }
  }

  // 2. Keep max N sessions per project (delete oldest beyond limit)
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

  for (const [, projectSessions] of byProject) {
    if (projectSessions.length > MAX_SESSIONS_PER_PROJECT) {
      const toDelete = projectSessions.slice(MAX_SESSIONS_PER_PROJECT)
      for (const s of toDelete) {
        const hasChanges = s.summary?.files > 0
        // Only auto-delete sessions with no changes
        if (!hasChanges) {
          await client.session.delete({ path: { id: s.id } })
          cleaned++
        }
      }
    }
  }

  // 3. Mark old sessions with changes as [WIP]
  for (const [, projectSessions] of byProject) {
    for (const s of projectSessions) {
      const age = now - (s.time?.updated || s.time?.created || 0)
      const hasChanges = s.summary?.files > 0
      const title = s.title || ""

      if (
        age > IDLE_THRESHOLD_MS &&
        hasChanges &&
        !title.startsWith("[WIP]")
      ) {
        await client.session.update({
          path: { id: s.id },
          body: {
            title: `[WIP] ${title.replace(/^\[(IDLE|WIP)\] /, "")}`,
          },
        })
      }
    }
  }
}
