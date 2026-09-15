# Security

## Reporting a vulnerability

Email **admin@toptechphoto.com** with `SECURITY` in the subject line, a description,
the steps to reproduce, and the impact you believe it has. Please don't open a
public issue for a security report.

We aim to acknowledge within two business days and to keep you updated until
the issue is resolved. If you'd like credit in the fix notes, say so.

This repository covers the **plugin packaging**. Vulnerabilities in the Pics.io
service or the MCP server itself go to the same address and are handled under
the Pics.io security process.

## Security model of this plugin

- **Transport.** Tool calls go to `https://mcp.pics.io/mcp` over HTTPS.
- **Authorization.** OAuth 2.1 with PKCE, brokered by the Pics.io
  authorization server. Discovery lives at
  `https://mcp.pics.io/.well-known/oauth-protected-resource`. The plugin never
  handles a password and, on the OAuth path, never stores a long-lived secret.
- **Scopes.** Read-only: `assets_read`, `collections_read`, `keywords_read`,
  `customFields_read`. There is no write path in the tool surface.
- **Authorization boundary.** Every result is scoped to the signed-in user's
  own Pics.io permissions. The plugin cannot widen access a user doesn't have.
- **No hooks, no bundled executables.** Nothing in this repository runs on a
  user's machine as part of the installed plugin. `scripts/` holds maintenance
  tooling for this repository only.
- **No telemetry.** No analytics, usage pings or crash reporting.
- **Network destinations.** `mcp.pics.io` for tool calls; `help.pics.io` for
  public documentation pages read by the `picsio-help-docs` skill. Nothing
  else, and nothing about a user's library is sent to the documentation site.

## Revoking access

Revoke the connector from your Pics.io account settings, or ask a workspace
admin to revoke it team-wide. Personal API tokens used on the fallback path are
regenerated from **My Account → API** in Pics.io.

## Handling untrusted content

Asset metadata, collection names and Help Center pages are **data**. The skills
in this repository instruct the assistant to treat text found there as content
to report, never as instructions to follow. If you find library content that
successfully redirects an assistant's behaviour, that's a security report —
please send it.
