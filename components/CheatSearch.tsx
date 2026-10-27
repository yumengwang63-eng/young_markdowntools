'use client';
import {Search,Download} from 'lucide-react';
import styles from './CheatSearch.module.css';
const sections=[['headings','Headings'],['emphasis','Emphasis'],['lists','Lists'],['links','Links'],['images','Images'],['code','Code'],['tables','Tables'],['blockquotes','Blockquotes'],['horizontal-rules','Horizontal Rules'],['task-lists','Task Lists'],['footnotes','Footnotes'],['other','Other']];
const platforms=[['r-markdown-cheat-sheet','R Markdown'],['obsidian-cheat-sheet','Obsidian'],['discord-markdown','Discord'],['jupyter-markdown-cheat-sheet','Jupyter'],['github-markdown-cheat-sheet','GitHub']];
export default function CheatSearch({query,onQuery}:{query:string;onQuery:(value:string)=>void}){
 return <div className={styles.region} aria-label="Syntax search and platform guides"><div className={styles.toolbar}><div className={styles.row}><label className={styles.search}><span className={styles.srOnly}>Search Markdown syntax</span><Search size={16} aria-hidden="true"/><input type="search" aria-label="Search Markdown syntax" placeholder="Search headings, links, tables, task lists..." value={query} onChange={e=>onQuery(e.target.value)}/></label><button className={styles.print} onClick={()=>window.print()}><Download size={16} aria-hidden="true"/>Save or Print</button></div><nav className={styles.nav} aria-label="Syntax sections">{sections.map(([id,name])=><a key={id} href={'#'+id} onClick={()=>{if(query){onQuery('');requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}))}}}>{name}</a>)}</nav></div><aside className={styles.platforms}><div>Looking for platform-specific syntax?</div><div className={styles.links}>{platforms.map(([slug,name])=><a href={'/'+slug} key={slug}>{name}</a>)}</div></aside></div>;
}

