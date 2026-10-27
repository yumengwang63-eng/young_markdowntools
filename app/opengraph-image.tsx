import {ImageResponse} from 'next/og';
export const alt='MarkdownTools — Write, convert and create Markdown';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:80,background:'#09090b',color:'#fafafa'}}><div style={{display:'flex',fontSize:32,color:'#bda6ff',marginBottom:36}}>MarkdownTools</div><div style={{display:'flex',fontSize:76,lineHeight:1.1}}>Write. Convert. Create.</div><div style={{display:'flex',fontSize:30,color:'#b4b4c0',marginTop:36}}>98 Markdown tools · Local documents · No account required</div></div>,size)}
