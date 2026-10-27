'use client';
import useExample from './useExample';
import { htmlTableMarkdown, messageMarkdown } from './conversions';
import { ToolHelp } from './Content';
import { SiteNav } from './SiteHome';
import { useState, type ClipboardEvent } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Turndown from 'turndown';
import { RichPreview } from './Advanced';
import inventory from './v4-inventory.json';
import { runDepth } from '../lib/depth';
import { excelMarkdown, rowsToMarkdown } from '../lib/excel';
import RemoteLinkCheck from './RemoteLinkCheck';

export const remainingTools = inventory.rows.filter(row => row.status === '未实现').map(row => ({ slug: row.slug, name: row.name, description: row.acceptance, category: row.category }));

function markdownFromHtml(html: string) {
  const turndown = new Turndown({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  turndown.addRule('strike', { filter: ['del', 's'], replacement: content => `~~${content}~~` });
  turndown.addRule('task', {
    filter: node => node.nodeName === 'LI' && Boolean(node.querySelector?.('input[type="checkbox"]')),
    replacement: (content, node) => `- [${(node as HTMLElement).querySelector('input')?.hasAttribute('checked') ? 'x' : ' '}] ${content.trim()}\n`
  });
  return turndown.turndown(html);
}

function prepareHtml(slug: string, html: string) {
  if (slug === 'confluence-to-markdown') return html
    .replace(/<ac:structured-macro\b[^>]*ac:name="code"[\s\S]*?<ac:plain-text-body>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/ac:plain-text-body>[\s\S]*?<\/ac:structured-macro>/gi, '<pre><code>$1</code></pre>')
    .replace(/<ac:structured-macro\b[^>]*ac:name="info"[\s\S]*?<ac:rich-text-body>([\s\S]*?)<\/ac:rich-text-body>[\s\S]*?<\/ac:structured-macro>/gi, '<blockquote><p><strong>Note</strong></p>$1</blockquote>');
  return html.replace(/<(span|b|i|font)\b[^>]*>/gi, '<$1>').replace(/\sclass="[^"]*"/gi, '').replace(/\sstyle="[^"]*"/gi, '');
}

export default function Remaining({ slug }: { slug: string }) {
  const tool = remainingTools.find(item => item.slug === slug)!;
  const [input, setInput] = useState('');
  const [extra, setExtra] = useState('');
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState('');
  const [canApplyFixes,setCanApplyFixes]=useState(false);
  const [options, setOptions] = useState<Record<string, string>>({ platform: 'obsidian', type: 'NOTE', color: 'green', kind: 'inline', format: 'markdown', template: 'library', method: 'markdown', mode: 'line', header: 'yes', alignments: 'left,left' });
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  useExample(setInput, setExtra);
  const setOption = (key: string) => (event: { target: { value: string } }) => setOptions(current => ({ ...current, [key]: event.target.value }));

  async function run(next: Record<string, string> = options) {
    setCanApplyFixes(false);
    try {
      let result = input;
      let note = 'Result ready.';
      let downloadName = 'result.md';
      if (slug === 'html-table-to-markdown') result = htmlTableMarkdown(input);
      else if (slug === 'markdown-to-discord' || slug === 'markdown-to-whatsapp') { result = messageMarkdown(input, slug.endsWith('discord') ? 'discord' : 'whatsapp'); note = 'Message formatting converted. Check nested lists in the destination app.'; }
      else if (slug === 'url-to-markdown') {
        const response = await fetch('/api/fetch-url', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: input.trim() }) });
        const payload = await response.json();
        if (!response.ok) throw Error(payload.error || 'Fetch failed');
        result = `# ${payload.title}\n\n${markdownFromHtml(payload.html)}`;
        note = 'Fetched through the local server. Scripts, navigation and footers were removed before conversion.';
      } else if (slug === 'excel-to-markdown') {
        result = bytes ? excelMarkdown(bytes, next.header !== 'no') : rowsToMarkdown(input.split(/\r?\n/).filter(Boolean).map(row => row.split('\t')), next.header !== 'no');
        note = bytes ? 'Workbook sheets were converted. Date cells can remain Excel serial numbers when the file stores them as numbers.' : 'Tab-separated text was converted. Choose an .xlsx or .xls file for a workbook.';
      } else if (['google-docs-to-markdown', 'notion-to-markdown', 'rich-text-to-markdown', 'confluence-to-markdown'].includes(slug)) {
        result = markdownFromHtml(prepareHtml(slug, input));
        note = 'HTML formatting was converted. Paste from the source app to capture its HTML, or paste the HTML source.';
      } else if (slug === 'markdown-to-google-docs' || slug === 'markdown-to-rich-text') {
        result = DOMPurify.sanitize(marked.parse(input, { async: false }) as string);
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([result], { type: 'text/html' }), 'text/plain': new Blob([input], { type: 'text/plain' }) })]);
          note = 'Rich text is on the clipboard. Paste it into the document. HTML is shown below if the clipboard is unavailable.';
        } catch { note = 'Clipboard writing was blocked. Copy the HTML below or allow clipboard access and run again.'; }
      } else {
        const converted = await runDepth(slug, input, extra, next);
        if (converted.navigate) {
          sessionStorage.setItem('replica:handoff', converted.output);
          location.href = converted.navigate;
          return;
        }
        result = converted.output;
        note = converted.message;
        downloadName = converted.downloadName || downloadName;
      }
      setOutput(result);
      setCanApplyFixes(slug==='markdown-lint'&&next.fix==='yes');
      setMessage(note);
      setOptions(current => ({ ...current, downloadName }));
    } catch (error) { setOutput(''); setMessage('Error: ' + (error as Error).message); }
  }

  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const html = event.clipboardData.getData('text/html');
    if (!html || !['google-docs-to-markdown', 'notion-to-markdown', 'rich-text-to-markdown', 'confluence-to-markdown'].includes(slug)) return;
    event.preventDefault();
    setInput(html);
  }

  const downloadName = options.downloadName || (slug === 'markdown-table-to-excel' ? 'table.csv' : 'result.md');
  return <><SiteNav /><main className="toolmain"><div className="toolheading"><div><span className="eyebrow">{tool.category}</span><h1>{tool.name}</h1><p>{slug==='openapi-to-markdown'?'Turn an API specification into readable Markdown documentation.':tool.description}</p></div></div>
    <div className="advancedbar"><button className="primary" onClick={() => run()}>Generate / Convert</button>
      {slug === 'markdown-lint' && <><button className="secondary" onClick={() => run({ ...options, fix: 'yes' })}>Apply fixes</button><button className="secondary" disabled={!canApplyFixes} onClick={()=>{setInput(output);setOutput('');setCanApplyFixes(false);setMessage('Fixed Markdown moved to input. Run the check again.')}}>Use fixed Markdown</button></>}
      <label>Open files<input type="file" accept={slug === 'excel-to-markdown' ? '.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : '.md,.txt,.html,.json,.csv,.tsv,.yaml,.yml'} onChange={async event => { const file = event.target.files?.[0]; if (!file) return; if (slug === 'excel-to-markdown') setBytes(new Uint8Array(await file.arrayBuffer())); else setInput(await file.text()); }} /></label>
      {slug!=='openapi-to-markdown'&&<input aria-label="Options or comparison text" value={extra} onChange={event => setExtra(event.target.value)} placeholder="Title, label, author, language, or comparison" />}
      {slug === 'markdown-callouts' && <><label>Platform <select aria-label="Callout platform" value={options.platform} onChange={setOption('platform')}><option>obsidian</option><option>github</option><option>gitlab</option></select></label><label>Type <select aria-label="Callout type" value={options.type} onChange={setOption('type')}>{['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'].map(type => <option key={type}>{type}</option>)}</select></label><label>Fold <select aria-label="Callout fold" value={options.fold || ''} onChange={setOption('fold')}><option value="">open</option><option value="+">expanded</option><option value="-">collapsed</option></select></label><input aria-label="Callout title" value={options.title || ''} onChange={setOption('title')} placeholder="Custom title" /></>}
      {slug === 'text-compare' && <label>Compare <select aria-label="Comparison mode" value={options.mode} onChange={setOption('mode')}><option value="line">Lines</option><option value="word">Words</option></select></label>}
      {slug === 'badge-generator' && <><input aria-label="Badge color" value={options.color} onChange={setOption('color')} placeholder="Color" /><select aria-label="Badge style" value={options.style || 'flat'} onChange={setOption('style')}><option>flat</option><option>flat-square</option><option>plastic</option><option>for-the-badge</option></select><input aria-label="Badge link" value={options.link || ''} onChange={setOption('link')} placeholder="Optional link" /></>}
      {slug === 'link-generator' && <><select aria-label="Link style" value={options.kind} onChange={setOption('kind')}><option value="inline">Inline</option><option value="reference">Reference</option><option value="autolink">Autolink</option></select><input aria-label="Link title" value={options.title || ''} onChange={setOption('title')} placeholder="Optional title" /></>}
      {slug === 'image-generator' && <><input aria-label="Image title" value={options.title || ''} onChange={setOption('title')} placeholder="Title" /><input aria-label="Image width" value={options.width || ''} onChange={setOption('width')} placeholder="Width" /><input aria-label="Image caption" value={options.caption || ''} onChange={setOption('caption')} placeholder="Caption" /></>}
      {slug === 'discord-colored-text' && <select aria-label="ANSI color" value={options.color} onChange={setOption('color')}>{['gray', 'red', 'green', 'yellow', 'blue', 'pink', 'cyan', 'white'].map(color => <option key={color}>{color}</option>)}</select>}
      {slug === 'readme-generator' && <input aria-label="README sections" value={options.sections || 'overview,install,usage,license'} onChange={setOption('sections')} />}
      {slug === 'readme-templates' && <select aria-label="Template" value={options.template} onChange={setOption('template')}><option value="library">Library</option><option value="app">Application</option><option value="cli">Command line</option></select>}
      {slug === 'markdown-definition-list' && <select aria-label="Definition format" value={options.format} onChange={setOption('format')}><option value="markdown">Markdown Extra</option><option value="html">HTML</option><option value="table">Table</option><option value="bold">Bold terms</option></select>}
      {slug === 'changelog-generator' && <><input aria-label="Version" value={options.version || ''} onChange={setOption('version')} placeholder="Version" /><input aria-label="Release date" value={options.date || ''} onChange={setOption('date')} placeholder="Date" /></>}
      {slug === 'llms-txt-generator' && <input aria-label="Index description" value={options.description || ''} onChange={setOption('description')} placeholder="Description" />}
      {slug === 'claude-md-generator' && <select aria-label="Instruction format" value={options.format || 'claude'} onChange={setOption('format')}><option value="claude">CLAUDE.md</option><option value="agents">AGENTS.md</option><option value="cursor">Cursor</option></select>}
      {(slug === 'quote-generator' || slug === 'quote-block-generator') && <label>Nesting <select aria-label="Quote depth" value={options.depth || '1'} onChange={setOption('depth')}><option>1</option><option>2</option><option>3</option></select></label>}
      {slug === 'excel-to-markdown' && <label>Header <select aria-label="Header row" value={options.header} onChange={setOption('header')}><option value="yes">First row</option><option value="no">No header</option></select></label>}
      {slug === 'table-alignment' && <input aria-label="Column alignments" value={options.alignments} onChange={setOption('alignments')} placeholder="left,center,right" />}
      {slug === 'table-without-header' && <><label>Header labels <select aria-label="Header labels" value={options.headerLabels||'keep'} onChange={setOption('headerLabels')}><option value="keep">Keep as first data row</option><option value="remove">Remove original header</option></select></label><select aria-label="Headerless method" value={options.method} onChange={setOption('method')}><option value="markdown">Empty Markdown header</option><option value="html">HTML without header</option></select></>}
      {slug === 'center-table' && <select aria-label="Centering method" value={options.method || 'div'} onChange={setOption('method')}><option value="div">div align</option><option value="paragraph">Centered block (HTML)</option><option value="html">table align</option></select>}
      {slug === 'table-merge-cells' && <><label>Content <select aria-label="Merge content" value={options.content||'join'} onChange={setOption('content')}><option value="join">Combine selected text</option><option value="first">Keep first cell only</option></select></label><span>Row 1 is the original header.</span><input aria-label="Merge row" value={options.row || '1'} onChange={setOption('row')} placeholder="Row" /><input aria-label="Merge column" value={options.column || '1'} onChange={setOption('column')} placeholder="Column" /><input aria-label="Column span" value={options.colspan || '2'} onChange={setOption('colspan')} placeholder="Colspan" /><input aria-label="Row span" value={options.rowspan || '1'} onChange={setOption('rowspan')} placeholder="Rowspan" /></>}
    </div>
    <div className="workspace"><section className="panel"><div className="panelbar">Input</div><textarea aria-label="Source input" value={input} onPaste={onPaste} onChange={event => {setInput(event.target.value);setCanApplyFixes(false)}} /></section><section className="panel"><div className="panelbar">Output<button className="quiet" onClick={() => navigator.clipboard.writeText(output).then(() => setMessage('Copied')).catch(() => setMessage('Copy unavailable'))}>Copy</button><button className="quiet" onClick={() => { const url = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = downloadName; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Download</button></div><textarea aria-label="Converted output" value={output} readOnly /></section></div>
    {message && <p role="status" className="notice">{message}</p>}{slug==='markdown-link-checker'&&<RemoteLinkCheck input={input}/>} {output && !output.startsWith('Error:') && <RichPreview text={slug === 'markdown-to-google-docs' || slug === 'markdown-to-rich-text' ? input : output} />}<ToolHelp slug={slug} /></main></>;
}
