export function callout(body: string, options: Record<string, string>) {
  const platform = options.platform || 'obsidian';
  const type = (options.type || 'NOTE').toUpperCase();
  const title = options.title?.trim();
  const fold = options.fold || '';
  const quoted = body.split('\n').map(line => '> ' + line).join('\n');
  if (platform === 'github') return `> [!${type}]${title ? ' ' + title : ''}\n${quoted}`;
  if (platform === 'gitlab') return `> [!${type}]${fold === '-' ? '-' : ''}${title ? ' ' + title : ''}\n${quoted}`;
  return `> [!${type}]${fold}${title ? ' ' + title : ''}\n${quoted}`;
}

export function quoteBlock(body: string, author: string, depth = 1) {
  const mark = '>'.repeat(Math.max(1, Math.min(3, depth)));
  const lines = body.split('\n').map(line => mark + ' ' + line);
  if (author.trim()) lines.push(mark + ' ', mark + ' — ' + author.trim());
  return lines.join('\n');
}

export function badge(options: Record<string, string>) {
  const label = options.label || 'status';
  const message = options.message || 'ready';
  const color = options.color || 'green';
  const style = options.style && options.style !== 'flat' ? `?style=${encodeURIComponent(options.style)}` : '';
  const image = `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${encodeURIComponent(color)}${style}`;
  const alt = `${label}: ${message}`;
  const markdown = `![${alt}](${image})`;
  return options.link ? `[${markdown}](${options.link})` : markdown;
}

export function linkMarkdown(url: string, label: string, title: string, kind: string) {
  const safeUrl = url.replace(/[<>\s]/g, '');
  const text = label.trim() || safeUrl;
  if (kind === 'autolink') return `<${safeUrl}>`;
  if (kind === 'reference') return `[${text}][link]\n\n[link]: ${safeUrl}${title.trim() ? ' "' + title.trim().replace(/"/g, '\\"') + '"' : ''}`;
  return `[${text}](${safeUrl}${title.trim() ? ' "' + title.trim().replace(/"/g, '\\"') + '"' : ''})`;
}

export function codeBlock(code: string, language: string) {
  const fence = '`'.repeat(Math.max(3, ...[...code.matchAll(/`+/g)].map(item => item[0].length + 1)));
  return `${fence}${language.replace(/[^\w+-]/g, '')}\n${code.replace(/\n$/, '')}\n${fence}`;
}

export function imageMarkdown(url: string, options: Record<string, string>) {
  const alt = (options.alt || 'Image').replace(/[\[\]]/g, '');
  const title = options.title?.trim() ? ` "${options.title.trim().replace(/"/g, '\\"')}"` : '';
  const target = url.replace(/[<>\n]/g, '');
  let markdown = `![${alt}](${target}${title})`;
  if (options.link) markdown = `[${markdown}](${options.link})`;
  if (options.width) markdown = `<img src="${target}" alt="${alt}" width="${options.width.replace(/[^\d]/g, '')}">`;
  if (options.caption) markdown += `\n\n*${options.caption.trim()}*`;
  return markdown;
}

export function githubImageGuide() {
  return [
    '## Relative path',
    '![Diagram](docs/diagram.png)',
    '',
    '## Size',
    '<img src="docs/diagram.png" alt="Diagram" width="480">',
    '',
    '## Alignment',
    '<p align="center"><img src="docs/diagram.png" alt="Diagram"></p>',
    '',
    '## Light and dark',
    '<picture>',
    '  <source media="(prefers-color-scheme: dark)" srcset="docs/diagram-dark.png">',
    '  <img src="docs/diagram-light.png" alt="Diagram">',
    '</picture>'
  ].join('\n');
}

export function githubCodeGuide() {
  return [
    '## Language',
    '```ts',
    'const ready = true;',
    '```',
    '',
    '## Diff',
    '```diff',
    '- const ready = false;',
    '+ const ready = true;',
    '```',
    '',
    '## Collapsed code',
    '<details>',
    '<summary>Show example</summary>',
    '',
    '```ts',
    'console.log("hidden until opened");',
    '```',
    '',
    '</details>'
  ].join('\n');
}

export function checkboxList(input: string) {
  return input.split('\n').filter(line => line.trim()).map(line => {
    const indent = line.match(/^\s*/)?.[0].replace(/\t/g, '  ') ?? '';
    const text = line.trim().replace(/^([-*]\s+)?(\[[ xX]\]\s+)?/, '');
    const checked = /\[[xX]\]/.test(line) || /^x\s+/i.test(line.trim());
    return `${indent}- [${checked ? 'x' : ' '}] ${text}`;
  }).join('\n');
}

export function discordTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw Error('Enter a valid date and time.');
  const unix = Math.floor(date.getTime() / 1000);
  const labels: Record<string, string> = { t: 'short time', T: 'long time', d: 'short date', D: 'long date', f: 'date and time', F: 'long date and time', R: 'relative' };
  return Object.entries(labels).map(([flag, label]) => `${label}: <t:${unix}:${flag}>`).join('\n');
}

export function discordAnsi(input: string, color: string) {
  const codes: Record<string, string> = { gray: '30', red: '31', green: '32', yellow: '33', blue: '34', pink: '35', cyan: '36', white: '37' };
  return '```ansi\n\u001b[' + (codes[color] || '32') + 'm' + input + '\u001b[0m\n```';
}

export function readmeDocument(input: string, options: Record<string, string>) {
  const name = options.name || 'Project';
  const sections = (options.sections || 'overview,install,usage,license').split(',');
  const parts = [`# ${name}`];
  if (sections.includes('overview')) parts.push('', '## Overview', '', input.trim() || 'Describe the project.');
  if (sections.includes('install')) parts.push('', '## Install', '', '```bash', 'npm install', '```');
  if (sections.includes('usage')) parts.push('', '## Usage', '', '```bash', 'npm start', '```');
  if (sections.includes('development')) parts.push('', '## Development', '', 'Document the commands and conventions used by contributors.');
  if (sections.includes('license')) parts.push('', '## License', '', options.license || 'Specify the license.');
  return parts.join('\n');
}

export function profileReadme(options: Record<string, string>) {
  const name = options.name || 'Your Name';
  const stack = (options.stack || 'TypeScript,React').split(',').map(item => item.trim()).filter(Boolean);
  return [`# ${name}`, '', options.bio || 'Building useful software.', '', '## Stack', '', ...stack.map(item => `- ${item}`), '', '## Highlights', '', '- Add a project and the problem it solves.'].join('\n');
}

export function readmeTemplate(kind: string, name: string) {
  const title = name || 'Project';
  const templates: Record<string, string> = {
    library: `# ${title}\n\nA focused library.\n\n## Install\n\n\`\`\`bash\nnpm install ${title.toLowerCase().replace(/\s+/g, '-')}\n\`\`\`\n\n## API\n\nDocument the public functions.\n\n## License\n\nMIT`,
    app: `# ${title}\n\n## What it does\n\nDescribe the user-facing result.\n\n## Run locally\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Configuration\n\nList required environment variables without secret values.`,
    cli: `# ${title}\n\n## Install\n\n\`\`\`bash\nnpm install -g ${title.toLowerCase().replace(/\s+/g, '-')}\n\`\`\`\n\n## Commands\n\n| Command | Purpose |\n| --- | --- |\n| \`${title.toLowerCase()} --help\` | Show help |`
  };
  return templates[kind] || templates.library;
}

export function definitionList(input: string, format: string) {
  const pairs = input.split('\n').filter(line => line.trim()).map(line => {
    const [term, ...rest] = line.split(':');
    return [term.trim(), rest.join(':').trim() || 'Definition'];
  });
  if (format === 'html') return pairs.map(([term, definition]) => `<dt>${term}</dt>\n<dd>${definition}</dd>`).join('\n');
  if (format === 'table') return ['| Term | Definition |', '| --- | --- |', ...pairs.map(([term, definition]) => `| ${term.replace(/\|/g, '\\|')} | ${definition.replace(/\|/g, '\\|')} |`)].join('\n');
  if (format === 'bold') return pairs.map(([term, definition]) => `**${term}**\n\n${definition}`).join('\n\n');
  return pairs.map(([term, definition]) => `${term}\n: ${definition}`).join('\n\n');
}

export function changelog(input: string, version: string, date: string) {
  const groups = { Added: [] as string[], Changed: [] as string[], Fixed: [] as string[] };
  for (const line of input.split('\n').filter(item => item.trim())) {
    const match = line.match(/^(added|changed|fixed)\s*:\s*(.+)$/i);
    const key = match ? match[1][0].toUpperCase() + match[1].slice(1).toLowerCase() : 'Changed';
    groups[key as keyof typeof groups].push(match ? match[2] : line.trim());
  }
  const body = Object.entries(groups).filter(([, items]) => items.length).map(([name, items]) => `### ${name}\n\n${items.map(item => '- ' + item).join('\n')}`).join('\n\n');
  return `# Changelog\n\n## ${version || 'Unreleased'}${date ? ' - ' + date : ''}\n\n${body}`;
}

export function llmsText(input: string, title: string, description: string) {
  const links = input.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const [label, url] = line.includes('|') ? line.split('|').map(part => part.trim()) : [line, line];
    return `- [${label}](${url.startsWith('http') ? url : 'https://' + url})`;
  });
  return `# ${title || 'Documentation'}\n\n${description || 'A concise index for language-model tools.'}\n\n## Docs\n\n${links.join('\n')}`;
}

export function instructionFile(input: string, options: Record<string, string>) {
  const format = options.format || 'claude';
  const name = options.name || 'Project';
  const body = [`# ${name} instructions`, '', input.trim() || 'Describe the project and the commands an agent may run.', '', '## Commands', '', '- Install: npm install', '- Test: npm test', '- Build: npm run build', '', '## Conventions', '', options.conventions || 'Keep changes focused and preserve existing user content.'];
  if (format === 'agents') return body.join('\n').replace('instructions', 'agent instructions');
  if (format === 'cursor') return ['---', 'description: Project instructions for Cursor', '---', '', ...body].join('\n');
  return body.join('\n');
}

export function alignTable(input: string, alignments: string[]) {
  const lines = input.trim().split('\n').filter(line => line.includes('|'));
  if (lines.length < 2) throw Error('Paste a Markdown table with a header and separator.');
  const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
  const width = Math.max(...lines.map(line => cells(line).length));
  const separator = Array.from({ length: width }, (_, index) => alignments[index] === 'center' ? ':---:' : alignments[index] === 'right' ? '---:' : '---');
  const body = lines.filter(line => !/^\|?\s*:?-{3,}/.test(line));
  return [body[0], separator.join(' | '), ...body.slice(1)].map(row => '| ' + (Array.isArray(row) ? row : cells(row).concat(Array(width).fill('')).slice(0, width)).join(' | ') + ' |').join('\n');
}

export {headerlessTable as tableWithoutHeader,centeredTable as centerTable,mergedTable as mergeCells} from './table-variants';

import {diffText} from './text-diff';
export function compareText(left:string,right:string,mode:string){return diffText(left,right,mode==='word'?'word':mode==='character'?'character':'line')}

