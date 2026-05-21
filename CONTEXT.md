# forgekit

A monorepo that publishes a structured registry of Claude Code tools (skills,
hooks, agents, MCP servers, collections, and installable shell tools), a CLI to
install them, and a web UI to browse them.

## Language

**Entry**:
A single publishable unit in the catalog. Every entry has a `kind`, an `id`, a
per-kind definition file (JSON for skill/hook/command/tool, YAML for server/collection,
Markdown for agent/doc/tutorial), bilingual metadata (English + pt-BR), and zero
or more tags. The nine kinds are: `skill`, `hook`, `agent`, `server`, `collection`,
`tool`, `doc`, `command`, `tutorial`. All nine kinds require a
`translations.pt-BR` block; `doc` and `tutorial` translate `title`, while every
other kind translates `name`. Both translate `description`.
_Avoid_: artifact, item (for the entry itself), package, resource, record.

**Id**:
The machine-readable identifier for a catalog entry — used in `adtl install <id>`
and as the entry's directory name. Must be lowercase and hyphen-separated. The
manifest `id` field always matches the entry's directory name.
_Avoid_: slug (too generic); name (id is the install handle, not the display label).

**Name**:
The human-readable display label for a catalog entry — shown in the web UI, CLI search
results, and the catalog index. Distinct from `id`: no format requirement. Doc and
Tutorial entries use `title` instead of `name`.
_Avoid_: title (reserved for doc and tutorial kinds); id (name is display-only, not the
install handle).

**Title**:
The human-readable heading for Doc and Tutorial catalog entries. Replaces `name` for
these two kinds; shown in the web UI and catalog index.
_Avoid_: name (name is used by all other catalog kinds; docs and tutorials use title instead).

**Kind**:
The classification axis that places every catalog entry into exactly one of nine categories: `skill`, `hook`, `agent`, `server`, `collection`, `tool`, `doc`, `command`, `tutorial`. Kind is inferred from an entry's location in the catalog directory tree; contributors name it explicitly only when writing collection members or filtering via the CLI.
_Avoid_: type, category (kind is the canonical term matching the schema and CLI).

**Catalog**:
The structured registry of all entries. Backed by the `packages/catalog/catalog/`
directory tree and queryable via the CLI index (`index.entries`).
_Avoid_: registry, store, library (for the catalog as a whole).

**Skill**:
A `SKILL.md` file whose instructions are loaded into the current Claude session when
invoked by a slash command (`/name`) or auto-invoked by the composite router on
matching prompts. Skills shape Claude's in-session behavior; they do not spawn a
separate process.
_Avoid_: command (too narrow), plugin, extension.

**Editor**:
An AI coding environment or client targeted by a skill's `editors` manifest field.
A skill with no `editors` value is editor-agnostic — simpler to maintain and a
prerequisite for promotion as a Command (Skill-vs-Command gate 4). A skill with
explicit `editors` values is editor-targeted and may require environment-specific
wiring. Enum values span traditional coding environments (`claude-code`, `codex`,
`cursor`) and broader AI clients (`claude-api`, `claude-ai`, `gemini`) that are not
text editors in the conventional sense.
_Avoid_: text editor (the field covers REST API clients and web interfaces, not just
coding IDEs); environment (has distinct meaning in deploy/CI contexts).

**Hook**:
A shell or Python script that the Claude Code runtime executes automatically on a
platform lifecycle event (`UserPromptSubmit`, `PreToolUse`, `SessionStart`, etc.).
Runs as an OS subprocess; does not run within Claude's inference. Installable via
`adtl install <id>`.
_Avoid_: trigger (ambiguous with skill triggers), listener.

**Agent**:
A separate Claude sub-process with a specific model, constrained tool set
(`disallowed_tools`), and a focused role. Defined as a `.md` file in
`.claude/agents/` and launched by the current session via the `Agent` tool.
Installable via `adtl install <id>`.
_Avoid_: bot, assistant, sub-skill.

**Collection**:
A curated, named list of catalog entries from different kinds — skills, agents, hooks,
servers, tools, docs, and commands — packaged as a discoverable entry in its own right.
Unlike tags (which are dimensional attributes applied per entry), a collection tells a
story: it groups related entries into a learning journey or workflow. Members are
installed individually via `adtl install <id>`, not as an atomic unit; collections are
discovery and guidance artifacts, not install bundles. Every member must reference a
catalog entry by its `id`.
_Avoid_: bundle (implies atomic install; collections are member-by-member), group (too
broad; implies a dimensional filter, not a curated narrative), playlist (implies a
fixed sequence; collections group by theme, not order).

**Server**:
A catalog entry that describes an MCP (Model Context Protocol) server — its invocation
signature (`transport`, `command`, `args`), adoption guidance, and tags. Serves as a
discovery and reference artifact; the CLI cannot install servers. Users copy the
invocation details into their own Claude configuration (`claude_desktop_config.json`
or equivalent).
_Avoid_: plugin (MCP servers are separate processes, not extensions of Claude);
integration (too generic); installable (servers are not installable via the CLI).

**Command**:
A static slash command markdown file installed into `~/.claude/commands/<id>.md`.
Unlike a Skill, a Command has no auto-invoke triggers and no SKILL.md structure; it is
a one-shot prompt template invoked only by its explicit slash-command name.
_Avoid_: skill (commands are simpler, static prompt files; skills carry auto-invoke
logic and full session-behavior instructions).

**Doc**:
A standalone reference article published in the catalog web UI — architecture guides,
pattern surveys, AI research summaries. Does not install into Claude's context.
Identified by a `title` field (not `name`); pt-BR translation uses
`translations.pt-BR.title` (not `.name`) + `.description`.
_Avoid_: tutorial (a doc has no `relates_to` links or procedural steps; it is
freestanding reference material).

**Tutorial**:
A step-by-step how-to guide that references one or more catalog entries via a
`relates_to` list. Carries `difficulty` and `time_estimate` metadata. Published to the
web UI; not installed via the CLI. Like Doc, uses `title` (not `name`) as its
primary identifier; pt-BR translation uses `translations.pt-BR.title` + `.description`.
_Avoid_: doc (a tutorial is procedural and anchored to specific catalog entries; a doc
is freestanding reference material).

**Tool**:
A standalone CLI script or binary distributed through the catalog and installable
via `adtl install <id>`. The CLI copies the script to `~/.local/bin/<id>` (or the
path specified in `install.copy_to`) and makes it executable. A tool has a `runtime`
field (`bash`, `python`, `node`, etc.) and lives entirely outside Claude's inference.
_Avoid_: plugin (tools are OS-level executables, not Claude extensions); skill (skills
run inside Claude's session; tools run as separate processes in the shell).

**Tag**:
A kebab-case label (`^[a-z0-9][a-z0-9-]*$`) attached to a catalog entry to support
filtering and discovery. Tags form an open taxonomy — any contributor may introduce
a new tag; no enum is enforced by the schema or validator. Common tags include
`skill-md`, `core`, `rag`, `testing`, `security`, `git`, `deploy`, `mcp`,
`debugging`, `planning`, `orchestration`. Unlike a Collection, a tag is a
dimensional attribute with no narrative; filtering by tag returns all entries that
share that attribute, not a curated sequence.
_Avoid_: category (implies a closed, mutually-exclusive taxonomy; tags are
open and an entry can have many); label (too generic).

**Source**:
The field that tells the catalog where to fetch or reference an entry's content.

For JSON-kind entries (skill, hook, command, tool, agent), two types are actively
used: `git` (content lives at a specific upstream repository ref — used by all
entries imported from GitHub) and `local` (content is bundled within the catalog
directory — used by hooks and locally-authored entries).

For Doc and Tutorial entries, source is an object with three optional attribution
fields: `upstream` (URI to the original content), `path` (file path within the
repository or catalog), and `license`. Entries typically provide at least one; some
provide all three.
_Avoid_: origin (too generic); location (implies a file path, not a content origin);
upstream (reserved for the attribution field in Doc and Tutorial entries).

**Version**:
The semantic version string (`MAJOR.MINOR.PATCH`) identifying a catalog entry's current
revision. Required in manifests for skills, hooks, commands, tools, and agents; absent from
servers, collections, docs, and tutorials. Entries are typically initialized at
`0.1.0`; contributors bump the version when entry behavior changes.
_Avoid_: release (that refers to the catalog publication cycle, not the individual entry's
revision state); build number (which implies machine-generated counters, not semantic versioning).

**Promotion**:
The workflow of converting a local `SKILL.md` (available only to the owner's
sessions) into a catalog entry: writing a `manifest.json` with bilingual metadata,
wiring into at least one collection, and passing `pnpm catalog:validate`. A promoted
skill is discoverable and installable by anyone via `adtl install`.
_Avoid_: publish (implies a release act), import (used for pulling from external
repos, not for the local→catalog workflow), add.

**Import**:
The workflow of adding external GitHub-hosted skills to the catalog. Unlike
Promotion (which originates from locally-authored skills), Import begins with
an external source, is curator-driven, and refuses to overwrite already-imported
entries. Imported entries retain their source repository reference and license.
_Avoid_: promotion (the local→catalog contributor path); sync (import is
one-time, not continuous); upload (implies user-authored content, not
external sourcing).
