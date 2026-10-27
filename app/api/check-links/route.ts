import {probePublicUrl} from '../../../lib/probe-public-url';
export const runtime='nodejs';
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin){let sameOrigin=false;try{const source=new URL(origin),host=request.headers.get('host')||new URL(request.url).host;sameOrigin=['http:','https:'].includes(source.protocol)&&source.host===host}catch{}if(!sameOrigin)return Response.json({error:'Cross-origin requests are not accepted.'},{status:403})}
 if(Number(request.headers.get('content-length'))>65536)return Response.json({error:'Request is too large.'},{status:413});
 let value:any;try{const text=await request.text();if(text.length>65536)return Response.json({error:'Request is too large.'},{status:413});value=JSON.parse(text)}catch{return Response.json({error:'Send JSON with a urls array.'},{status:400})}
 if(!Array.isArray(value?.urls)||value.urls.length>20||value.urls.some((url:any)=>typeof url!=='string'||url.length>2048))return Response.json({error:'Send up to 20 URLs, each at most 2048 characters.'},{status:400});
 const urls=[...new Set<string>(value.urls)],results:Awaited<ReturnType<typeof probePublicUrl>>[]=new Array(urls.length);let cursor=0;
 await Promise.all(Array.from({length:Math.min(4,urls.length)},async()=>{while(cursor<urls.length){const index=cursor++;results[index]=await probePublicUrl(urls[index])}}));
 return Response.json({results},{headers:{'cache-control':'no-store'}});
}
