import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{return {name:'MarkdownTools',short_name:'MarkdownTools',description:'Browser-based Markdown tools and local documents',start_url:'/',display:'standalone',background_color:'#ffffff',theme_color:'#09090b',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]}}
