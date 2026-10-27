export type DiffMode='line'|'word'|'character';
export type DiffPart={kind:'same'|'added'|'removed';values:string[]};
function tokens(text:string,mode:DiffMode){if(!text)return [];if(mode==='line')return text.replace(/\r\n?/g,'\n').split('\n');if(typeof Intl.Segmenter==='function')return [...new Intl.Segmenter(undefined,{granularity:mode==='word'?'word':'grapheme'}).segment(text)].map(part=>part.segment);return mode==='word'?text.split(/(\s+)/).filter(Boolean):Array.from(text)}
export function diffText(left:string,right:string,mode:DiffMode='line'){
 if(left.length>200000||right.length>200000)throw Error('Use at most 200,000 characters on each side.');
 const a=tokens(left,mode),b=tokens(right,mode);let prefix=0,suffix=0;
 while(prefix<a.length&&prefix<b.length&&a[prefix]===b[prefix])prefix++;
 while(suffix<a.length-prefix&&suffix<b.length-prefix&&a[a.length-1-suffix]===b[b.length-1-suffix])suffix++;
 const n=a.length-prefix-suffix,m=b.length-prefix-suffix;if((n+1)*(m+1)>4000000)throw Error('The changed region is too large to compare in this mode. Use line mode or compare a smaller section.');
 const dp=new Uint32Array((n+1)*(m+1)),width=m+1;
 for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i*width+j]=a[prefix+i]===b[prefix+j]?dp[(i+1)*width+j+1]+1:Math.max(dp[(i+1)*width+j],dp[i*width+j+1]);
 const parts:DiffPart[]=[],stats={same:0,added:0,removed:0};
 function push(kind:DiffPart['kind'],value:string){stats[kind]++;if(parts.at(-1)?.kind===kind)parts.at(-1)!.values.push(value);else parts.push({kind,values:[value]})}
 for(let i=0;i<prefix;i++)push('same',a[i]);let i=0,j=0;
 while(i<n&&j<m){if(a[prefix+i]===b[prefix+j]){push('same',a[prefix+i]);i++;j++}else if(dp[(i+1)*width+j]>=dp[i*width+j+1])push('removed',a[prefix+i++]);else push('added',b[prefix+j++])}
 while(i<n)push('removed',a[prefix+i++]);while(j<m)push('added',b[prefix+j++]);for(let k=a.length-suffix;k<a.length;k++)push('same',a[k]);
 const output=mode==='line'?parts.flatMap(part=>part.values.map(value=>(part.kind==='same'?'  ':part.kind==='added'?'+ ':'- ')+value)).join('\n'):parts.map(part=>part.kind==='same'?part.values.join(''):(part.kind==='added'?'{+':'{-')+part.values.join('')+(part.kind==='added'?'+}':'-}')).join('');
 return {parts,stats,output,mode};
}
