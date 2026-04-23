#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

CONFIG_PATH = Path.home() / ".config/opencode/opencode.jsonc"
POSITIVE_HINTS = ("connected", "authenticated", "ready", "enabled", "active", "ok")
AUTH_FAILURE_HINTS = (
    "expired",
    "missing",
    "unauthorized",
    "unauthenticated",
    "denied",
    "revoked",
    "failed",
    "error",
)
LIVE_FAILURE_HINTS = ("error", "failed", "timeout", "unreachable", "offline", "denied")


def strip_jsonc(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"(^|[^:])//.*$", r"\1", text, flags=re.M)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return text


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        raise SystemExit(f"Missing config: {CONFIG_PATH}")
    return json.loads(strip_jsonc(CONFIG_PATH.read_text()))


def usage() -> int:
    print("Usage: mcp-health.py [--all] [server ...]", file=sys.stderr)
    return 0


def run_opencode(*args: str) -> tuple[int | None, str]:
    try:
        result = subprocess.run(
            ["opencode", *args],
            capture_output=True,
            text=True,
            check=False,
        )
    except FileNotFoundError:
        return None, "opencode CLI not found"

    output = "\n".join(
        part.strip() for part in (result.stdout, result.stderr) if part.strip()
    ).strip()
    return result.returncode, output


def compact(text: str) -> str:
    return " ".join(text.split())


def find_signal(text: str, name: str) -> str:
    pattern = re.compile(rf"(^|[^a-z0-9_-]){re.escape(name)}([^a-z0-9_-]|$)", re.I)
    for line in text.splitlines():
        candidate = line.strip()
        if candidate and pattern.search(candidate):
            return compact(candidate)
    return ""


def classify(
    name: str, config: dict, live_signal: str, auth_signal: str
) -> tuple[str, str]:
    if not config.get("enabled", False):
        return "blocked", "disabled in local config"

    auth_lower = auth_signal.lower()
    live_lower = live_signal.lower()

    if auth_signal and any(hint in auth_lower for hint in AUTH_FAILURE_HINTS):
        return "blocked", auth_signal
    if live_signal and any(hint in live_lower for hint in LIVE_FAILURE_HINTS):
        return "blocked", live_signal
    if live_signal and any(hint in live_lower for hint in POSITIVE_HINTS):
        return "ready", live_signal
    if auth_signal and any(hint in auth_lower for hint in POSITIVE_HINTS):
        return "indeterminate", auth_signal
    return "indeterminate", "no live MCP signal returned by opencode CLI"


def selected_names(args: list[str], data: dict) -> list[str]:
    mcp_config = data.get("mcp", {})
    if "--all" in args:
        return list(mcp_config.keys())
    if args:
        return args
    return [name for name, config in mcp_config.items() if config.get("enabled", False)]


def describe_target(config: dict) -> str:
    if "url" in config:
        return config["url"]
    if "command" in config:
        return " ".join(config["command"])
    return config.get("type", "unknown")


def main() -> int:
    args = sys.argv[1:]
    if any(arg in {"-h", "--help"} for arg in args):
        return usage()

    data = load_config()
    mcp_config = data.get("mcp", {})
    names = selected_names(args, data)
    if not names:
        print("No MCP servers selected. Enable one first or pass --all.")
        return 0

    live_code, live_output = run_opencode("mcp", "ls")
    auth_code, auth_output = run_opencode("mcp", "auth", "ls")

    print("MCP health snapshot")
    print()
    if live_code is None:
        print(f"opencode mcp ls: {live_output}")
    elif live_output:
        print("Live MCP status source: opencode mcp ls")
    else:
        print(f"Live MCP status source returned no output (exit {live_code})")

    if auth_code is None:
        print(f"Auth status source: {auth_output}")
    elif auth_output:
        print("Auth status source: opencode mcp auth ls")
    else:
        print(f"Auth status source returned no output (exit {auth_code})")
    print()

    overall_ready = True
    for name in names:
        config = mcp_config.get(name)
        if config is None:
            overall_ready = False
            print(f"- {name}: blocked — unknown MCP server in local config")
            continue

        live_signal = find_signal(live_output, name)
        auth_signal = find_signal(auth_output, name)
        status, detail = classify(name, config, live_signal, auth_signal)
        if status != "ready":
            overall_ready = False

        print(f"- {name}: {status}")
        print(f"  type: {config.get('type', 'unknown')}")
        print(f"  target: {describe_target(config)}")
        print(f"  enabled: {'yes' if config.get('enabled', False) else 'no'}")
        if live_signal:
            print(f"  live: {live_signal}")
        if auth_signal:
            print(f"  auth: {auth_signal}")
        print(f"  next: {detail}")

    return 0 if overall_ready else 1


if __name__ == "__main__":
    raise SystemExit(main())
