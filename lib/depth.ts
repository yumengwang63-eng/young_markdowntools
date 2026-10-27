import {markdownToXlsx} from './markdown-xlsx';
import { auditReadme, checkLinks, countScripts, countTwitter, fixMarkdown, lintMarkdown } from './checks';
import { alignTable, badge, callout, centerTable, changelog, checkboxList, codeBlock, compareText, definitionList, discordAnsi, discordTimestamp, githubCodeGuide, githubImageGuide, imageMarkdown, instructionFile, linkMarkdown, llmsText, mergeCells, profileReadme, quoteBlock, readmeDocument, readmeTemplate, tableWithoutHeader } from './generators';
import { cleanChatGpt, cleanClaude, cleanGemini, fromJira, textToMarkdown, toBbcode, toJira, toTelegram } from './messages';

export type DepthResult = { output: string; message: string; downloadName?: string; downloadBytes?: Uint8Array; navigate?: string };

import {openApiMarkdown} from './openapi';
export {openApiMarkdown} from './openapi';

export async function validateMdx(input: string) {
  const { compile } = await import('@mdx-js/mdx');
  try {
    const file = await compile(input, { outputFormat: 'function-body' });
    return { output: String(file), message: 'MDX compiled without errors.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'MDX compilation failed.';
    return { output: message, message: 'MDX compilation failed. The message includes the source location when the compiler provides one.' };
  }
}

function report(issues: { line: number; rule: string; message: string }[]) {
  return issues.length ? issues.map(issue => `Line ${issue.line} [${issue.rule}] ${issue.message}`).join('\n') : 'No issues found.';
}

function handoff(output: string, destination: string): DepthResult {
  return { output, message: 'Cleaned text is ready for export.', navigate: destination };
}

export async function runDepth(slug: string, input: string, extra: string, options: Record<string, string> = {}): Promise<DepthResult> {
  const value = input;
  if (slug === 'markdown-to-telegram') return { output: toTelegram(value), message: 'Telegram MarkdownV2 escapes punctuation outside code. Preview it in Telegram before sending.' };
  if (slug === 'markdown-to-jira') return { output: toJira(value), message: 'Converted to Jira wiki markup.' };
  if (slug === 'jira-to-markdown') return { output: fromJira(value), message: 'Converted Jira headings, links, code and tables.' };
  if (slug === 'markdown-to-bbcode') return { output: toBbcode(value), message: 'Converted nested bold, italic, links, lists, quotes and code.' };
  if (slug === 'markdown-to-word') return { output: value, message: 'Opening the DOCX exporter with this document.', navigate: '/markdown-to-docx' };
  if (slug === 'chatgpt-to-word') return handoff(cleanChatGpt(value), '/markdown-to-docx');
  if (slug === 'chatgpt-to-pdf') return handoff(cleanChatGpt(value), '/markdown-to-pdf');
  if (slug === 'claude-to-pdf') return handoff(cleanClaude(value), '/markdown-to-pdf');
  if (slug === 'gemini-to-pdf') return handoff(cleanGemini(value), '/markdown-to-pdf');
  if (slug === 'text-to-markdown') return { output: textToMarkdown(value), message: 'Headings, lists and links were inferred from the plain text.' };
  if (slug === 'markdown-callouts') return { output: callout(value, options), message: 'Callout generated for the selected platform.' };
  if (slug === 'quote-generator' || slug === 'quote-block-generator') return { output: quoteBlock(value, extra, Number(options.depth) || 1), message: 'Quote generated.' };
  if (slug === 'badge-generator') return { output: badge({ ...options, message: value, label: extra || options.label }), message: 'Shields badge generated. The image is loaded from shields.io when previewed.' };
  if (slug === 'link-generator') return { output: linkMarkdown(value, extra, options.title || '', options.kind || 'inline'), message: 'Link generated.' };
  if (slug === 'code-block-generator') return { output: codeBlock(value, extra), message: 'Fence length avoids backticks inside the code.' };
  if (slug === 'image-generator') return { output: imageMarkdown(value, { ...options, alt: extra }), message: 'Image markup generated.' };
  if (slug === 'github-markdown-image') return { output: githubImageGuide() + (value.trim() ? '\n\n## Your path\n' + imageMarkdown(value, { ...options, alt: extra || 'Diagram' }) : ''), message: 'Relative, sized, centered and color-scheme examples are ready to copy.' };
  if (slug === 'github-markdown-code-block') return { output: githubCodeGuide(), message: 'Language, diff and collapsed examples are ready to copy.' };
  if (slug === 'checkbox-generator') return { output: checkboxList(value), message: 'Task list generated. Indent a line with spaces to nest it.' };
  if (slug === 'discord-timestamp-generator') return { output: discordTimestamp(value), message: 'Unix timestamps generated for every Discord display style.' };
  if (slug === 'discord-colored-text') return { output: discordAnsi(value, options.color || 'green'), message: 'ANSI color is only rendered inside Discord.' };
  if (slug === 'readme-generator') return { output: readmeDocument(value, { ...options, name: extra || options.name }), message: 'README generated from the selected sections.' };
  if (slug === 'github-profile-readme') return { output: profileReadme({ ...options, name: extra || options.name, bio: value }), message: 'Profile README generated.' };
  if (slug === 'readme-templates') return { output: readmeTemplate(options.template || 'library', extra || value), message: 'Template copied into the output. Replace the placeholder sections.' };
  if (slug === 'markdown-definition-list') return { output: definitionList(value, options.format || 'markdown'), message: 'Definition list generated in the selected format.' };
  if (slug === 'changelog-generator') return { output: changelog(value, options.version || extra, options.date || ''), message: 'Prefix lines with Added:, Changed: or Fixed: to choose a section.' };
  if (slug === 'llms-txt-generator') return { output: llmsText(value, extra || options.title || '', options.description || ''), message: 'Use Label | https://example.com on each line.' };
  if (slug === 'claude-md-generator') return { output: instructionFile(value, { ...options, name: extra || options.name }), message: 'Instruction file generated. It does not grant an agent any permissions by itself.' };
  if (slug === 'text-compare') {
    const result = compareText(value, extra, options.mode || 'line');
    return { output: result.output, message: `Same ${result.stats.same}, added ${result.stats.added}, removed ${result.stats.removed}.` };
  }
  if (slug === 'twitter-character-counter') {
    const count = countTwitter(value);
    return { output: `${count.weighted} / ${count.limit}\nRemaining: ${count.remaining}\nURLs: ${count.urls} (23 each)\nEmoji: ${count.emoji} (2 each)`, message: count.remaining >= 0 ? 'Within the weighted 280 limit.' : 'Over the weighted 280 limit.' };
  }
  if (slug === 'chinese-character-counter') return { output: Object.entries(countScripts(value)).map(([name, count]) => `${name}: ${count}`).join('\n'), message: 'Counts are Unicode script counts, not reading difficulty.' };
  if (slug === 'markdown-lint') return { output: options.fix === 'yes' ? fixMarkdown(value) : report(lintMarkdown(value)), message: options.fix === 'yes' ? 'Fixable spacing, heading and list issues were rewritten. Code blocks and Markdown hard line breaks were retained; review the output before using it.' : 'Line numbers refer to the current source.' };
  if (slug === 'markdown-link-checker') return { output: report(checkLinks(value)), message: 'Local anchors, labels, alt text and reference definitions were checked, including definitions after their use. Code is ignored. Remote URLs were not requested.' };
  if (slug === 'readme-auditor') {
    const audit = auditReadme(value);
    return { output: `Score: ${audit.score}/100\n${audit.suggestions.join('\n') || 'The expected sections are present.'}`, message: 'The score checks section coverage, not writing quality.' };
  }
  if (slug === 'mdx-validator') return validateMdx(value);
  if (slug === 'openapi-to-markdown') return { output: await openApiMarkdown(value), message: 'Operations, parameters, request bodies, responses and local component references were rendered. External references are never fetched; conversion notes identify unresolved references.' };
  if (slug === 'table-alignment') return { output: alignTable(value, (options.alignments || 'left').split(',')), message: 'Column alignment markers updated.' };
  if (slug === 'table-without-header') return { output: tableWithoutHeader(value, options.method || 'markdown',options.headerLabels!=='remove'), downloadName:options.method==='html'?'table-no-header.html':'table-no-header.md', message: 'Headerless output is ready. Markdown requires a blank header row; HTML can omit it.' };
  if (slug === 'center-table') return { output: centerTable(value, options.method || 'div'), downloadName:'table-centered.html', message: 'A real HTML table was centered. The destination renderer may restrict alignment attributes or CSS.' };
  if (slug === 'table-merge-cells') return { output: mergeCells(value, options), downloadName:'table-merged.html', message: 'Merge rows include the original header as row 1. HTML preserves the selected spans; selected text is combined unless Keep first cell is chosen.' };
  if (slug === 'markdown-table-to-excel') {const result=markdownToXlsx(value,options.cellTypes==='text'?'text':'auto');return {output:JSON.stringify(result.tables,null,2),downloadBytes:result.bytes,downloadName:'tables.xlsx',message:'A real Excel workbook is ready.'};}
  throw Error('This tool does not have a converter yet.');
}
