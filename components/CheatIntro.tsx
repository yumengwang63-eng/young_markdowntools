'use client';
import {useEffect,useRef} from 'react';
import {syncShadowTheme} from '../lib/shadow-theme';
import {marked} from 'marked';
import DOMPurify from 'dompurify';
import data from './cheat-intro.json';
import examples from './cheat-sheet-data.json';

export default function CheatIntro(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const root=ref.current!.shadowRoot||ref.current!.attachShadow({mode:'open'});root.innerHTML='';
  const style=document.createElement('style');style.textContent=':host{display:block;font:16px/24px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--tw-border-style:solid;--background:#fff;--surface:#f6f6f8;--border:#e6e6eb;--text-primary:#18181b;--text-secondary:#52525b;--text-muted:#71717a;--primary:#6355f5;--primary-foreground:#fff;--primary-hover:#5748e8;--code-bg:#f6f6f8;--code-border:#e6e6eb;color:#18181b}@layer base{*,::before,::after{box-sizing:border-box;border-style:solid;border-width:0}}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace!important}button{cursor:pointer}textarea{background:#fff!important}section{border:1px solid #e6e6eb}section>div:first-child,section>div:nth-child(2){border-bottom:1px solid #e6e6eb}section>div:last-child{border-top:1px solid #e6e6eb}.border{border-style:solid}.border-r{border-right-style:solid}.border-b{border-bottom-style:solid}[download]{border-style:solid}.markdown-callout-tip{border-left:3px solid #059669!important}.markdown-callout-title{color:#059669}.markdown-preview blockquote{border-left:4px solid #e6e6eb}.markdown-callout{border-left:3px solid #059669;border-radius:4px;padding:12px 16px;margin:16px 0}.markdown-callout strong{color:#059669;font-size:12px}.copy-status{font-size:12px;color:#52525b}';root.append(style);
  for(const href of ['/cheat-sheet-original-1.css','/cheat-sheet-original-2.css']){const link=document.createElement('link');link.rel='stylesheet';link.href=href;root.append(link)}
  const body=document.createElement('div');body.innerHTML=data.html;root.append(body);
  const source=body.querySelector('textarea')!;source.setAttribute('aria-label','Try Markdown syntax');
  const output=body.querySelector('[aria-label="Rendered Markdown output"]')!;
  const originalOutput=output.innerHTML;
  let revision=0;
  async function render(){const current=++revision;if(source.value===data.initial){output.innerHTML=originalOutput;return}output.innerHTML=DOMPurify.sanitize(marked.parse(source.value,{async:false}) as string);output.firstElementChild?.classList.add('markdown-preview');if(!output.querySelector('.markdown-preview')){const wrap=document.createElement('div');wrap.className='markdown-preview';wrap.innerHTML=output.innerHTML;output.replaceChildren(wrap)}else{const wrap=document.createElement('div');wrap.className='markdown-preview';wrap.innerHTML=output.innerHTML;output.replaceChildren(wrap)}
   for(const quote of output.querySelectorAll('blockquote')){const first=quote.querySelector('p');const match=first?.textContent?.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?([\s\S]*)/);if(match&&first){quote.className='markdown-callout';first.textContent=match[2];const title=document.createElement('strong');title.textContent=match[1];quote.prepend(title)}}
   if(source.value.includes('```mermaid')){try{const mermaid=(await import('mermaid')).default;mermaid.initialize({startOnLoad:false,securityLevel:'strict'});for(const node of output.querySelectorAll('code.language-mermaid')){const {svg}=await mermaid.render('intro-diagram-'+current,node.textContent||'');if(current!==revision)return;const div=document.createElement('div');div.innerHTML=DOMPurify.sanitize(svg,{USE_PROFILES:{svg:true,svgFilters:true}});node.parentElement?.replaceWith(div)}}catch{}}
   if(source.value.includes('$')){const katex=(await import('katex')).default;if(current!==revision)return;const walker=document.createTreeWalker(output,NodeFilter.SHOW_TEXT);const nodes:Text[]=[];while(walker.nextNode()){const n=walker.currentNode as Text;if(!n.parentElement?.closest('code,pre,svg'))nodes.push(n)}for(const n of nodes){if(!/\$/.test(n.data))continue;const span=document.createElement('span');let last=0;for(const m of n.data.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g)){span.append(document.createTextNode(n.data.slice(last,m.index)));const math=document.createElement('span');katex.render(m[1]||m[2],math,{throwOnError:false,displayMode:!!m[1]});span.append(math);last=m.index!+m[0].length}span.append(document.createTextNode(n.data.slice(last)));n.replaceWith(span)}}
  }
  const load=(text:string)=>{source.value=text;void render()};source.oninput=()=>void render();
  const buttons=Array.from(body.querySelectorAll('button'));
  const status=document.createElement('span');status.className='copy-status';status.setAttribute('role','status');buttons[0].after(status);
  buttons[0].onclick=async()=>{try{await navigator.clipboard.writeText(source.value);status.textContent='Copied!'}catch{status.textContent='Copy unavailable. Select the source and copy manually.'}};
  const presets:Record<string,string>={Table:examples.cards.find(c=>c.title==='Table')!.code,'Code block':examples.cards.find(c=>c.title==='Code Block')!.code,'Task list':examples.cards.find(c=>c.title==='Task List')!.code,Callouts:'> [!TIP]\n> GitHub-style callouts render here too.\n\n> [!WARNING]\n> Check your Markdown before publishing.','Math & diagrams':'## Math\n\n$E = mc^2$\n\n```mermaid\nflowchart LR\n  Markdown --> Preview\n```',Footnotes:examples.cards.find(c=>c.title==='Footnote')!.code};
  for(const button of buttons.slice(1)){const label=button.textContent!.trim();button.onclick=()=>load(label==='Reset'?data.initial:presets[label]||data.initial)}
  const cleanup=syncShadowTheme(ref.current!);
  return()=>{revision++;cleanup()};
 },[]);
 return <div ref={ref} aria-label="Cheat sheet introduction and playground"/>;
}
