"""Build index.html from the files in src/.

Usage:  python build.py

The site is plain HTML, CSS and JavaScript with no dependencies. Edit the files
in src/, run this script, and commit the regenerated index.html. Scripts are
concatenated in filename order, so keep the numeric prefixes.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

FAVICON = (
    "data:image/svg+xml,"
    "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
    "%3Ccircle cx='32' cy='32' r='26' fill='none' stroke='%23a2501a' stroke-width='5'/%3E"
    "%3Cline x1='32' y1='32' x2='32' y2='11' stroke='%23a2501a' stroke-width='5' stroke-linecap='round'/%3E"
    "%3Ccircle cx='32' cy='11' r='6' fill='%23a2501a'/%3E%3C/svg%3E"
)

RESET = """<style>
:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0}
img{max-width:100%}
[hidden]{display:none!important}
</style>"""


def build() -> Path:
    head = (SRC / "head.html").read_text(encoding="utf-8")
    body = (SRC / "body.html").read_text(encoding="utf-8")
    scripts = "\n".join(p.read_text(encoding="utf-8") for p in sorted(SRC.glob("*.js")))
    page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="{FAVICON}">
<meta property="og:title" content="Quantum Computing A-Z">
<meta property="og:description" content="An interactive guide to quantum computing, from the first qubit to fault-tolerant error correction, by Sai Ganesh Chidambaram.">
<meta property="og:type" content="website">
{RESET}
{head.strip()}
</head>
<body>
{body.strip()}
<script>
{scripts}
</script>
</body>
</html>
"""
    out = ROOT / "index.html"
    out.write_text(page, encoding="utf-8", newline="\n")
    return out


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path} ({path.stat().st_size:,} bytes)")
