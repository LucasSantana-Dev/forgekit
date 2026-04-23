#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

CONFIG_PATH = Path.home() / ".config/opencode/opencode.jsonc"


def strip_jsonc(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"(^|[^:])//.*$", r"\1", text, flags=re.M)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return text


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        raise SystemExit(f"Missing config: {CONFIG_PATH}")
    return json.loads(strip_jsonc(CONFIG_PATH.read_text()))


def save_config(data: dict) -> None:
    CONFIG_PATH.write_text(json.dumps(data, indent=2) + "\n")


def require_name(name: str, data: dict) -> None:
    if name not in data.get("mcp", {}):
        raise SystemExit(f"Unknown MCP server: {name}")


def list_status(data: dict) -> int:
    for name, config in data.get("mcp", {}).items():
        enabled = config.get("enabled", False)
        print(f"{name}: {'enabled' if enabled else 'disabled'}")
    return 0


def set_enabled(name: str, enabled: bool, data: dict) -> int:
    require_name(name, data)
    data["mcp"][name]["enabled"] = enabled
    save_config(data)
    print(f"{name}: {'enabled' if enabled else 'disabled'}")
    return 0


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print("Usage: toggle-mcp.py [list|enable|disable] [name]", file=sys.stderr)
        return 1

    data = load_config()
    command = args[0]

    if command == "list":
        return list_status(data)

    if len(args) < 2:
        print("Usage: toggle-mcp.py [list|enable|disable] [name]", file=sys.stderr)
        return 1

    name = args[1]
    if command == "enable":
        return set_enabled(name, True, data)
    if command == "disable":
        return set_enabled(name, False, data)

    print("Usage: toggle-mcp.py [list|enable|disable] [name]", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
