# Assets

Brand artwork for marketplace listings.

`logo.svg` (and a `logo.png` fallback at 512×512 on a transparent background)
should hold the official Pics.io mark. They are **not committed yet** — drop
them here from the Pics.io brand kit rather than exporting a favicon, then add
the reference to the manifests:

```json
"logo": "assets/logo.svg"
```

in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` and
`.cursor-plugin/plugin.json`. `scripts/validate.mjs` checks that a `logo` path
actually resolves, so add the files first.

Keep the mark legible at 32×32 — it renders small in plugin lists — and leave
a little padding inside the canvas so it doesn't collide with the card edge.
