import {marked} from 'marked';
export function externalLinks(input:string){
 const links=new Map<string,{url:string;occurrences:number}>();
 marked.walkTokens(marked.lexer(input),(token:any)=>{if(!['link','image'].includes(token.type)||!/^https?:\/\//i.test(token.href))return;try{const url=new URL(token.href);url.hash='';const value=url.toString(),row=links.get(value);if(row)row.occurrences++;else links.set(value,{url:value,occurrences:1})}catch{}});
 return [...links.values()];
}
export type RemoteLinkResult={url:string;finalUrl?:string;status?:number;state:'ok'|'redirected'|'broken'|'restricted'|'error'|'blocked';message:string};
