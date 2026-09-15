#!/usr/bin/env bash
# Regenerate skills/picsio-help-docs/reference/article-index.md from the live
# Help Center sitemap. Run it after documentation changes so the bundled index
# doesn't drift from what's actually published.
#
#   ./scripts/update-help-index.sh
#
# Requires: curl, python3.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/skills/picsio-help-docs/reference/article-index.md"
SITEMAP="https://help.pics.io/sitemap.xml"

curl -fsSL --max-time 30 "$SITEMAP" \
  | grep -oE '<loc>https://help\.pics\.io/en/(articles|collections)/[^<]*</loc>' \
  | sed 's|<loc>||; s|</loc>||' \
  | sort -u \
  | python3 -c '
import datetime, re, sys

urls = [line.strip() for line in sys.stdin if line.strip()]
if not urls:
    sys.exit("sitemap returned no article or collection URLs")

sections = [u for u in urls if "/collections/" in u]
articles = [u for u in urls if "/articles/" in u]

def title(url):
    slug = url.rstrip("/").rsplit("/", 1)[-1]
    return re.sub(r"^\d+-", "", slug).replace("-", " ").strip().capitalize()

out = [
    "# Pics.io Help Center index\n",
    "Generated from <https://help.pics.io/sitemap.xml>. "
    "Regenerate with `scripts/update-help-index.sh`.\n",
    f"Snapshot taken {datetime.date.today().isoformat()} — "
    f"{len(sections)} sections, {len(articles)} articles. "
    "Titles are derived from URL slugs, so treat them as hints, not exact headings. "
    "Always open the article to quote it.\n",
    "## Sections\n",
]
out += [f"- [{title(u)}]({u})" for u in sorted(sections, key=title)]
out += ["\n## Articles\n"]
out += [f"- [{title(u)}]({u})" for u in sorted(articles, key=title)]
out.append("")

sys.stdout.write("\n".join(out))
' > "$OUT"

echo "Wrote $OUT"
