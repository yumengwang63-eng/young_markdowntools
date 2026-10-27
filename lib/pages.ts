import {catalog,categories} from './catalog';
import {syntaxTopics,platform} from './guides';
import {articles} from '../content/articles';
export type PublicPage={slug:string;name:string;description:string};
const fixed:PublicPage[]=[
 {slug:'',name:'Free Online Markdown Tools',description:'Write, convert and create Markdown in your browser.'},
 {slug:'tools',name:'All Markdown Tools',description:'Browse the full Markdown tool directory.'},
 {slug:'syntax',name:'Markdown Syntax',description:'Learn Markdown with examples, previews and practice.'},
 {slug:'guides',name:'Markdown Guides',description:'Choose an editor and learn document conversion workflows.'},
 {slug:'about',name:'About this project',description:'Learn about this independent local recreation.'},
 {slug:'privacy',name:'Privacy and data handling',description:'Understand browser storage, local links and network requests.'},
 {slug:'changelog',name:'Changelog',description:'Read the local recreation’s implementation milestones.'},
 {slug:'markdown-to-docx',name:'Markdown to DOCX',description:'Export a Markdown document to Word format.'},
];
export const publicPages:PublicPage[]=[...new Map([
 ...fixed,...catalog,...categories.map(c=>({slug:c.slug,name:c.name,description:'Browse '+c.name+' for Markdown.'})),
 ...Object.entries(platform).map(([slug,[name,description]])=>({slug,name,description})),
 ...Object.entries(syntaxTopics).map(([slug,[name,description]])=>({slug:'syntax/'+slug,name:name+' — Markdown Syntax',description})),
 ...articles.map(a=>({slug:a.slug,name:a.title,description:a.description})),
].map(page=>[page.slug,page])).values()];
export const pageAliases:Record<string,string>={'syntax/horizontal-rules':'syntax/horizontal-rule','syntax/escaping':'syntax/escaping-characters'};
export const indexedPages=publicPages.filter(page=>!pageAliases[page.slug]);
export function getPage(slug:string):PublicPage|undefined{
 if(slug==='workspace')return {slug,name:'My documents',description:'Save and edit documents in this browser.'};
 if(/^d\/[^/]+$/.test(slug))return {slug,name:'Local document',description:'A document saved in this browser.'};
 return publicPages.find(page=>page.slug===slug);
}
export const staticDownloads=[
 'pdf/github-markdown-cheat-sheet.pdf','pdf/jupyter-notebook-markdown-cheat-sheet.pdf','pdf/markdown-cheat-sheet.pdf','pdf/markdown-flavor-compatibility.pdf','pdf/obsidian-markdown-cheat-sheet.pdf','pdf/r-markdown-cheat-sheet.pdf',
 'downloads/markdown-flavor-compatibility.md','downloads/obsidian-markdown-cheat-sheet.md',
];
