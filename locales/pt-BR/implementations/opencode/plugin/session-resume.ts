import type { Plugin } from "@opencode-ai/plugin"
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync } from "fs"
import { join } from "path"

const STATE_DIR = join(
  process.env.HOME || "~",
  ".local",
  "share",
  "opencode",
  "session-state",
)
const RESUME_DELAY_MS = 8000 // wait for OpenCode to fully boot

interface SessionState {
  sessionID: string
  title: string
  todos: Array<{ content: string; status: string; priority: string }>
  lastPrompt?: string
  savedAt: number
}

export const SessionResume: Plugin = async ({ client }) => {
  mkdirSync(STATE_DIR, { recursive: true })

  // On startup: check for interrupted sessions and offer to resume
  setTimeout(async () => {
    try {
      await resumeInterrupted(client)
    } catch {}
  }, RESUME_DELAY_MS)

  return {
    async event(input) {
      const event = input.event

      // Save session state when it goes idle
      if (event.type === "session.idle") {
        const props = (event as any).properties
        const sessionID = props?.sessionID
        if (!sessionID) return

        try {
          await saveSessionState(client, sessionID)
        } catch {}
      }

      // Save state when session gets a new message (track last prompt)
      if (event.type === "message.updated") {
        const props = (event as any).properties
        const msg = props?.info
        if (!msg?.sessionID) return

        // Only save user messages as "last prompt"
        if (msg.role === "user") {
          const stateFile = join(STATE_DIR, `${msg.sessionID}.json`)
          try {
            let state: SessionState = existsSync(stateFile)
              ? JSON.parse(readFileSync(stateFile, "utf-8"))
              : {
                  sessionID: msg.sessionID,
                  title: "",
                  todos: [],
                  savedAt: Date.now(),
                }

            // Extract text from parts
            const textParts = (msg.parts || [])
              .filter((p: any) => p.type === "text")
              .map((p: any) => p.text)
              .join("\n")

            if (textParts) {
              state.lastPrompt = textParts
              state.savedAt = Date.now()
              writeFileSync(stateFile, JSON.stringify(state, null, 2))
            }
          } catch {}
        }
      }

      // Clean up state file when session is deleted
      if (event.type === "session.deleted") {
        const props = (event as any).properties
        const sessionID = props?.sessionID
        if (sessionID) {
          const stateFile = join(STATE_DIR, `${sessionID}.json`)
          try {
            if (existsSync(stateFile)) unlinkSync(stateFile)
          } catch {}
        }
      }
    },
  }
}

async function saveSessionState(client: any, sessionID: string) {
  const session = await client.session.get({
    path: { id: sessionID },
  })
  if (!session.data) return

  // Get todos for this session
  let todos: any[] = []
  try {
    const todoResult = await client.session.todo({
      path: { id: sessionID },
    })
    todos = (todoResult.data as any[]) || []
  } catch {}

  const pendingTodos = todos.filter(
    (t: any) => t.status === "pending" || t.status === "in_progress",
  )

  // Only save state if there are pending tasks
  if (pendingTodos.length === 0) {
    // Clean up state file if no pending work
    const stateFile = join(STATE_DIR, `${sessionID}.json`)
    if (existsSync(stateFile)) unlinkSync(stateFile)
    return
  }

  const state: SessionState = {
    sessionID,
    title: session.data.title || sessionID.slice(0, 8),
    todos: pendingTodos.map((t: any) => ({
      content: t.content,
      status: t.status,
      priority: t.priority,
    })),
    savedAt: Date.now(),
  }

  // Preserve last prompt if we already have it
  const stateFile = join(STATE_DIR, `${sessionID}.json`)
  if (existsSync(stateFile)) {
    try {
      const existing = JSON.parse(readFileSync(stateFile, "utf-8"))
      if (existing.lastPrompt) state.lastPrompt = existing.lastPrompt
    } catch {}
  }

  writeFileSync(stateFile, JSON.stringify(state, null, 2))
}

async function resumeInterrupted(client: any) {
  if (!existsSync(STATE_DIR)) return

  const files = readdirSync(STATE_DIR).filter((f) => f.endsWith(".json"))
  if (files.length === 0) return

  // Get list of existing sessions
  const sessions = await client.session.list()
  const sessionIds = new Set(
    ((sessions.data as any[]) || []).map((s: any) => s.id),
  )

  for (const file of files) {
    const stateFile = join(STATE_DIR, file)
    try {
      const state: SessionState = JSON.parse(
        readFileSync(stateFile, "utf-8"),
      )

      // Skip if session no longer exists
      if (!sessionIds.has(state.sessionID)) {
        unlinkSync(stateFile)
        continue
      }

      // Skip if state is older than 48h
      if (Date.now() - state.savedAt > 48 * 60 * 60 * 1000) {
        unlinkSync(stateFile)
        continue
      }

      // Check if session is currently idle
      const status = await client.session.status({
        path: { id: state.sessionID },
      })
      if ((status.data as any)?.type !== "idle") continue

      // Build resume prompt from pending todos
      const todoList = state.todos
        .map(
          (t) =>
            `- [${t.status === "in_progress" ? "IN PROGRESS" : "PENDING"}] ${t.content}`,
        )
        .join("\n")

      const resumePrompt = [
        "Continue from where you left off. Here are your pending tasks:",
        "",
        todoList,
        "",
        "Pick up the next incomplete task and continue working.",
      ].join("\n")

      // Send resume prompt to the session
      await client.session.promptAsync({
        path: { id: state.sessionID },
        body: { prompt: resumePrompt },
      })

      // Clean up state file after resume
      unlinkSync(stateFile)
    } catch {
      // If anything fails, skip this session
    }
  }
}
