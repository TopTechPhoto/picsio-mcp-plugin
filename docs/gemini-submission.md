# Listing in the Gemini CLI extensions gallery

There is **no form, no pull request and no email**. Google's crawler finds
extensions by GitHub topic and reads the manifest itself, daily. Listing is
three conditions, all of which this repository already meets:

| Condition | Status |
| --- | --- |
| Public GitHub repository | Yes |
| Repository topic `gemini-cli-extension` | Set — see [repo topics](https://github.com/TopTechPhoto/picsio-mcp-plugin) |
| `gemini-extension.json` at the repository root (or at the root of a release archive) | Yes |

Google states plainly that it does not vet, endorse or guarantee gallery
extensions, so there's no review queue to wait on and no approval to chase.
Gallery: <https://geminicli.com/extensions/>.

## Cut a GitHub Release

Users can install straight from the repository:

```bash
gemini extensions install https://github.com/TopTechPhoto/picsio-mcp-plugin
```

but a **GitHub Release** is the better path — it skips the repository clone, so
installation is noticeably faster, and it's what the CLI checks for updates.
The CLI looks specifically for the release marked **Latest**.

```bash
# from a clean master with the tag already pushed
gh release create v0.1.0 \
  --title "Pics.io v0.1.0" \
  --notes-file - <<'EOF'
First public release. Read-only Pics.io MCP tools plus two skills.
EOF
```

**The `version` in `gemini-extension.json` must match the release tag.** Ours is
`0.1.0` against tag `v0.1.0` — the conventional `v` prefix, which tooling
normally strips. If the gallery or an update check ever disagrees, drop the
prefix from the tag rather than putting a `v` into the manifest, where it
wouldn't be valid semver for the other four ecosystems.

Every release from here on needs the version bumped in all the manifests first;
`node scripts/validate.mjs` enforces that they agree, and
[CONTRIBUTING.md](../CONTRIBUTING.md) lists the files.

## What users get

`gemini-extension.json` declares the MCP server over streamable HTTP
(`httpUrl`, not the SSE `url` field) and loads [`GEMINI.md`](../GEMINI.md) as
the extension's context file — the collections-first search strategy, the
filter vocabulary, and the rule that ids aren't names. That file is the Gemini
equivalent of the two skills the Claude and Codex packages ship.

After install, users authenticate with:

```
/mcp auth picsio
```

## Verifying the listing

The crawler runs daily, so allow a day or two, then search for **Pics.io** in
the [gallery](https://geminicli.com/extensions/). If it hasn't appeared after a
few days, check in this order:

1. The `gemini-cli-extension` topic is still on the repository — topics get
   dropped by accident during repo settings edits.
2. `gemini-extension.json` parses and sits at the repository root, not in a
   subdirectory.
3. The repository is public and not archived.

## Moving the repository later

If this ever moves to a different repository, Gemini's `migratedTo` flow needs
**at least one release on the new repository** before the CLI will accept it as
a valid update source. Cut a release there first, then point `migratedTo` at it.
