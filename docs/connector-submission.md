# Connectors Directory submission — prepared values

Values to paste into the **remote MCP server** submission portal at
<https://claude.ai/admin-settings/directory/submissions/new>.

This is a **different submission** from the plugin one in
[`marketplace-submission.md`](./marketplace-submission.md). The connector
listing makes `https://mcp.pics.io/mcp` discoverable in
[claude.ai/directory](https://claude.ai/directory) across Claude.ai, Desktop,
mobile, Cowork and Claude Code. The plugin listing distributes this repository's
skills and commands. They're worth doing both, in either order.

Access needed: a Team or Enterprise organization and directory management
access — Owners and Primary owners have it by default.

Every submission is scanned and listed as a **community connector** by default.
Anthropic escalates listings it judges highly useful to **verified** review on
its own; there's nothing to apply for.

---

## Step 2 — Connection

| Field | Value |
| --- | --- |
| Server URL | `https://mcp.pics.io/mcp` |
| Transport | Streamable HTTP |
| How users reach the server | **Universal URL** — one endpoint for everyone |

## Step 3 — Tools

Syncs automatically from the live server. All four are read-only and carry the
required `title` and `readOnlyHint`, so none should be flagged:

| Tool | Title | Annotation |
| --- | --- | --- |
| `picsio_search_collections` | Search Pics.io collections | `readOnlyHint: true` |
| `picsio_search_assets` | Search Pics.io assets | `readOnlyHint: true` |
| `picsio_get_asset` | Get Pics.io asset | `readOnlyHint: true` |
| `picsio_get_asset_preview` | Get Pics.io asset preview | `readOnlyHint: true` |

No write tools, so the "separate read and write tools" rule and the catch-all
`api_request` rejection don't apply. No tool takes a freeform endpoint path, so
no API-docs reference is required in a description.

## Step 4 — Listing

**Server name** (≤100)

> Pics.io

**Tagline** (≤55) — 51 characters

> Search your team's approved photos, videos and docs

Alternates if the reviewer wants the brand in it: *"Search your Pics.io digital
asset library"* (41) or *"Find the approved file, not last year's version"* (47).

**Description** (≤2,000)

> Pics.io is a digital asset management system. This connector gives Claude
> read-only access to your Pics.io library so answers come from the approved
> files your team actually ships, instead of a guess or a stale copy someone
> kept locally.
>
> Claude can browse and search your collection tree, then search assets across
> roughly 35 filters — free text, asset type, file extension, keywords, faces,
> assignees, uploader, star rating, flag state, color label, file size, upload
> and modification dates, and text extracted from documents and images by OCR —
> with sorting and paging. It can pull full metadata for a single asset and a
> safe preview URL for images, video thumbnails and PDFs.
>
> Typical use: finding the current approved logo pack before a deck goes out,
> checking whether a photo of something already exists before commissioning a
> shoot, auditing what a campaign collection actually contains, or locating the
> one PDF that mentions a specific phrase.
>
> Everything is read-only. There is no tool that uploads, tags, rates, moves,
> shares or deletes anything — for changes, users go to the Pics.io web app.
> Access is scoped by OAuth to four read scopes (assets, collections, keywords,
> custom fields) and every result is filtered by the signed-in user's own
> Pics.io permissions, so the connector can never surface an asset that user
> couldn't find in the app themselves.
>
> Requires a Pics.io account. Sign-in happens through OAuth on the first tool
> call — nothing to paste, no key to store.

**Categories** (1–5, picked from the portal's list) — in order of preference:
Productivity, Design or Creative, Content or Marketing, File storage. Pick the
closest matches the portal actually offers.

| Field | Value |
| --- | --- |
| Documentation URL | `https://github.com/TopTechPhoto/picsio-mcp-plugin` — see the open item below |
| Privacy policy URL | `https://pics.io/privacy-policy` |
| Support contact | `admin@toptechphoto.com` |
| Icon | `assets/logo.png` — see the open item below |
| URL slug | `picsio` — **permanent once published**, so agree on it before submitting |

## Step 5 — Use cases

**Primary use cases** — plain text, ASCII only, paste as-is:

```text
Pics.io is a digital asset management system. This connector gives Claude
read-only access to a team's asset library, so answers resolve to specific
approved files instead of guesses.

1. Pull the approved assets for a deliverable.
   Example prompt: "I'm building the Q4 partner deck - find our current
   approved logo files and the hero photography from the autumn campaign."
   Claude locates the relevant collections first, then filters to flagged and
   high-rated assets, so nothing off-brand or superseded ends up in the work.

2. Answer "do we already have this?" before a shoot or a purchase.
   Example prompt: "Do we have any 5-star product photos of the blue colorway
   from the last year?"
   One pass over the library combining rating, collection and date filters -
   and an honest "no" when the library genuinely has nothing matching, which
   is the answer that saves the money.

3. Audit what a collection actually contains.
   Example prompt: "What's in Campaigns / Autumn 2025, and how much of it is
   video?"
   Claude walks the collection tree and breaks the results down by file type,
   rating and upload date. Useful before a handoff, a migration or a rights
   review.

4. Find a file by something other than its name.
   Example prompt: "Which PDF in the Sales collection mentions enterprise
   pricing?"
   Searches text extracted from documents and images by OCR, plus keywords,
   recognized faces, assignees and custom metadata - the things people
   actually remember about a file after they have forgotten what it was
   called.

5. Keep the assistant's answers grounded in the real library.
   Anything that would otherwise be answered from a half-remembered filename
   resolves to a specific asset id with a preview link, scoped to what the
   signed-in user is permitted to see.

All five are read-only. The connector exposes no tool that uploads, tags,
rates, moves, shares or deletes anything; users make changes in the Pics.io
web app.
```

**What users need before connecting**

> A Pics.io account with access to the library they want to search. On a team
> plan an owner enables the connector once for the organization; members then
> connect individually through OAuth. No API key, no configuration.

Confirm before submitting whether MCP access is gated to particular Pics.io
plans — if it is, say which, here.

**Does the connector read data, write data, or both**

> Reads only.

## Step 6 — Company

| Field | Value |
| --- | --- |
| Company name | TopTechPhoto |
| Company website | `https://toptechphoto.com` |
| Primary contact | Pre-filled from the submitting account; `admin@toptechphoto.com` |

## Step 7 — Authentication

**OAuth with dynamic client registration.** Verified against the live server's
discovery documents:

| Property | Value |
| --- | --- |
| Issuer | `https://mcp.pics.io` |
| Registration endpoint | `https://mcp.pics.io/oauth/register` (DCR supported) |
| Authorization / token | `https://mcp.pics.io/oauth/authorize`, `https://mcp.pics.io/oauth/token` |
| PKCE | `S256` |
| Grants | `authorization_code`, `refresh_token` |
| Scopes | `assets_read`, `collections_read`, `keywords_read`, `customFields_read` |
| Protected resource | `https://mcp.pics.io/mcp` |

Not a no-auth server, not a custom connection, and no Anthropic-held client
credentials needed. Authentication is required up front — the server answers an
unauthenticated `POST /mcp` with `401`, so this is not the "starts without auth,
individual tools prompt on demand" case.

## Step 8 — Data handling

| Question | Answer |
| --- | --- |
| Whose API is behind the server | **Our own first-party API.** `mcp.pics.io` is a thin read-only wrapper over `api.pics.io`, both operated by TopTechPhoto. |
| Personal health data | No |
| Sponsored content | No |

## Step 9 — Test & launch

Reviewers need a **fully populated** test account — an empty library reads as a
broken connector. Prepare, then paste into the portal:

- A demo Pics.io account's email and password, on a plan matching what real
  users get.
- A library with enough substance to exercise every tool: a nested collection
  tree, assets with keywords, star ratings, flags and color labels, at least
  one recognized face, a few PDFs or Office documents with extractable text,
  and a mix of images and video.
- Step-by-step access: sign-in URL, then "add `https://mcp.pics.io/mcp` as a
  custom connector in Claude, click Connect, sign in with the credentials
  above".
- Two or three prompts that demonstrably return results in that account, so the
  reviewer doesn't have to guess what to ask.

Before submitting, the portal asks you to confirm you've run every tool
yourself — do that through
[MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) or as a
custom connector in Claude.

## Step 10 — Compliance

Seven acknowledgments, all required: directory guidelines, first-party API
usage, financial transactions, AI media generation, prompt injection,
conversation data collection, public documentation. Nothing here is a problem —
the connector is read-only over our own API, moves no money, generates no AI
media, collects no conversation data, and its tool descriptions describe
behaviour without instructing Claude how to act.

---

## Open items before submitting

1. **Public documentation.** Required by the publish date; a help-center article
   or blog post is enough. The repository README is public and accurate, and can
   stand in, but a `help.pics.io` article titled something like "Connect Pics.io
   to Claude" is the better answer and is what users will look for. Docs can be
   shared privately with Anthropic during review if the article isn't live yet.
2. **Icon.** `assets/logo.png` is 196×196 — fine for a plugin card, likely
   undersized for a directory listing. Export the square mark at 512×512 from
   the brand kit; see [`../assets/README.md`](../assets/README.md).
3. **Test account.** Create and populate it (Step 9). This is the most common
   reason a submission stalls.
4. **Slug.** `picsio` is permanent once published. Confirm it with whoever owns
   the brand before you submit.
5. **Plan gating.** Confirm whether MCP access depends on a Pics.io plan tier,
   and say so in Step 5 if it does.
6. **Exercise every tool** through MCP Inspector or a custom connector, against
   the test account, and keep the output — Step 9 asks you to confirm it and a
   generic error from any tool fails review.

## Escalation

`mcp-review@anthropic.com`. Status and reviewer feedback appear in the
[submissions dashboard](https://claude.ai/admin-settings/directory/submissions).
