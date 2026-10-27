import Link from 'next/link';
import {SiteNav} from '../components/SiteHome';
export default function NotFound(){return <><SiteNav/><main className="toolmain guidepage"><p>404</p><h1>Page not found</h1><p>This address does not match a tool or guide in this recreation.</p><div className="local-actions"><Link className="primary" href="/tools">Browse all tools</Link><Link href="/guides">Read Markdown guides</Link><Link href="/">Return home</Link></div></main></>}
