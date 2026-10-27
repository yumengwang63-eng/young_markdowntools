import {marked} from 'marked';
import {markdownHeadings,maskMarkdownCode,scanFences,indentedCodeLines} from './markdown-structure';
import type {Issue} from './checks';

export function fixMarkdown(input:string){
 const source=input.replace(/\r\n?/g,'\n').split('\n'),state=scanFences(source),output:string[]=[];
 const indented=indentedCodeLines(source.join('\n'));
 for(let index=0;index<source.length;index++){
  let line=source[index];
  if(state.skip.has(index)||state.openers.has(index)||indented.has(index)){output.push(line);continue}
  // Two trailing spaces represent an intentional Markdown hard line break.
  const hardBreak=/\S {2,}$/.test(line);
  if(/^ {0,3}(?:\*\s*){3,}$/.test(line)){output.push(line);continue}
  line=line.replace(/\t/g,'    ').replace(/[ \t]+$/,'').replace(/^(#{1,6})([^#\s])/,'$1 $2').replace(/^(\s*)[+*]\s+/,'$1- ');
  if(hardBreak)line+='  ';
  if(!line.trim()&&output.at(-1)==='')continue;
  if(/^ {0,3}#{1,6}\s/.test(line)&&output.at(-1)&&output.at(-1)!=='')output.push('');
  output.push(line);
  if(/^ {0,3}#{1,6}\s/.test(line)&&source[index+1]?.trim())output.push('');
 }
 if(state.open)return output.join('\n')+(input.endsWith('\n')?'':'\n');
 while(output.at(-1)==='')output.pop();return output.join('\n')+'\n';
}

export function checkLinks(input:string){
 const source=input.replace(/\r\n?/g,'\n'),masked=maskMarkdownCode(source),issues:Issue[]=[];
 const headings=new Set(markdownHeadings(source).map(heading=>heading.id));
 for(const match of source.matchAll(/<[^>]+\b(?:id|name)=["']([^"']+)["'][^>]*>/g))headings.add(match[1]);
 const tokens=marked.lexer(source),definitions=new Set(Object.keys(tokens.links).map(label=>label.trim().replace(/\s+/g,' ').toLowerCase()));
 const occurrences=new Map<string,number>();
 marked.walkTokens(tokens,(token:any)=>{
  if(token.type!=='link'&&token.type!=='image')return;
  const offset=masked.indexOf(token.raw,occurrences.get(token.raw)||0);if(offset>=0)occurrences.set(token.raw,offset+token.raw.length);
  const line=source.slice(0,Math.max(0,offset)).split('\n').length,image=token.type==='image';
  if(!token.text.trim())issues.push({line,rule:image?'image-alt':'link-label',message:image?'Image is missing alt text.':'Link label is empty.'});
  if(!token.href)issues.push({line,rule:image?'image-target':'link-target',message:image?'Image is missing a target.':'Link target is empty.'});
  if(token.href?.startsWith('#')&&token.href.length>1){try{const id=decodeURIComponent(token.href.slice(1));if(!headings.has(id))issues.push({line,rule:'link-anchor',message:'No heading matches '+token.href+'.'})}catch{issues.push({line,rule:'link-anchor-encoding',message:'Malformed percent encoding in '+token.href+'.'})}}
 });
 masked.split('\n').forEach((line,index)=>{for(const reference of line.matchAll(/(?<!!)(!?)\[([^\]]+)\]\[([^\]]*)\]/g)){
  const position=reference.index!;let escapes=0;for(let i=position-1;i>=0&&line[i]==='\\';i--)escapes++;if(escapes%2)continue;
  const id=(reference[3]||reference[2]).trim().replace(/\s+/g,' ').toLowerCase();if(!definitions.has(id))issues.push({line:index+1,rule:reference[1]?'image-reference':'link-reference',message:'Reference ['+id+'] is not defined.'});
 }});
 return issues.sort((a,b)=>a.line-b.line);
}
