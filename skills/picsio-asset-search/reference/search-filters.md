# `picsio_search_assets` — full filter reference

Every parameter is optional and they combine with AND. Mirrors the Pics.io
Search API. Canonical schema: [`mcp-manifest.json`](../../../mcp-manifest.json).

## Text and scope

| Parameter | Type | Notes |
| --- | --- | --- |
| `query` | string | Free text over name, keywords, description and metadata. |
| `search_in` | string[] | Restrict `query` to `_all`, `name`, `title`, `description`, `keywords`, `faces`, `transcripts`, `meta`, `content`. |
| `collection_ids` | string[] | Restrict to these collections. Preferred over free text for topics. |
| `collection_id` | string | Single-value alias of `collection_ids`. |
| `recursive` | boolean | Include sub-collections. Default `true`. |
| `lightboard_id` | string | Restrict to one lightboard (a user's personal collection). |
| `inbox_id` | string | Restrict to one inbox (an upload drop zone). |

## Type and file

| Parameter | Type | Notes |
| --- | --- | --- |
| `type` | enum | `images`, `video`, `audio`, `audioAndVideo`, `text`, `pdf`, `sketch`, `raw`, `photoshop`, `office`, `3d`, `externalLink`. |
| `mime_type` | string | Substring match, e.g. `image/jpeg`, `pdf`. |
| `file_extension` | string | e.g. `jpg`. No dot. |
| `file_name` | string | Substring match on the file name. |
| `file_size_min` / `file_size_max` | number | Bytes. 1 MB = `1048576`. |

## Metadata text

| Parameter | Type | Notes |
| --- | --- | --- |
| `title` | string | Substring of the asset title (distinct from file name). |
| `description` | string | Substring of the description. |
| `content` | string | Text extracted from the file — OCR, PDF and document body. |

## People and tags — ids only

| Parameter | Type | Notes |
| --- | --- | --- |
| `keywords` | string[] | Keyword **ids**. |
| `keywords_match` | enum | `oneOf` (default), `allOf`, `noneOf`. |
| `faces` | string[] | Face / person **ids**. |
| `faces_match` | enum | `oneOf` (default), `allOf`, `noneOf`. |
| `assignees` | string[] | Assigned user **ids**. |
| `assignees_match` | enum | `oneOf` (default), `allOf`, `noneOf`. |
| `created_by` | string[] | Uploader user **ids**. |

These take ids, never display names. With only a name in hand, use `query` —
free text already searches keywords and faces — or narrow by collection.

## Review state

| Parameter | Type | Notes |
| --- | --- | --- |
| `flag` | enum | `flagged`, `unflagged`, `rejected`. |
| `rating` | number | 1–5 stars. |
| `rating_operator` | enum | `equals` (default), `gt`, `lt`. For "4 stars and up" use `rating: 3` + `gt`, or `rating: 4` + `equals` when they mean exactly 4. State which reading you used. |
| `color` | string[] | `yellow`, `orange`, `red`, `green`, `aqua`, `blue`, `purple`, `nocolor`. Teams assign their own meaning to colors — ask rather than assume "red = rejected". |

## Dates — ISO 8601

| Parameter | Notes |
| --- | --- |
| `created_after` / `created_before` | Upload time. `2025-06-01` or a full timestamp. |
| `updated_after` / `updated_before` | Last modification time. |

Resolve relative dates ("last quarter", "since the launch") to absolute dates
before calling, and say which range you used.

## Trash and archive

| Parameter | Notes |
| --- | --- |
| `trashed` | Search the trash **instead of** active assets. |
| `include_archived` | Add archived assets to active results. |

Both are off by default. Turn either on only when the user implies deleted or
archived material, and say that you did.

## Sorting and paging

| Parameter | Notes |
| --- | --- |
| `sort_by` | `score` (relevance), `alphabetical`, `uploadTime`, `updateTime`, `rating`, `color`, `fileSize`, `createTime`, `fileType`, `creator`, `imageResolution`. |
| `sort_order` | `asc` / `desc`. Default `desc`. |
| `limit` | 1–100. |
| `offset` | Results to skip. Page with `offset += limit`. |

`sort_by: "score"` is the right default for a text query; `uploadTime` for
"newest"; `rating` for "best".

## `picsio_search_collections`

| Parameter | Notes |
| --- | --- |
| `query` | Matches collection name, path and description. |
| `parent_id` | With a blank `query`, lists direct children. Must be a 24-character hex id. Omit to list top-level collections. Ignored when `query` is set. |
| `include_archived` | Default `false`. |
| `limit` / `offset` | Same paging as assets. |

Walk the tree by calling with no arguments (top level), then re-calling with
`parent_id` set to the id you want to open.
