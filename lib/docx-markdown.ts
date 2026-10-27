import { marked } from 'marked';

type Token = any;

function levels(text: string) {
  return Array.from({ length: 6 }, (_, level) => ({
    level,
    format: 'decimal' as const,
    text,
    alignment: 'left' as const,
    style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } } }
  }));
}

function inline(docx: any, tokens: Token[] = [], style: Record<string, boolean> = {}): any[] {
  return tokens.flatMap(token => {
    if (token.type === 'strong') return inline(docx, token.tokens, { ...style, bold: true });
    if (token.type === 'em') return inline(docx, token.tokens, { ...style, italics: true });
    if (token.type === 'del') return inline(docx, token.tokens, { ...style, strike: true });
    if (token.type === 'codespan') return [new docx.TextRun({ text: token.text, font: 'Consolas', ...style })];
    if (token.type === 'link') return [new docx.ExternalHyperlink({ link: token.href, children: inline(docx, token.tokens ?? [{ text: token.text }], style) })];
    if (token.tokens && token.type !== 'text') return inline(docx, token.tokens, style);
    if (token.tokens && token.type === 'text') return inline(docx, token.tokens, style);
    return [new docx.TextRun({ text: token.text ?? '', ...style })];
  });
}

function itemText(docx: any, item: Token) {
  const tokens = (item.tokens ?? []).filter((token: Token) => token.type !== 'list');
  const source = tokens.flatMap((token: Token) => token.tokens ?? [{ text: token.text ?? '' }]);
  const prefix = item.task ? (item.checked ? '☑ ' : '☐ ') : '';
  return [new docx.TextRun({ text: prefix }), ...inline(docx, source)];
}

function addBlocks(docx: any, tokens: Token[], children: any[], depth = 0, state = { ordered: 0 }) {
  for (const token of tokens) {
    if (token.type === 'heading') children.push(new docx.Paragraph({ heading: ('Heading' + token.depth) as any, children: inline(docx, token.tokens) }));
    else if (token.type === 'paragraph') children.push(new docx.Paragraph({ children: inline(docx, token.tokens) }));
    else if (token.type === 'blockquote') addBlocks(docx, token.tokens, children, depth, state);
    else if (token.type === 'code') children.push(new docx.Paragraph({ shading: { type: 'clear', fill: 'F4F4F4' }, children: [new docx.TextRun({ text: token.text.replace(/\n$/, ''), font: 'Consolas' })] }));
    else if (token.type === 'hr') children.push(new docx.Paragraph({ border: { bottom: { style: 'single', size: 6, color: 'CCCCCC' } }, children: [] }));
    else if (token.type === 'list') {
      if (token.ordered) state.ordered += 1;
      const instance = state.ordered;
      token.items.forEach((item: Token) => {
        children.push(new docx.Paragraph({
          numbering: token.ordered ? { reference: 'md-ordered', level: Math.min(depth, 5), instance } : undefined,
          bullet: token.ordered ? undefined : { level: Math.min(depth, 5) },
          children: itemText(docx, item)
        }));
        addBlocks(docx, (item.tokens ?? []).filter((child: Token) => child.type === 'list'), children, depth + 1, state);
      });
    } else if (token.type === 'table') {
      const rows = [token.header, ...token.rows].map((row: Token[]) => new docx.TableRow({
        children: row.map(cell => new docx.TableCell({ children: [new docx.Paragraph({ children: inline(docx, cell.tokens) })] }))
      }));
      children.push(new docx.Table({ rows }));
    }
  }
}

export async function markdownToDocxBlob(input: string) {
  const docx = await import('docx');
  const children: any[] = [];
  addBlocks(docx, marked.lexer(input), children);
  return docx.Packer.toBlob(new docx.Document({
    numbering: { config: [{ reference: 'md-ordered', levels: levels('%1.') }] },
    sections: [{ children }]
  }));
}
