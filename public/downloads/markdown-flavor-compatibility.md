# Markdown Flavor Compatibility Matrix

Which Markdown features work on which platforms — 21 features × 8 platforms, every cell verified against official documentation.

- Source page: https://www.markdowntools.io/cheat-sheet
- Dataset version: 2026-07-18 (last verification pass)
- Machine-readable: [CSV](https://www.markdowntools.io/downloads/markdown-flavor-compatibility.csv) · [JSON](https://www.markdowntools.io/downloads/markdown-flavor-compatibility.json)
- Compact PDF: [markdown-flavor-compatibility.pdf](https://www.markdowntools.io/pdf/markdown-flavor-compatibility.pdf)

Legend: ✅ yes · ⚠️ partial · ❌ no

| Feature | Syntax | CommonMark | GitHub | GitLab | Obsidian | Discord | Slack | Reddit | Jupyter / Rmd |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Headings | `# Heading 1` | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ⚠️ partial | ❌ no | ✅ yes | ✅ yes |
| Bold | `**bold text**` | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes |
| Italic | `*italic text*` | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes |
| Strikethrough | `~~struck text~~` | ❌ no | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ⚠️ partial |
| Underline | `<u>text</u> (HTML)` | ❌ no | ⚠️ partial | ❌ no | ⚠️ partial | ✅ yes | ⚠️ partial | ❌ no | ⚠️ partial |
| Tables | `\| A \| B \|<br>\| --- \| --- \|` | ❌ no | ✅ yes | ✅ yes | ✅ yes | ❌ no | ❌ no | ✅ yes | ✅ yes |
| Task lists | `- [x] done<br>- [ ] todo` | ❌ no | ✅ yes | ✅ yes | ✅ yes | ❌ no | ❌ no | ❌ no | ⚠️ partial |
| Footnotes | `Text.[^1]<br><br>[^1]: The note.` | ❌ no | ✅ yes | ✅ yes | ✅ yes | ❌ no | ❌ no | ❌ no | ⚠️ partial |
| Math (LaTeX) | `$x^2$` | ❌ no | ✅ yes | ✅ yes | ✅ yes | ❌ no | ❌ no | ❌ no | ✅ yes |
| Mermaid / diagrams | `` ```mermaid<br>graph TD<br>  A --> B<br>``` `` | ❌ no | ✅ yes | ✅ yes | ✅ yes | ❌ no | ❌ no | ❌ no | ⚠️ partial |
| Raw HTML | `<div>text</div>` | ✅ yes | ⚠️ partial | ⚠️ partial | ⚠️ partial | ❌ no | ❌ no | ❌ no | ⚠️ partial |
| Spoilers | `\|\|hidden text\|\|` | ❌ no | ⚠️ partial | ⚠️ partial | ❌ no | ✅ yes | ❌ no | ✅ yes | ❌ no |
| Dynamic timestamps | `<t:1752840000:R>` | ❌ no | ❌ no | ❌ no | ❌ no | ✅ yes | ⚠️ partial | ❌ no | ❌ no |
| Callouts / alerts | `> [!note]<br>> Content` | ❌ no | ✅ yes | ✅ yes | ✅ yes | ❌ no | ❌ no | ❌ no | ❌ no |
| Wikilinks | `[[Page Name]]` | ❌ no | ⚠️ partial | ⚠️ partial | ✅ yes | ❌ no | ❌ no | ❌ no | ❌ no |
| Highlight | `==highlighted text==` | ❌ no | ❌ no | ❌ no | ✅ yes | ❌ no | ❌ no | ❌ no | ❌ no |
| Comments (hidden text) | `%%hidden%%` | ⚠️ partial | ✅ yes | ⚠️ partial | ✅ yes | ❌ no | ❌ no | ❌ no | ⚠️ partial |
| Code blocks | `` ```js<br>code<br>``` `` | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ⚠️ partial | ✅ yes |
| Blockquotes | `> quoted text` | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes |
| Images | `![alt text](image.jpg)` | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ❌ no | ❌ no | ⚠️ partial | ✅ yes |
| Links | `[text](https://example.com)` | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ✅ yes | ⚠️ partial | ✅ yes | ✅ yes |

## Platform sources

- **CommonMark** — https://spec.commonmark.org/0.31.2/ (verified 2026-07-18)
- **GitHub Flavored Markdown** — https://github.github.com/gfm/ (verified 2026-07-18)
- **GitLab Flavored Markdown** — https://docs.gitlab.com/user/markdown/ (verified 2026-07-18)
- **Obsidian** — https://help.obsidian.md/syntax (verified 2026-07-18)
- **Discord** — https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline (verified 2026-07-18)
- **Slack** — https://slack.com/help/articles/202288908-Format-your-messages (verified 2026-07-18)
- **Reddit** — https://support.reddithelp.com/hc/en-us/articles/360043033952-Formatting-Guide (verified 2026-07-18)
- **Jupyter / R Markdown** — https://jupyter-notebook.readthedocs.io/en/stable/examples/Notebook/Working%20With%20Markdown%20Cells.html (verified 2026-07-18)

## Notes by feature

### Headings

Source: https://spec.commonmark.org/0.31.2/#atx-headings

- **CommonMark** — ✅ yes: ATX (#) and Setext styles; levels 1–6.
- **GitHub Flavored Markdown** — ✅ yes: Levels 1–6 with auto-generated anchors.
- **GitLab Flavored Markdown** — ✅ yes: Levels 1–6, Setext alternative; auto anchors.
- **Obsidian** — ✅ yes: Levels 1–6; appear in the outline pane.
- **Discord** — ⚠️ partial: H1–H3 (# to ###) plus -# subtext only.
- **Slack** — ❌ no: Not in message formatting; canvases only.
- **Reddit** — ✅ yes: Six levels; Setext underline style also works.
- **Jupyter / R Markdown** — ✅ yes: Supported in Jupyter cells and R Markdown.

### Bold

Source: https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis

- **CommonMark** — ✅ yes: ** or __ delimiters.
- **GitHub Flavored Markdown** — ✅ yes: ** or __.
- **GitLab Flavored Markdown** — ✅ yes: ** or __.
- **Obsidian** — ✅ yes: ** or __.
- **Discord** — ✅ yes: **text** only; __ is underline here.
- **Slack** — ✅ yes: *text* markup or the toolbar button.
- **Reddit** — ✅ yes: ** or __.
- **Jupyter / R Markdown** — ✅ yes: ** or __ in both.

### Italic

Source: https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis

- **CommonMark** — ✅ yes: * or _ delimiters.
- **GitHub Flavored Markdown** — ✅ yes: * or _.
- **GitLab Flavored Markdown** — ✅ yes: * or _; intra-word underscores ignored.
- **Obsidian** — ✅ yes: * or _.
- **Discord** — ✅ yes: *text* or _text_.
- **Slack** — ✅ yes: _text_ markup or the toolbar button.
- **Reddit** — ✅ yes: * or _.
- **Jupyter / R Markdown** — ✅ yes: * or _ in both.

### Strikethrough

Source: https://github.github.com/gfm/#strikethrough-extension-

- **CommonMark** — ❌ no: Not in the spec.
- **GitHub Flavored Markdown** — ✅ yes: GFM extension; GitHub also accepts a single ~.
- **GitLab Flavored Markdown** — ✅ yes: GLFM: ~~double tildes~~.
- **Obsidian** — ✅ yes: GFM-style ~~text~~.
- **Discord** — ✅ yes: ~~text~~.
- **Slack** — ✅ yes: ~text~ (single tilde) or the toolbar.
- **Reddit** — ✅ yes: ~~double tildes~~.
- **Jupyter / R Markdown** — ⚠️ partial: R Markdown (Pandoc strikeout): yes; not documented for Jupyter cells.

### Underline

Source: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax

- **CommonMark** — ❌ no: No syntax; raw <u>/<ins> HTML is the only option.
- **GitHub Flavored Markdown** — ⚠️ partial: No Markdown syntax; GitHub documents the <ins> tag.
- **GitLab Flavored Markdown** — ❌ no: No documented underline syntax.
- **Obsidian** — ⚠️ partial: <u> HTML works; no Markdown syntax, and Markdown inside HTML is not processed.
- **Discord** — ✅ yes: __text__ (Discord extension).
- **Slack** — ⚠️ partial: Toolbar only; no markup shortcut.
- **Reddit** — ❌ no: Not supported.
- **Jupyter / R Markdown** — ⚠️ partial: No Markdown syntax; raw <u> passes through to HTML output.

### Tables

Source: https://github.github.com/gfm/#tables-extension-

- **CommonMark** — ❌ no: Not in the spec.
- **GitHub Flavored Markdown** — ✅ yes: GFM tables extension with column alignment.
- **GitLab Flavored Markdown** — ✅ yes: GLFM tables; paste from spreadsheets works.
- **Obsidian** — ✅ yes: Plus Live Preview table editing.
- **Discord** — ❌ no: No table syntax.
- **Slack** — ❌ no: No tables in messages.
- **Reddit** — ✅ yes: Pipe tables; parsing quirks differ between old and new Reddit.
- **Jupyter / R Markdown** — ✅ yes: Jupyter renders GFM tables; R Markdown supports pipe tables.

### Task lists

Source: https://github.github.com/gfm/#task-list-items-extension-

- **CommonMark** — ❌ no: Not in the spec.
- **GitHub Flavored Markdown** — ✅ yes: GFM task list extension.
- **GitLab Flavored Markdown** — ✅ yes: Adds an inapplicable [~] state.
- **Obsidian** — ✅ yes: Any character inside the brackets marks a task complete.
- **Discord** — ❌ no: Renders as a plain list item.
- **Slack** — ❌ no: No Markdown syntax for tasks.
- **Reddit** — ❌ no: Renders as a plain list item.
- **Jupyter / R Markdown** — ⚠️ partial: R Markdown (Pandoc task_lists): yes; not documented for Jupyter cells.

### Footnotes

Source: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#footnotes

- **CommonMark** — ❌ no: Not in the spec.
- **GitHub Flavored Markdown** — ✅ yes: GitHub.com extension; not part of the GFM spec itself.
- **GitLab Flavored Markdown** — ✅ yes: GLFM footnotes.
- **Obsidian** — ✅ yes: Plus inline ^[...] footnotes.
- **Discord** — ❌ no: Renders as literal [^1].
- **Slack** — ❌ no: Not supported.
- **Reddit** — ❌ no: Renders as literal [^1].
- **Jupyter / R Markdown** — ⚠️ partial: R Markdown (Pandoc footnotes): yes; Jupyter cells do not render them.

### Math (LaTeX)

Source: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions

- **CommonMark** — ❌ no: Not in the spec.
- **GitHub Flavored Markdown** — ✅ yes: MathJax on github.com; $ inline and $$ blocks.
- **GitLab Flavored Markdown** — ✅ yes: KaTeX; $`...`$ inline and ```math blocks.
- **Obsidian** — ✅ yes: MathJax; $ inline and $$ blocks.
- **Discord** — ❌ no: Not supported.
- **Slack** — ❌ no: Not supported.
- **Reddit** — ❌ no: No native rendering.
- **Jupyter / R Markdown** — ✅ yes: MathJax in Jupyter cells; LaTeX math in R Markdown.

### Mermaid / diagrams

Source: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams

- **CommonMark** — ❌ no: Renders as a plain code block.
- **GitHub Flavored Markdown** — ✅ yes: Mermaid blocks render as diagrams on github.com.
- **GitLab Flavored Markdown** — ✅ yes: ```mermaid; PlantUML and Kroki also available.
- **Obsidian** — ✅ yes: Native Mermaid rendering in notes.
- **Discord** — ❌ no: Renders as a code block.
- **Slack** — ❌ no: Renders as a code block.
- **Reddit** — ❌ no: Renders as a code block.
- **Jupyter / R Markdown** — ⚠️ partial: JupyterLab 4.1+ renders ```mermaid natively; R Markdown needs the DiagrammeR package.

### Raw HTML

Source: https://spec.commonmark.org/0.31.2/#raw-html

- **CommonMark** — ✅ yes: HTML blocks and inline HTML are part of the spec.
- **GitHub Flavored Markdown** — ⚠️ partial: Sanitized subset; scripts and some tags are stripped.
- **GitLab Flavored Markdown** — ⚠️ partial: Sanitized subset (e.g. <details> and <br>).
- **Obsidian** — ⚠️ partial: Renders HTML, but Markdown inside HTML is intentionally not processed.
- **Discord** — ❌ no: HTML renders as literal text.
- **Slack** — ❌ no: No HTML rendering.
- **Reddit** — ❌ no: Tags render as literal text; only HTML entities work.
- **Jupyter / R Markdown** — ⚠️ partial: Jupyter renders raw HTML; R Markdown passes it to HTML output only.

### Spoilers

Source: https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline

- **CommonMark** — ❌ no: Not in the spec.
- **GitHub Flavored Markdown** — ⚠️ partial: No spoiler syntax; <details> HTML gives collapsible sections.
- **GitLab Flavored Markdown** — ⚠️ partial: No spoiler syntax; <details>/<summary> HTML.
- **Obsidian** — ❌ no: No spoiler syntax.
- **Discord** — ✅ yes: ||text|| hides content until clicked.
- **Slack** — ❌ no: Not supported.
- **Reddit** — ✅ yes: >!text!< syntax — different delimiters from Discord.
- **Jupyter / R Markdown** — ❌ no: Not supported.

### Dynamic timestamps

Source: https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline

- **CommonMark** — ❌ no: Not in the spec.
- **GitHub Flavored Markdown** — ❌ no: Not supported.
- **GitLab Flavored Markdown** — ❌ no: Not supported.
- **Obsidian** — ❌ no: Not supported.
- **Discord** — ✅ yes: <t:unix:format> renders in each viewer’s timezone; seven formats.
- **Slack** — ⚠️ partial: Via <!date^unix^text> in app/bot messages (Slack mrkdwn).
- **Reddit** — ❌ no: Not supported.
- **Jupyter / R Markdown** — ❌ no: Not supported.

### Callouts / alerts

Source: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts

- **CommonMark** — ❌ no: Renders as a plain blockquote.
- **GitHub Flavored Markdown** — ✅ yes: Alerts: NOTE, TIP, IMPORTANT, WARNING, CAUTION.
- **GitLab Flavored Markdown** — ✅ yes: GLFM alerts (note, tip, warning, caution, important).
- **Obsidian** — ✅ yes: 13 types with aliases, folding, and nesting.
- **Discord** — ❌ no: Renders as a plain blockquote.
- **Slack** — ❌ no: Renders as a plain quote.
- **Reddit** — ❌ no: Renders as a plain blockquote.
- **Jupyter / R Markdown** — ❌ no: Quarto (R Markdown’s successor) adds callout blocks; classic R Markdown has none.

### Wikilinks

Source: https://help.obsidian.md/links

- **CommonMark** — ❌ no: Not in the spec.
- **GitHub Flavored Markdown** — ⚠️ partial: [[links]] resolve in GitHub wiki pages only.
- **GitLab Flavored Markdown** — ⚠️ partial: [[Page]] works in wiki pages; regular files and comments do not resolve it.
- **Obsidian** — ✅ yes: Vault-native; auto-updates when the target note is renamed.
- **Discord** — ❌ no: Renders as literal brackets.
- **Slack** — ❌ no: Not supported.
- **Reddit** — ❌ no: Renders as literal brackets.
- **Jupyter / R Markdown** — ❌ no: Renders as literal brackets.

### Highlight

Source: https://help.obsidian.md/syntax

- **CommonMark** — ❌ no: Not in the spec.
- **GitHub Flavored Markdown** — ❌ no: Renders as literal ==.
- **GitLab Flavored Markdown** — ❌ no: Renders as literal ==.
- **Obsidian** — ✅ yes: ==text== marker-style highlight.
- **Discord** — ❌ no: Renders as literal ==.
- **Slack** — ❌ no: Not supported.
- **Reddit** — ❌ no: Renders as literal ==.
- **Jupyter / R Markdown** — ❌ no: Pandoc’s ==mark== extension exists but is off by default.

### Comments (hidden text)

Source: https://help.obsidian.md/syntax#Comments

- **CommonMark** — ⚠️ partial: Via <!-- --> HTML comments; hidden but kept in the output source.
- **GitHub Flavored Markdown** — ✅ yes: GitHub documents hiding content with <!-- --> comments.
- **GitLab Flavored Markdown** — ⚠️ partial: No dedicated syntax; <!-- --> HTML comments.
- **Obsidian** — ✅ yes: %%comment%% hides text in Reading view and on publish.
- **Discord** — ❌ no: Not supported.
- **Slack** — ❌ no: Not supported.
- **Reddit** — ❌ no: Not supported.
- **Jupyter / R Markdown** — ⚠️ partial: <!-- --> hidden in HTML output only.

### Code blocks

Source: https://spec.commonmark.org/0.31.2/#fenced-code-blocks

- **CommonMark** — ✅ yes: Fenced and indented blocks.
- **GitHub Flavored Markdown** — ✅ yes: Fenced, with syntax highlighting.
- **GitLab Flavored Markdown** — ✅ yes: Fenced; 100+ highlight languages.
- **Obsidian** — ✅ yes: Fenced, with syntax highlighting.
- **Discord** — ✅ yes: ``` with optional language.
- **Slack** — ✅ yes: ``` or the toolbar code block.
- **Reddit** — ⚠️ partial: Fenced blocks only on new Reddit; old Reddit supports indented blocks only.
- **Jupyter / R Markdown** — ✅ yes: Fenced blocks; R Markdown chunks also execute code.

### Blockquotes

Source: https://spec.commonmark.org/0.31.2/#block-quotes

- **CommonMark** — ✅ yes: > at the start of a line.
- **GitHub Flavored Markdown** — ✅ yes: > at the start of a line.
- **GitLab Flavored Markdown** — ✅ yes: > at the start of a line.
- **Obsidian** — ✅ yes: > at the start of a line.
- **Discord** — ✅ yes: > for one line; >>> quotes the rest of the message.
- **Slack** — ✅ yes: > markup or the toolbar.
- **Reddit** — ✅ yes: > at the start of a line.
- **Jupyter / R Markdown** — ✅ yes: > at the start of a line.

### Images

Source: https://spec.commonmark.org/0.31.2/#images

- **CommonMark** — ✅ yes: ![alt](url) with optional title.
- **GitHub Flavored Markdown** — ✅ yes: ![alt](url); relative paths and uploads supported.
- **GitLab Flavored Markdown** — ✅ yes: ![alt](url); uploads supported.
- **Obsidian** — ✅ yes: Plus ![[embeds]] for vault files.
- **Discord** — ❌ no: Attachments/embeds only; no Markdown image syntax.
- **Slack** — ❌ no: File uploads only; no Markdown image syntax.
- **Reddit** — ⚠️ partial: No Markdown image syntax; the rich-text editor supports image uploads.
- **Jupyter / R Markdown** — ✅ yes: Standard syntax; Jupyter also supports attachment: references.

### Links

Source: https://spec.commonmark.org/0.31.2/#links

- **CommonMark** — ✅ yes: Inline, reference, and autolinks.
- **GitHub Flavored Markdown** — ✅ yes: Inline, reference, and autolinks.
- **GitLab Flavored Markdown** — ✅ yes: Inline, reference, and autolinks.
- **Obsidian** — ✅ yes: Inline links; [[wikilinks]] are the default.
- **Discord** — ✅ yes: Masked links [text](url) in user messages.
- **Slack** — ⚠️ partial: Composer toolbar or paste-to-link; mrkdwn uses <url|text>.
- **Reddit** — ✅ yes: Inline, reference, and autolinks.
- **Jupyter / R Markdown** — ✅ yes: Inline links in both.

<!-- Generated from the same structured source as https://www.markdowntools.io/cheat-sheet. Regenerate with `npm run generate-flavor-compatibility` instead of editing by hand. -->
