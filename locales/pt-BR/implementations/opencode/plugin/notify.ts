import type { Plugin } from "@opencode-ai/plugin"

function notify(title: string, message: string, sound = false) {
  const soundFlag = sound ? '-sound default' : ''
  return `osascript -e 'display notification "${message}" with title "OpenCode" subtitle "${title}" ${soundFlag}'`
}

export const Notify: Plugin = async ({ $ }) => {
  return {
    async event(input) {
      if (input.event.type === "session.idle") {
        await $`${notify("Task Complete", "Session is idle — ready for next task")}`
      }
    },
    async tool(input) {
      if (input.tool.type === "after") {
        const name = input.tool.name
        if (name === "bash" && input.tool.input?.command) {
          const cmd = input.tool.input.command as string
          if (cmd.includes("gh pr create")) {
            await $`${notify("PR Created", "Pull request opened successfully", true)}`
          } else if (cmd.includes("git push")) {
            await $`${notify("Pushed", "Changes pushed to remote")}`
          } else if (cmd.includes("npm test") || cmd.includes("pytest")) {
            const failed = input.tool.output?.includes("FAIL") ||
              input.tool.output?.includes("failed") ||
              input.tool.output?.includes("Error")
            if (failed) {
              await $`${notify("Tests Failed", "Check test output for errors", true)}`
            }
          }
        }
      }
    },
  }
}
