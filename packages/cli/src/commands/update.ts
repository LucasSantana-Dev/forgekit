import { runInstall } from "./install.js";

export async function runUpdate(args: string[]): Promise<void> {
  const id = args[0];
  if (!id) {
    console.error("Usage: forge-kit update <id>   (skill | agent | hook | command | tool)");
    process.exit(2);
  }
  return runInstall([id, "--force"]);
}
