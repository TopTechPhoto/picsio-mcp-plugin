# Changelog

All notable changes to this plugin are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[semver](https://semver.org/).

## [Unreleased]

## [0.1.0] — 2026-09-15

First public release.

### Added

- Remote MCP server configuration pointing at `https://mcp.pics.io/mcp`, with
  four read-only tools: `picsio_search_collections`, `picsio_search_assets`,
  `picsio_get_asset`, `picsio_get_asset_preview`.
- Manifests for Claude Code, Codex, Cursor and Gemini CLI, plus a
  `server.json` for the MCP Registry.
- `picsio-asset-search` skill — collections-first search strategy, filter
  vocabulary and a full parameter reference.
- `picsio-help-docs` skill — locating and reading the right article from the
  Pics.io Help Center, with a bundled index generated from the site's sitemap.
- `/picsio:find-assets` and `/picsio:docs` slash commands.
- `scripts/validate.mjs` manifest consistency checks and
  `scripts/update-help-index.sh`, both wired into CI alongside an MCP endpoint
  liveness probe.

[Unreleased]: https://github.com/TopTechPhoto/picsio-mcp-plugin/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/TopTechPhoto/picsio-mcp-plugin/releases/tag/v0.1.0
