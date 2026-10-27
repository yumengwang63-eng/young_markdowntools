import './style.css';
import './foundation.css';
import './visual.css';
import './footer.css';
import './editor-original.css';
import './theme.css';
import localFont from 'next/font/local';
import {themeBootstrap} from '../lib/theme';
import {siteUrl} from '../lib/catalog';
const geist=localFont({src:'./fonts/geist-latin.woff2',variable:'--font-geist',display:'swap',weight:'100 900'});
const geistMono=localFont({src:'./fonts/geist-mono-latin.woff2',variable:'--font-geist-mono',display:'swap',weight:'100 900'});
import FooterArea from '../components/FooterArea';
import 'katex/dist/katex.min.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { metadataBase:new URL(siteUrl), icons:{icon:'/icon.svg'}, title: 'MarkdownTools — Free Online Markdown Tools', description: 'Write, convert and format Markdown. A local-first toolkit.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en" suppressHydrationWarning className={geist.variable+' '+geistMono.variable}><head><script dangerouslySetInnerHTML={{__html:themeBootstrap}}/></head><body><a className="skip-nav" href="#main-content">Skip to content</a><div id="main-content" tabIndex={-1}>{children}</div><FooterArea/></body></html>; }

