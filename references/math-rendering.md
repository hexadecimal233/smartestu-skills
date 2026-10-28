# Rendering math

Two jobs look alike and need different tools: reading the LaTeX the platform sends, and producing a picture of your own Chinese-plus-math text. Everything here was executed on this machine on 2026-10-28 unless tagged **inferred**.

## Where math appears in the payload

| Field | Content |
| --- | --- |
| `questionStructure.mainQuestion.questionMd` | stem, Markdown with inline and display math |
| `questionStructure.subQuestions[].questionMd` | 小题 stem |
| `mcqSpec.options[].text` | option text, may contain math |
| `tfSpec.statements[].text` | statement text, may contain math |
| `answerStructure...answerMd` | reference answer |

## What the platform accepts

Verified in `static.smartestu.cn/assets/latex.CI7UeoRk.js`, the preprocessor that feeds KaTeX:

- Delimiters: `\(...\)`, `\[...\]`, `$...$`, `$$...$$`, `\begin{equation}...\end{equation}`.
- A `$` followed by a digit is escaped, so `$5` stays text and never opens math.
- Code fences and inline code are removed before math extraction, then restored.
- Inline math is wrapped in `\displaystyle`, so inline operators render at display height.
- `\ce{...}` and `\pu{...}` are re-escaped for the mhchem extension.
- KaTeX runs with `output: "html"`, `strict: false`, `trust: false`, `maxExpand: 1000`, `maxSize: 20`, `singleDollarTextMath: true`.

Consequence: the site renders LaTeX leniently. A strict renderer can reject input KaTeX accepted, so KaTeX itself is the reference when a formula looks wrong.

The extractor regex, copied from the same file, is a usable starting point for pulling math spans out of `questionMd`:

```js
const MATH = /\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\begin\{equation\}[\s\S]*?\\end\{equation\}/
```

## Pick the renderer by job

| Job | Tool | Reason |
| --- | --- | --- |
| Render platform LaTeX unchanged | MathJax `tex2svg` | same input language, mhchem included, no TeX install |
| Compose your own Chinese plus math card | typst 0.15.1 | page width follows content, CJK layout correct, one 45 MB binary |
| Full LaTeX, `tikz`, custom `.sty` | tectonic | real TeX semantics |

typst does not read LaTeX. Four commands tried through `scripts/render-math.sh`:

```
$\frac{1}{2}$   -> mathcard.typ:3:6: error: unknown variable: rac
$\sum_(i=1)^n$  -> error: unknown variable: um
$\int_0^1$      -> error: unknown variable: nt
$\alpha$        -> error: unknown variable: lpha
```

The backslash is consumed as a typst escape and the remaining letters become an unknown identifier. Sending platform LaTeX to typst fails this way; convert first.

## MathJax recipe

```bash
mkdir -p mj && cd mj && npm i mathjax-full
```

```js
// render.mjs: node render.mjs '<latex>' out.svg
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'
import { writeFileSync } from 'node:fs'

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)
const tex = new TeX({ packages: AllPackages })
const svg = new SVG({ fontCache: 'local' })
const doc = mathjax.document('', { InputJax: tex, OutputJax: svg })
const node = doc.convert(process.argv[2], { display: true })
writeFileSync(process.argv[3], adaptor.outerHTML(node))
```

- `mathjax-full` 3.2.1, Node 26. `AllPackages` already covers mhchem, so `\ce{H2O}` compiles.
- `fontCache: "local"` draws every glyph as a path; the SVG carries no external font dependency for math.
- CJK inside `\text{}` comes out as `<text font-family="serif">设`, so the rasterizer supplies the CJK font. macOS `qlmanage -t` did it correctly; elsewhere use resvg with a font config.
- Verified output for `\text{设 } f(x)=\frac{\sin x}{x}\text{，求 } \lim_{x\to 0} f(x)`: 9517 byte SVG, Chinese glyphs present, formula correct after rasterizing.

Rasterize when a bitmap is required:

```bash
qlmanage -t -s 1400 -o outdir formula.svg   # macOS, writes outdir/formula.svg.png
```

## typst recipe

```bash
typst compile mathcard.typ out.png --ppi 300 --diagnostic-format short --input body="$TEXT"
```

```typst
// mathcard.typ
#set page(width: auto, height: auto, margin: 8pt)
#set text(font: ("PingFang SC",), lang: "zh", region: "CN", size: 11pt)
#eval(sys.inputs.body, mode: "markup")
```

- `#eval(sys.inputs.body, mode: "markup")` is required. A bare `#sys.inputs.body` inserts the string as literal text: `$m$` prints with its dollar signs. This is the one line most posted templates get wrong; verified both ways.
- `page(width: auto, height: auto)` makes a single-line card. A fixed width such as `width: 80mm` wraps.
- Source newlines become spaces between two Chinese runs, which shows as a visible gap. Fix it by importing the `cjk-unbreak` package: `#import "@preview/cjk-unbreak:0.2.3": remove-cjk-break-space` then `#show: remove-cjk-break-space`. The import fetches from the package registry on first use.
- `\/` is a thin space. An unescaped `/` inside math divides.
- Fonts: `PingFang SC` exists on macOS only. For reproducible images pin the font file and compile with `--font-path` plus `--ignore-system-fonts`.
- `--diagnostic-format short` prints `mathcard.typ:3:6: error: ...` and exits 1 without writing a partial file, which suits an agent loop.
- `--ppi` defaults to 144. 300 suits print and high-DPI viewing. Replace the extension with `.svg` for vector output.

Helper that wraps all of this, reading the markup from stdin:

```bash
echo '质量为 $m$ 的物体加速度 $a = F \/ m$' | scripts/render-math.sh --out card.png --ppi 300
```

Verified: 1093x106 PNG, Chinese and math on one line, no wrap. `--svg`, `--font`, `--ppi` are supported, and a typst error returns exit 1 with the diagnostic above.

## LaTeX to typst conversion

| LaTeX | typst |
| --- | --- |
| `\frac{a}{b}` | `a/b` |
| `\sqrt{x}` | `sqrt(x)` |
| `x^{2}` | `x^2` |
| `\lim_{x\to 0}` | `lim_(x -> 0)` |
| `\sum_{i=1}^{n}` | `sum_(i=1)^n` |
| `\int_a^b f\,dx` | `integral_a^b f dif x` |
| `\left( \right)` | `( )` |
| `\cdot`, `\times` | `dot`, `times` |
| `\le`, `\ge`, `\ne` | `<=`, `>=`, `!=` |
| `\infty` | `oo` |
| `\alpha`, `\pi` | `alpha`, `pi` |
| `\begin{cases}...\end{cases}` | `cases(x &"if" x > 0, -x &"otherwise")` |

Every formula row above compiled through `scripts/render-math.sh` on 2026-10-28.

## Cache rendered images

Key the output file on the source text digest, for example `sha256(card_text + ppi).png`. Rerendering the same formula dominates batch time, and a content-addressed name makes retries free.

## Caution before uploading a rendered card

This skill's answer upload path expects 手写 work. The platform flags typeset or reused images: `handwriting_flag`, `plagiarism_flag`, and exercise status `4` NOT_HANDWRITING which is final and blocks resubmission. Rendered cards suit the agent's own reading and explanation output; uploading one as a 作答 image risks a status `4` the student cannot undo.
