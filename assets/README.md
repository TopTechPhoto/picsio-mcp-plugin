# Assets

Brand artwork for marketplace listings and this repository's README.

| File | What it is | Used by |
| --- | --- | --- |
| `logo.png` | The square Pics.io app mark — yellow camera outline on black, 196×196. | The `logo` field in `.codex-plugin/plugin.json` and `.cursor-plugin/plugin.json`, and the README header. Claude Code's manifest schema has no `logo` field, so `.claude-plugin/plugin.json` omits it and validates clean under `--strict`. |
| `logo-wordmark.svg` | The Pics.io wordmark, taken from the site header. `width`/`height` removed so it scales, and `fill` set to `currentColor` — the source is filled `#fff` for a dark header and would be invisible on a light card. | Documentation and anywhere a horizontal lockup fits better than a square mark. |

`scripts/validate.mjs` checks that every `logo` path in a manifest resolves, so
add the file before you reference it.

## Replacing them

Both files came from public Pics.io surfaces, not from the brand kit. A square
mark exported at **512×512** would be a straight upgrade — plugin cards render
anywhere from 32 px to about 128 px, and a native 512 export stays crisp on a
retina display where the current 196 px source has to be upscaled. Drop the
replacement in as `logo.png` and nothing else needs to change.

Keep the mark legible at 32×32 and leave a little padding inside the canvas so
it doesn't collide with the card edge.
