---
name: picsio-asset-search
description: Find files, folders and their metadata in a Pics.io digital asset library using the Pics.io MCP tools. Use whenever someone asks to find, locate, list, count or pull assets — photos, videos, logos, PDFs, product shots, brand files — or asks what is in a collection, folder, campaign or lightboard, or asks about an asset's keywords, rating, flag, color label, size or upload date. Also use for phrasings like "do we have a photo of X", "where are the approved logos", "show me the hero images from the spring campaign", or any request naming Pics.io or a DAM library.
---

# Searching a Pics.io library

Pics.io is a digital asset management (DAM) system. The library is a tree of
**collections** (folders) holding **assets** (files). The MCP tools are
**read-only** — you can find and describe assets, never change them.

## Tools

| Tool | What it returns |
| --- | --- |
| `picsio_search_collections` | Collections by name/path/description, or the children of one collection. Gives `id`, `name`, `description`, `path`, `has_child`, `archived`. |
| `picsio_search_assets` | Assets matching text plus filters. Gives `id`, `name`, file type, collections and a preview URL. |
| `picsio_get_asset` | Full metadata for one asset id — keywords, description, collections, dimensions, preview URL. |
| `picsio_get_asset_preview` | A safe preview URL for one asset id. Rejects oversized and unsupported files with an explanation. |

## The one rule that matters: collections first

Free-text search over a large library is noisy. A collection id is a precise
filter. So for anything that names a **topic, campaign, client, brand, event,
product line or team**, do this:

1. `picsio_search_collections` with that name → pick the matching collection(s).
2. `picsio_search_assets` with `collection_ids: [...]` plus any other filters.

Skip step 1 only when the user names a specific file, or when the query is
genuinely library-wide ("every video uploaded last week").

```
User: "Find the hero shots from the autumn campaign."

picsio_search_collections { query: "autumn campaign" }
  → 68f1…a2  Campaigns / Autumn 2025
  → 68f1…b7  Campaigns / Autumn 2025 / Social cutdowns

picsio_search_assets {
  collection_ids: ["68f1…a2"], query: "hero",
  type: "images", sort_by: "score"
}
```

`collection_ids` searches sub-collections too. Pass `recursive: false` to stay
in one level.

## Picking filters

Translate the user's words into filters instead of stuffing everything into
`query` — filters are exact, free text is fuzzy.

| They say | Use |
| --- | --- |
| "photos", "videos", "PDFs", "raw files" | `type` |
| ".jpg", "PNG files" | `file_extension` or `mime_type` |
| "our best", "5-star", "at least 4 stars" | `rating` + `rating_operator` |
| "approved", "rejected", "flagged" | `flag` |
| "the red ones", a color-coded workflow stage | `color` |
| "tagged X", "keyworded X" | `keywords` (ids) — or put the word in `query`, see below |
| "photos of Anna", "shots with the CEO" | `faces` (ids) |
| "uploaded since June", "changed this week" | `created_after` / `updated_after` |
| "big files", "under 2 MB" | `file_size_min` / `file_size_max` |
| "in the text of the PDF", "the slide that mentions X" | `content` (OCR / document text) |
| "deleted", "archived" | `trashed`, `include_archived` |

`keywords`, `faces`, `assignees` and `created_by` take **ids, not names**. If
you only have a name, put it in `query` (free text already covers keywords) or
narrow by collection instead — do not invent ids.

Defaults worth knowing: `recursive` is true, `sort_order` is `desc`,
`*_match` is `oneOf`, `limit` caps at 100.

The full parameter list lives in
[`reference/search-filters.md`](reference/search-filters.md) — read it when a
request needs a filter not in the table above.

## Narrow, then widen

Start specific. If a search comes back empty, loosen one thing at a time and
say what you loosened:

1. Drop the rarest filter (rating, color, flag) before dropping the collection.
2. Broaden the collection (parent instead of child, or `recursive: true`).
3. Shorten `query` to one distinctive word.
4. Try `search_in: ["content"]` for text living inside documents.
5. Only then consider `include_archived: true` or `trashed: true`, and say so.

If it is still empty after that, report that the library has nothing matching.
Never present a near-miss as the answer.

## Reporting results

- Lead with the count and where they came from: *"7 assets in Campaigns /
  Autumn 2025."*
- List name, type, and the metadata the user actually asked about — rating,
  keywords, upload date. Don't dump every field.
- Include the preview URL for visual assets so the user can look.
- Call `picsio_get_asset` only for the handful of assets you are discussing in
  depth. Don't fan out over every search hit.
- Page with `offset` when the user wants more than the first `limit`.
- Say plainly when results are ambiguous — two plausible collections, a query
  that matched on filename noise — and ask which one they meant.

## Boundaries

- Read-only. If asked to upload, tag, rate, move, delete or share, say the MCP
  cannot write and point to the Pics.io web app.
- Results are scoped to the signed-in user's permissions. "Not found" can mean
  "not visible to you" — phrase it that way when it matters.
- Preview URLs come from the tool. Never construct one by hand.
- For *how Pics.io works* rather than *what is in the library* — pricing,
  setup, keywording features, sharing, integrations — use the
  **picsio-help-docs** skill instead.
