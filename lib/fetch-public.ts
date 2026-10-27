import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 3;

export function isPrivateAddress(address: string) {
  const ip = address.toLowerCase().replace(/^::ffff:/, '');
  if (ip === '::1' || ip === '::' || ip === '0.0.0.0') return true;
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:') || ip.startsWith('fec0:')) return true;
  if (ip.includes(':')) return false;
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

async function assertPublic(target: URL) {
  if (!['http:', 'https:'].includes(target.protocol)) throw Error('Use an HTTP or HTTPS URL.');
  if (target.username || target.password) throw Error('Blocked URL: credentials are not allowed.');
  if (target.port && !['80', '443'].includes(target.port)) throw Error('Blocked URL: only ports 80 and 443 are allowed.');
  const literal = isIP(target.hostname);
  const addresses = literal ? [target.hostname] : (await lookup(target.hostname, { all: true, verbatim: true })).map(item => item.address);
  if (!addresses.length || addresses.some(isPrivateAddress)) throw Error('Blocked URL: local and private network addresses are not fetched.');
}

export async function fetchPublicHtml(input: string) {
  let current = new URL(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublic(current);
    const response = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(12000),
      headers: { accept: 'text/html,application/xhtml+xml,text/plain;q=0.8', 'user-agent': 'MarkdownToolsLocal/1.0' }
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw Error('The site returned a redirect without a destination.');
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw Error(`The site responded with HTTP ${response.status}.`);
    const type = response.headers.get('content-type') ?? '';
    if (!/text\/html|application\/xhtml\+xml|text\/plain|application\/xml|text\/xml/i.test(type)) throw Error('The URL did not return an HTML or text document.');
    const reader = response.body?.getReader();
    if (!reader) throw Error('The response had no readable content.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) throw Error('The page is larger than 1.5 MB.');
      chunks.push(value);
    }
    const html = new TextDecoder().decode(await new Blob(chunks as BlobPart[]).arrayBuffer());
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() ?? current.hostname;
    const article = html.match(/<article\b[\s\S]*?<\/article>|<main\b[\s\S]*?<\/main>/i)?.[0] ?? html;
    const readable = article.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>/gi, '');
    return { title, html: readable, url: current.toString() };
  }
  throw Error('The page redirected too many times.');
}
