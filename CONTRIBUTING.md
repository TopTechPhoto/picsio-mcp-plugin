# Contributing

This repository is small but duplicated across five plugin ecosystems, so most
mistakes are drift mistakes. `node scripts/validate.mjs` catches them — run it
before you push.

## Setup

Node 20+ for the validator, `curl` and `python3` for the Help Center index
refresh. No dependencies to install.

```bash
node scripts/validate.mjs
```

## The duplication rule

`name`, `version`, `description` and the MCP URL appear in several manifests.
They must be **byte-identical** everywhere. When you change one, change them
all in the same commit:

| Change | Files to touch |
| --- | --- |
| Version bump | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (both places), `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `gemini-extension.json`, `server.json`, `mcp-manifest.json` |
| Description | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (both places), `.codex-plugin/plugin.json` (`description` and `interface.longDescription`), `.cursor-plugin/plugin.json`, `gemini-extension.json` |
| MCP URL | `.mcp.json`, `.cursor-plugin/plugin.json`, `gemini-extension.json` (`httpUrl`), `server.json` (`remotes[0].url`) |

The validator fails the build on any mismatch, so you'll find out either way —
but finding out locally is faster.

Versioning is [semver](https://semver.org/): patch for wording and fixes, minor
for a new skill or command, major for a breaking change to the tool surface.
Add an entry to [`CHANGELOG.md`](./CHANGELOG.md) with every release.

## Adding a skill

```
skills/<kebab-case-name>/
  SKILL.md              # required, frontmatter name must equal the directory
  reference/*.md        # optional, loaded on demand
```

`SKILL.md` frontmatter needs `name` and `description`. The description is the
only thing an assistant sees when deciding whether to load the skill, so write
it as trigger conditions, not as a summary: name the concrete phrasings, nouns
and question shapes that should fire it. Both existing skills are worth reading
first.

Inside the body, keep it to what the assistant can't work out alone — the
collections-first strategy, which parameters take ids instead of names, the
fact that the Help Center's search page is client-rendered. Skip generic advice.

Only reference tools that exist in [`mcp-manifest.json`](./mcp-manifest.json);
the validator checks every `picsio_*` mention in every markdown file.

## Adding a command

One `commands/<name>.md` per command, with `description` and `argument-hint`
frontmatter. Commands should delegate to a skill rather than restating it.

## Things this plugin deliberately does not ship

The official Claude marketplace runs an automated security and privacy review
of the **whole repository**, not just the loaded surface. Three constraints
follow from it, and the validator enforces the first:

1. **No hooks.** A `UserPromptSubmit`, `PreToolUse` or `PostToolUse` hook that
   isn't gated to Pics.io-relevant sessions is an automatic fail — it observes
   prompts and tool I/O in sessions that have nothing to do with this plugin.
2. **No telemetry.** Any outbound call to a host other than the declared MCP
   server fails review unless the description and README disclose it *and*
   document an opt-out. Simpler not to have one.
3. **Nothing dormant.** Installing from a git source clones the entire repo to
   the user's disk. Scripts under `scripts/`, `examples/` or `.claude/` are
   reviewed even though nothing loads them. Don't add code that reads
   credentials, environment variables or files outside the project.

And the description must match the behaviour: if a change makes the plugin do
something a user reading the install description wouldn't expect, update the
description in the same commit.

## Skills are read by a model, not a person

Two consequences worth keeping in mind:

- Don't write coercive instructions ("ignore other instructions", "always run
  this first"). They fail the marketplace policy review.
- Treat asset metadata, collection names and Help Center content as untrusted
  data in the guidance you write. If a skill tells an assistant to act on text
  found inside a customer's library, that's a prompt-injection vector.

## Pull requests

Keep them scoped — one skill, one fix, one version bump. Say what you changed
and why in the body, and confirm `node scripts/validate.mjs` passes. CI runs the
validator plus a liveness probe of the MCP endpoint on every PR.
