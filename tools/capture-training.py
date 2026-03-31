#!/usr/bin/env python3
"""
capture-training — Extract Claude Code sessions as instruction fine-tuning training data.

Parses ~/.claude/projects/**/*.jsonl (Claude Code conversation logs), extracts
user→assistant exchanges, and writes them as alpaca-format instruction pairs.
Deduplicates via SHA256 of file path so re-runs only add new sessions.

Usage:
  python3 capture-training.py                        # show stats
  python3 capture-training.py --export               # append new pairs to dataset.jsonl
  python3 capture-training.py --export --min-turns 3 # only multi-turn sessions
  python3 capture-training.py --dry-run              # preview without writing
  python3 capture-training.py --output /path/to/dataset.jsonl  # custom output path
"""
import json
import sys
import hashlib
import argparse
from pathlib import Path
from datetime import datetime

CLAUDE_PROJECTS = Path.home() / ".claude" / "projects"
DEFAULT_DATASET = Path.cwd() / "training" / "dataset.jsonl"
SEEN_FILE = Path.home() / ".local" / "share" / "capture-training-seen.json"

def load_seen():
    if SEEN_FILE.exists():
        return set(json.loads(SEEN_FILE.read_text()))
    return set()

def save_seen(seen):
    SEEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    SEEN_FILE.write_text(json.dumps(list(seen)))

def flatten_content(content):
    """Flatten Anthropic content blocks to plain text."""
    if isinstance(content, str):
        return content.strip()
    if not isinstance(content, list):
        return ""
    parts = []
    for block in content:
        if not isinstance(block, dict):
            continue
        t = block.get("type", "")
        if t == "text":
            parts.append(block.get("text", "").strip())
        elif t == "tool_use":
            name = block.get("name", "")
            inp = json.dumps(block.get("input", {}))[:200]
            parts.append(f"[{name}({inp})]")
        elif t == "tool_result":
            result_content = block.get("content", "")
            if isinstance(result_content, list):
                result_content = " ".join(b.get("text", "") for b in result_content if isinstance(b, dict))
            parts.append(f"[result: {str(result_content)[:200]}]")
    return "\n".join(p for p in parts if p)


def extract_sessions(min_turns=2):
    """Parse Claude Code conversation JSONL files and extract quality sessions."""
    sessions = []
    if not CLAUDE_PROJECTS.exists():
        return sessions

    for jsonl_file in CLAUDE_PROJECTS.rglob("*.jsonl"):
        try:
            lines = jsonl_file.read_text(errors="replace").strip().splitlines()
            if len(lines) < min_turns * 3:
                continue

            turns = []
            for line in lines:
                try:
                    event = json.loads(line)
                except json.JSONDecodeError:
                    continue

                etype = event.get("type", "")
                if etype not in ("user", "assistant"):
                    continue

                msg = event.get("message", {})
                if not msg:
                    continue

                content = flatten_content(msg.get("content", ""))
                if not content or len(content) < 10:
                    continue

                turns.append((etype, content[:1000]))

            # Extract consecutive user→assistant exchanges
            exchanges = []
            i = 0
            while i < len(turns) - 1:
                if turns[i][0] == "user" and turns[i+1][0] == "assistant":
                    exchanges.append((turns[i], turns[i+1]))
                    i += 2
                else:
                    i += 1

            if len(exchanges) >= min_turns:
                sessions.append({
                    "file": str(jsonl_file),
                    "exchanges": exchanges,
                    "id": hashlib.sha256(str(jsonl_file).encode()).hexdigest()[:16]
                })
        except Exception:
            continue

    return sessions

def to_training_pair(session):
    """Convert a session to an instruction-following training pair."""
    exchanges = session["exchanges"]
    # Each exchange is ((role, text), (role, text))
    first_user_text = exchanges[0][0][1]
    first_asst_text = exchanges[0][1][1]

    # Build multi-turn context from middle exchanges
    context = ""
    if len(exchanges) > 2:
        for u_turn, a_turn in exchanges[1:-1]:
            context += f"\nUser: {u_turn[1][:300]}\nAssistant: {a_turn[1][:400]}\n"

    return {
        "instruction": first_user_text,
        "input": context.strip(),
        "output": first_asst_text,
        "source": "claude-code-session",
        "captured_at": datetime.now().isoformat()[:10]
    }

def main():
    parser = argparse.ArgumentParser(description="Capture Claude Code sessions as training data")
    parser.add_argument("--export", action="store_true", help="Export new pairs to dataset.jsonl")
    parser.add_argument("--min-turns", type=int, default=2, help="Minimum turns per session (default: 2)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be exported without writing")
    parser.add_argument("--output", type=Path, default=DEFAULT_DATASET, help="Output dataset path")
    args = parser.parse_args()

    dataset = args.output
    sessions = extract_sessions(min_turns=args.min_turns)
    seen = load_seen()
    new_sessions = [s for s in sessions if s["id"] not in seen]

    print(f"Sessions found: {len(sessions)} total, {len(new_sessions)} new")

    if not args.export and not args.dry_run:
        print(f"\nRun with --export to append {len(new_sessions)} new pairs to:")
        print(f"  {dataset}")
        if new_sessions:
            print("\nPreview (first new session):")
            pair = to_training_pair(new_sessions[0])
            print(f"  instruction: {pair['instruction'][:100]}...")
            print(f"  output: {pair['output'][:100]}...")
        return

    if not new_sessions:
        print("Nothing new to export.")
        return

    if args.dry_run:
        for s in new_sessions[:3]:
            pair = to_training_pair(s)
            print(f"\n--- {s['id']} ---")
            print(f"instruction: {pair['instruction'][:150]}")
            print(f"output:      {pair['output'][:150]}")
        return

    dataset.parent.mkdir(parents=True, exist_ok=True)

    written = 0
    with open(dataset, "a") as f:
        for session in new_sessions:
            pair = to_training_pair(session)
            f.write(json.dumps(pair, ensure_ascii=False) + "\n")
            seen.add(session["id"])
            written += 1

    save_seen(seen)
    print(f"Exported {written} pairs → {dataset}")
    print(f"Dataset now has {sum(1 for _ in open(dataset))} total pairs")

if __name__ == "__main__":
    main()
