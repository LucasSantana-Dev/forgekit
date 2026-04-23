#!/usr/bin/env python3
"""Register every catalog/servers/*.yaml into the local mcp-context-forge gateway.

Idempotent: upserts by server id. Creates the single library virtual-server.

Usage:
    cd gateway/
    pip install -r seeds/requirements.txt
    python seeds/seed.py
"""
from __future__ import annotations

import base64
import os
import sys
from pathlib import Path

import httpx
import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
CATALOG_SERVERS = REPO_ROOT / "catalog" / "servers"
VIRTUAL_SERVER_FILE = Path(__file__).with_name("virtual-server.yaml")


def load_env() -> dict[str, str]:
    env_file = Path(__file__).resolve().parents[1] / ".env"
    env: dict[str, str] = dict(os.environ)
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            env.setdefault(k.strip(), v.strip())
    return env


def gateway_client(env: dict[str, str]) -> httpx.Client:
    base = f"http://127.0.0.1:{env.get('GATEWAY_PORT', '4444')}"
    user = env.get("ADMIN_USER", "admin")
    token = env.get("GATEWAY_ADMIN_TOKEN")
    if not token:
        sys.exit("❌ GATEWAY_ADMIN_TOKEN not set. Copy .env.example to .env and fill it.")
    basic = base64.b64encode(f"{user}:{token}".encode()).decode()
    return httpx.Client(
        base_url=base,
        headers={"Authorization": f"Basic {basic}"},
        timeout=30.0,
    )


def load_server_yaml(path: Path) -> dict:
    return yaml.safe_load(path.read_text())


def upsert_server(client: httpx.Client, spec: dict) -> None:
    """Register (or update) an upstream MCP server with the gateway admin API."""
    server_id = spec["id"]
    transport = spec["transport"]
    payload: dict = {
        "name": server_id,
        "description": spec.get("description", ""),
        "transport": transport,
    }
    if transport == "stdio":
        payload["command"] = spec["command"]
        payload["args"] = spec.get("args", [])
        payload["env"] = {e["name"]: os.environ.get(e["name"], "") for e in spec.get("env", []) if os.environ.get(e["name"])}
    else:
        payload["url"] = spec["url"]
    # Admin endpoints in mcp-context-forge: list + create under /gateways
    # (upstreams are "gateways" in the product's nomenclature).
    resp = client.get("/gateways")
    if resp.status_code != 200:
        sys.exit(f"❌ gateway not reachable at {client.base_url}: {resp.status_code} {resp.text[:200]}")
    existing = {g.get("name"): g for g in resp.json() or []}
    if server_id in existing:
        put = client.put(f"/gateways/{existing[server_id]['id']}", json=payload)
        put.raise_for_status()
        print(f"↻ updated  {server_id}")
    else:
        post = client.post("/gateways", json=payload)
        post.raise_for_status()
        print(f"＋ registered {server_id}")


def ensure_virtual_server(client: httpx.Client) -> None:
    spec = yaml.safe_load(VIRTUAL_SERVER_FILE.read_text())
    # List and match by name; create if missing.
    resp = client.get("/servers")
    resp.raise_for_status()
    current = {s.get("name"): s for s in resp.json() or []}
    if spec["name"] in current:
        print(f"✓ virtual-server {spec['name']} already exists (id={current[spec['name']].get('id')})")
        return
    created = client.post("/servers", json={"name": spec["name"], "description": spec["description"]})
    created.raise_for_status()
    data = created.json()
    print(f"＋ virtual-server {spec['name']} (id={data.get('id')})")


def main() -> None:
    if not CATALOG_SERVERS.exists():
        sys.exit(f"❌ {CATALOG_SERVERS} not found")
    env = load_env()
    with gateway_client(env) as client:
        ensure_virtual_server(client)
        specs = sorted(CATALOG_SERVERS.glob("*.yaml"))
        if not specs:
            print("(no servers in catalog/servers/ yet)")
            return
        for path in specs:
            try:
                upsert_server(client, load_server_yaml(path))
            except httpx.HTTPStatusError as err:
                sys.exit(f"❌ {path.name}: {err.response.status_code} {err.response.text[:200]}")
    print("\n✅ seed complete")


if __name__ == "__main__":
    main()
