#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: render-opencode-config.py <template> <output>", file=sys.stderr)
        return 1

    template = Path(sys.argv[1]).expanduser().resolve()
    output = Path(sys.argv[2]).expanduser().resolve()
    home = str(Path.home())

    content = template.read_text()
    content = content.replace("__HOME__", home)

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
