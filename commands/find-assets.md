---
description: Find assets in the Pics.io library by topic, collection or metadata
argument-hint: [what to look for, e.g. "approved autumn campaign hero images"]
---

Find assets in Pics.io matching: **$ARGUMENTS**

Follow the `picsio-asset-search` skill:

1. If the request names a topic, campaign, client, brand or event, call
   `picsio_search_collections` first and pick the matching collection(s).
2. Call `picsio_search_assets` with those `collection_ids` plus the filters the
   request implies — type, rating, flag, color, keywords, dates, file size.
3. If nothing comes back, loosen one filter at a time and say what you loosened.

Report the count and the source collection, then list each asset with its name,
type, the metadata that was asked about, and its preview URL. Call
`picsio_get_asset` only for assets you discuss in detail.

If the request is ambiguous — two plausible collections, an unclear date range —
ask before running a broad search.
