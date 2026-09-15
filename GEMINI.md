# Pics.io

[Pics.io](https://pics.io) is a digital asset management (DAM) system. A library
is a tree of **collections** (folders) containing **assets** (files) with rich
metadata: keywords, faces, star ratings, flags, color labels, custom fields,
descriptions and extracted document text.

This extension connects to the Pics.io MCP server at `https://mcp.pics.io/mcp`.
It is **read-only** — it can find and describe assets, never modify, upload,
tag, share or delete them. Point the user at the Pics.io web app for changes.

## Tools

| Tool | Purpose |
| --- | --- |
| `picsio_search_collections` | Find collections by name/path/description, or list the children of one. Returns `id`, `name`, `description`, `path`, `has_child`, `archived`. |
| `picsio_search_assets` | Search assets by free text plus filters. Returns `id`, `name`, file type, collections, preview URL. |
| `picsio_get_asset` | Full metadata for one asset id. |
| `picsio_get_asset_preview` | A safe preview URL for one asset id. |

## How to search well

**Collections first.** For anything naming a topic, campaign, client, brand,
event or product line, call `picsio_search_collections` to get a collection id,
then pass it to `picsio_search_assets` as `collection_ids`. A collection id is
an exact filter; free text over a whole library is noisy.

**Use filters, not a longer query.** Map the user's words onto parameters:
`type` for photos/videos/PDFs, `rating` + `rating_operator` for "our best",
`flag` for approved/rejected, `color` for color-coded workflow stages,
`created_after` / `updated_after` for dates, `file_size_min` / `file_size_max`
for size, `content` for text inside PDFs and documents.

**Ids, not names.** `keywords`, `faces`, `assignees` and `created_by` take ids.
With only a name in hand, put it in `query` — free text already covers keywords
and faces — or narrow by collection. Never invent an id.

**Defaults:** `recursive` true, `sort_order` desc, `*_match` `oneOf`,
`limit` max 100. Page with `offset`.

**On empty results**, loosen one filter at a time — rarest filter first, then
the collection, then shorten the query — and say what you loosened. Report an
empty library honestly rather than offering a near-miss.

## Reporting

Lead with the count and the collection it came from. List name, type, and the
metadata actually asked about. Include preview URLs for visual assets. Results
are scoped to the signed-in user's permissions, so "not found" can mean "not
visible to you" — say so when it matters.

## Documentation

Product questions ("how do I set up AI keywording?") are answered by the Help
Center at <https://help.pics.io/en/>, not by these tools. Search
`site:help.pics.io`, then fetch and read the article before answering.
API reference: <https://api.pics.io>.
