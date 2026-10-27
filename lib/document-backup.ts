import type {LocalDocument} from './documents';
export function validateDocuments(value:unknown):LocalDocument[]{
 if(!Array.isArray(value)||value.length>1000)throw Error('A backup can contain at most 1,000 documents.');
 const ids=new Set<string>();let length=0;
 return value.map((row:any,index)=>{
  if(!row||typeof row!=='object'||typeof row.id!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(row.id)||typeof row.title!=='string'||typeof row.content!=='string'||typeof row.updatedAt!=='string'||!Number.isFinite(Date.parse(row.updatedAt)))throw Error('Invalid document at position '+(index+1)+'.');
  if(ids.has(row.id))throw Error('Duplicate document ID in the backup.');ids.add(row.id);length+=row.title.length+row.content.length;if(length>20_000_000)throw Error('Document content exceeds the 20 MB backup limit.');
  return {id:row.id,title:row.title,content:row.content,updatedAt:new Date(row.updatedAt).toISOString()};
 });
}
export function createDocumentBackup(rows:LocalDocument[]){validateDocuments(rows);const text=JSON.stringify({format:'markdowntools-local-backup',version:1,exportedAt:new Date().toISOString(),documents:rows},null,2);if(new TextEncoder().encode(text).length>25_000_000)throw Error('Backup exceeds 25 MB. Download documents individually or reduce library size.');return text}
export function parseDocumentBackup(text:string){if(text.length>25_000_000)throw Error('Backup JSON exceeds the 25 MB text limit.');let value:any;try{value=JSON.parse(text)}catch{throw Error('The backup is not valid JSON.')}if(value?.format!=='markdowntools-local-backup'||value.version!==1)throw Error('Unsupported backup format or version.');return validateDocuments(value.documents)}
export function planDocumentRestore(existing:LocalDocument[],incoming:LocalDocument[],newId=()=>crypto.randomUUID()){
 const originals=new Map(existing.map(row=>[row.id,row])),ids=new Set(originals.keys()),reserved=new Set([...ids,...incoming.map(row=>row.id)]),add:LocalDocument[]=[];let skipped=0,copies=0;
 for(const row of incoming){const old=originals.get(row.id);if(old&&old.title===row.title&&old.content===row.content||old&&existing.some(copy=>copy.title===row.title+' (imported copy)'&&copy.content===row.content)){skipped++;continue}let item={...row};if(ids.has(item.id)){let attempts=0;do{item.id=newId();if(++attempts>16)throw Error('Could not allocate a unique document ID.')}while(reserved.has(item.id));reserved.add(item.id);item.title+=' (imported copy)';copies++}ids.add(item.id);add.push(item)}
 return {add,skipped,copies};
}
