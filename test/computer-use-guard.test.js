import { describe, test, expect } from "@jest/globals";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOOK = path.join(
  __dirname,
  "../packages/catalog/catalog/hooks/computer-use-guard/script.sh",
);
const RA = "mcp__computer-use__request_access";

const req = (apps, extra = {}) =>
  JSON.stringify({ tool_name: RA, tool_input: { apps, reason: "t", ...extra } });

const run = (input, env) =>
  spawnSync("/bin/bash", [HOOK], { input, encoding: "utf8", env: env ?? process.env })
    .status;

describe("computer-use-guard blocks (exit 2)", () => {
  const blocked = [
    ["terminal", ["Terminal"]],
    ["iterm bundle id", ["com.googlecode.iterm2"]],
    ["vscode name", ["Visual Studio Code"]],
    ["dot-app suffix", ["Ghostty.app"]],
    ["finder", ["Finder"]],
    ["system settings", ["System Settings"]],
    ["keychain", ["Keychain Access"]],
    ["1password", ["1Password"]],
    ["case-insensitive", ["TERMINAL"]],
    ["mixed set, one bad", ["Simulator", "Terminal"]],
    ["zero-width split name", ["Ter​minal"]],
    ["full path to app", ["/System/Applications/Utilities/Terminal.app"]],
    ["double .app suffix", ["Terminal.app.app"]],
    ["nested list entry", [["Terminal"]]],
    ["object entry", [{ name: "Terminal" }]],
    ["vscode insiders", ["Code - Insiders"]],
    ["combining accent", ["Terminaĺ"]],
    ["screen sharing", ["Screen Sharing"]],
    ["claude desktop", ["Claude"]],
  ];
  test.each(blocked)("%s", (_d, apps) => {
    expect(run(req(apps))).toBe(2);
  });

  test("clipboardRead true", () => {
    expect(run(req(["Simulator"], { clipboardRead: true }))).toBe(2);
  });
  test("clipboardRead string", () => {
    expect(run(req(["Simulator"], { clipboardRead: "true" }))).toBe(2);
  });
  test("systemKeyCombos", () => {
    expect(run(req(["Simulator"], { systemKeyCombos: true }))).toBe(2);
  });
  test("apps as plain string", () => {
    expect(
      run(JSON.stringify({ tool_name: RA, tool_input: { apps: "Terminal" } })),
    ).toBe(2);
  });
  test("unparseable payload", () => {
    expect(run("not json")).toBe(2);
  });
  test("fails closed without python3", () => {
    const bin = fs.mkdtempSync(path.join(os.tmpdir(), "cug-"));
    fs.symlinkSync(
      spawnSync("sh", ["-c", "command -v cat"], { encoding: "utf8" }).stdout.trim(),
      path.join(bin, "cat"),
    );
    expect(run(req(["Simulator"]), { PATH: bin })).toBe(2);
    fs.rmSync(bin, { recursive: true });
  });
});

describe("computer-use-guard allows (exit 0)", () => {
  const allowed = [
    ["simulator", req(["Simulator"])],
    ["xcode", req(["Xcode"])],
    ["no substring match", req(["Authorized Zedboard Viewer"])],
    ["clipboardWrite only", req(["Simulator"], { clipboardWrite: true })],
    [
      "explicit false flags",
      req(["Simulator"], { clipboardRead: false, systemKeyCombos: false }),
    ],
    ["null tool_input", JSON.stringify({ tool_name: RA, tool_input: null })],
    [
      "other computer-use tool",
      JSON.stringify({ tool_name: "mcp__computer-use__screenshot", tool_input: {} }),
    ],
    ["unrelated tool", JSON.stringify({ tool_name: "Bash", tool_input: { command: "ls" } })],
  ];
  test.each(allowed)("%s", (_d, input) => {
    expect(run(input)).toBe(0);
  });
});
