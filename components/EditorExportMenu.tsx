'use client';
import {ChevronDown} from 'lucide-react';
import {marked} from 'marked';
import DOMPurify from 'dompurify';
import {messageMarkdown} from './conversions';
import {toSlack} from '../lib/messages';

function download(data:Blob|string,name:string,type='text/plain;charset=utf-8'){
  const blob=typeof data==='string'?new Blob([data],{type}):data;
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function html(markdown:string){return DOMPurify.sanitize(marked.parse(markdown,{async:false}) as string)}
function plain(markdown:string){const node=document.createElement('div');node.innerHTML=html(markdown);return node.innerText||node.textContent||''}
function telegram(text:string){return text.replace(/^#{1,6}\s+(.+)$/gm,'**$1**')}
function jira(text:string){return text.replace(/^(#{1,6})\s+(.+)$/gm,(_,h,t)=>`h${h.length}. ${t}`).replace(/\*\*(.+?)\*\*/g,'*$1*').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'[$1|$2]')}
function bbcode(text:string){return text.replace(/\*\*(.+?)\*\*/g,'[b]$1[/b]').replace(/\*(.+?)\*/g,'[i]$1[/i]').replace(/~~(.+?)~~/g,'[s]$1[/s]').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'[url=$2]$1[/url]')}
async function wordBlob(input:string){
  const d=await import('docx');
  const inline=(tokens:any[]=[]):any[]=>tokens.flatMap<any>(t=>t.type==='strong'||t.type==='em'||t.type==='del'?inline(t.tokens).map(r=>new d.TextRun({text:r.text||t.text,bold:t.type==='strong',italics:t.type==='em',strike:t.type==='del'})):t.type==='link'?[new d.ExternalHyperlink({link:t.href,children:[new d.TextRun({text:t.text,style:'Hyperlink'})]})]:[new d.TextRun({text:t.text??t.raw??'',font:t.type==='codespan'?'Consolas':undefined})]);
  const children:any[]=[];
  for(const t of marked.lexer(input)){if(t.type==='heading')children.push(new d.Paragraph({heading:('Heading'+t.depth) as any,children:inline(t.tokens)}));else if(t.type==='paragraph')children.push(new d.Paragraph({children:inline(t.tokens)}));else if(t.type==='list')for(const item of t.items)children.push(new d.Paragraph({children:inline(marked.lexer(item.text)[0]?.['tokens']??[{text:item.text}]),bullet:t.ordered?undefined:{level:0}}));else if(t.type==='table')children.push(new d.Table({rows:[t.header,...t.rows].map(row=>new d.TableRow({children:row.map(cell=>new d.TableCell({children:[new d.Paragraph({children:inline(cell.tokens)})]}))}))}));else if(t.type==='code')children.push(new d.Paragraph({children:[new d.TextRun({text:t.text,font:'Consolas'})]}))}
  return d.Packer.toBlob(new d.Document({sections:[{children}]}));
}

export default function EditorExportMenu({text,onStatus}:{text:string;onStatus:(value:string)=>void}){
  async function copyRich(){try{const rendered=html(text);if(typeof ClipboardItem!=='undefined'&&navigator.clipboard.write){await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([rendered],{type:'text/html'}),'text/plain':new Blob([plain(text)],{type:'text/plain'})})]);onStatus('Copied rich text and plain-text fallback.')}else{await navigator.clipboard.writeText(plain(text));onStatus('Rich clipboard unavailable; copied plain text.')}}catch{onStatus('Clipboard unavailable.')}}
  async function word(){try{download(await wordBlob(text),'document.docx');onStatus('Word document downloaded.')}catch(e){onStatus('Word export failed: '+(e as Error).message)}}
  const outputs:[string,string,()=>string][]=[
    ['Slack','document-slack.txt',()=>toSlack(text)],['Discord','document-discord.txt',()=>messageMarkdown(text,'discord')],
    ['Telegram','document-telegram.txt',()=>telegram(text)],['WhatsApp','document-whatsapp.txt',()=>messageMarkdown(text,'whatsapp')],
    ['Jira','document-jira.txt',()=>jira(text)],['BBCode','document-bbcode.txt',()=>bbcode(text)],['Plain text','document.txt',()=>plain(text)]
  ];
  return <details className="editorexport"><summary>Export <ChevronDown size={15}/></summary><div>
    <button className="quiet" onClick={()=>download(text,'document.md')}>Markdown (.md)</button>
    <button className="secondary" onClick={()=>download('<!doctype html><html><head><meta charset="utf-8"><title>Document</title></head><body>'+html(text)+'</body></html>','document.html','text/html;charset=utf-8')}>HTML</button>
    <button className="secondary" onClick={()=>window.print()}>PDF / Print</button>
    <button className="secondary" onClick={word}>Word (.docx)</button>
    <button className="secondary" onClick={copyRich}>Copy rich text</button>
    {outputs.map(([label,name,convert])=><button className="secondary" key={label} onClick={()=>{try{download(convert(),name)}catch(error){onStatus((error as Error).message)}}}>{label}</button>)}
  </div></details>
}
