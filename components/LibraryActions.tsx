'use client';
import {useEffect,useRef,useState} from 'react';
import {documents,LocalDocument} from '../lib/documents';
export default function LibraryActions({text,onStatus}:{text:string;onStatus:(message:string)=>void}){
 const id=useRef(''),title=useRef(''),[busy,setBusy]=useState(false),[link,setLink]=useState('');
 useEffect(()=>{const value=new URLSearchParams(location.search).get('document');if(value)documents('get',value).then(doc=>{if(doc){id.current=value;title.current=(doc as LocalDocument).title}}).catch(()=>{})},[]);
 async function save(share=false){setBusy(true);try{const doc={id:id.current||crypto.randomUUID(),title:title.current||text.match(/^#\s+(.+)$/m)?.[1]||'Untitled',content:text,updatedAt:new Date().toISOString()};await documents('put',doc);id.current=doc.id;title.current=doc.title;if(share){const url=location.origin+'/d/'+doc.id;setLink(url);try{await navigator.clipboard.writeText(url);onStatus('Saved. Local link copied; it opens only in this browser.')}catch{onStatus('Saved. Open or copy the local link below.')}}else onStatus('Saved to My documents.')}catch(error){onStatus('Could not save document: '+(error as Error).message)}finally{setBusy(false)}}
 return <><button className="secondary" disabled={busy} onClick={()=>save()}>Save to My documents</button><button className="secondary" disabled={busy} onClick={()=>save(true)}>Share locally</button>{link&&<a href={link}>Open local link</a>}</>;
}
