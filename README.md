# MarkdownTools local recreation

## V40 current additions

Markdown to Slack converts through the shared Markdown parser instead of global replacements. Paste mode matches the Slack composer, and API mode encodes `&`, `<` and `>` for an mrkdwn payload. Code stays literal, tables become monospace blocks, and results over 40,000 characters are rejected. The converter does not post messages. See `../method/V40/流程.md`.

## V39 current additions

My documents supports multi-file Markdown import, saved-library JSON backup and atomic merge restore. Existing documents are not overwritten; identical records are skipped and conflicting versions become copies. Imports preserve the current unsaved workspace buffer. 18 logic checks, real IndexedDB rollback/fresh-browser restore checks and V38 browser regression passed. See `../method/V39/流程.md` for scope and limits.

## V38 current additions

Table merging, headerless output and centering use parsed tables with escaped cell content. Merges accept empty targets, validate the full rectangle and combine selected text by default. Original header labels can be kept as data or removed. Centering produces an actual HTML table; downloads use appropriate extensions. 21 logic checks, browser checks and V37 regression passed. Details: `../method/V38/流程.md`.

## V37 current additions

Naming converters retain the reference-compatible ASCII default and offer an optional Unicode/camelCase mode. Alternative formats now have individual copy controls. 15 rule checks, 50 default comparisons, 12 preserved original-site examples and browser checks passed; V36 text comparison regression also passed. The Unicode rules are a local extension, not a claim of original-site equivalence. See `../method/V37/流程.md`.

## V36 current additions

Text Compare now aligns actual insertions/deletions and supports lines, words and characters, with highlighted results, file import, swap, copy and report downloads. Long inputs are not silently truncated; resource limits are explicit. 17 logic checks plus 100 generated cases, browser checks and V35 XLSX regression passed. Details: `../method/V36/流程.md`.

## V35 current additions

Markdown tables now export as real `.xlsx` workbooks, with one sheet per table, frozen/filterable headers and conservative numeric typing. Leading-zero identifiers, long numeric identifiers and formula-like text are preserved as text; an all-text mode is also available. 18 logic checks, actual browser downloads, independent Artifact Tool import and native Microsoft Excel read-only checks passed. Details and limitations: `../method/V35/流程.md`.

## V34 current additions

OpenAPI to Markdown now renders local references, inherited/overridden parameters, request bodies, response content, schema summaries, examples and security requirements from JSON or YAML. Missing/circular/external references produce notes; external documents are not fetched. It generates documentation rather than performing full OpenAPI/JSON Schema validation. 25 converter checks, browser import/preview/download checks, 44 remote-link checks and 42 local checks passed. See `../method/V34/流程.md`.

## V33 current additions

The link checker now offers a separate **Check remote URLs** action. It checks up to 20 distinct HTTP/HTTPS URLs through the server, follows bounded redirects, distinguishes restricted access from errors and exports JSON results. Only URLs are posted; local document checks remain available. Private/reserved addresses are blocked and checked DNS addresses are pinned to connections. 44 remote checks, three real network observations, 42 local checks and browser regression passed. See `../method/V33/流程.md`.

## V32 current additions

Markdown linting distinguishes opening/closing fences, and fixes preserve code blocks and intentional hard line breaks. Corrected Markdown can be moved back into the input. Local link checks resolve definitions written after use. TOC generation and previews share heading anchors, including duplicate and Chinese headings, with working clickable previews. 42 logic checks, browser interaction checks and V31/V30 regressions passed. V32 local checks do not request remote URLs; V33 adds a separate optional action. Details: `../method/V32/流程.md`.

## V31 current additions

Four writing/conversion/API guides are available under `/guides`, with guide search, reference downloads and proper missing-page responses. Public routes and metadata share one registry. Two old syntax URLs redirect to their canonical routes. All 141 captured reference sitemap URLs return successfully locally; this is route coverage, not a claim of complete behavior or visual equivalence. Build, browser checks and V30/V28 regressions passed. Details: `../method/V31/流程.md`.

## V30 current additions

Light, dark and system appearance modes persist across pages and tabs. Geist fonts are bundled locally. The editor can save named documents to My documents, share local links and reopen existing documents for editing. A real PNG Open Graph image is generated. Browser checks for these additions and V29/V28 regressions passed; see `../method/V30/流程.md`. These additions do not establish complete equivalence with the reference website.

## V29 current behavior

Six category hubs, Ctrl/Cmd+K global tool search, route metadata, sitemap, robots and web manifest are available. `/workspace` saves local documents in IndexedDB without account setup. `/d/[id]` opens a saved document only in the same browser; export Markdown to back up or transfer files. Set `NEXT_PUBLIC_SITE_URL` to the deployment address before building. Previous milestone notes below describe history, not proof of complete feature parity. V29 checks and limitations: `../method/V29/流程.md`.

Working implementation built from the observed behavior documented in ../工具页分析.md. Original source bundles are research evidence and are not application dependencies.

## Run

```powershell
$env:PATH = 'F:\node\install;' + $env:PATH
Set-Location F:\REA\markdowntools\replica
npm run dev
```

Open http://127.0.0.1:3000 . Production: `npm run build`, then `npm start`.

## Implemented

Homepage, searchable/category-filtered tool directory, responsive navigation, Markdown editor with sanitized preview, HTML→Markdown, Markdown→HTML, CSV/JSON→Markdown table, visual table editor, basic word count and Markdown formatting. Output copy/download controls are shared.

## Added in milestone 2

Markdown→PDF with A4/Letter/A5 and margin controls, Markdown→DOCX, DOCX→Markdown, PDF text extraction, English OCR, Mermaid editor, Markdown viewer with KaTeX and Mermaid, plain-text extraction, case conversion, table of contents generation and Slack syntax adaptation. The shared Markdown editor also renders diagrams and formulas. Total: 18 tools.

PDF export opens the browser print dialog; choose Save as PDF. OCR initially downloads worker/core/English trained data from the dependency's configured CDN. PDF files stay in browser memory. Uploaded documents are limited to 20 MB. OCR is English-only; it is not a Chinese OCR implementation.

QA: `qa.cjs` covers 8 original browser checks; `qa-advanced.cjs` covers 10 added checks including real DOCX download/import, PDF extraction, English OCR, diagrams, math and print styles. Results are saved as JSON. Test PDF/DOCX files are in this folder.

Dependency audit: 3 moderate findings from mammoth→argparse→sprintf-js. Registry latest sprintf-js remains in the affected range; a forced downgrade of mammoth is not applied. The affected dependency is a command-line parser; DOCX conversion is browser-only here. This is not a claim that the dependency is vulnerability-free.

## Remaining

This is not the complete 98-tool site. Account persistence, remaining tools and closer visual parity are subsequent work. DOCX complex layouts and nested lists need further fidelity work; PDF extraction uses text positions and does not recover original Markdown structure. The independent homepage design preserves the toolkit structure; it is not a pixel-identical copy. Font loading uses Google Fonts; input content is processed by browser code.

## V3 milestone
Six evidence-backed text tools added: snake, kebab, title, alternating case, character counter and reading time. Total: 24 tools. Methods and REA evidence: ../method/V3/流程.md. 18 reference inputs plus 3 controls/layout checks passed; the original 8 browser checks also passed.


## V4 milestone
Five table tools added: Markdown table to CSV/JSON/HTML/LaTeX and table formatter. Total: 29 tools. Evidence and process: ../method/V4/流程.md. Build passed; 21 V4 checks, 8 base checks and 21 V3 checks passed. CSV output quoting, HTML/LaTeX escaping and code-block preservation verified.


## V5
98 basic tool entries. 69 new entries are simplified initial implementations, not complete equivalents. See ../method/V5/流程.md for important limitations. Build and 69-page smoke check passed.
