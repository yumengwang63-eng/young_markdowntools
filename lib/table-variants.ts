import {marked} from 'marked';
import {inlineText} from './markdown-structure';
function firstTable(input:string){
 if(input.length>1_000_000)throw Error('Use a table smaller than 1 MB.');
 let table:any;marked.walkTokens(marked.lexer(input),(token:any)=>{if(!table&&token.type==='table')table=token});
 if(!table)throw Error('Paste a Markdown table with a header and separator row.');
 if((table.rows.length+1)*table.header.length>50000)throw Error('Use at most 50,000 table cells.');
 const plain=(cell:any)=>cell.tokens.map((part:any)=>part.type==='html'&&/^<br\s*\/?\s*>$/i.test(part.raw)?'\n':inlineText([part])).join('');
 return {rows:[table.header.map(plain),...table.rows.map((row:any[])=>row.map(plain))] as string[][],align:table.align as string[],raw:table.raw as string};
}
const escape=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>');
const markdown=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\\`*_~\[\]]/g,'\\$&').replace(/\|/g,'\\|').replace(/\n/g,'<br>');
function htmlRows(rows:string[][]){return rows.map(row=>'  <tr>'+row.map(value=>'<td>'+escape(value)+'</td>').join('')+'</tr>').join('\n')}
export function headerlessTable(input:string,method:string,keepHeader=true){
 let parsed:ReturnType<typeof firstTable>;
 try{parsed=firstTable(input)}catch(error){const lines=input.trim().split(/\r?\n/).filter(line=>line.trim());if(!lines.length||lines.some(line=>!line.includes('|')))throw error;const first=lines[0].trim().replace(/^\|/,'').replace(/\|$/,'');let columns=1;for(let i=0;i<first.length;i++){if(first[i]==='\\')i++;else if(first[i]==='|')columns++}parsed=firstTable([lines[0],'| '+Array(columns).fill('---').join(' | ')+' |',...lines.slice(1)].join('\n'))}
 const {rows}=parsed,data=keepHeader?rows:rows.slice(1),width=rows[0].length;
 if(method==='html')return '<table>\n<tbody>\n'+htmlRows(data)+'\n</tbody>\n</table>';
 return [Array(width).fill(''),Array(width).fill('---'),...data.map(row=>row.map(markdown))].map(row=>'| '+row.join(' | ')+' |').join('\n');
}
export function centeredTable(input:string,method:string){const {rows,align}=firstTable(input);const header='<thead><tr>'+rows[0].map((value,index)=>'<th'+(align[index]?' style="text-align:'+align[index]+'"':'')+'>'+escape(value)+'</th>').join('')+'</tr></thead>';const table='<table'+(method==='html'?' align="center"':method==='paragraph'?' style="margin-left:auto;margin-right:auto"':'')+'>\n'+header+'\n<tbody>\n'+htmlRows(rows.slice(1))+'\n</tbody>\n</table>';return method==='html'?table:method==='paragraph'?'<div style="text-align:center">\n'+table+'\n</div>':'<div align="center">\n'+table+'\n</div>'}
function positive(value:string|undefined,fallback:number,name:string){if(value===undefined||value==='')return fallback;const number=Number(value);if(!Number.isInteger(number)||number<1)throw Error(name+' must be a positive whole number.');return number}
export function mergedTable(input:string,options:Record<string,string>){
 const {rows}=firstTable(input),row=positive(options.row,1,'Row')-1,column=positive(options.column,1,'Column')-1,rowspan=positive(options.rowspan,1,'Row span'),colspan=positive(options.colspan,2,'Column span');
 if(row>=rows.length||column>=rows[0].length||row+rowspan>rows.length||column+colspan>rows[0].length)throw Error('The selected merge range is outside the table.');
 const values:string[]=[];for(let r=row;r<row+rowspan;r++)for(let c=column;c<column+colspan;c++)values.push(rows[r][c]);
 const content=options.content==='first'?rows[row][column]:values.filter(value=>value!=='').join('\n');
 const body=rows.map((cells,r)=>'<tr>'+cells.map((value,c)=>{if(r>=row&&r<row+rowspan&&c>=column&&c<column+colspan){if(r!==row||c!==column)return '';return '<td colspan="'+colspan+'" rowspan="'+rowspan+'">'+escape(content)+'</td>'}return '<td>'+escape(value)+'</td>'}).join('')+'</tr>').join('\n');
 return '<table>\n<tbody>\n'+body+'\n</tbody>\n</table>';
}
