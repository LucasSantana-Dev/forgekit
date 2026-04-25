# Documentation Index

This document lists all documentation files for `ai-dev-toolkit-setup`, with brief descriptions and links.

## Quick Navigation

| File | Purpose | For Whom |
|------|---------|----------|
| [README.md](../README.md) | Quick start and overview | Everyone |
| [OWNERSHIP.md](../OWNERSHIP.md) | File ownership: setup-owned vs toolkit-sourced | Developers, maintainers |
| [TOOLKIT_COMPARISON.md](../TOOLKIT_COMPARISON.md) | Detailed responsibility split with examples | Developers, architects |
| [TOOLKIT_VERSION.md](TOOLKIT_VERSION.md) | How to check and bump the toolkit version pin | Release engineers, contributors |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute to this repo | Contributors |
| [CHANGELOG.md](../CHANGELOG.md) | Release notes and history | Release engineers |

---

## Getting Started

**New to the project?** Start here:

1. Read [README.md](../README.md) for what this repo does
2. Run `./bootstrap.sh` to set up your machine
3. Run `bash ./scripts/doctor.sh` to verify the setup

---

## For Maintainers

**Understanding the codebase?** Read in this order:

1. [OWNERSHIP.md](../OWNERSHIP.md) — which files live here vs upstream
3. [TOOLKIT_COMPARISON.md](../TOOLKIT_COMPARISON.md) — what each repo is responsible for
4. [TOOLKIT_VERSION.md](TOOLKIT_VERSION.md) — how to manage version bumps

---

## For Release Engineers

**Releasing a new version?** Follow this workflow:

1. Review [CHANGELOG.md](../CHANGELOG.md) to see what was added/fixed
2. Use [TOOLKIT_VERSION.md](TOOLKIT_VERSION.md) to check for toolkit updates
3. Follow the release workflow in [TOOLKIT_VERSION.md](TOOLKIT_VERSION.md)
4. Update [CHANGELOG.md](../CHANGELOG.md) with new entries
5. Tag and release on GitHub

---

## For Contributors

**Contributing code?** Read these first:

1. [CONTRIBUTING.md](../CONTRIBUTING.md) — contribution guidelines
2. [OWNERSHIP.md](../OWNERSHIP.md) — understand which files to edit

---

## Documentation Files (Detailed)

### OWNERSHIP.md

**Purpose**: Define the canonical owner for every file and directory.

**Key sections**:
- Ownership rules (setup-owned, toolkit-sourced, generated)
- File map by directory
- Migration phases

**Read if**: You're adding new files, modifying existing ones, or trying to understand the file structure.


**Purpose**: Explain the organizational split between two repos.

**Key sections**:
- Why `ai-dev-toolkit-setup` stays personal (LucasSantana-Dev)
- Why `ai-dev-toolkit` lives on LucasSantana-Dev
- The consumption model
- When to add content to each repo

**Read if**: You're deciding where to make a change, or explaining the architecture to others.

### TOOLKIT_COMPARISON.md

**Purpose**: Detailed responsibility matrix showing what each repo provides.

**Key sections**:
- Core toolkit responsibilities
- Setup repo responsibilities
- Provider-specific vs manual setup
- File reference map
- Usage workflow

**Read if**: You need to know exactly which repo owns a feature, or understand how both repos work together.

### TOOLKIT_VERSION.md

**Purpose**: Manage the pinned toolkit release version.

**Key sections**:
- What gets pinned
- Helper commands (toolkit-version-check, prepare, sync, pr)
- Release-chain workflow
- When to update

**Read if**: You're bumping the toolkit version, or learning how version management works.

### CONTRIBUTING.md

**Purpose**: Guidelines for contributing to this repo.

**Key sections**:
- How to report bugs
- How to submit feature requests
- Development workflow
- Testing requirements

**Read if**: You're planning to contribute code.

### CHANGELOG.md

**Purpose**: Keep track of releases and notable changes.

**Format**: [Keep a Changelog](https://keepachangelog.com/)

**Read if**: You're checking what changed in a release, or preparing a new release.

---

## See Also

- **README.md** — Quick start
- **README.en.md** — English version of README
- **LucasSantana-Dev/forgekit** — Upstream repo with reusable patterns and skills
