import {marked,type Token} from 'marked';

export function scanFences(lines:string[]){
 const skip=new Set<number>(),openers=new Set<number>();let fence='',start=0;
 lines.forEach((line,index)=>{if(fence){skip.add(index);const close=line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);if(close&&close[1][0]===fence[0]&&close[1].length>=fence.length)fence='';return}
  const mark=line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);if(!mark||(mark[1][0]==='`'&&mark[2].includes('`')))return;fence=mark[1];start=index;openers.add(index);
 });return {skip,openers,start,open:Boolean(fence)};
}

function decodeEntities(text:string){
 const named:Record<string,string>={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
 return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(raw,key:string)=>{if(key[0]!=='#')return named[key.toLowerCase()]||raw;const number=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):parseInt(key.slice(1),10);return number>0&&number<=0x10ffff&&!(number>=0xd800&&number<=0xdfff)?String.fromCodePoint(number):'�'});
}
export function inlineText(tokens:Token[]):string{return tokens.map((token:any)=>token.type==='html'?'':token.tokens?inlineText(token.tokens):decodeEntities(token.text||'')).join('')}
export function createHeadingSlugger(){
 const used=new Set<string>();
 return (text:string)=>{const base=text.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu,'').trim().replace(/\s/g,'-')||'section';let id=base,index=0;while(used.has(id))id=base+'-'+(++index);used.add(id);return id};
}
export function markdownHeadings(input:string){
 const slug=createHeadingSlugger(),headings:{text:string;id:string;depth:number}[]=[];
 marked.walkTokens(marked.lexer(input),(token:any)=>{if(token.type==='heading'){const text=inlineText(token.tokens);headings.push({text,id:slug(text),depth:token.depth})}});
 return headings;
}
export function tableOfContents(input:string){const headings=markdownHeadings(input);if(!headings.length)return '';const minimum=Math.min(...headings.map(heading=>heading.depth));return headings.map(heading=>'  '.repeat(heading.depth-minimum)+'- ['+heading.text.replace(/([\\\[\]])/g,'\\$1')+'](#'+heading.id+')').join('\n')}

export function renderMarkdownWithAnchors(input:string,anchorSource=input){
 const slug=createHeadingSlugger(),renderer=new marked.Renderer();
 const headings=new Set(markdownHeadings(anchorSource).map(heading=>heading.id));
 // Namespace DOM IDs so headings such as "title" survive sanitization safely.
 renderer.heading=function({tokens,depth}){return '<h'+depth+' id="md-'+slug(inlineText(tokens))+'">'+this.parser.parseInline(tokens)+'</h'+depth+'>\n'};
 const link=renderer.link;
 renderer.link=function(token){let href=token.href;if(href.startsWith('#')){try{if(headings.has(decodeURIComponent(href.slice(1))))href='#md-'+href.slice(1)}catch{}}return link.call(this,{...token,href})};
 return marked.parse(input,{async:false,renderer}) as string;
}

/** Masks code and raw HTML while keeping offsets and line breaks unchanged. */
export function maskMarkdownCode(input:string){
 let masked=input;marked.walkTokens(marked.lexer(input),(token:any)=>{if(['code','codespan','html'].includes(token.type)&&token.raw){const index=masked.indexOf(token.raw);if(index>=0)masked=masked.slice(0,index)+token.raw.replace(/[^\n\r]/g,' ')+masked.slice(index+token.raw.length)}});return masked;
}

export function indentedCodeLines(input:string){
 const protectedLines=new Set<number>();let cursor=0;
 marked.walkTokens(marked.lexer(input),(token:any)=>{if(token.type!=='code'||token.codeBlockStyle!=='indented')return;const offset=input.indexOf(token.raw,cursor);if(offset<0)return;cursor=offset+token.raw.length;const start=input.slice(0,offset).split('\n').length-1,count=token.raw.replace(/\n$/,'').split('\n').length;for(let i=0;i<count;i++)protectedLines.add(start+i)});
 return protectedLines;
}
