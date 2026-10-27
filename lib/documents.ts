export type LocalDocument={id:string;title:string;content:string;updatedAt:string};
import {planDocumentRestore,validateDocuments} from './document-backup';
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('markdowntools-local',1);request.onupgradeneeded=()=>{request.result.createObjectStore('documents',{keyPath:'id'})};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
export async function documents(action:'list'|'get'|'put'|'delete',value?:LocalDocument|string):Promise<LocalDocument[]|LocalDocument|undefined>{
  const db=await database();
  return new Promise((resolve,reject)=>{const tx=db.transaction('documents',action==='put'||action==='delete'?'readwrite':'readonly'),store=tx.objectStore('documents');let result:any;
    const request=action==='list'?store.getAll():action==='get'?store.get(value as string):action==='put'?store.put(value):store.delete(value as string);
    request.onsuccess=()=>{result=request.result};tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(tx.error||new Error('Local document transaction cancelled'))};
  });
}
export async function restoreDocuments(incoming:LocalDocument[]){
 const validated=validateDocuments(incoming),db=await database();
 return new Promise<{added:number;skipped:number;copies:number}>((resolve,reject)=>{const tx=db.transaction('documents','readwrite'),store=tx.objectStore('documents'),request=store.getAll();let failure:Error|undefined,result={added:0,skipped:0,copies:0};
 request.onsuccess=()=>{try{const plan=planDocumentRestore(request.result,validated);for(const row of plan.add)store.add(row);result={added:plan.add.length,skipped:plan.skipped,copies:plan.copies}}catch(error){failure=error as Error;tx.abort()}};
 tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=()=>{db.close();reject(tx.error||failure||Error('Import failed.'))};tx.onabort=()=>{db.close();reject(failure||tx.error||Error('Import cancelled; no documents were changed.'))};
 });
}
