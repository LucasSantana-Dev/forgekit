import type { Plugin } from "@opencode-ai/plugin"

const COMPACT_AFTER_IDLE_MS = 5 * 60 * 1000 // compact after 5 min idle
const compactedSessions = new Set<string>()

export const PerfOptimizer: Plugin = async ({ client }) => {
  return {
    async event(input) {
      const event = input.event

      // Auto-compact sessions when they go idle
      // Compacted sessions load much faster on switch
      if (event.type === "session.idle") {
        const props = (event as any).properties
        const sessionID = props?.sessionID
        if (!sessionID || compactedSessions.has(sessionID)) return

        try {
          const session = await client.session.get({
            path: { id: sessionID },
          })
          if (!session.data) return

          // Only compact if session has messages (non-empty)
          const messages = await client.session.messages({
            path: { id: sessionID },
          })
          const msgCount = (messages.data as any[])?.length || 0

          // Compact sessions with >20 messages to reduce render load
          if (msgCount > 20) {
            await client.session.summarize({
              path: { id: sessionID },
            })
            compactedSessions.add(sessionID)
          }
        } catch {}
      }

      // Clear compaction flag when session gets new activity
      if (event.type === "message.updated") {
        const props = (event as any).properties
        const sessionID = props?.info?.sessionID
        if (sessionID) {
          compactedSessions.delete(sessionID)
        }
      }
    },
  }
}
