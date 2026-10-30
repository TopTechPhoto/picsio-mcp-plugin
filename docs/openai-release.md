# Build and release the OpenAI / Codex plugin ZIP

This is the canonical release procedure for ZIPs uploaded to OpenAI Platform.
It supports creating a new Pics.io plugin and updating an existing plugin. Use
the GitHub Actions workflow instead of assembling the archive by hand.

## Package contract

These values identify the package and its MCP connection. Treat them as a
versioned contract.

| Item | Required value |
| --- | --- |
| Default `plugin.json` name | `picsio` |
| Existing plugin override | Its assigned app ID, supplied through the workflow's `plugin_name` input |
| Display name | `Pics.io` |
| Portable MCP file | `mcp.json` |
| Codex compatibility MCP file | `.mcp.json` |
| MCP server name | `picsio` |
| Default MCP URL | `https://mcp.pics.io/mcp` |
| MCP URL override | An HTTPS URL supplied through the workflow's `mcp_url` input |
| Authentication | Configure or reuse it in OpenAI Platform; omit ZIP auth overrides |
| Release tag format | Bare semantic version, for example `1.0.2`; a manual run can create it automatically |
| Release asset | `<plugin_name>-codex-plugin-<version>.zip` |

Source manifests use `picsio`. Automatic release builds also use `picsio` and
the default MCP URL, which is suitable for creating a new plugin. When updating
an existing plugin, run the workflow manually and set `plugin_name` to the exact
app ID required by OpenAI Platform. Set `mcp_url` only when that package must
connect to a different MCP endpoint. Other ecosystem manifest names always
remain `picsio`.

Do not remove either MCP file:

- `mcp.json` is the portable Agent Plugins declaration used by OpenAI package
  ingestion. It declares only `type: "streamable-http"` and the existing URL.
- `.mcp.json` is the Codex compatibility declaration. It uses `type: "http"`
  and is referenced by `.codex-plugin/plugin.json`.

Never add `extensions["com.openai"].auth`, a `clientId`, client secret, access
token, authorization header, or static request headers to either MCP file. The
plugin's authentication configuration belongs in OpenAI Platform, not the ZIP.

## Validate a change locally

Use Node.js 26. The validator has no npm dependencies.

```bash
node scripts/validate.mjs
```

Before releasing, confirm the portable package identity and MCP connection:

```bash
jq -r '.name' plugin.json
# picsio

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

The release tag is the source of truth for the ZIP version. The workflow also
sets root `plugin.json` to the requested package name, validates the result, and
archives that staged tree. It does not commit build-time changes to `master`.

1. Merge the intended plugin changes into `master`.
2. Open **Actions → Release plugin ZIP → Run workflow**.
3. Leave `tag` blank to increment the highest existing semantic version by one
   patch release. Both bare tags and legacy `v`-prefixed tags are considered,
   but the new tag is always bare. For example, `v0.1.0` produces `0.1.1`.
4. Alternatively, enter the exact bare semantic version to create, such as
   `1.0.2`. If it does not exist, the workflow creates it on the current
   `master` commit. If it already exists, the workflow reuses it.
5. Set optional package-name and MCP-URL overrides, then run the workflow.
6. The workflow creates the GitHub release when needed, builds the ZIP, and
   attaches it to that release.
7. Download `picsio-codex-plugin-1.0.2.zip` from the GitHub release assets.
   An override build uses its selected name, for example
   `app-example-codex-plugin-1.0.2.zip`.

Publishing a GitHub release manually is still supported. Its `release` event
uses the published release tag and builds from that tagged source.

The workflow uses Node.js 26 on `ubuntu-latest` and performs these checks:

- the tag is a bare `MAJOR.MINOR.PATCH` version;
- a manual run creates a missing requested tag on `master`, or creates the next
  patch tag when `tag` is blank;
- a matching GitHub release exists before the ZIP is uploaded;
- the package name is `picsio` by default or the valid `plugin_name` supplied
  to a manual run;
- the MCP endpoint is the default URL or the valid HTTPS `mcp_url` supplied to
  a manual run, synchronized across every packaged manifest;
- all version-bearing manifests are updated to the tag;
- `node scripts/validate.mjs` passes after the update;
- neither MCP file contains an auth override, fixed credentials, or headers;
- `plugin.json`, `mcp.json`, `.mcp.json`, the Codex overlay, skills, and logo
  exist at the ZIP root;
- the ZIP has no wrapper directory, nested ZIP, `.git`, `.DS_Store`, or local
  settings file;
- the generated ZIP is attached to the matching GitHub release.

## Rebuild an existing release

Use this when a tag or release exists but its ZIP is missing or failed
validation.

1. Open **Actions → Release plugin ZIP**.
2. Select **Run workflow**.
3. Enter the existing bare release tag, for example `1.0.1`. Leave it blank
   only when you intend to create a new patch release.
4. For a new plugin, leave `plugin_name` as `picsio`. For an update, enter the
   existing plugin's exact assigned app ID.
5. Leave `mcp_url` at `https://mcp.pics.io/mcp`, or enter the custom HTTPS MCP
   endpoint that should be written to every manifest in this ZIP.
6. Run the workflow.

The upload uses `--clobber`, so rerunning replaces an asset with the same name.
If the selected tag has no GitHub release, the workflow creates one. Manual
runs package the latest `master` branch and attach that build to the selected
release tag; they do not check out an older tag's source.

## Create a new OpenAI plugin

1. Build with the default package name `picsio`.
2. Open [OpenAI Platform](https://platform.openai.com/plugins) and choose
   **Upload new or existing plugin**.
3. Upload `picsio-codex-plugin-<version>.zip` as a new plugin.
4. Under **Metadata & Skills**, confirm the package version and automated
   checks.
5. Under **MCPs**, connect `https://mcp.pics.io/mcp` and configure OAuth/DCR
   for the new app.
6. Complete domain verification and rescan the MCP tools.
7. Complete review information and submit the new draft.

## Update an existing OpenAI plugin

1. Copy the exact package name required by the existing plugin. OpenAI may show
   an assigned ID such as `app-...` in a name-mismatch error.
2. Run **Release plugin ZIP** manually with the release tag and that exact value
   in `plugin_name`.
3. Open the existing plugin and choose **Upload new version**.
4. Upload `<assigned-app-id>-codex-plugin-<version>.zip` and confirm the
   existing MCP connection remains.
5. Reconnect only when changing authentication in OpenAI Platform, then rescan.

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
| `Plugin name must match the existing plugin` | An update ZIP used `picsio` instead of the existing plugin's assigned package name. | Run the workflow manually and pass the exact required value through `plugin_name`. |
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
