import type {MetadataRoute} from 'next';
import {indexedPages,staticDownloads} from '../lib/pages';
import {siteUrl} from '../lib/catalog';
export default function sitemap():MetadataRoute.Sitemap{
  return [...indexedPages.map(page=>page.slug),...staticDownloads].map(slug=>({url:siteUrl+'/'+slug}));
}
