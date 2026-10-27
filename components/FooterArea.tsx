'use client';
import {usePathname} from 'next/navigation';
import SiteFooter,{RelatedTools} from './SiteFooter';
import data from './v4-inventory.json';
export default function FooterArea(){const slug=usePathname().slice(1);return <>{data.rows.some(r=>r.slug===slug)&&<RelatedTools slug={slug}/>}<SiteFooter/></>}
