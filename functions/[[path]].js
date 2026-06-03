import { handleApi } from '../worker/index.js';

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.replace(/^www\./, '');
    return Response.redirect(url.toString(), 301);
  }

  if (url.pathname.startsWith('/api/')) {
    return handleApi(context.request, context.env, url);
  }

  const response = await context.next();

  if (url.pathname.startsWith('/dashboard')) {
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
}
