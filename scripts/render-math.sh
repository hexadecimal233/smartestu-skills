#!/usr/bin/env bash
# Render one Markdown+LaTeX line to PNG or SVG with typst.
# Chinese and math mix on one line; page width follows the content, so nothing wraps.

set -euo pipefail

ppi=300
font="PingFang SC"
out=""
format="png"

usage() {
  cat <<'EOF'
usage: render-math.sh [--out PATH] [--ppi N] [--font NAME] [--svg] < input

  --out PATH   output file, default mathcard.png (or mathcard.svg with --svg)
  --ppi N      raster resolution, default 300
  --font NAME  text font, default "PingFang SC"; use "Noto Sans SC" on Linux
  --svg        vector output

Input is typst markup with typst math: $x^2$, $a = F \/ m$ (escape the slash), $$block$$.
LaTeX commands such as \frac do not exist here; write $1/2$ and $lim_(x -> 0)$ instead.
Render platform LaTeX verbatim with MathJax; see references/math-rendering.md.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --out) out="$2"; shift 2 ;;
    --ppi) ppi="$2"; shift 2 ;;
    --font) font="$2"; shift 2 ;;
    --svg) format="svg"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

command -v typst >/dev/null 2>&1 || {
  echo "typst not found; install with: brew install typst" >&2
  exit 2
}

body="$(cat)"
[[ -n "${body//[[:space:]]/}" ]] || {
  echo "empty input; pipe Markdown on stdin" >&2
  exit 2
}

[[ -n "$out" ]] || out="mathcard.$format"
case "$out" in
  /*) out_abs="$out" ;;
  *) out_abs="$(cd "$(dirname "$out")" && pwd)/$(basename "$out")" ;;
esac

# Compile inside the scratch directory so diagnostics name mathcard.typ, not a temp path.
workdir="$(mktemp -d -t mathcard.XXXXXX)"
trap 'rm -rf "$workdir"' EXIT

cat >"$workdir/mathcard.typ" <<EOF
#set page(width: auto, height: auto, margin: 8pt)
#set text(font: ("$font",), lang: "zh", region: "CN", size: 11pt)
#eval(sys.inputs.body, mode: "markup")
EOF

( cd "$workdir" && typst compile mathcard.typ "$out_abs" --ppi "$ppi" --input body="$body" --diagnostic-format short )
printf '%s\n' "$out"
