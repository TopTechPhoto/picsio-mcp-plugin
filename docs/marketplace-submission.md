# Submitting to the Claude plugin marketplace

Notes for maintainers. Nothing here is needed to *use* the plugin.

This covers the **plugin** submission — the skills and commands in this
repository. Listing the MCP server itself in the Connectors Directory is a
separate submission with its own portal and its own prepared values; see
[`connector-submission.md`](./connector-submission.md).

## Community, not official — there is no choice to make

Anthropic runs two public marketplaces:

| Marketplace | What it is | How you get in |
| --- | --- | --- |
| `claude-plugins-official` | A curated set maintained by Anthropic. Registered automatically on a user's first interactive Claude Code launch. | **No application process.** Anthropic decides what to include at its discretion, and the submission form does not add plugins here. |
| `claude-community` ([`anthropics/claude-plugins-community`](https://github.com/anthropics/claude-plugins-community)) | The public community marketplace where third-party submissions land after review. Users add it with `/plugin marketplace add anthropics/claude-plugins-community` and install as `@claude-community`. | The submission form below. |

So the target is **community**. Being listed there doesn't preclude Anthropic
later picking the plugin up for the official marketplace — that's their call
either way, and nothing we submit influences which queue it lands in.

## Submit

Use one of the in-app forms:

- **claude.ai** — <https://claude.ai/admin-settings/directory/submissions/plugins/new>
  Requires a Team or Enterprise organization and directory management access;
  organization Owners have it by default.
- **Console** — <https://platform.claude.com/plugins/submit>
  For individual authors not in a Team or Enterprise organization.

## Copy to paste into the form

The form asks for a **plugin description** and **example use cases**. Use these
so the listing matches the manifests — the safety review explicitly fails a
plugin whose description wouldn't lead a user to expect what it actually does.

### Plugin description

Identical to the `description` field in every manifest. Keep them in sync.

> Connect your AI assistant to your Pics.io digital asset library. Browse and
> search collections, find assets with rich filters — keywords, people, ratings,
> color labels, file types, dates — read full metadata, and pull safe previews,
> so answers are grounded in the approved files your team actually ships.
> Read-only.

### Example use cases

**1. Pull the approved assets for a deliverable.**
> *"I'm building the Q4 partner deck — find our current approved logo files and
> the hero photography from the autumn campaign."*
Finds the right collections first, then filters to flagged/high-rated assets and
returns them with previews, so nothing off-brand or superseded gets used.

**2. Answer "do we already have this?" before a shoot or a purchase.**
> *"Do we have any 5-star product photos of the blue colorway from the last
> year?"*
Combines rating, collection and date filters in one pass over the library —
faster than browsing, and it reports honestly when the answer is no.

**3. Audit what's actually in a collection.**
> *"What's in Campaigns / Autumn 2025, and how much of it is video?"*
Walks the collection tree and breaks results down by type, rating and upload
date — useful before a handoff, a migration or a rights review.

**4. Find the file by something other than its name.**
> *"Which PDF in the Sales collection mentions enterprise pricing?"*
Searches text extracted from documents and images (OCR), plus keywords, faces,
assignees and custom metadata — the things people actually remember about a file
when they've forgotten what it was called.

**5. Answer how-to questions about Pics.io itself.**
> *"How do I set up AI keywording, and which plan includes it?"*
Reads the official Help Center and answers with the concrete steps and a link,
instead of guessing from how other DAM products behave.

### Fields to have ready

| Field | Value |
| --- | --- |
| Repository | `https://github.com/TopTechPhoto/picsio-mcp-plugin` |
| Plugin name | `picsio` |
| Display name | Pics.io |
| Homepage | `https://pics.io` |
| License | Apache-2.0 |
| Author contact | `admin@toptechphoto.com` |
| Category | Productivity |
| Requires an account | Yes — a Pics.io account, OAuth 2.1 on first tool call |
| External network calls | Yes — `mcp.pics.io` (tools) and `help.pics.io` (public docs) |
| Downloads software | No |

## After approval — updates are automatic

Approved plugins are pinned to a **specific commit SHA** in the community
catalog, and **CI bumps that pin automatically as you push new commits** to this
repository. So shipping a fix or a new skill is just a normal push — no
resubmission, no form.

Two caveats:

- The public catalog syncs nightly from the review pipeline, so there's a delay
  between approval and the plugin appearing in `marketplace.json`. Check by
  searching for `picsio` in the
  [community catalog](https://github.com/anthropics/claude-plugins-community/blob/main/.claude-plugin/marketplace.json).
- Users only receive updates when the `version` field is bumped, so a content
  change that matters needs a version bump in the same push. See
  [CONTRIBUTING.md](../CONTRIBUTING.md) for the list of files that carry it.

## Don't open a pull request

`anthropics/knowledge-work-plugins` — the Cowork plugin marketplace, a separate
catalog from the two above — auto-closes pull requests from non-members. A
workflow (`close-external-prs.yml`) comments and closes on open, and the only
external change it tolerates is adding an entry whose source repository
*already* backs a live plugin there. The same applies to the community catalog:
entries are written by the review pipeline, not by contributors.

## What the review pipeline checks

**`claude plugin validate`** runs on every submission. Run it locally first:

```bash
claude plugin validate .                              # marketplace manifest
claude plugin validate .claude-plugin/plugin.json     # plugin manifest
```

Both pass under `--strict` as of v0.1.0. Warnings don't fail the review, but a
clean run is a better submission artifact — that's why `.claude-plugin/plugin.json`
carries no `logo` field: Claude Code doesn't recognize one, and the Codex and
Cursor manifests that do use it are validated by their own ecosystems. It isn't
wired into our CI because the check needs the `claude` CLI installed and
possibly authenticated; run it by hand before submitting.

**Automated safety screening** — a model reads the whole cloned repository
against the
[Anthropic Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy)
and the [Acceptable Use Policy](https://www.anthropic.com/legal/aup). It fails a
plugin for any of:

| Check | Where we stand |
| --- | --- |
| Ungated `UserPromptSubmit` / `PreToolUse` / `PostToolUse` hooks | We ship no hooks at all; `validate.mjs` fails the build if a `hooks/` directory appears. |
| Undisclosed telemetry — any outbound call to a host other than the declared MCP server, without disclosure *and* an opt-out | None. The only non-MCP destination is `help.pics.io` for public docs, disclosed in the README's "What this plugin does and doesn't do" section. |
| Description that doesn't match behaviour | The description says read-only search over a Pics.io library; that is exactly the tool surface. |
| Credential reads routed cross-service | No code in the repo reads credentials. |
| Coercive or injection-style text in skills, commands or README | None; `CONTRIBUTING.md` makes this a rule for new skills. |
| Dormant code anywhere in the tree — `scripts/`, `.claude/`, `examples/` | Two maintenance scripts, both documented in the README, neither part of the installed surface. `.claude/` is gitignored. |

It also records `may_make_external_network_calls` (true for us — the remote MCP
server and the docs site) and `may_download_additional_software` (false).

**Endpoint liveness** — the marketplace probes declared http/sse MCP URLs, HEAD
then a JSON-RPC `initialize` POST. `401`/`403`/`405`/`5xx` all pass; only `404`,
`410` or a connection failure fail.
[`validate.yml`](../.github/workflows/validate.yml) runs the same probe weekly
so we find out before they do.

## Pre-submission checklist

- [x] `node scripts/validate.mjs` passes.
- [x] `claude plugin validate` passes on both manifests, under `--strict`.
- [x] `https://mcp.pics.io/mcp` answers OAuth discovery, advertising
      `resource: https://mcp.pics.io/mcp` and the four read-only scopes.
- [x] Version set and `CHANGELOG.md` written.
- [x] `assets/logo.png` present, wired into the Codex and Cursor manifests.
- [x] Repository is public, with a description, homepage and topics set.
- [x] Commit tagged so the pinned SHA has a human-readable name.
- [x] CI green on `master`, including the endpoint probe.
- [ ] OAuth flow completed end to end in a real client (Claude, then Codex).
- [ ] README install steps verified by someone who has not installed it before.
- [ ] `assets/logo.png` replaced with a 512×512 export from the brand kit —
      see [`assets/README.md`](../assets/README.md).

## Other directories

The same repository serves several listings; keep the manifests in sync when
any of them changes.

| Directory | Manifest | How to submit |
| --- | --- | --- |
| Claude community marketplace | `.claude-plugin/` | The forms above |
| Codex / ChatGPT apps | `.codex-plugin/`, `.agents/plugins/` | OpenAI's app submission flow |
| Cursor | `.cursor-plugin/` | Cursor's plugin submission |
| Gemini CLI extensions | `gemini-extension.json` | Installable directly from the repo URL |
| MCP Registry | `server.json` | `mcp-publisher` against <https://registry.modelcontextprotocol.io> |
