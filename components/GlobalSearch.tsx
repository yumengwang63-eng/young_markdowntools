'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {indexedPages} from '../lib/pages';

export default function GlobalSearch(){
  const [open,setOpen]=useState(false),[query,setQuery]=useState('');
  const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const key=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setOpen(value=>!value)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
  useEffect(()=>{if(open){setQuery('');dialog.current?.showModal()}else if(dialog.current?.open){dialog.current.close();trigger.current?.focus()}},[open]);
  const results=indexedPages.filter(page=>page.slug).filter(row=>(row.name+' '+row.description).toLowerCase().includes(query.toLowerCase())).slice(0,30);
  return <><button ref={trigger} className="quiet" onClick={()=>setOpen(true)} aria-label="Search all tools">Search <kbd>Ctrl K</kbd></button><dialog ref={dialog} className="global-search" onCancel={()=>setOpen(false)} onClick={event=>{if(event.target===event.currentTarget)setOpen(false)}} aria-labelledby="search-heading"><div className="panelbar"><h2 id="search-heading">Search MarkdownTools</h2><button onClick={()=>setOpen(false)} aria-label="Close search">×</button></div><input autoFocus aria-label="Search all tools and categories" placeholder="Find a tool or category…" value={query} onChange={event=>setQuery(event.target.value)}/><div className="search-results">{results.map(row=><Link href={'/'+row.slug} key={row.slug} onClick={()=>setOpen(false)}><strong>{row.name}</strong><small>{row.description}</small></Link>)}{!results.length&&<p>No matching tools.</p>}</div></dialog></>;
}
