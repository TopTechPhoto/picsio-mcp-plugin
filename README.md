<img src="./assets/logo.png" alt="Pics.io" width="72" align="right">

# Pics.io plugin

> Official plugin and extension distribution for the [Pics.io](https://pics.io)
> MCP server.

[![Validate](https://github.com/TopTechPhoto/picsio-mcp-plugin/actions/workflows/validate.yml/badge.svg)](https://github.com/TopTechPhoto/picsio-mcp-plugin/actions/workflows/validate.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)

Pics.io is a digital asset management (DAM) system: a library of collections
and files carrying keywords, faces, ratings, flags, color labels, custom fields
and extracted document text. This repository packages that library as an
installable plugin for AI assistants that speak the
[Model Context Protocol](https://modelcontextprotocol.io/), so your assistant
can answer from the approved files your team actually ships instead of guessing.

It is the canonical public surface for five install paths — **Claude** and
**Claude Code**, **ChatGPT / Codex**, **Cursor**, and **Gemini CLI** — plus the
bundled skills that teach an assistant how to search a DAM well.

**Everything here is read-only.** The tools find and describe assets. They never
upload, tag, rate, move, share or delete anything.

## What you get

### Tools — from the remote MCP server at `https://mcp.pics.io/mcp`

| Tool | What it does |
| --- | --- |
| `picsio_search_collections` | Find collections by name, path or description, or list the children of one. Returns `id`, `name`, `description`, `path`, `has_child`, `archived`. |
| `picsio_search_assets` | Search assets by free text plus ~35 filters — type, keywords, faces, assignees, flag, rating, color label, file size, date ranges, collections — with sorting and paging. |
| `picsio_get_asset` | Full metadata for one asset: keywords, description, collections, dimensions, preview URL. |
| `picsio_get_asset_preview` | A safe preview URL for one asset. Oversized and unsupported files are rejected with an explanation. |

Every tool is annotated `readOnlyHint: true`. The exact schemas the server
advertises are mirrored in [`mcp-manifest.json`](./mcp-manifest.json).

### Skills — installed alongside the tools

| Skill | When it fires |
| --- | --- |
| [`picsio-asset-search`](./skills/picsio-asset-search/SKILL.md) | Finding assets and collections in a library. Teaches the collections-first strategy, how to map plain language onto filters, and how to widen a search that came back empty. |
| [`picsio-help-docs`](./skills/picsio-help-docs/SKILL.md) | Questions about how Pics.io itself works. Locates and reads the right article from the public Help Center at <https://help.pics.io/en/> instead of guessing from how other DAMs behave. |

### Commands — Claude Code and Claude

| Command | Does |
| --- | --- |
| `/picsio:find-assets <what you need>` | Runs a collections-first asset search and reports the hits with previews. |
| `/picsio:docs <question>` | Answers a how-to question from the Help Center, with links. |

## Install

### Claude

**Settings → Connectors → Add custom connector** → `https://mcp.pics.io/mcp`,
then **Connect** and sign in to Pics.io.

On a team plan an owner adds the connector once under **Organization settings →
Connectors**; teammates then connect individually.

### Claude Code

```bash
claude plugin marketplace add TopTechPhoto/picsio-mcp-plugin
claude plugin install picsio@picsio
```

Or from inside a session: `/plugin marketplace add TopTechPhoto/picsio-mcp-plugin`
then `/plugin install picsio@picsio`.

### ChatGPT / Codex

Register the marketplace from your shell:

```bash
codex plugin marketplace add TopTechPhoto/picsio-mcp-plugin
```

Then run `/plugins` inside a Codex session, find **Pics.io**, and install it.

### Cursor

Add the MCP server in **Settings → MCP**, or drop this into
`.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "picsio": { "url": "https://mcp.pics.io/mcp" }
  }
}
```

### Gemini CLI

```bash
gemini extensions install https://github.com/TopTechPhoto/picsio-mcp-plugin
```

Then authenticate:

```
/mcp auth picsio
```

## Authentication

You need a Pics.io account with access to the library you want to search.

The first request that touches a Pics.io tool starts an **OAuth 2.1** flow — your
client opens a browser, you sign in to Pics.io and approve access, and the client
receives a short-lived token. Nothing to paste, no key to store.

The server grants read-only scopes: `assets_read`, `collections_read`,
`keywords_read`, `customFields_read`. Results are always scoped to what your own
Pics.io account can see, so the plugin can never surface an asset you wouldn't
find in the web app.

<details>
<summary>Static token fallback for clients without OAuth support</summary>

Some older MCP clients can't run the OAuth flow. Those can send a Personal API
token (**My Account → API → Personal token** in Pics.io) as a bearer header via
[`mcp-remote`](https://www.npmjs.com/package/mcp-remote):

```json
{
  "mcpServers": {
    "picsio": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote", "https://mcp.pics.io/mcp",
        "--header", "Authorization:${AUTH_HEADER}"
      ],
      "env": { "AUTH_HEADER": "Bearer <your-personal-api-token>" }
    }
  }
}
```

Note the missing space after `Authorization:` — that's an `mcp-remote` quirk, not
a typo. Contact [admin@toptechphoto.com](mailto:admin@toptechphoto.com) if you need this path.

</details>

## Try it

```
Which Pics.io collections hold our approved brand logos?
Find the hero images from our last product launch.
Show me every 5-star photo tagged for the autumn campaign, newest first.
Any PDFs in the Sales collection that mention "enterprise pricing"?
How do I set up AI keywording in Pics.io?
```

## What this plugin does and doesn't do

Worth stating plainly, because an assistant plugin runs with your data:

- **No hooks.** Nothing runs on session start, on your prompts, or around your
  tool calls. The plugin is inert until you ask something Pics.io-related.
- **No telemetry.** This repository ships no analytics, usage pings or crash
  reporting.
- **Two network destinations, both expected.** Tool calls go to
  `https://mcp.pics.io/mcp`. The `picsio-help-docs` skill reads **public**
  documentation pages on `help.pics.io` — it sends nothing about your library or
  account to do so.
- **Read-only, always.** There is no write path. For changes, use the Pics.io
  web app.
- **No bundled code runs on your machine.** The scripts in `scripts/` are
  maintenance tools for this repository, not part of the installed surface.

## Repository layout

| Path | What it is |
| --- | --- |
| `.mcp.json` | Shared MCP server config — Claude Code and Codex read this |
| `.claude-plugin/plugin.json` | Claude Code plugin manifest |
| `.claude-plugin/marketplace.json` | Claude Code marketplace catalog |
| `.codex-plugin/plugin.json` | Codex plugin manifest, including the app-store interface block |
| `.agents/plugins/marketplace.json` | Codex marketplace catalog |
| `.cursor-plugin/plugin.json` | Cursor plugin manifest |
| `gemini-extension.json` | Gemini CLI extension manifest |
| `GEMINI.md` | Context file loaded by the Gemini CLI extension |
| `server.json` | [MCP Registry](https://github.com/modelcontextprotocol/registry) server manifest |
| `mcp-manifest.json` | Mirror of the tool schemas the live server advertises |
| `skills/` | Skills installed with the plugin |
| `commands/` | Claude Code slash commands |
| `scripts/` | Maintenance scripts — manifest validation, Help Center index refresh |
| `assets/` | Brand artwork referenced by the `logo` field and this README |
| `docs/` | Maintainer notes — plugin marketplace and Connectors Directory submissions |
| `LICENSE` / `NOTICE` | Apache-2.0 for this packaging; see `NOTICE` for the service |

## For maintainers

```bash
node scripts/validate.mjs        # manifests, skills, commands, tool references
./scripts/update-help-index.sh   # refresh the bundled Help Center index
```

Both run in CI on every pull request, plus weekly to catch the endpoint
disappearing. See [CONTRIBUTING.md](./CONTRIBUTING.md) before changing a
manifest — the version, name, description and MCP URL are duplicated across
seven files by design, and `validate.mjs` enforces that they stay identical.

## Links

- Pics.io: <https://pics.io>
- Help Center: <https://help.pics.io/en/>
- API reference: <https://api.pics.io>
- Privacy Policy: <https://pics.io/privacy-policy>
- Terms of Use: <https://pics.io/terms-of-use>
- Support: <admin@toptechphoto.com>

## License

This plugin packaging is released under the
[Apache License 2.0](./LICENSE). Pics.io itself is a commercial service governed
by its own Terms of Use — see [`NOTICE`](./NOTICE).
