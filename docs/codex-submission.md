# Submitting to the ChatGPT / Codex plugin directory

Portal: <https://platform.openai.com/plugins>

Approved plugins land in the **universal Plugins Directory shared by ChatGPT
and Codex** — one submission covers both surfaces. Submitting starts a review;
it does not publish. After OpenAI approves, you publish from the portal
yourself.

This is the heaviest of the four submissions: it needs a verified developer
identity, domain verification, demo credentials and eight written test cases.
Budget more time for it than for the Claude or Gemini listings.

## Prerequisites — do these first

1. **Apps Management: Write** on your OpenAI Platform organization role.
   Without it the portal won't let you submit.
2. **Developer identity verification** — individual or business. Business
   verification is the right one for TopTechPhoto and takes longer than you'd
   expect; start it before you need it.
3. **Domain verification** for `pics.io` — the portal issues a token to place
   on the domain. Coordinate with whoever controls the DNS or the web root.

## Manifests in this repository

Codex reads two, and both are already here:

| File | Role |
| --- | --- |
| [`plugin.json`](../plugin.json) | The portable **Agent Plugins 1.0.0** manifest at the plugin root. Primary. OpenAI-specific presentation lives under `extensions."com.openai".interface`. |
| [`.codex-plugin/plugin.json`](../.codex-plugin/plugin.json) | The legacy overlay, explicitly supported as a **compatibility fallback** — read only when the root manifest has no `extensions."com.openai"`. Kept for older Codex builds. |

The portable schema is closed (`additionalProperties: false`) and has no
`skills`, `mcpServers` or `logo` keys — those components are found at their
default locations (`skills/`, `.mcp.json` at the plugin root), which is why
`plugin.json` doesn't declare them. `scripts/validate.mjs` enforces both the
closed key set and the presence of those default paths.

`.agents/plugins/marketplace.json` is the repo-level marketplace catalog, used
for `codex plugin marketplace add TopTechPhoto/picsio-mcp-plugin` and for team
distribution. It is independent of the public directory — you don't need
approval to use it.

## Info tab

| Field | Value |
| --- | --- |
| Plugin name | Pics.io |
| Short description | Search your Pics.io asset library |
| Long description | The shared description — see [`plugin.json`](../plugin.json), keep byte-identical |
| Developer identity | TopTechPhoto (business verification) |
| Logo | `assets/logo.png` — export 512×512 first, see [`../assets/README.md`](../assets/README.md) |
| Category | Productivity |
| Website URL | `https://pics.io` |
| Support URL | `https://help.pics.io/en/` |
| Privacy policy URL | `https://pics.io/privacy-policy` |
| Terms of service URL | `https://pics.io/terms-of-use` |

## MCP tab

| Field | Value |
| --- | --- |
| MCP Server URL | `https://mcp.pics.io/mcp` |
| URL type | **Universal** — one endpoint for every customer, not a template |
| Authentication | OAuth 2.1 with dynamic client registration at `https://mcp.pics.io/oauth/register`; PKCE `S256`; grants `authorization_code` and `refresh_token`; scopes `assets_read`, `collections_read`, `keywords_read`, `customFields_read` |
| Demo credentials | `anthropic.example@pics.io` — the same reviewer account prepared for the Claude submission. Reuse the walkthrough in [`connector-submission.md`](./connector-submission.md) Step 9 verbatim. |
| Content security policy | Not applicable — the server returns no UI, only text and preview URLs |
| Domain verification token | Place where the portal directs, on `pics.io` |

Consider naming the demo account something neutral if OpenAI reviewers get the
same one — `anthropic.example@pics.io` reads oddly in an OpenAI review queue.
A second account, or a rename to something like `directory.demo@pics.io`, costs
nothing and avoids the awkwardness.

## Skills tab

Import from the MCP server, or upload the two bundles in `skills/`:

- `picsio-asset-search` — collections-first search strategy, mapping plain
  language onto the filters, widening an empty result.
- `picsio-help-docs` — locating and reading the right help.pics.io article.

## Prompts tab — starter prompts

Same three as `extensions."com.openai".interface.defaultPrompt`:

```text
Which Pics.io collections hold our approved brand logos?
Find the hero images from our last product launch in Pics.io.
Show me every 5-star photo in Pics.io tagged for the autumn campaign.
```

## Testing tab — five positive, three negative

Positive cases must return results in the demo account. Check each one against
the real library before submitting; a case that returns nothing reads as a
broken tool.

```text
POSITIVE 1 - Collection discovery
  Prompt:  "List the top-level collections in my Pics.io library."
  Expect:  Several collections with ids, names and paths, via
           picsio_search_collections.

POSITIVE 2 - Collections-first asset search
  Prompt:  "Find the images in our brand assets collection, newest first."
  Expect:  The collection is resolved first, then picsio_search_assets runs
           scoped to its id. Results carry names, file types and preview URLs.

POSITIVE 3 - Metadata filtering
  Prompt:  "Show me only the 5-star images from that collection."
  Expect:  A correctly narrowed set using the rating filter - or a clear
           statement that none match.

POSITIVE 4 - Document text search
  Prompt:  "Which PDFs in the library mention pricing?"
  Expect:  Matches found through extracted document text and OCR rather than
           filenames.

POSITIVE 5 - Single asset detail and preview
  Prompt:  "Show me the full metadata and a preview for the first result."
  Expect:  picsio_get_asset returns keywords, description, collections and
           dimensions; picsio_get_asset_preview returns a preview URL that
           renders.

NEGATIVE 1 - Write attempt
  Prompt:  "Delete the oldest asset in that collection."
  Expect:  The plugin does not attempt a write. It states that the Pics.io
           tools are read-only and points the user at the Pics.io web app.
           There is no tool that uploads, tags, rates, moves, shares or
           deletes, so there is nothing to call.

NEGATIVE 2 - No matching assets
  Prompt:  "Find 5-star underwater photographs of the Mariana Trench taken
            with a Hasselblad in 1998."
  Expect:  An honest empty result. The search runs, returns nothing, and the
           answer says so rather than offering a near-miss as if it matched.

NEGATIVE 3 - Content beyond the account's permissions
  Prompt:  "Show me the assets in a collection this account cannot access."
  Expect:  Nothing is returned and nothing is leaked. Results are scoped
           server-side to the signed-in user's Pics.io permissions, so the
           correct answer is that it was not found or is not visible to this
           account.
```

## Global tab

Availability: everywhere Pics.io is sold. Restrict only if a region is
genuinely unsupported.

## Submit tab

Release notes for the first submission:

```text
First public release of the Pics.io plugin. Four read-only MCP tools for
searching collections and assets, reading asset metadata, and fetching safe
previews, plus two skills covering asset search strategy and the Pics.io Help
Center. OAuth 2.1 with dynamic client registration; no write operations.
```

Then the policy attestations. Nothing problematic: the connector is read-only
over our own first-party API, moves no money, generates no AI media, and its
tool descriptions describe behavior without instructing the model how to act.

## Open items

1. **Business verification** — start early, it gates everything else.
2. **Domain verification token** on `pics.io` — needs DNS or web-root access.
3. **512×512 logo** — see [`../assets/README.md`](../assets/README.md).
4. **Demo account** populated and verified against all five positive cases;
   decide whether to reuse `anthropic.example@pics.io` or create a separate one.
5. **Apps Management: Write** on the submitting account's org role.

## Distribution that needs no approval

While the directory review runs, the repo marketplace already works:

```bash
codex plugin marketplace add TopTechPhoto/picsio-mcp-plugin
```

then `/plugins` inside a Codex session. That path is documented in the
[README](../README.md) and is unaffected by the directory submission.
