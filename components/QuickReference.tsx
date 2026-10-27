'use client';
import {useEffect,useRef} from 'react';
import {syncShadowTheme} from '../lib/shadow-theme';
import data from './quick-reference.json';
export function OriginalCard({html,code,title,onCopy}:{html:string;code:string;title:string;onCopy:(text:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const root=ref.current!.shadowRoot||ref.current!.attachShadow({mode:'open'});root.innerHTML='';
 const style=document.createElement('style');style.textContent=':host{display:block;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans",Arial,sans-serif;--font-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--tw-border-style:solid;--background:#fff;--text-primary:#18181b;--text-secondary:#52525b;--text-muted:#71717a;--surface:#f6f6f8;--border:#e6e6eb;--code-bg:#f6f6f8;--code-border:#e6e6eb;--primary:#6355f5;--success-bg:#ecfdf5;--success-text:#047857;--warning-bg:#fffbeb;--warning-border:#fde68a;--warning-text:#92400e;--warning-text-muted:#a16207;color:#18181b;margin-bottom:24px}@layer base{*,::before,::after{box-sizing:border-box;border-style:solid;border-width:0}}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace!important}.syntax-card{content-visibility:visible!important}button{cursor:pointer}[hidden]{display:none!important}.border{border-style:solid}.bg-warning-bg{background:#fffbeb}.border-warning-border{border-color:#fde68a}.text-warning-text{color:#92400e}.text-warning-text-muted{color:#a16207}.bg-info-bg{background:#eef2ff}.border-info-border{border-color:#c7d2fe}.text-info-text{color:#3730a3}.text-info-text-muted{color:#4f46e5}.markdown-preview blockquote{border-left:4px solid #e6e6eb}';root.append(style);
 for(const href of ['/cheat-sheet-original-1.css','/cheat-sheet-original-2.css']){const link=document.createElement('link');link.rel='stylesheet';link.href=href;root.append(link)}
 const body=document.createElement('div');body.innerHTML=html;root.append(body);
 const mainCopy=body.querySelector('button')!;
 const bindCopy=(button:HTMLButtonElement,text:string,label:string)=>{button.setAttribute('aria-label',label);button.onclick=async()=>{try{await navigator.clipboard.writeText(text);const span=button.querySelector('span');if(span){span.textContent='Copied!';setTimeout(()=>{if(span.isConnected)span.textContent='Copy'},1600)}}catch{onCopy(text)}}};
 bindCopy(mainCopy,code,'Copy '+title);
 for(const toggle of body.querySelectorAll('button')){if(!toggle.textContent?.includes('variations'))continue;const panel=toggle.nextElementSibling as HTMLElement;const count=panel.querySelectorAll('code').length;panel.hidden=true;const label=document.createElement('span');label.textContent=`Show variations (${count})`;toggle.replaceChildren(label);toggle.setAttribute('aria-expanded','false');toggle.onclick=()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));label.textContent=`${panel.hidden?'Show':'Hide'} variations (${count})`};for(const row of Array.from(panel.children)){const button=row.querySelector('button'),source=row.querySelector('code');if(button&&source)bindCopy(button,source.textContent||'','Copy '+title+' '+(row.querySelector('span')?.textContent||'variation'))}}
 for(const link of body.querySelectorAll<HTMLAnchorElement>('a[href="/preview"],a[href="/editor"]')){link.onclick=()=>{try{sessionStorage.setItem('replica:cheat-example',code)}catch{}}}
 for(const link of body.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')){link.onclick=event=>{const id=decodeURIComponent(link.hash.slice(1));const target=Array.from(body.querySelectorAll<HTMLElement>('[id]')).find(el=>el.id===id);if(target){event.preventDefault();target.scrollIntoView({block:'nearest'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}}}

 return syncShadowTheme(ref.current!);
 },[html,code,title,onCopy]);return <div ref={ref}/>;
}
export default function QuickReference(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const host=ref.current;if(!host)return;const root=host.shadowRoot||host.attachShadow({mode:'open'});root.innerHTML='';
 const style=document.createElement('style');style.textContent=':host{display:block;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans",Arial,sans-serif;--font-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--tw-border-style:solid;--background:#fff;--text-primary:#18181b;--text-secondary:#52525b;--text-muted:#71717a;--surface:#f6f6f8;--border:#e6e6eb;--code-bg:#f6f6f8;--code-border:#e6e6eb;--primary:#6355f5;--success-bg:#ecfdf5;--success-text:#047857;--warning-bg:#fffbeb;--warning-border:#fde68a;--warning-text:#92400e;--warning-text-muted:#a16207;color:#18181b}@layer base{*,::before,::after{box-sizing:border-box;border-style:solid;border-width:0}}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace!important}.syntax-card{content-visibility:visible!important}button{cursor:pointer}[hidden]{display:none!important}.border{border-style:solid}.bg-warning-bg{background:#fffbeb}.border-warning-border{border-color:#fde68a}.text-warning-text{color:#92400e}.text-warning-text-muted{color:#a16207}.bg-info-bg{background:#eef2ff}.border-info-border{border-color:#c7d2fe}.text-info-text{color:#3730a3}.text-info-text-muted{color:#4f46e5}.markdown-preview blockquote{border-left:4px solid #e6e6eb}';root.append(style);
 for(const href of ['/cheat-sheet-original-1.css','/cheat-sheet-original-2.css']){const link=document.createElement('link');link.rel='stylesheet';link.href=href;root.append(link)}
 const body=document.createElement('div');body.innerHTML=data.html;root.append(body);
 return syncShadowTheme(host);
 },[]);
 return <div ref={ref} aria-label="Markdown Syntax Quick Reference"/>;
}
