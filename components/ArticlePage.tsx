'use client';
import {useState} from 'react';
import Link from 'next/link';
import {articles} from '../content/articles';
import {SiteNav} from './SiteHome';
import {RichPreview} from './Advanced';

export default function ArticlePage({slug}:{slug:string}){
 const article=articles.find(a=>a.slug===slug),[input,setInput]=useState(article?.example||''),[status,setStatus]=useState('');
 if(!article)return <><SiteNav/><main className="toolmain guidepage"><h1>Markdown Guides</h1><p>Learn writing and conversion workflows, then try the tools.</p><div className="categorygrid">{articles.map(a=><Link className="panel article-card" href={'/'+a.slug} key={a.slug}><h2>{a.title}</h2><p>{a.description}</p><span>Read guide →</span></Link>)}</div><h2>Syntax and reference</h2><p><Link href="/syntax">Markdown syntax guides</Link> · <Link href="/cheat-sheet">Interactive cheat sheet</Link></p></main></>;
 return <><SiteNav/><main className="toolmain guidepage article-page"><Link className="back" href="/guides">← All guides</Link><h1>{article.title}</h1><p className="guideintro">{article.intro}</p>{article.notice&&<aside className="notice">{article.notice}</aside>}
 {article.example&&<section aria-label="Try Markdown"><h2>Try Markdown</h2><div className="local-actions"><button onClick={async()=>{try{await navigator.clipboard.writeText(input);setStatus('Copied Markdown.')}catch{setStatus('Select the Markdown source and copy it manually.')}}}>Copy Markdown</button><button onClick={()=>setInput(article.example!)}>Reset example</button></div><div className="workspace"><section className="panel"><textarea aria-label="Guide Markdown example" value={input} onChange={event=>setInput(event.target.value)}/></section><section className="panel"><RichPreview text={input}/></section></div><p role="status">{status}</p></section>}
 <nav className="article-toc panel" aria-label="On this page"><h2>On this page</h2>{article.sections.map(section=><a href={'#'+section.id} key={section.id}>{section.title}</a>)}<a href="#guide-faq">Frequently asked questions</a></nav>
 {article.sections.map(section=><section className="article-section" id={section.id} key={section.id}><h2>{section.title}</h2>{section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}{section.code&&<pre>{section.code}</pre>}{section.links&&<div className="local-actions">{section.links.map(([label,url])=><Link key={url} href={url}>{label} →</Link>)}</div>}</section>)}
 <section id="guide-faq" className="article-section"><h2>Frequently asked questions</h2>{article.faq.map(([question,answer])=><article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</section>
 <section className="article-section"><h2>Related tools and guides</h2><div className="categorygrid">{article.related.map(([name,href])=><Link className="panel article-card" href={href} key={href}>{name} →</Link>)}</div></section>
 </main></>;
}
