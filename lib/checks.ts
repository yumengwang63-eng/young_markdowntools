import {scanFences as fenced,indentedCodeLines} from './markdown-structure';
export {fixMarkdown,checkLinks} from './checks-markdown';
export type Issue = { line: number; rule: string; message: string };

function linesOf(input: string) {
  return input.replace(/\r\n?/g, '\n').split('\n');
}

export function lintMarkdown(input: string) {
  const lines = linesOf(input);
  const indented=indentedCodeLines(lines.join('\n'));
  const { skip, open, openers,start } = fenced(lines);
  const issues: Issue[] = [];
  let previousBullet = '';
  lines.forEach((line, index) => {
    const lineNo = index + 1;
    if (skip.has(index)||indented.has(index)) return;
    if (/[ \t]+$/.test(line)&&!(/\S {2}$/.test(line))) issues.push({ line: lineNo, rule: 'MD009', message: 'Trailing whitespace.' });
    if (/\t/.test(line)) issues.push({ line: lineNo, rule: 'MD010', message: 'Hard tab; use spaces.' });
    if (!line.trim() && index > 0 && !lines[index - 1].trim()) issues.push({ line: lineNo, rule: 'MD012', message: 'Multiple consecutive blank lines.' });
    if (/^#{1,6}[^#\s]/.test(line)) issues.push({ line: lineNo, rule: 'MD018', message: 'Heading needs a space after the hash marks.' });
    const bullet = line.match(/^(\s*)([-+*])\s+/);
    if (bullet) {
      if (previousBullet && bullet[2] !== previousBullet) issues.push({ line: lineNo, rule: 'MD004', message: 'Unordered list marker is inconsistent.' });
      previousBullet = bullet[2];
    }
    if (/^#{1,6}\s+\S/.test(line)) {
      if (index > 0 && lines[index - 1].trim()) issues.push({ line: lineNo, rule: 'MD022', message: 'Heading needs a blank line before it.' });
      if (lines[index + 1]?.trim()) issues.push({ line: lineNo, rule: 'MD022', message: 'Heading needs a blank line after it.' });
      if (/[.,;:!?]$/.test(line.trim())) issues.push({ line: lineNo, rule: 'MD026', message: 'Heading ends with punctuation.' });
    }
    if (openers.has(index)&&/^ {0,3}(`{3,}|~{3,})\s*$/.test(line)) issues.push({ line: lineNo, rule: 'MD040', message: 'Fenced code block has no language.' });
    if (/!\[[^\]]*\]\(\s*\)/.test(line) || /\[[^\]]*\]\(\s*\)/.test(line)) issues.push({ line: lineNo, rule: 'MD042', message: 'Empty link or image destination.' });
    if (/!\[\s*\]\([^)]+\)/.test(line)) issues.push({ line: lineNo, rule: 'MD045', message: 'Image is missing alt text.' });
  });
  if (open) issues.push({ line: start+1, rule: 'MD046', message: 'Code fence is not closed.' });
  if (input.length && !input.endsWith('\n')) issues.push({ line: lines.length, rule: 'MD047', message: 'File does not end with a newline.' });
  return issues;
}

const README_SECTIONS = ['title', 'description', 'install', 'usage', 'example', 'license'];

export function auditReadme(input: string) {
  const lower = input.toLowerCase();
  const present = {
    title: /^#\s+\S/m.test(input),
    description: input.split('\n').filter(line => line.trim() && !line.startsWith('#')).length > 0,
    install: /install/.test(lower),
    usage: /usage|getting started/.test(lower),
    example: /example|```/.test(lower),
    license: /license/.test(lower)
  };
  const missing = README_SECTIONS.filter(section => !present[section as keyof typeof present]);
  const score = Math.round((README_SECTIONS.length - missing.length) / README_SECTIONS.length * 100);
  const suggestions = missing.map(section => `Add a ${section} section.`);
  return { score, missing, suggestions };
}

export function countTwitter(input: string) {
  const urls = input.match(/https?:\/\/\S+/g) ?? [];
  const withoutUrls = input.replace(/https?:\/\/\S+/g, '');
  const segmenter = (Intl as any).Segmenter ? new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' }) : null;
  const graphemes = segmenter ? [...segmenter.segment(withoutUrls)] : [...withoutUrls].map(segment => ({ segment }));
  const emoji = graphemes.filter((item: { segment: string }) => /\p{Extended_Pictographic}/u.test(item.segment)).length;
  const other = graphemes.length - emoji;
  const weighted = other + emoji * 2 + urls.length * 23;
  return { weighted, limit: 280, remaining: 280 - weighted, urls: urls.length, emoji };
}

export function countScripts(input: string) {
  const count = (pattern: RegExp) => (input.match(pattern) ?? []).length;
  return {
    Chinese: count(/\p{Script=Han}/gu),
    Japanese: count(/[\p{Script=Hiragana}\p{Script=Katakana}]/gu),
    Korean: count(/\p{Script=Hangul}/gu),
    Latin: count(/\p{Script=Latin}/gu),
    Digits: count(/\p{Nd}/gu),
    Punctuation: count(/\p{P}/gu),
    Spaces: count(/\s/gu)
  };
}
