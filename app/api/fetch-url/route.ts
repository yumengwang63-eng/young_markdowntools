import { fetchPublicHtml } from '../../../lib/fetch-public';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let url = '';
  try {
    url = String((await request.json()).url ?? '');
  } catch {
    return Response.json({ error: 'Send JSON with a url field.' }, { status: 400 });
  }
  try {
    return Response.json(await fetchPublicHtml(url));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The page could not be fetched.';
    const status = message.startsWith('Blocked') || message.startsWith('Use an') ? 400 : 502;
    return Response.json({ error: message }, { status });
  }
}
