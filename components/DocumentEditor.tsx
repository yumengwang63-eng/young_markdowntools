'use client';
import {Bold,Italic,Link as LinkIcon,Code,CodeSquare,List,ListOrdered,ListTodo,Quote,Table,Strikethrough,Image,Info,Minus,PanelLeft,Search,SpellCheck,Maximize,Eye,ArrowDownUp,Upload,FileText,Sparkles,Share2,Copy,Undo2,Redo2} from 'lucide-react';
import {formatMarkdown} from './conversions';
import SourceHighlight from './SourceHighlight';
import useExample from './useExample';
import {useEffect,useRef,useState} from 'react';
import {SiteNav} from './SiteHome';
import {RichPreview} from './Advanced';
import {ToolHelp} from './Content';
import {marked} from 'marked';
import DOMPurify from 'dompurify';
import Turndown from 'turndown';
import {htmlTableMarkdown} from './conversions';
import EditorExportMenu from './EditorExportMenu';
import LibraryActions from './LibraryActions';
import {documents,LocalDocument} from '../lib/documents';
const demo='# Project notes\n\n## Summary\nA **clear** document with $E=mc^2$.\n\n## Tasks\n- [x] Draft\n- [ ] Review\n\n## Data\n| Name | Status |\n| --- | --- |\n| Editor | Ready |\n\n## Diagram\n```mermaid\nflowchart LR\n Draft --> Review --> Publish\n```';
const EMOJIS:[string,string][]=[['smile','😄'],['joy','😂'],['heart','❤️'],['thumbsup','👍'],['thumbsdown','👎'],['tada','🎉'],['rocket','🚀'],['fire','🔥'],['warning','⚠️'],['check','✅'],['x','❌'],['eyes','👀'],['sparkles','✨'],['bulb','💡'],['memo','📝'],['bug','🐛'],['lock','🔒'],['link','🔗'],['star','⭐'],['wave','👋']];
function download(text:string,name:string,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export default function DocumentEditor({viewer=false}:{viewer?:boolean}){const slug=viewer?'preview':'editor';const[text,setText]=useState(''),[ready,setReady]=useState(false),[status,setStatus]=useState(''),[theme,setTheme]=useState('default'),[outline,setOutline]=useState(false),[spell,setSpell]=useState(true),[showPreview,setShowPreview]=useState(true),[sync,setSync]=useState(true),[full,setFull]=useState(false),[find,setFind]=useState(false),[query,setQuery]=useState(''),[replacement,setReplacement]=useState(''),[regex,setRegex]=useState(false),[caseSensitive,setCaseSensitive]=useState(false),[externalDraft,setExternalDraft]=useState<string|null>(null),[emojiQuery,setEmojiQuery]=useState(''),[emojiStart,setEmojiStart]=useState<number|null>(null),[emojiIndex,setEmojiIndex]=useState(0),[historyVersion,setHistoryVersion]=useState(0);const source=useRef<HTMLTextAreaElement>(null),preview=useRef<HTMLDivElement>(null),history=useRef<string[]>(['']),historyIndex=useRef(0),skipHistory=useRef(false);const cheatExample=useRef<string|null>(null);useEffect(()=>{let initial='';try{initial=localStorage.getItem('document:'+slug)||'';const example=sessionStorage.getItem('replica:cheat-example');if(example!==null){cheatExample.current=example;sessionStorage.removeItem('replica:cheat-example')}if(cheatExample.current!==null)initial=cheatExample.current}catch{setStatus('Local storage unavailable; download a backup.')}history.current=[initial];historyIndex.current=0;setText(initial);setReady(true);setHistoryVersion(v=>v+1)},[slug]);useEffect(()=>{if(!ready)return;
if(skipHistory.current){skipHistory.current=false;return}
if(history.current[historyIndex.current]===text)return;history.current=history.current.slice(0,historyIndex.current+1);history.current.push(text);
if(history.current.length>100)history.current.shift();historyIndex.current=history.current.length-1;setHistoryVersion(v=>v+1)},[text,ready]);useEffect(()=>{if(!ready||externalDraft!==null)return;const timer=setTimeout(()=>{try{localStorage.setItem('document:'+slug,text);setStatus('Saved on this device')}catch{setStatus('Could not save locally. Download a backup.')}},400);return()=>clearTimeout(timer)},[text,ready,slug,externalDraft]);
useEffect(()=>{function changed(e:StorageEvent){if(e.key==='document:'+slug&&e.newValue!==null){setExternalDraft(e.newValue);setStatus('Another tab changed this draft. Choose which version to keep.')}}window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed)},[slug]);
function pasteContent(e:React.ClipboardEvent<HTMLTextAreaElement>){const plain=e.clipboardData.getData('text/plain'),html=e.clipboardData.getData('text/html'),el=e.currentTarget,start=el.selectionStart,end=el.selectionEnd;let value:string|undefined;try{if(start!==end&&/^https?:\/\/\S+$/.test(plain.trim()))value='['+text.slice(start,end).replace(/[[\]]/g,'\\$&')+'](<'+plain.trim().replace(/[<>]/g,'')+'>)';else if(html){const clean=DOMPurify.sanitize(html);value=/<table[\s>]/i.test(clean)?htmlTableMarkdown(clean):new Turndown({headingStyle:'atx',codeBlockStyle:'fenced'}).turndown(clean)}else if(plain.includes('\t')){const rows=plain.trimEnd().split(/\r?\n/).map(row=>row.split('\t'));const width=Math.max(...rows.map(r=>r.length));const lines=rows.map(row=>'| '+Array.from({length:width},(_,i)=>(row[i]||'').replace(/\|/g,'\\|')).join(' | ')+' |');lines.splice(1,0,'| '+Array(width).fill('---').join(' | ')+' |');value=lines.join('\n')}}catch{setStatus('Could not convert clipboard; pasted plain text.');value=plain}
if(value!==undefined){e.preventDefault();setText(text.slice(0,start)+value+text.slice(end));requestAnimationFrame(()=>{el.selectionStart=el.selectionEnd=start+value!.length})}}
const emojiOptions=emojiQuery?EMOJIS.filter(([name])=>name.includes(emojiQuery)).slice(0,8):[];
function changeText(e:React.ChangeEvent<HTMLTextAreaElement>){const value=e.target.value,caret=e.target.selectionStart,before=value.slice(0,caret),match=before.match(/:([a-z0-9_+-]{2,})$/i);setText(value);
if(match){setEmojiQuery(match[1].toLowerCase());setEmojiStart(caret-match[0].length);setEmojiIndex(0)}else{setEmojiQuery('');setEmojiStart(null)}}
function chooseEmoji(name:string,symbol:string){const el=source.current;
if(!el||emojiStart===null)return;const end=el.selectionStart,value=text.slice(0,emojiStart)+symbol+text.slice(end),caret=emojiStart+symbol.length;setText(value);setEmojiQuery('');setEmojiStart(null);requestAnimationFrame(()=>{el.setSelectionRange(caret,caret);el.focus()});setStatus('Inserted :'+name+':')}
function handleEmojiKey(e:React.KeyboardEvent<HTMLTextAreaElement>){if(!emojiOptions.length)return false;
if(e.key==='Escape'){e.preventDefault();setEmojiQuery('');setEmojiStart(null);return true}
if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setEmojiIndex(index=>(index+(e.key==='ArrowDown'?1:-1)+emojiOptions.length)%emojiOptions.length);return true}
if(e.key==='Enter'){e.preventDefault();chooseEmoji(...emojiOptions[emojiIndex]);return true}return false}
useEffect(()=>{let active=true;const id=new URLSearchParams(location.search).get('document');if(id)documents('get',id).then(doc=>{if(!active)return;if(doc){const content=(doc as LocalDocument).content;setText(content);history.current=[content];historyIndex.current=0;setHistoryVersion(v=>v+1);setStatus('Opened from My documents.')}else setStatus('Document not found in this browser.')}).catch(()=>{if(active)setStatus('Unable to open local document.')});return()=>{active=false}},[slug]);
useExample(setText);const headings=marked.lexer(text).filter(t=>t.type==='heading') as any[];function insert(before:string,after='',fallback='text'){const el=source.current;
if(!el)return;const start=el.selectionStart,end=el.selectionEnd,selection=text.slice(start,end)||fallback;setText(text.slice(0,start)+before+selection+after+text.slice(end));requestAnimationFrame(()=>{el.focus();el.setSelectionRange(start+before.length,start+before.length+selection.length)})}
function findMatches(){if(!query)return [];try{const pattern=regex?query:Array.from(query).map(c=>'\\^$.*+?()[]{}|'.includes(c)?'\\'+c:c).join('');return Array.from(text.matchAll(new RegExp(pattern,'g'+(caseSensitive?'':'i')))).slice(0,10000)}catch{return []}}
const matches=findMatches();
function findNext(){const from=source.current?.selectionEnd||0;const m=matches.find(m=>m.index!>=from)||matches[0];
if(m&&source.current){source.current.focus();source.current.setSelectionRange(m.index!,m.index!+m[0].length)}}
function replaceAll(){if(!query)return;try{const pattern=regex?query:Array.from(query).map(c=>'\\^$.*+?()[]{}|'.includes(c)?'\\'+c:c).join('');setText(regex?text.replace(new RegExp(pattern,'g'+(caseSensitive?'':'i')),replacement):text.replace(new RegExp(pattern,'g'+(caseSensitive?'':'i')),()=>replacement));setStatus('Replaced matching text')}catch(e){setStatus('Invalid regular expression: '+(e as Error).message)}}
function travelHistory(delta:number){const next=historyIndex.current+delta;
if(next<0||next>=history.current.length)return;historyIndex.current=next;skipHistory.current=true;setText(history.current[next]);setHistoryVersion(v=>v+1);setStatus(delta<0?'Undid last edit':'Redid edit');requestAnimationFrame(()=>source.current?.focus())}
function prefixLines(prefix:string){const el=source.current;
if(!el)return;const start=text.lastIndexOf('\n',el.selectionStart-1)+1,next=text.indexOf('\n',el.selectionEnd),end=next<0?text.length:next,selected=text.slice(start,end),value=selected.split('\n').map((line,index)=>{if(prefix==='> ')return '> '+line.replace(/^\s*>\s?/,'');const clean=line.replace(/^\s*(?:[-+*]|\d+\.)\s+/,'');return prefix==='1. '?`${index+1}. ${clean}`:'- '+clean}).join('\n');setText(text.slice(0,start)+value+text.slice(end));requestAnimationFrame(()=>{el.setSelectionRange(start,start+value.length);el.focus()})}
function handleLineAction(e:React.KeyboardEvent<HTMLTextAreaElement>){
  if(!e.altKey||!['ArrowUp','ArrowDown'].includes(e.key))return false;
  const el=e.currentTarget,start=text.lastIndexOf('\n',el.selectionStart-1)+1,next=text.indexOf('\n',el.selectionEnd),end=next<0?text.length:next,block=text.slice(start,end);e.preventDefault();
  if(e.shiftKey&&e.key==='ArrowDown'){const insert=end<text.length?end+1:end,separator=insert<text.length?'\n':'';setText(text.slice(0,insert)+block+separator+text.slice(insert));requestAnimationFrame(()=>{el.setSelectionRange(insert,insert+block.length);el.focus()});return true}
  if(e.key==='ArrowUp'){if(start===0)return true;const previousStart=text.lastIndexOf('\n',Math.max(0,start-2))+1,previous=text.slice(previousStart,start-1);setText(text.slice(0,previousStart)+block+'\n'+previous+text.slice(end));requestAnimationFrame(()=>{el.setSelectionRange(previousStart,previousStart+block.length);el.focus()});return true}
  if(end===text.length)return true;const followingStart=end+1,followingEnd=text.indexOf('\n',followingStart),followingStop=followingEnd<0?text.length:followingEnd,following=text.slice(followingStart,followingStop),movedStart=start+following.length+1;setText(text.slice(0,start)+following+'\n'+block+text.slice(followingStop));requestAnimationFrame(()=>{el.setSelectionRange(movedStart,movedStart+block.length);el.focus()});return true
}
function handleTableOrIndent(e:React.KeyboardEvent<HTMLTextAreaElement>){
  const el=e.currentTarget,start=el.selectionStart,end=el.selectionEnd,lineStart=text.lastIndexOf('\n',start-1)+1,nextBreak=text.indexOf('\n',start),lineEnd=nextBreak<0?text.length:nextBreak,line=text.slice(lineStart,lineEnd);
  const table=/^\s*\|.*\|\s*$/.test(line)&&!/^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/.test(line);
  if(e.key==='Tab'){
    e.preventDefault();
    if(table){
      const bars=Array.from(line.matchAll(/(?<!\\)\|/g),m=>m.index!);
      let cell=Math.max(0,bars.findIndex((position,index)=>index>0&&lineStart+position>=start)-1);
      if(cell<0)cell=bars.length-2;
      let target=cell+(e.shiftKey?-1:1),nextText=text,nextLineStart=lineStart;
      if(target<0){const previous=text.lastIndexOf('\n',Math.max(0,lineStart-2));
if(previous<0)return true;nextLineStart=previous+1;const previousEnd=lineStart-1,previousLine=text.slice(nextLineStart,previousEnd);
if(!/^\s*\|.*\|\s*$/.test(previousLine))return true;const previousBars=Array.from(previousLine.matchAll(/(?<!\\)\|/g),m=>m.index!);const left=nextLineStart+previousBars[previousBars.length-2]+1,right=nextLineStart+previousBars[previousBars.length-1];requestAnimationFrame(()=>{el.setSelectionRange(left,right);el.focus()});return true}
      if(target>=bars.length-1){const columns=bars.length-1,newRow='\n| '+Array(columns).fill('').join(' | ')+' |';nextText=text.slice(0,lineEnd)+newRow+text.slice(lineEnd);nextLineStart=lineEnd+1;target=0;setText(nextText);const nextBars=Array.from(newRow.slice(1).matchAll(/\|/g),m=>m.index!);requestAnimationFrame(()=>{el.setSelectionRange(nextLineStart+nextBars[0]+1,nextLineStart+nextBars[1]);el.focus()});return true}
      const left=lineStart+bars[target]+1,right=lineStart+bars[target+1];requestAnimationFrame(()=>{el.setSelectionRange(left,right);el.focus()});return true
    }
    const blockStart=text.lastIndexOf('\n',start-1)+1,after=text.indexOf('\n',end),blockEnd=after<0?text.length:after,selected=text.slice(blockStart,blockEnd),updated=selected.split('\n').map(line=>e.shiftKey?line.replace(/^ {1,2}/,''):'  '+line).join('\n');setText(text.slice(0,blockStart)+updated+text.slice(blockEnd));requestAnimationFrame(()=>{el.setSelectionRange(blockStart,blockStart+updated.length);el.focus()});return true
  }
  if(e.key==='Enter'&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&table&&start===end&&start===lineEnd){e.preventDefault();const cells=line.split('|').slice(1,-1);
if(cells.every(cell=>!cell.trim())){setText(text.slice(0,lineStart)+text.slice(lineEnd+(lineEnd<text.length?1:0)));requestAnimationFrame(()=>el.setSelectionRange(lineStart,lineStart));return true}const row='\n| '+cells.map(()=>'').join(' | ')+' |';setText(text.slice(0,start)+row+text.slice(start));requestAnimationFrame(()=>el.setSelectionRange(start+3,start+3));return true}
  return false
}

return <><SiteNav/><main className={"toolmain documentpage "+(viewer?"":"originaleditor ")+(full?"editorfullscreen":"")}><h1>{viewer?'Markdown Viewer':'Markdown Editor'}</h1><p>Write Markdown with a colour-coded source pane, a live preview, and spell check and Grammarly that actually work. Free, no sign-up, nothing uploaded.</p><div className="advancedbar"><label className="secondary"><Upload size={16}/> Open .md<input aria-label="Open Markdown file" type="file" accept=".md,.markdown,.txt" onChange={async e=>{const f=e.target.files?.[0];
if(!f)return;
if(!/\.(md|markdown|txt)$/i.test(f.name)){setStatus('Choose a .md, .markdown or .txt file.');return}
if(f.size>5*1024*1024){setStatus('File too large: maximum 5 MB.');return}
if(!confirm('Replace the current document? Download a backup first if needed.'))return;setText(await f.text());setStatus('Opened '+f.name);e.target.value=''}}/></label><button className="secondary" onClick={()=>setText(demo)}><FileText size={16}/> Try a sample</button>
<button className="secondary" onClick={()=>setText(formatMarkdown(text))}><Sparkles size={16}/> Format</button>
<LibraryActions text={text} onStatus={setStatus}/><EditorExportMenu text={text} onStatus={setStatus}/><button className="quiet" onClick={()=>navigator.clipboard.writeText(text).then(()=>setStatus('Copied Markdown')).catch(()=>setStatus('Clipboard unavailable'))}><Copy size={16}/> Copy Markdown</button><label className="editorreadingstyle">Reading style <select aria-label="Reading style" value={theme} onChange={e=>setTheme(e.target.value)}>{['default','paper','serif','dark','compact'].map(t=><option key={t}>{t}</option>)}</select></label></div>{!viewer&&<div className="formattoolbar" aria-label="Formatting toolbar"><select aria-label="Heading level" defaultValue="" onChange={e=>{insert(e.target.value,'','Heading');e.target.value=''}}><option value="">Paragraph</option>{[1,2,3,4,5,6].map(n=><option key={n} value={'#'.repeat(n)+' '}>Heading {n}</option>)}</select><button aria-label="Bold" title="Bold" onClick={()=>insert('**','**','bold')}><Bold size={17}/></button>
<button aria-label="Italic" title="Italic" onClick={()=>insert('*','*','italic')}><Italic size={17}/></button>
<button aria-label="Link" title="Link" onClick={()=>insert('[','](https://example.com)','label')}><LinkIcon size={17}/></button>
<button aria-label="Inline code" title="Inline code" onClick={()=>insert('`','`','code')}><Code size={17}/></button>
<button aria-label="Code block" title="Code block" onClick={()=>insert('\n```text\n','\n```\n','code')}><CodeSquare size={17}/></button>
<button aria-label="List" title="List" onClick={()=>insert('- ','','item')}><List size={17}/></button>
<button aria-label="Task" title="Task" onClick={()=>insert('- [ ] ','','task')}><ListTodo size={17}/></button>
<button aria-label="Quote" title="Quote" onClick={()=>insert('> ','','quote')}><Quote size={17}/></button>
<button aria-label="Table" title="Table" onClick={()=>insert('\n| Column | Value |\n| --- | --- |\n| ',' | example |\n','row')}><Table size={17}/></button>
<button aria-label="Strikethrough" title="Strikethrough" onClick={()=>insert('~~','~~')}><Strikethrough size={17}/></button>
<button aria-label="Image" title="Image" onClick={()=>insert('![','](https://example.com/image.png)','alt text')}><Image size={17}/></button>
<button aria-label="Numbered list" title="Numbered list" onClick={()=>insert('1. ','','item')}><ListOrdered size={17}/></button>
<button aria-label="Callout" title="Callout" onClick={()=>insert('> [!NOTE]\n> ','','Note')}><Info size={17}/></button>
<button aria-label="Horizontal rule" title="Horizontal rule" onClick={()=>insert('\n---\n','','')}><Minus size={17}/></button><div className="editorrighttools"><button aria-label="Undo" title="Undo (Ctrl+Z)" disabled={historyVersion>=0&&historyIndex.current===0} onClick={()=>travelHistory(-1)}><Undo2 size={17}/></button>
<button aria-label="Redo" title="Redo (Ctrl+Y)" disabled={historyVersion>=0&&historyIndex.current>=history.current.length-1} onClick={()=>travelHistory(1)}><Redo2 size={17}/></button>
<button aria-label="Toggle outline" title="Outline" onClick={()=>setOutline(!outline)}><PanelLeft size={17}/></button>
<button aria-label="Find text" title="Find" onClick={()=>setFind(!find)}><Search size={17}/></button>
<button className={spell?'active':''} aria-label="Toggle spell check" title="Spell check" onClick={()=>setSpell(!spell)}><SpellCheck size={17}/></button>
<button className={sync?'active':''} aria-label="Toggle scroll sync" title="Scroll sync" onClick={()=>setSync(!sync)}><ArrowDownUp size={17}/></button>
<button aria-label="Toggle preview" title="Preview" onClick={()=>setShowPreview(!showPreview)}><Eye size={17}/></button>
<button aria-label="Toggle fullscreen" title="Fullscreen" onClick={()=>setFull(!full)}><Maximize size={17}/></button></div></div>}{find&&<div className="editorfind"><input aria-label="Find in document" value={query} onChange={e=>setQuery(e.target.value)}/><input aria-label="Replace with" value={replacement} onChange={e=>setReplacement(e.target.value)} placeholder="Replace with"/><label><input type="checkbox" checked={regex} onChange={e=>setRegex(e.target.checked)}/>Regular expression</label><label><input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)}/>Match case</label><span role="status">{matches.length} matches</span><button onClick={findNext}>Find next</button>
<button onClick={replaceAll}>Replace all</button>
<button onClick={()=>setFind(false)}>Close</button></div>}{externalDraft!==null&&<div role="alert" className="notice">Another tab saved a different draft. Automatic saving is paused.<button onClick={()=>{setText(externalDraft);setExternalDraft(null)}}>Use other tab draft</button>
<button onClick={()=>{setExternalDraft(null);setStatus('Keeping this draft')}}>Keep this draft</button>
<button onClick={()=>download(externalDraft,'other-tab-draft.md')}>Download other draft</button></div>}<p role="status" className="documentstatus">{text.trim()?text.trim().split(/\s+/).length:0} words　·　{text.length} chars　·　{text?text.split('\n').length:0} lines　·　{text.trim()?Math.ceil(text.trim().split(/\s+/).length/200):0} min read　·　<span>✓ {status||'Not saved yet'}</span></p><div className={"documentlayout "+(outline?"hasoutline":"")+(showPreview?"":" nopreview")}><aside className="documentoutline"><h2>Outline</h2>{headings.map((h,i)=><button style={{paddingLeft:8+(h.depth-1)*10}} key={i} onClick={()=>preview.current?.querySelectorAll('h1,h2,h3,h4,h5,h6')[i]?.scrollIntoView({behavior:'smooth',block:'start'})}>{h.text}</button>)}</aside><div className="workspace"><section className="panel documentsource">{!viewer&&<SourceHighlight text={text} query={find?query:''} regex={regex} caseSensitive={caseSensitive}/>}{!viewer&&emojiOptions.length>0&&<div className="emojipicker" role="listbox" aria-label="Emoji suggestions">{emojiOptions.map(([name,symbol],index)=><button type="button" role="option" aria-selected={index===emojiIndex} key={name} onMouseDown={event=>event.preventDefault()} onClick={()=>chooseEmoji(name,symbol)}><span>{symbol}</span> :{name}:</button>)}</div>}<textarea onPaste={pasteContent} aria-label="Source input" ref={source} value={text} onChange={changeText} placeholder="Write your Markdown here..." spellCheck={spell} onKeyDown={e=>{if(handleEmojiKey(e)||handleLineAction(e)||handleTableOrIndent(e))return;
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();travelHistory(e.shiftKey?1:-1);return}
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();travelHistory(1);return}
if((e.ctrlKey||e.metaKey)&&e.shiftKey&&['7','8','9'].includes(e.key)){e.preventDefault();prefixLines(e.key==='7'?'1. ':e.key==='8'?'- ':'> ');return}
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();download(text,'document.md');return}
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='e'){e.preventDefault();insert('`','`','code');return}
if((e.ctrlKey||e.metaKey)&&/^[0-6]$/.test(e.key)){e.preventDefault();const el=e.currentTarget,start=text.lastIndexOf('\n',el.selectionStart-1)+1,end=text.indexOf('\n',el.selectionEnd);const stop=end<0?text.length:end;const value=text.slice(start,stop).split('\n').map(l=>(e.key==='0'?'':'#'.repeat(Number(e.key))+' ')+l.replace(/^#{1,6}\s+/, '')).join('\n');setText(text.slice(0,start)+value+text.slice(stop));return}
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='g'){e.preventDefault();setFind(true);findNext();return}
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'){e.preventDefault();setFind(true);return}
if(e.key==='Enter'&&e.shiftKey&&!e.ctrlKey&&!e.metaKey){const el=e.currentTarget,start=el.selectionStart,line=text.slice(0,start).split('\n').pop()||'',m=line.match(/^(\s*)(?:[-+*] |\d+\. )(?:\[[ xX]\] )?/);if(m){e.preventDefault();const continuation='\n'+m[1]+'  ';setText(text.slice(0,start)+continuation+text.slice(el.selectionEnd));requestAnimationFrame(()=>el.setSelectionRange(start+continuation.length,start+continuation.length));return}}
if(e.key==='Enter'&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey){const el=e.currentTarget,start=el.selectionStart;
if(start===el.selectionEnd){const line=text.slice(0,start).split('\n').pop()||'';const m=line.match(/^(\s*)([-+*] |\d+\. )(\[[ xX]\] )?(.*)$/);
if(m){e.preventDefault();const prefix=m[4]?'\n'+m[1]+(/\d/.test(m[2])?(parseInt(m[2])+1)+'. ':m[2])+(m[3]?'[ ] ':''):'';const base=m[4]?start:start-line.length;setText(text.slice(0,base)+prefix+text.slice(start));requestAnimationFrame(()=>{el.selectionStart=el.selectionEnd=base+prefix.length});return}}}
if((e.ctrlKey||e.metaKey)&&['b','i','k'].includes(e.key.toLowerCase())){e.preventDefault();e.key.toLowerCase()==='b'?insert('**','**'):e.key.toLowerCase()==='i'?insert('*','*'):insert('[','](https://example.com)')}}} onScroll={e=>{const overlay=e.currentTarget.parentElement?.querySelector('.sourcehighlight');
if(overlay)overlay.scrollTop=e.currentTarget.scrollTop;
if(sync&&preview.current){const node=preview.current.querySelector('.preview');
if(node)node.scrollTop=e.currentTarget.scrollTop/Math.max(1,e.currentTarget.scrollHeight-e.currentTarget.clientHeight)*(node.scrollHeight-node.clientHeight)}}}/></section><section className={'panel documentrender '+theme} ref={preview}><RichPreview text={ready?text:''}/></section></div></div><p className="notice">Autosave is local to this browser and this page. It is not cloud backup. HTML export includes basic rendered Markdown; interactive diagrams and math styling are not bundled.</p><ToolHelp slug={slug}/></main><style>{'@media print{.siteheader,.documentpage>h1,.documentpage>p,.advancedbar,.formattoolbar,.documentoutline,.documentsource,.toolhelp,.documentrender>.panelbar{display:none!important}.documentlayout,.documentlayout>.workspace{display:block!important}.documentrender{border:0!important}.documentrender .preview{padding:0!important}}'}</style></>}
