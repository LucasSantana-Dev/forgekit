import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.join(path.dirname(__filename), "..");

function parseArgs(argv) {
  const args = {
    write: false,
    check: false,
    file: path.join(rootDir, "backlog.json"),
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--write") args.write = true;
    if (token === "--check") args.check = true;
    if (token === "--file" && argv[i + 1]) {
      args.file = path.resolve(argv[i + 1]);
      i += 1;
    }
  }

  return args;
}

function safeCommand(command) {
  try {
    return execSync(command, {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

function inferPrNumber(task) {
  const idMatch = task.id?.match(/^merge-pr-(\d+)$/);
  if (idMatch) return Number(idMatch[1]);

  const titleMatch = task.title?.match(/PR\s*#(\d+)/i);
  if (titleMatch) return Number(titleMatch[1]);

  return null;
}

function inferReleaseTag(task) {
  const titleMatch = task.title?.match(/v(\d+\.\d+\.\d+)/i);
  if (titleMatch) return `v${titleMatch[1]}`;

  const idMatch = task.id?.match(/^release-v(\d+)-(\d+)(?:-(\d+))?$/);
  if (!idMatch) return null;

  const major = idMatch[1];
  const minor = idMatch[2];
  const patch = idMatch[3] ?? "0";
  return `v${major}.${minor}.${patch}`;
}

function markDone(task, completedAt) {
  if (task.status === "done") return false;
  task.status = "done";
  task.completedAt = completedAt;
  return true;
}

export function reconcileBacklog(backlog, checks, now = Date.now()) {
  const changes = [];

  for (const task of backlog.tasks ?? []) {
    const prNumber = inferPrNumber(task);
    if (prNumber && checks.isPrMerged(prNumber)) {
      if (markDone(task, now)) {
        changes.push(`Marked ${task.id} done (PR #${prNumber} merged)`);
      }
      continue;
    }

    const tag = inferReleaseTag(task);
    if (tag && checks.hasReleaseTag(tag)) {
      if (markDone(task, now)) {
        changes.push(`Marked ${task.id} done (release tag ${tag} present)`);
      }
    }
  }

  return { backlog, changes };
}

function loadBacklog(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveBacklog(filePath, backlog) {
  fs.writeFileSync(filePath, `${JSON.stringify(backlog, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const backlog = loadBacklog(args.file);

  const mergedPrs = new Set(
    safeCommand("git log --oneline --all")
      .split("\n")
      .flatMap((line) => {
        const match = line.match(/\(#(\d+)\)/);
        return match ? [Number(match[1])] : [];
      }),
  );

  const tags = new Set(
    safeCommand("git tag --list")
      .split("\n")
      .map((tag) => tag.trim())
      .filter(Boolean),
  );

  const checks = {
    isPrMerged: (prNumber) => mergedPrs.has(prNumber),
    hasReleaseTag: (tag) => tags.has(tag),
  };

  const { changes } = reconcileBacklog(backlog, checks);

  if (changes.length === 0) {
    console.log("No backlog lifecycle changes required.");
    return;
  }

  for (const change of changes) {
    console.log(`- ${change}`);
  }

  if (args.check) {
    console.error(`Backlog drift detected in ${args.file}`);
    process.exit(1);
  }

  if (args.write) {
    saveBacklog(args.file, backlog);
    console.log(`Applied ${changes.length} change(s) to ${args.file}`);
  } else {
    console.log("Dry run only. Re-run with --write to persist changes.");
  }
}

if (process.argv[1] === __filename) {
  main();
}
