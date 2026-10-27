'use client';
import { useState, useCallback } from 'react';
import { SiteNav } from './SiteHome';
import { RichPreview } from './Advanced';
import data from './cheat-sheet-data.json';
import styles from './CheatSheet.module.css';
import CheatIntro from './CheatIntro';
import CheatSearch from './CheatSearch';
import SyntaxDeepDives from './SyntaxDeepDives';
import FlavorComparison from './FlavorComparison';
import CheatExtras from './CheatExtras';
import QuickReference, { OriginalCard } from './QuickReference';

const initial = '# Try Markdown\n\nWrite **bold**, *italic* and `code`.\n\n- [x] Copy an example\n- [ ] Try it here\n\n| Syntax | Result |\n| --- | --- |\n| Markdown | Preview |';
const groups = [...new Map(data.cards.map(c => [c.section, c.category])).entries()];
const platforms = [['GitHub','github-markdown-cheat-sheet'],['GitLab','gitlab-markdown'],['Obsidian','obsidian-cheat-sheet'],['Discord','discord-markdown'],['Slack','slack-markdown'],['Notion','notion-to-markdown'],['Reddit','reddit-markdown'],['Jupyter','jupyter-markdown-cheat-sheet'],['R Markdown','r-markdown-cheat-sheet']];
export default function CheatSheet() {
  const [query,setQuery] = useState('');
  const [input,setInput] = useState(initial);
  const [message,setMessage] = useState('');
  const copy = useCallback(async (text:string) => { try { await navigator.clipboard.writeText(text); setMessage('Copied to clipboard.'); } catch { setMessage('Copy unavailable. Select the Markdown source and copy it manually.'); } }, []);
  const matches = data.cards.filter(c => `${c.title} ${c.category} ${c.description} ${c.code}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <><SiteNav/><main className={`toolmain ${styles.sheet}`}><CheatIntro/>
    <QuickReference/>
    <CheatSearch query={query} onQuery={setQuery}/>
    <p role="status" aria-live="polite" style={{position:"absolute",width:1,height:1,overflow:"hidden",clipPath:"inset(50%)"}}>{message || `${matches.length} syntax examples`}</p>
    {!matches.length&&<p>No syntax matches your search. <button onClick={()=>setQuery('')}>Clear search</button></p>}
    {groups.map(([id,name])=>{const cards=matches.filter(c=>c.section===id);return cards.length?<section key={id} id={id} className={styles.section}><h2>{name}</h2>{cards.map(c=><article id={c.id} key={c.id}><OriginalCard html={c.html} code={c.code} title={c.title} onCopy={copy}/></article>)}</section>:null;})}
    <SyntaxDeepDives/>
    <FlavorComparison/>
    <CheatExtras/>
    </main></>;
}
