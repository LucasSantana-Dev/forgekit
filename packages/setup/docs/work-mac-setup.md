# Work Mac Setup Guide

A guide for setting up ai-dev-toolkit on a corporate macOS machine where you may not have admin/sudo access, use a corporate proxy, or need to keep a minimal footprint.

## Quick start (no sudo required)

```bash
./bootstrap.sh --work-mac
```

This skips all Homebrew-dependent installs and goes straight to AI tool configuration using npm and user-space tools.

## What `--work-mac` does

- Skips `install-macos.sh` (no Homebrew bundle, no sudo prompts)
- Runs `install-ai-clis.sh` — installs AI CLIs via npm (user-space, no sudo)
- Runs `setup-ai-tools.sh` — applies rules/config via the toolkit
- Runs `setup-shell.sh` — adds shell helpers to your rc file
- Skips iTerm2 setup

## Prerequisites

Before running, you need:

| Tool | How to get it (no admin) |
|------|--------------------------|
| Node.js + npm | [nvm](https://github.com/nvm-sh/nvm): `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh \| bash` |
| Git | Likely pre-installed on work Mac |
| Python 3 | Likely pre-installed on macOS |

## Gemini CLI (primary AI tool for work)

Gemini CLI is the recommended AI tool for work environments — no cask install, no sudo, just npm.

### Install

```bash
npm install -g @google/gemini-cli
gemini --version
```

### Authenticate

**Option 1 — API key (recommended for work):**

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and create an API key
2. Add it to your local env file:

```bash
echo 'export GEMINI_API_KEY="your-key-here"' >> ~/.config/ai-dev-toolkit/local.env
source ~/.config/ai-dev-toolkit/local.env
```

**Option 2 — Google account OAuth:**

```bash
gemini auth
```

### Configure rules

Copy the Gemini rule file into any project to give the agent your conventions:

```bash
# From within a project directory
cp ~/.config/ai-dev-toolkit/rules/GEMINI.md ./GEMINI.md
```

The `GEMINI.md` file is installed by the toolkit bootstrap. It contains your coding standards, workflow rules, and security guidelines.

## Corporate proxy support

If your network routes through a corporate proxy, set these before running bootstrap:

```bash
export HTTP_PROXY="http://proxy.corp.example.com:8080"
export HTTPS_PROXY="http://proxy.corp.example.com:8080"
export NO_PROXY="localhost,127.0.0.1,.corp.example.com"

# npm-specific proxy
npm config set proxy http://proxy.corp.example.com:8080
npm config set https-proxy http://proxy.corp.example.com:8080

# Git proxy
git config --global http.proxy http://proxy.corp.example.com:8080
```

If your company uses a custom SSL certificate:

```bash
# Add corp cert to npm
npm config set cafile /path/to/corp-cert.pem

# Or disable strict SSL (less secure, last resort)
npm config set strict-ssl false
```

## Unreliable tools

Some tools in the standard setup may not work in restricted environments. Use `--work-mac` and skip them selectively:

| Tool | Issue | Workaround |
|------|-------|------------|
| Claude Code (cask) | Requires admin | Use Gemini CLI via npm instead |
| OpenCode (brew tap) | May need brew setup | Install via npm: `npm install -g opencode-ai` |
| Homebrew (new install) | Requires sudo for `/usr/local` | Use pre-existing brew if present, or skip with `--work-mac` |
| iTerm2 | Requires admin | Use built-in Terminal.app |

## Minimal footprint mode

To install only what's needed for Gemini CLI + shell helpers:

```bash
# 1. Install nvm + Node (if not present)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc && nvm install --lts

# 2. Install Gemini CLI
npm install -g @google/gemini-cli

# 3. Bootstrap (skip packages, work-mac mode)
./bootstrap.sh --work-mac

# 4. Set API key
./scripts/auth-ai-tools.sh
```

Total: ~5 minutes, no sudo, no Homebrew.

## Validate your setup

```bash
bash ./scripts/doctor.sh
```

Expected output:
- `gemini` — ✅ (primary AI tool)
- Shell helpers — ✅ (repo-terminal-ready, etc.)
- GEMINI.md in toolkit config — ✅

Claude Code and OpenCode may show ❌ — that is expected in work-Mac mode.

## Troubleshooting

**`npm install -g` fails with EACCES**

Your npm prefix needs to be in a user-writable directory:

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Then retry `npm install -g @google/gemini-cli`.

**`gemini auth` fails behind proxy**

Use API key auth instead (Option 1 above). OAuth flows often fail behind corporate proxies.

**Toolkit download fails (fetch_toolkit)**

The bootstrap will fall back to local-only config automatically. You can also set:

```bash
TOOLKIT_DIR_OVERRIDE=~/path/to/local-toolkit ./bootstrap.sh --work-mac
```

Or clone the toolkit manually and point to it:

```bash
git clone https://github.com/LucasSantana-Dev/forgekit.git ~/ai-dev-toolkit
TOOLKIT_DIR_OVERRIDE=~/ai-dev-toolkit ./bootstrap.sh --work-mac
```
