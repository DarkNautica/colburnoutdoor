import { applySeoResponse, handleApi, staticUtilityResponse } from '../worker/index.js';

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.replace(/^www\./, '');
    return Response.redirect(url.toString(), 301);
  }

  const staticResponse = staticUtilityResponse(url);
  if (staticResponse) return staticResponse;

  if (url.pathname.startsWith('/api/')) {
    return handleApi(context.request, context.env, url);
  }

  const response = await context.next();

  return applySeoResponse(response, url, { noIndex: url.pathname.startsWith('/dashboard') });
}
