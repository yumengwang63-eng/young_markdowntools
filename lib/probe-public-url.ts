import {lookup} from 'node:dns/promises';
import {BlockList,isIP} from 'node:net';
import {request as httpRequest} from 'node:http';
import {request as httpsRequest} from 'node:https';
import type {RemoteLinkResult} from './remote-links';

const denied=new BlockList();
for(const [address,prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]] as [string,number][])denied.addSubnet(address,prefix,'ipv4');
const globalV6=new BlockList();globalV6.addSubnet('2000::',3,'ipv6');
for(const [address,prefix] of [['2001:db8::',32],['2001::',32],['2002::',16]] as [string,number][])denied.addSubnet(address,prefix,'ipv6');
export function publicAddress(address:string){const family=isIP(address);return family===4?!denied.check(address,'ipv4'):family===6&&globalV6.check(address,'ipv6')&&!denied.check(address,'ipv6')}
export function validateRemoteUrl(input:string){
 let url:URL;try{url=new URL(input)}catch{throw Error('Blocked: invalid URL.')}
 if(!['http:','https:'].includes(url.protocol))throw Error('Blocked: only HTTP and HTTPS are supported.');
 if(url.username||url.password)throw Error('Blocked: URL credentials are not allowed.');
 if(url.port&&url.port!==(url.protocol==='https:'?'443':'80'))throw Error('Blocked: only standard web ports are supported.');
 const host=url.hostname.replace(/^\[|\]$/g,'');if(host==='localhost'||host.endsWith('.localhost')||(isIP(host)&&!publicAddress(host)))throw Error('Blocked: private or reserved network address.');
 url.hash='';return url;
}
async function resolve(url:URL,remaining:number){
 const host=url.hostname.replace(/^\[|\]$/g,'');if(isIP(host))return {address:host,family:isIP(host)};
 let timer:ReturnType<typeof setTimeout>;
 try{const addresses=await Promise.race([lookup(host,{all:true,verbatim:true}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('DNS lookup timed out.')),Math.min(3000,remaining))})]);if(!addresses.length||addresses.some(row=>!publicAddress(row.address)))throw Error('Blocked: hostname resolves to a private or reserved network address.');return addresses[0]}finally{clearTimeout(timer!)}
}
async function headers(url:URL,method:'HEAD'|'GET',deadline:number){
 const remaining=deadline-Date.now();if(remaining<=0)throw Error('Link check timed out.');
 const pinned=await resolve(url,remaining),time=deadline-Date.now();if(time<=0)throw Error('Link check timed out.');
 return new Promise<{status:number;location?:string}>((resolveResult,reject)=>{
  const send=url.protocol==='https:'?httpsRequest:httpRequest;
  // Keep the checked address bound to this connection; never resolve it again.
  const req=send(url,{method,agent:false,family:pinned.family,lookup:((_host:any,options:any,callback:any)=>options?.all?callback(null,[pinned]):callback(null,pinned.address,pinned.family)) as any,headers:{'user-agent':'MarkdownToolsLocal/1.0',accept:'*/*',...(method==='GET'?{range:'bytes=0-0'}:{})}},response=>{resolveResult({status:response.statusCode||0,location:response.headers.location});response.destroy()});
  const timer=setTimeout(()=>req.destroy(Error('Link check timed out.')),time);req.once('close',()=>clearTimeout(timer));req.once('error',reject);req.end();
 });
}
export async function probePublicUrl(input:string):Promise<RemoteLinkResult>{
 const deadline=Date.now()+10000;let current:URL,redirected=false;
 try{current=validateRemoteUrl(input);const seen=new Set<string>();for(let hop=0;hop<=3;hop++){
  if(seen.has(current.toString()))throw Error('Redirect loop.');seen.add(current.toString());let response=await headers(current,'HEAD',deadline);
  if([405,501].includes(response.status))response=await headers(current,'GET',deadline);
  if([301,302,303,307,308].includes(response.status)){if(!response.location)throw Error('Redirect has no destination.');if(hop===3)throw Error('Too many redirects.');current=validateRemoteUrl(new URL(response.location,current).toString());redirected=true;continue}
  const state=response.status>=200&&response.status<300?(redirected?'redirected':'ok'):[401,403,429].includes(response.status)?'restricted':'broken';
  return {url:input,finalUrl:current.toString(),status:response.status,state,message:state==='restricted'?'Access is restricted or rate-limited; the link may still work in your browser.':'HTTP '+response.status};
 }}catch(error){const message=(error as Error).message;return {url:input,state:message.startsWith('Blocked:')?'blocked':'error',message}}
 return {url:input,state:'error',message:'Link check did not finish.'};
}
