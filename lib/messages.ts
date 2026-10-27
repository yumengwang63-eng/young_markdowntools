import { marked } from 'marked';

type Token = any;

function protect(input: string, convert: (source: string) => string) {
  const blocks: string[] = [];
  const hidden = input.replace(/```[\s\S]*?```|`[^`\n]+`/g, block => `@@CODE${blocks.push(block) - 1}@@`);
  return convert(hidden).replace(/@@CODE(\d+)@@/g, (_, index) => blocks[Number(index)]);
}

function render(tokens: Token[], visit: (token: Token) => string): string {
  return tokens.map(visit).filter(Boolean).join('\n\n');
}

function plain(tokens: Token[] = []): string {
  return tokens.map(token => token.tokens ? plain(token.tokens) : token.text ?? '').join('');
}

export function toJira(input: string) {
  const inline = (tokens: Token[] = []): string => tokens.map(token => {
    if (token.type === 'strong') return `*${inline(token.tokens)}*`;
    if (token.type === 'em') return `_${inline(token.tokens)}_`;
    if (token.type === 'del') return `-${inline(token.tokens)}-`;
    if (token.type === 'codespan') return `{{${token.text}}}`;
    if (token.type === 'link') return `[${inline(token.tokens)}|${token.href}]`;
    return token.tokens ? inline(token.tokens) : token.text ?? '';
  }).join('');
  const blocks = (tokens: Token[]): string => render(tokens, token => {
    if (token.type === 'heading') return `h${Math.min(token.depth, 6)}. ${inline(token.tokens)}`;
    if (token.type === 'paragraph') return inline(token.tokens);
    if (token.type === 'code') return `{code${token.lang ? ':' + token.lang : ''}}\n${token.text.replace(/\n$/, '')}\n{code}`;
    if (token.type === 'blockquote') return `{quote}\n${blocks(token.tokens)}\n{quote}`;
    if (token.type === 'list') return token.items.map((item: Token) => `${token.ordered ? '# ' : '* '}${blocks(item.tokens).replace(/\n/g, '\n  ')}`).join('\n');
    if (token.type === 'table') {
      const row = (cells: Token[]) => '||' + cells.map(cell => inline(cell.tokens)).join('||') + '||';
      const body = (cells: Token[]) => '|' + cells.map(cell => inline(cell.tokens)).join('|') + '|';
      return [row(token.header), ...token.rows.map(body)].join('\n');
    }
    return token.type === 'space' ? '' : plain(token.tokens ?? [token]);
  });
  return blocks(marked.lexer(input));
}

export function fromJira(input: string) {
  return input
    .replace(/^h([1-6])\. (.*)$/gm, (_, level, text) => '#'.repeat(Number(level)) + ' ' + text)
    .replace(/\{code(?::([^}]+))?\}([\s\S]*?)\{code\}/g, (_, lang = '', code) => '```' + lang + code.replace(/^\n/, '\n') + (code.endsWith('\n') ? '```' : '\n```'))
    .replace(/\{quote\}([\s\S]*?)\{quote\}/g, (_, quote) => quote.trim().split('\n').map((line: string) => '> ' + line).join('\n'))
    .replace(/\[([^|\]]+)\|([^\]]+)\]/g, '[$1]($2)')
    .replace(/^\* /gm, '- ')
    .replace(/^# /gm, '1. ')
    .replace(/^\|\|(.+)\|\|$/gm, line => '| ' + line.slice(2, -2).split('||').join(' | ') + ' |\n| ' + line.slice(2, -2).split('||').map(() => '---').join(' | ') + ' |')
    .replace(/^\|(.+)\|$/gm, line => '| ' + line.slice(1, -1).split('|').join(' | ') + ' |')
    .replace(/(^|[^\w])\*(\S(?:.*?\S)?)\*(?!\*)/g, '$1**$2**')
    .replace(/\{\{(.+?)\}\}/g, '`$1`');
}

export function toTelegram(input: string) {
  const escape = (value: string) => value.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  const inline = (tokens: Token[] = []): string => tokens.map(token => {
    if (token.type === 'strong') return `*${inline(token.tokens)}*`;
    if (token.type === 'em') return `_${inline(token.tokens)}_`;
    if (token.type === 'del') return `~${inline(token.tokens)}~`;
    if (token.type === 'codespan') return '`' + token.text.replace(/`/g, '\\`') + '`';
    if (token.type === 'link') return `[${inline(token.tokens)}](${token.href})`;
    return escape(token.tokens ? plain(token.tokens) : token.text ?? '');
  }).join('');
  return render(marked.lexer(input), token => {
    if (token.type === 'heading') return `*${inline(token.tokens)}*`;
    if (token.type === 'paragraph') return inline(token.tokens);
    if (token.type === 'code') return '```' + (token.lang || '') + '\n' + token.text.replace(/\n$/, '') + '\n```';
    if (token.type === 'list') return token.items.map((item: Token, index: number) => `${token.ordered ? index + 1 + '\\.' : '\\-'} ${inline(item.tokens?.[0]?.tokens ?? item.tokens ?? [])}`).join('\n');
    if (token.type === 'blockquote') return inline(token.tokens?.[0]?.tokens ?? []).split('\n').map(line => '>' + line).join('\n');
    return token.type === 'space' ? '' : escape(plain(token.tokens ?? [token]));
  });
}

export function toBbcode(input: string) {
  const inline = (tokens: Token[] = []): string => tokens.map(token => {
    if (token.type === 'strong') return `[b]${inline(token.tokens)}[/b]`;
    if (token.type === 'em') return `[i]${inline(token.tokens)}[/i]`;
    if (token.type === 'del') return `[s]${inline(token.tokens)}[/s]`;
    if (token.type === 'codespan') return `[code]${token.text}[/code]`;
    if (token.type === 'link') return `[url=${token.href}]${inline(token.tokens)}[/url]`;
    return token.tokens ? inline(token.tokens) : token.text ?? '';
  }).join('');
  return render(marked.lexer(input), token => {
    if (token.type === 'heading') return `[b]${inline(token.tokens)}[/b]`;
    if (token.type === 'paragraph') return inline(token.tokens);
    if (token.type === 'code') return `[code]${token.text.replace(/\n$/, '')}[/code]`;
    if (token.type === 'blockquote') return `[quote]${render(token.tokens, child => child.tokens ? inline(child.tokens) : child.text ?? '')}[/quote]`;
    if (token.type === 'list') return `[list${token.ordered ? '=1' : ''}]\n${token.items.map((item: Token) => `[*]${inline(item.tokens?.[0]?.tokens ?? item.tokens ?? [])}`).join('\n')}\n[/list]`;
    return token.type === 'space' ? '' : plain(token.tokens ?? [token]);
  });
}

export function cleanChatGpt(input: string) {
  return protect(input, source => source
    .replace(/【[^】\n]{0,80}】/g, '')
    .replace(/\[\^\d+\]/g, '')
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, expression) => `$$\n${expression.trim()}\n$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$')
    .replace(/^([ \t]*(?:[-*+]|\d+[.)]))[ \t]*\n+(?=\S)/gm, '$1 ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')).trim();
}

export function cleanClaude(input: string) {
  return protect(input, source => source.replace(/^(Note|Warning|Tip|Important|Caution):\s+(.+)$/gm, '> [!$1]\n> $2')).trim();
}

export function cleanGemini(input: string) {
  return protect(input, source => source
    .replace(/^\*\*([^*\n]{2,80})\*\*$/gm, '## $1')
    .replace(/^([A-Z][A-Z0-9 ,:'’-]{3,70})$/gm, '## $1')
    .replace(/\n{3,}/g, '\n\n')).trim();
}

export type SlackMode = 'composer' | 'api';

function slackText(value: string, api: boolean) {
  const escaped = api ? value : value.replace(/[\\*_~`]/g, '\\$&').replace(/<([@#!])/g, '＜$1');
  return api ? escaped.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : escaped;
}

function slackCode(value: string, api: boolean) {
  const safe = value.replace(/```/g, '``\u200b`');
  return api ? safe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : safe.replace(/<([@#!])/g, '＜$1');
}

function slackFence(value: string, api: boolean) {
  return '```\n' + slackCode(value.replace(/\n$/, ''), api) + '\n```';
}

function slackHref(href: string) {
  try {
    const url = new URL(href);
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol) || /[\s<>|]/.test(href)) return '';
    return href;
  } catch { return ''; }
}

export function toSlack(input: string, mode: SlackMode = 'composer') {
  if (input.length > 1_000_000) throw Error('Use Markdown smaller than 1 MB.');
  const api = mode === 'api';
  const inline = (tokens: Token[] = []): string => tokens.map(token => {
    if (token.type === 'strong') return `*${inline(token.tokens)}*`;
    if (token.type === 'em') return `_${inline(token.tokens)}_`;
    if (token.type === 'del') return `~${inline(token.tokens)}~`;
    if (token.type === 'codespan') return token.text.includes('`') || token.text.includes('\n') ? '\n' + slackFence(token.text, api) + '\n' : '`' + slackCode(token.text, api) + '`';
    if (token.type === 'link' || token.type === 'image') {
      const href = slackHref(token.href || '');
      const label = inline(token.tokens ?? []).replace(/\|/g, '｜').replace(/[<>]/g, char => char === '<' ? '＜' : '＞') || (token.type === 'image' ? 'Image' : href);
      if (!href) return slackText(token.text || label, api) + (token.href ? ' (' + slackText(token.href, api) + ')' : '');
      const encoded = api ? href.replace(/&/g, '&amp;') : href;
      return label === encoded || label === href ? `<${encoded}>` : `<${encoded}|${label}>`;
    }
    if (token.type === 'br') return '\n';
    return slackText(token.tokens ? plain(token.tokens) : token.text ?? '', api);
  }).join('');
  const list = (token: Token, depth = 0): string => token.items.map((item: Token, index: number) => {
    const marker = item.task ? `- [${item.checked ? 'x' : ' '}] ` : token.ordered ? `${(Number(token.start) || 1) + index}. ` : '- ';
    const own = (item.tokens ?? []).filter((child: Token) => child.type !== 'list');
    const nested = (item.tokens ?? []).filter((child: Token) => child.type === 'list');
    const body = blocks(own);
    const pad = '  '.repeat(depth);
    const lines = (body || '').split('\n').map((line, lineIndex) => pad + (lineIndex === 0 ? marker : ' '.repeat(marker.length)) + line);
    return lines.join('\n') + nested.map((child: Token) => '\n' + list(child, depth + 1)).join('');
  }).join('\n');
  const blocks = (tokens: Token[]): string => tokens.map(token => {
    if (token.type === 'space') return '';
    if (token.type === 'heading') { const text = inline(token.tokens); return text.startsWith('*') && text.endsWith('*') ? text : `*${text}*`; }
    if (token.type === 'paragraph') return inline(token.tokens);
    if (token.type === 'code') return slackFence(token.text, api);
    if (token.type === 'blockquote') return blocks(token.tokens).split('\n').map(line => '>' + line).join('\n');
    if (token.type === 'list') return list(token);
    if (token.type === 'table') {
      const cell = (entry: Token) => plain(entry.tokens).replace(/\n/g, ' ');
      const rows = [token.header.map(cell), ...token.rows.map((row: Token[]) => row.map(cell))];
      const widths = rows[0].map((_: string, index: number) => Math.max(3, ...rows.map(row => [...(row[index] || '')].length)));
      const render = (row: string[]) => row.map((value, index) => value + ' '.repeat(widths[index] - [...value].length)).join('  ').trimEnd();
      return slackFence([render(rows[0]), widths.map(width => '-'.repeat(width)).join('  '), ...rows.slice(1).map(render)].join('\n'), api);
    }
    if (token.type === 'hr') return '———';
    if (token.type === 'html') return slackText(token.raw || token.text || '', api);
    return slackText(token.text ?? plain(token.tokens ?? []), api);
  }).filter(Boolean).join('\n\n');
  const output = blocks(marked.lexer(input)).trim();
  if (output.length > 40000) throw Error('The Slack result exceeds 40,000 characters. Shorten the document or split it before posting.');
  return output;
}

export function textToMarkdown(input: string) {
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const output: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { output.push(''); continue; }
    if (/^[-*•]\s+/.test(trimmed)) output.push('- ' + trimmed.replace(/^[-*•]\s+/, ''));
    else if (/^\d+[.)]\s+/.test(trimmed)) output.push(trimmed.replace(/^(\d+)[.)]\s+/, '$1. '));
    else if (/^https?:\/\/\S+$/.test(trimmed)) output.push(`<${trimmed}>`);
    else if ((trimmed.endsWith(':') && trimmed.length < 80) || (/^[A-Z0-9][A-Z0-9 ,:'’-]{2,70}$/.test(trimmed) && !/[.!?]$/.test(trimmed))) output.push('## ' + trimmed.replace(/:$/, ''));
    else output.push(trimmed.replace(/(https?:\/\/[^\s)]+)/g, '<$1>'));
  }
  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
