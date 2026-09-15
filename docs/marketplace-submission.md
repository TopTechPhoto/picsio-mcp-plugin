# Submitting to the official Claude plugin directory

Notes for maintainers. Nothing here is needed to *use* the plugin.

## Don't open a pull request first

`anthropics/knowledge-work-plugins` auto-closes pull requests from non-members.
A workflow (`close-external-prs.yml`) comments and closes on open, and the only
external change it tolerates is adding a marketplace entry whose source repo
**already** backs a live plugin there — which ours does not, yet.

The submission path is the form linked from that bot's comment:

**<https://clau.de/plugin-directory-submission>** (redirects to the
*Submit your plugin to the official marketplace* section of the Claude Code
plugin docs).

Once Anthropic accepts the submission, a maintainer adds the entry themselves
and a bot keeps the pinned SHA current from then on.

## The entry they will add

It lands in `.claude-plugin/marketplace.json` in their repo and looks like this
(the shape used by [PR #940](https://github.com/anthropics/knowledge-work-plugins/pull/940)
and every other partner listing):

```json
{
  "name": "picsio",
  "displayName": "Pics.io",
  "description": "Connect your AI assistant to your Pics.io digital asset library. Browse and search collections, find assets with rich filters — keywords, people, ratings, color labels, file types, dates — read full metadata, and pull safe previews, so answers are grounded in the approved files your team actually ships. Read-only.",
  "category": "productivity",
  "source": {
    "source": "url",
    "url": "https://github.com/TopTechPhoto/picsio-mcp-plugin.git",
    "sha": "<commit sha to pin>"
  },
  "homepage": "https://pics.io"
}
```

`sha` pins the exact commit users install. Get it with `git rev-parse HEAD` on
the commit you want to ship. Categories in use there include `productivity`,
`development`, `design`, `database`, `finance`, `security`, `monitoring`,
`automation`, `deployment`, `learning` and `testing` — `productivity` is where
comparable asset and content tools sit.

## What their automation checks

Worth passing before submitting, since these run on their side after merge.

**Endpoint liveness** (`check-mcp-urls.yml`) — probes every declared http/sse
MCP URL, HEAD then a JSON-RPC `initialize` POST. `401`/`403`/`405`/`5xx` all
pass; only `404`, `410` or a connection failure fail. Our
[`validate.yml`](../.github/workflows/validate.yml) runs the same probe weekly
so we find out before they do.

**Security and privacy review** (`scan-plugins.yml`) — a model reads the whole
cloned repository against the
[Anthropic Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy)
and the [Acceptable Use Policy](https://www.anthropic.com/legal/aup). It fails a
plugin for any of:

| Check | Where we stand |
| --- | --- |
| Ungated `UserPromptSubmit` / `PreToolUse` / `PostToolUse` hooks | We ship no hooks at all; `validate.mjs` fails the build if a `hooks/` directory appears. |
| Undisclosed telemetry — any outbound call to a host other than the declared MCP server, without disclosure *and* an opt-out | None. The only non-MCP destination is `help.pics.io` for public docs, disclosed in the README's "What this plugin does and doesn't do" section. |
| Description that doesn't match behaviour | The description says read-only search over a Pics.io library; that is exactly the tool surface. |
| Credential reads routed cross-service | No code in the repo reads credentials. |
| Coercive or injection-style text in skills, agents, commands or README | None; `CONTRIBUTING.md` makes this a rule for new skills. |
| Dormant code anywhere in the tree — `scripts/`, `.claude/`, `examples/` | Two maintenance scripts, both documented in the README, neither part of the installed surface. |

It also records `may_make_external_network_calls` (true for us — the remote MCP
server and the docs site) and `may_download_additional_software` (false).

## Pre-submission checklist

- [x] `node scripts/validate.mjs` passes.
- [x] `https://mcp.pics.io/mcp` answers OAuth discovery, advertising
      `resource: https://mcp.pics.io/mcp` and the four read-only scopes.
- [x] Version set and `CHANGELOG.md` written.
- [x] `assets/logo.png` present and wired into the Claude, Codex and Cursor
      manifests.
- [x] Repository is public, with a description, homepage and topics set.
- [x] Commit tagged so the pinned SHA has a human-readable name.
- [ ] CI green on `master`, including the endpoint probe.
- [ ] OAuth flow completed end to end in a real client (Claude, then Codex).
- [ ] README install steps verified by someone who has not installed it before.
- [ ] `assets/logo.png` replaced with a 512×512 export from the brand kit —
      see [`assets/README.md`](../assets/README.md).

## Other directories

The same repository serves several listings; keep the manifests in sync when
any of them changes.

| Directory | Manifest | How to submit |
| --- | --- | --- |
| Claude plugin directory | `.claude-plugin/` | The form above |
| Codex / ChatGPT apps | `.codex-plugin/`, `.agents/plugins/` | OpenAI's app submission flow |
| Cursor | `.cursor-plugin/` | Cursor's plugin submission |
| Gemini CLI extensions | `gemini-extension.json` | Installable directly from the repo URL |
| MCP Registry | `server.json` | `mcp-publisher` against <https://registry.modelcontextprotocol.io> |
