import {ReactNode} from 'react';

type Range={start:number;end:number};
function escaped(value:string){return Array.from(value).map(c=>'\\^$.*+?()[]{}|'.includes(c)?'\\'+c:c).join('')}
function ranges(text:string,query:string,regex:boolean,caseSensitive:boolean):Range[]{
  if(!query)return [];
  try{return Array.from(text.matchAll(new RegExp(regex?query:escaped(query),'g'+(caseSensitive?'':'i')))).filter(m=>m[0].length>0).slice(0,10000).map(m=>({start:m.index!,end:m.index!+m[0].length}))}catch{return []}
}
function syntax(value:string,key:string):ReactNode[]{return value.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]*\]\([^)]+\)|\$[^$]+\$)/g).map((part,index)=><span key={key+'-'+index} className={part.startsWith('**')?'sourcestrong':part.startsWith('`')?'sourcecode':part.startsWith('[')?'sourcelink':part.startsWith('$')?'sourcemath':undefined}>{part}</span>)}
function highlighted(line:string,offset:number,hits:Range[],key:string){
  const local=hits.filter(hit=>hit.end>offset&&hit.start<offset+line.length).map(hit=>({start:Math.max(0,hit.start-offset),end:Math.min(line.length,hit.end-offset)}));
  if(!local.length)return syntax(line,key);
  const result:ReactNode[]=[];let cursor=0;
  for(const [index,hit] of local.entries()){if(hit.start>cursor)result.push(...syntax(line.slice(cursor,hit.start),key+'-before-'+index));result.push(<mark className="sourcehit" key={key+'-hit-'+index}>{line.slice(hit.start,hit.end)}</mark>);cursor=Math.max(cursor,hit.end)}
  if(cursor<line.length)result.push(...syntax(line.slice(cursor),key+'-after'));return result;
}
export default function SourceHighlight({text,query='',regex=false,caseSensitive=false}:{text:string;query?:string;regex?:boolean;caseSensitive?:boolean}){
  let fence=false,offset=0;const hits=ranges(text,query,regex,caseSensitive);
  return <pre className="sourcehighlight" aria-hidden="true">{text.split('\n').map((line,index)=>{let className:string|undefined;if(/^\s*(`{3,}|~{3,})/.test(line)){fence=!fence;className='sourcecode'}else if(fence)className='sourcecode';else if(/^#{1,6}\s/.test(line))className='sourceheading';const content=highlighted(line,offset,hits,String(index));offset+=line.length+1;return <span className={className} key={index}>{content}{'\n'}</span>})}</pre>
}
