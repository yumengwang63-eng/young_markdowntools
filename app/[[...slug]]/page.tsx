import Toolkit from '../../components/Toolkit';
import type {Metadata} from 'next';
import {siteUrl} from '../../lib/catalog';
import {getPage,pageAliases} from '../../lib/pages';
import {notFound,permanentRedirect} from 'next/navigation';
export async function generateMetadata({params}:{params:Promise<{slug?:string[]}>}):Promise<Metadata>{
  const {slug=[]}=await params;
  const path=slug.join('/'),page=getPage(path);
  if(!page)notFound();
  const title=page.name,description=page.description,canonical=siteUrl+'/'+(pageAliases[path]||path);
  return {title:title+' — MarkdownTools',description,alternates:{canonical},openGraph:{title,description,url:canonical},...(['workspace','d'].includes(slug[0])?{robots:{index:false,follow:false}}:{})};
}
export default async function Page({params}:{params:Promise<{slug?:string[]}>}) {const {slug=[]}=await params;const path=slug.join('/');if(pageAliases[path])permanentRedirect('/'+pageAliases[path]);if(!getPage(path))notFound();return <Toolkit/>; }
