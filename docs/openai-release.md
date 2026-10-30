# Build and release the OpenAI / Codex plugin ZIP

This is the canonical release procedure for the ZIP uploaded to the existing
Pics.io plugin in OpenAI Platform. Use the GitHub Actions workflow instead of
assembling the archive by hand.

## Package contract

These values identify the existing OpenAI plugin and its MCP connection. Treat
them as a versioned contract.

| Item | Required value |
| --- | --- |
| OpenAI plugin ID in `plugin.json` | `app-6ab67f879bfc81919e4ffcd24759c639` |
| Display name | `Pics.io` |
| Portable MCP file | `mcp.json` |
| Codex compatibility MCP file | `.mcp.json` |
| MCP server name | `picsio` |
| MCP URL | `https://mcp.pics.io/mcp` |
| Authentication | Reuse the existing OpenAI app connection; omit ZIP auth overrides |
| Release tag format | Bare semantic version, for example `1.0.2` |
| Release asset | `picsio-codex-plugin-<version>.zip` |

Do not change the OpenAI plugin ID back to `picsio`. The other ecosystem
manifests keep `picsio` as their package name. `scripts/validate.mjs` enforces
this intentional difference.

Do not remove either MCP file:

- `mcp.json` is the portable Agent Plugins declaration used by OpenAI package
  ingestion. It declares only `type: "streamable-http"` and the existing URL.
- `.mcp.json` is the Codex compatibility declaration. It uses `type: "http"`
  and is referenced by `.codex-plugin/plugin.json`.

Never add `extensions["com.openai"].auth`, a `clientId`, client secret, access
token, authorization header, or static request headers to either MCP file. The
existing OpenAI app already stores its authentication configuration.

## Validate a change locally

Use Node.js 26. The validator has no npm dependencies.

```bash
node scripts/validate.mjs
```

Before releasing, confirm the portable package identity and MCP connection:

```bash
jq -r '.name' plugin.json
# app-6ab67f879bfc81919e4ffcd24759c639

jq -r '.mcpServers.picsio.url' mcp.json
# https://mcp.pics.io/mcp

jq -e '.mcpServers.picsio.extensions["com.openai"].auth? == null' mcp.json
# true
```

Do not continue if the working tree contains unreviewed changes:

```bash
git status --short
```

## Create a release

The release tag is the source of truth for the ZIP version. The workflow
rewrites every version-bearing manifest in its build workspace, validates the
result, and archives that staged tree. It does not commit the rewritten
versions back to `master`.

1. Merge the intended plugin changes into `master`.
2. Choose a new bare semantic version such as `1.0.2`. Do not prefix it with
   `v`.
3. Create and publish a GitHub release targeting `master`:

   ```bash
   gh release create 1.0.2 \
     --target master \
     --title "1.0.2" \
     --generate-notes
   ```

4. Open **Actions → Release plugin ZIP** and wait for the run to finish.
5. Download `picsio-codex-plugin-1.0.2.zip` from the GitHub release assets.

The workflow uses Node.js 26 on `ubuntu-latest` and performs these checks:

- the tag is a bare `MAJOR.MINOR.PATCH` version;
- all version-bearing manifests are updated to the tag;
- `node scripts/validate.mjs` passes after the update;
- neither MCP file contains an auth override, fixed credentials, or headers;
- `plugin.json`, `mcp.json`, `.mcp.json`, the Codex overlay, skills, and logo
  exist at the ZIP root;
- the ZIP has no wrapper directory, nested ZIP, `.git`, `.DS_Store`, or local
  settings file;
- the generated ZIP is attached to the matching GitHub release.

## Rebuild an existing release

Use this when a release exists but its ZIP is missing or failed validation.

1. Open **Actions → Release plugin ZIP**.
2. Select **Run workflow**.
3. Enter the existing bare release tag, for example `1.0.1`.
4. Run the workflow.

The upload uses `--clobber`, so rerunning replaces an asset with the same name.
The GitHub release must already exist.

## Upload the new package to OpenAI

1. Open the existing Pics.io plugin in
   [OpenAI Platform](https://platform.openai.com/plugins).
2. Choose **Upload new version**. Do not create a second plugin.
3. Upload the generated `picsio-codex-plugin-<version>.zip`.
4. Under **Metadata & Skills**, confirm the package version and automated
   checks.
5. Under **MCPs**, confirm that the existing `picsio` connection and
   `https://mcp.pics.io/mcp` endpoint are preserved.
6. Reconnect if authentication settings changed, then rescan the MCP tools.
7. Complete review information and submit the new draft.

Changing the MCP server origin is not a normal package update. Contact OpenAI
support before changing its scheme, hostname, or port.

## ZIP update or MCP rescan?

Use a new ZIP when changing:

- `plugin.json`, `mcp.json`, authentication configuration, listing metadata,
  icons, assets, or bundled skills;
- the existing plugin package version.

Deploy the server and select **MCPs → Issues → Rescan** without a new ZIP when
changing only hosted tool schemas, descriptions, annotations, or server
implementation.

## Common failures

| Message | Cause | Fix |
| --- | --- | --- |
| `Plugin name must match the existing plugin` | Root `plugin.json` does not use the assigned OpenAI plugin ID. | Restore `app-6ab67f879bfc81919e4ffcd24759c639`; do not change the other ecosystem package names. |
| `Keep the existing MCP connection` | Portable root `mcp.json` is missing from the ZIP. | Restore `mcp.json`, keep the `picsio` server name and URL, rebuild the ZIP, and upload it to the existing plugin. |
| `This app already has authentication configured` | `mcp.json` includes an `extensions.com.openai.auth` override. | Remove the entire auth override and reuse authentication stored on the existing OpenAI app. |
| `plugin_version_unchanged` | The release reused an uploaded version. | Create a release with a new bare semantic version. |
| Release tag does not match package versions | A ZIP was assembled manually or an old workflow was used. | Run the current **Release plugin ZIP** workflow with the intended tag. |
| OAuth uses the wrong client | The ZIP tries to replace authentication stored on the existing app. | Remove the entire auth override from `mcp.json`, rebuild, and upload again. |
| ZIP has an extra top-level directory | The repository folder was zipped instead of its contents. | Use the release workflow; `plugin.json` and `mcp.json` must be at the archive root. |
| Missing `destructiveHint` or other tool annotations | The hosted MCP server omits required tool metadata. | Fix and deploy the MCP server, then rescan; the ZIP cannot override scanned tool descriptors. |

## Official references

- [Package your plugin](https://developers.openai.com/plugins/build/plugins)
- [Upload and submit your plugin](https://developers.openai.com/plugins/deploy/submission)
- [Plugin submission errors](https://developers.openai.com/plugins/deploy/submission-errors)
- [Remote MCP server review requirements](https://developers.openai.com/plugins/deploy/app-review)
- [Plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines)

Review these references before changing package identity, MCP configuration, or
the release workflow. OpenAI submission requirements can change independently
of this repository.
