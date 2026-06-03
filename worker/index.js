import { calculateEstimate, pricingConfig } from '../src/data/pricing.js';

const leadStatuses = ['new', 'contacted', 'quoted', 'booked', 'completed', 'lost'];
const submissionRateLimit = new Map();
const googleVerificationFile = 'googlee11bb7f9d7b29aad.html';
const googleVerificationBody = `google-site-verification: ${googleVerificationFile}\n`;

function cleanString(value = '') {
  return String(value ?? '').trim();
}

function normalizePhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits;
}

function nowIso() {
  return new Date().toISOString();
}

function jsonResponse(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

const seoRoutes = {
  '/': {
    title: 'Colburn Outdoor Maintenance | Charlotte Area Lawn Care & Cleanup',
    description:
      'Colburn Outdoor Maintenance provides reliable lawn care, trimming, cleanup, and outdoor property upkeep across the Charlotte area and northwest North Carolina.',
    canonical: 'https://colburnoutdoor.com/',
  },
  '/privacy': {
    title: 'Privacy Policy | Colburn Outdoor Maintenance',
    description:
      'Privacy Policy for Colburn Outdoor Maintenance, including quote request information, lead storage, email notifications, and optional SMS automation.',
    canonical: 'https://colburnoutdoor.com/privacy',
  },
  '/terms': {
    title: 'Terms of Use | Colburn Outdoor Maintenance',
    description:
      'Terms of Use for Colburn Outdoor Maintenance, including estimate ranges, scheduling, website use, and dashboard message handling.',
    canonical: 'https://colburnoutdoor.com/terms',
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function routeSeo(pathname) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return seoRoutes[normalized] || seoRoutes['/'];
}

export function staticUtilityResponse(url) {
  if (url.pathname === `/${googleVerificationFile}` || url.pathname === `/sitemap.xml/${googleVerificationFile}`) {
    return new Response(googleVerificationBody, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'text/plain; charset=UTF-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  if (url.pathname === '/sitemap.xml/') {
    url.pathname = '/sitemap.xml';
    return Response.redirect(url.toString(), 301);
  }

  return null;
}

function replaceMetaTag(html, selector, replacement) {
  const pattern = new RegExp(`<meta\\s+[^>]*${selector}[^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`);
}

export async function applySeoResponse(response, url, { noIndex = false } = {}) {
  const headers = new Headers(response.headers);
  if (noIndex) headers.set('X-Robots-Tag', 'noindex, nofollow');

  const contentType = headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) {
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  const metadata = routeSeo(url.pathname);
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const canonical = escapeHtml(metadata.canonical);
  let html = await response.text();

  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  html = replaceMetaTag(html, 'name="description"', `<meta name="description" content="${description}" />`);
  html = replaceMetaTag(html, 'property="og:title"', `<meta property="og:title" content="${title}" />`);
  html = replaceMetaTag(html, 'property="og:description"', `<meta property="og:description" content="${description}" />`);
  html = replaceMetaTag(html, 'property="og:url"', `<meta property="og:url" content="${canonical}" />`);
  html = replaceMetaTag(html, 'name="twitter:title"', `<meta name="twitter:title" content="${title}" />`);
  html = replaceMetaTag(html, 'name="twitter:description"', `<meta name="twitter:description" content="${description}" />`);
  html = html.replace(/<link id="canonical-url" rel="canonical" href="[^"]*" \/>/i, `<link id="canonical-url" rel="canonical" href="${canonical}" />`);

  headers.set('Content-Type', 'text/html; charset=UTF-8');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function parseBody(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json().catch(() => ({}));
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(await request.text()));
  }

  if (contentType.includes('multipart/form-data')) {
    const data = {};
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      if (key in data) data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
      else data[key] = value;
    }
    return data;
  }

  return {};
}

function clientIp(request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function rateLimitLeadSubmission(request) {
  const ip = clientIp(request);
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 5;
  const hits = (submissionRateLimit.get(ip) || []).filter((timestamp) => now - timestamp < windowMs);
  hits.push(now);
  submissionRateLimit.set(ip, hits);

  if (hits.length > max) return 'Too many quote requests. Please try again shortly.';
  return '';
}

function requiredFields(body, fields) {
  return fields.filter((field) => !cleanString(body[field]));
}

function validatePricingInput(body) {
  const missing = requiredFields(body, ['name', 'phone', 'serviceType']);
  if (missing.length) return `${missing.join(', ')} required.`;
  if (!pricingConfig.services[body.serviceType]) return 'Service required.';
  return '';
}

function utmFrom(url, body) {
  return {
    utmSource: cleanString(body.utmSource || url.searchParams.get('utm_source')),
    utmMedium: cleanString(body.utmMedium || url.searchParams.get('utm_medium')),
    utmCampaign: cleanString(body.utmCampaign || url.searchParams.get('utm_campaign')),
  };
}

function buildLeadPayload(url, body, source = 'quote_form') {
  const estimate = calculateEstimate(body);
  const addons = Array.isArray(body.addons) ? body.addons : body.addons ? [body.addons] : [];

  return {
    name: cleanString(body.name),
    phone: cleanString(body.phone),
    email: cleanString(body.email),
    serviceType: body.serviceType,
    propertySize: body.propertySize || 'small',
    condition: body.condition || 'normal',
    urgency: body.urgency || 'flexible',
    addons,
    estimateLow: estimate.low,
    estimateHigh: estimate.high,
    notes: cleanString(body.notes),
    source: cleanString(body.source || source),
    ...utmFrom(url, body),
  };
}

function mapLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.name,
    phone: row.phone,
    phoneNormalized: row.phone_normalized,
    email: row.email ?? '',
    serviceType: row.service_type,
    propertySize: row.property_size,
    condition: row.condition,
    urgency: row.urgency,
    addons: parseJson(row.addons_json, []),
    estimateLow: row.estimate_low,
    estimateHigh: row.estimate_high,
    notes: row.notes ?? '',
    source: row.source,
    utmSource: row.utm_source ?? '',
    utmMedium: row.utm_medium ?? '',
    utmCampaign: row.utm_campaign ?? '',
    status: row.status,
    internalNotes: row.internal_notes ?? '',
    lastContactedAt: row.last_contacted_at ?? '',
    reviewRequestedAt: row.review_requested_at ?? '',
  };
}

function mapMessage(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    leadId: row.lead_id,
    direction: row.direction,
    channel: row.channel,
    fromPhone: row.from_phone ?? '',
    toPhone: row.to_phone ?? '',
    body: row.body,
    providerMessageId: row.provider_message_id ?? '',
  };
}

async function getLead(env, id) {
  const row = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();
  return mapLead(row);
}

async function createLead(env, input) {
  const id = input.id ?? crypto.randomUUID();
  const createdAt = input.createdAt ?? nowIso();
  const updatedAt = createdAt;
  const phoneNormalized = normalizePhone(input.phone);

  await env.DB.prepare(`
    INSERT INTO leads (
      id, created_at, updated_at, name, phone, phone_normalized, email, service_type,
      property_size, condition, urgency, addons_json, estimate_low, estimate_high,
      notes, source, utm_source, utm_medium, utm_campaign, status, internal_notes,
      last_contacted_at, review_requested_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      createdAt,
      updatedAt,
      input.name,
      input.phone,
      phoneNormalized,
      input.email ?? '',
      input.serviceType,
      input.propertySize,
      input.condition,
      input.urgency,
      JSON.stringify(input.addons ?? []),
      input.estimateLow,
      input.estimateHigh,
      input.notes ?? '',
      input.source,
      input.utmSource ?? '',
      input.utmMedium ?? '',
      input.utmCampaign ?? '',
      input.status ?? 'new',
      input.internalNotes ?? '',
      input.lastContactedAt ?? null,
      input.reviewRequestedAt ?? null,
    )
    .run();

  return getLead(env, id);
}

async function listLeads(env, { status = 'all', search = '' } = {}) {
  const clauses = [];
  const params = [];

  if (status !== 'all') {
    clauses.push('status = ?');
    params.push(status);
  }

  if (search.trim()) {
    const normalized = normalizePhone(search);
    clauses.push('(name LIKE ? OR phone LIKE ? OR phone_normalized LIKE ? OR service_type LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${normalized}%`, `%${search}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await env.DB.prepare(`SELECT * FROM leads ${where} ORDER BY created_at DESC`).bind(...params).all();
  return (result.results || []).map(mapLead);
}

async function updateLead(env, id, updates) {
  const allowed = {
    status: 'status',
    internalNotes: 'internal_notes',
    lastContactedAt: 'last_contacted_at',
    reviewRequestedAt: 'review_requested_at',
  };
  const entries = Object.entries(updates).filter(([key]) => key in allowed);
  if (!entries.length) return getLead(env, id);

  const values = entries.map(([key, value]) => [allowed[key], value]);
  values.push(['updated_at', nowIso()]);

  const setSql = values.map(([column]) => `${column} = ?`).join(', ');
  await env.DB.prepare(`UPDATE leads SET ${setSql} WHERE id = ?`)
    .bind(...values.map(([, value]) => value), id)
    .run();
  return getLead(env, id);
}

async function findLatestLeadByPhone(env, phone) {
  const row = await env.DB.prepare('SELECT * FROM leads WHERE phone_normalized = ? ORDER BY created_at DESC LIMIT 1')
    .bind(normalizePhone(phone))
    .first();
  return mapLead(row);
}

async function findRecentMissedCallLead(env, phone, hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const row = await env.DB.prepare(
    "SELECT * FROM leads WHERE phone_normalized = ? AND source = 'missed_call' AND created_at >= ? ORDER BY created_at DESC LIMIT 1",
  )
    .bind(normalizePhone(phone), cutoff)
    .first();
  return mapLead(row);
}

async function hasRecentEvent(env, type, phone, hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const row = await env.DB.prepare('SELECT id FROM events WHERE type = ? AND phone_normalized = ? AND created_at >= ? LIMIT 1')
    .bind(type, normalizePhone(phone), cutoff)
    .first();
  return Boolean(row);
}

async function addMessage(env, input) {
  const id = input.id ?? crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO messages (
      id, created_at, lead_id, direction, channel, from_phone, to_phone, body, provider_message_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      input.createdAt ?? nowIso(),
      input.leadId ?? null,
      input.direction,
      input.channel,
      input.fromPhone ?? '',
      input.toPhone ?? '',
      input.body,
      input.providerMessageId ?? '',
    )
    .run();

  const row = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first();
  return mapMessage(row);
}

async function listMessagesForLead(env, leadId) {
  const result = await env.DB.prepare('SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC').bind(leadId).all();
  return (result.results || []).map(mapMessage);
}

async function addEvent(env, input) {
  const id = input.id ?? crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO events (id, created_at, type, lead_id, phone_normalized, message, payload_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      id,
      input.createdAt ?? nowIso(),
      input.type,
      input.leadId ?? null,
      input.phone ? normalizePhone(input.phone) : input.phoneNormalized ?? null,
      input.message ?? '',
      JSON.stringify(input.payload ?? {}),
    )
    .run();
  return id;
}

async function getAnalytics(env) {
  const total = (await env.DB.prepare('SELECT COUNT(*) AS count FROM leads').first())?.count ?? 0;
  const statusResult = await env.DB.prepare('SELECT status, COUNT(*) AS count FROM leads GROUP BY status').all();
  const sourceResult = await env.DB.prepare('SELECT source, COUNT(*) AS count FROM leads GROUP BY source').all();
  const byStatus = Object.fromEntries((statusResult.results || []).map((row) => [row.status, row.count]));
  const bySource = Object.fromEntries((sourceResult.results || []).map((row) => [row.source, row.count]));

  return {
    total,
    new: byStatus.new ?? 0,
    booked: byStatus.booked ?? 0,
    missedCall: bySource.missed_call ?? 0,
    quoteForm: bySource.quote_form ?? 0,
    byStatus,
    bySource,
  };
}

function dashboardPassword(env) {
  return env.DASHBOARD_PASSWORD || 'colburn-admin';
}

function requireDashboardAuth(request, env) {
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const password = request.headers.get('x-dashboard-password') || bearer;
  return password === dashboardPassword(env);
}

function providerStatus(env) {
  const twilioEnabled = isTwilioEnabled(env);
  const twilioConfigured = hasTwilioConfig(env);
  return {
    emailConfigured: hasEmailConfig(env),
    emailProvider: env.RESEND_API_KEY ? 'resend' : hasSmtpConfig(env) ? 'smtp' : 'none',
    smsConfigured: twilioConfigured,
    smsEnabled: twilioEnabled,
    ownerEmailConfigured: Boolean(env.OWNER_EMAIL),
    ownerPhoneConfigured: Boolean(env.OWNER_PHONE || '7044305221'),
    googleReviewConfigured: Boolean(env.GOOGLE_REVIEW_LINK),
  };
}

function isTwilioEnabled(env) {
  return String(env.TWILIO_ENABLED || 'false').toLowerCase() === 'true';
}

function hasTwilioConfig(env) {
  return Boolean(isTwilioEnabled(env) && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER);
}

function smsDisabledPayload() {
  return {
    ok: false,
    status: 'disabled',
    message: 'SMS automation is disabled for Phase 1. Enable TWILIO_ENABLED=true only after Twilio/A2P 10DLC verification is complete.',
  };
}

function hasSmtpConfig(env) {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);
}

function hasEmailConfig(env) {
  return Boolean(env.OWNER_EMAIL && (env.RESEND_API_KEY || hasSmtpConfig(env)));
}

async function sendEmail(env, { to, subject, text }) {
  if (!to) {
    return { channel: 'email', status: 'skipped', reason: 'OWNER_EMAIL is not configured' };
  }

  if (env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || 'Colburn Outdoor Maintenance <onboarding@resend.dev>',
        to,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Resend email failed: ${response.status} ${detail}`);
    }

    const payload = await response.json();
    return { channel: 'email', provider: 'resend', status: 'sent', providerMessageId: payload.id };
  }

  if (hasSmtpConfig(env)) {
    return {
      channel: 'email',
      provider: 'smtp',
      status: 'skipped',
      reason: 'SMTP variables are present, but Cloudflare Pages Functions require an HTTP email provider. Use RESEND_API_KEY for Phase 1 on Cloudflare.',
    };
  }

  return { channel: 'email', status: 'skipped', reason: 'RESEND_API_KEY or SMTP env vars are not configured' };
}

async function sendSms(env, { to, body }) {
  if (!isTwilioEnabled(env)) {
    return { channel: 'sms', status: 'disabled', reason: smsDisabledPayload().message };
  }

  if (!hasTwilioConfig(env) || !to) {
    return { channel: 'sms', status: 'disabled', reason: 'Twilio is enabled but required Twilio env vars or recipient are missing' };
  }

  const credentials = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const params = new URLSearchParams({
    To: to,
    From: env.TWILIO_FROM_NUMBER,
    Body: body,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Twilio SMS failed: ${response.status} ${detail}`);
  }

  const payload = await response.json();
  return { channel: 'sms', status: 'sent', providerMessageId: payload.sid };
}

function formatEstimate(lead) {
  return `$${lead.estimateLow}-$${lead.estimateHigh}`;
}

function dashboardUrl(env, leadId = '') {
  const baseUrl = env.PUBLIC_SITE_URL || 'https://colburnoutdoor.com';
  return `${baseUrl.replace(/\/$/, '')}/dashboard${leadId ? `?lead=${leadId}` : ''}`;
}

async function notifyOwnerNewLead(env, lead) {
  const subject = `New Colburn Outdoor lead: ${lead.name}`;
  const text = [
    `New lead from ${lead.source}`,
    '',
    `Customer: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email || 'Not provided'}`,
    `Service: ${lead.serviceType}`,
    `Timeline: ${lead.urgency}`,
    `Estimate: ${formatEstimate(lead)}`,
    `Notes: ${lead.notes || 'None'}`,
    '',
    `Dashboard: ${dashboardUrl(env, lead.id)}`,
  ].join('\n');

  const results = [await sendEmail(env, { to: env.OWNER_EMAIL, subject, text })];
  if (isTwilioEnabled(env)) {
    results.push(
      await sendSms(env, {
        to: env.OWNER_PHONE || '7044305221',
        body: `New Colburn lead: ${lead.name}, ${lead.phone}, ${lead.serviceType}, ${formatEstimate(lead)}. ${dashboardUrl(env, lead.id)}`,
      }),
    );
  }
  return results;
}

async function notifyOwnerSmsReply(env, { lead, fromPhone, body }) {
  return sendSms(env, {
    to: env.OWNER_PHONE || '7044305221',
    body: `SMS reply from ${fromPhone}: ${body}${lead?.id ? ` ${dashboardUrl(env, lead.id)}` : ''}`,
  });
}

async function sendCustomerConfirmation(env, lead) {
  if (String(env.SEND_CUSTOMER_CONFIRMATION || '').toLowerCase() !== 'true') {
    return { channel: 'sms', status: 'skipped', reason: 'Customer confirmations disabled' };
  }

  return sendSms(env, {
    to: lead.phone,
    body:
      'Thanks for contacting Colburn Outdoor Maintenance. Your request was received. We will follow up to talk through the job and scheduling.',
  });
}

function missedCallReplyText(env) {
  return (
    env.MISSED_CALL_REPLY ||
    'Thanks for calling Colburn Outdoor Maintenance. Sorry we missed you - what outdoor work do you need help with? You can reply here or request a quote at https://colburnoutdoor.com/#contact'
  );
}

async function sendMissedCallReply(env, phone) {
  return sendSms(env, {
    to: phone,
    body: missedCallReplyText(env),
  });
}

async function sendReviewRequest(env, lead) {
  if (!env.GOOGLE_REVIEW_LINK) {
    return { channel: 'sms', status: 'skipped', reason: 'GOOGLE_REVIEW_LINK not configured' };
  }

  return sendSms(env, {
    to: lead.phone,
    body: `Thanks for choosing Colburn Outdoor Maintenance. If you were happy with the work, would you mind leaving us a quick Google review? ${env.GOOGLE_REVIEW_LINK}`,
  });
}

async function safelyRecordNotification(env, lead, type, run) {
  try {
    const result = await run();
    await addEvent(env, { type, leadId: lead?.id, phone: lead?.phone, payload: { result } });
    return result;
  } catch (error) {
    await addEvent(env, {
      type: `${type}_failed`,
      leadId: lead?.id,
      phone: lead?.phone,
      message: error.message,
      payload: { stack: error.stack },
    });
    return { status: 'failed', reason: error.message };
  }
}

export async function handleApi(request, env, url) {
  const path = url.pathname;

  if (path === '/api/health' && request.method === 'GET') {
    return jsonResponse({
      ok: true,
      database: 'D1',
      providers: providerStatus(env),
    });
  }

  if (path === '/api/pricing' && request.method === 'GET') {
    return jsonResponse(pricingConfig);
  }

  if (path === '/api/track' && request.method === 'POST') {
    const body = await parseBody(request);
    await addEvent(env, {
      type: cleanString(body.type || 'site_event'),
      phone: cleanString(body.phone || ''),
      message: cleanString(body.message || ''),
      payload: {
        source: cleanString(body.source || ''),
        path: cleanString(body.path || ''),
        utm: utmFrom(url, body),
      },
    });
    return jsonResponse({ ok: true });
  }

  if (path === '/api/leads' && request.method === 'POST') {
    const rateLimitMessage = rateLimitLeadSubmission(request);
    if (rateLimitMessage) return jsonResponse({ error: rateLimitMessage }, 429);

    const body = await parseBody(request);
    if (cleanString(body.company)) {
      await addEvent(env, { type: 'spam_honeypot', payload: { body } });
      return jsonResponse({ error: 'Unable to submit this request.' }, 400);
    }

    const error = validatePricingInput(body);
    if (error) return jsonResponse({ error }, 400);

    const lead = await createLead(env, buildLeadPayload(url, body));
    await addEvent(env, { type: 'lead_created', leadId: lead.id, phone: lead.phone, payload: { source: lead.source } });
    await safelyRecordNotification(env, lead, 'owner_notification', () => notifyOwnerNewLead(env, lead));
    await safelyRecordNotification(env, lead, 'customer_confirmation', () => sendCustomerConfirmation(env, lead));

    return jsonResponse({ lead }, 201);
  }

  if (path === '/api/dashboard/summary' && request.method === 'GET') {
    if (!requireDashboardAuth(request, env)) return jsonResponse({ error: 'Dashboard password required.' }, 401);
    return jsonResponse({ analytics: await getAnalytics(env), providers: providerStatus(env) });
  }

  if (path === '/api/leads' && request.method === 'GET') {
    if (!requireDashboardAuth(request, env)) return jsonResponse({ error: 'Dashboard password required.' }, 401);
    const leads = await listLeads(env, {
      status: cleanString(url.searchParams.get('status') || 'all'),
      search: cleanString(url.searchParams.get('search') || ''),
    });
    return jsonResponse({ leads, analytics: await getAnalytics(env) });
  }

  const leadMatch = path.match(/^\/api\/leads\/([^/]+)$/);
  if (leadMatch && request.method === 'GET') {
    if (!requireDashboardAuth(request, env)) return jsonResponse({ error: 'Dashboard password required.' }, 401);
    const lead = await getLead(env, leadMatch[1]);
    if (!lead) return jsonResponse({ error: 'Lead not found.' }, 404);
    return jsonResponse({ lead, messages: await listMessagesForLead(env, lead.id) });
  }

  if (leadMatch && request.method === 'PATCH') {
    if (!requireDashboardAuth(request, env)) return jsonResponse({ error: 'Dashboard password required.' }, 401);
    const existing = await getLead(env, leadMatch[1]);
    if (!existing) return jsonResponse({ error: 'Lead not found.' }, 404);

    const body = await parseBody(request);
    const updates = {};
    if (body.status && leadStatuses.includes(body.status)) updates.status = body.status;
    if (typeof body.internalNotes === 'string') updates.internalNotes = body.internalNotes;
    if (body.markContacted) updates.lastContactedAt = nowIso();

    const lead = await updateLead(env, existing.id, updates);
    await addEvent(env, { type: 'lead_updated', leadId: lead.id, phone: lead.phone, payload: updates });
    return jsonResponse({ lead });
  }

  const reviewMatch = path.match(/^\/api\/leads\/([^/]+)\/review-request$/);
  if (reviewMatch && request.method === 'POST') {
    if (!requireDashboardAuth(request, env)) return jsonResponse({ error: 'Dashboard password required.' }, 401);
    if (!hasTwilioConfig(env)) return jsonResponse(smsDisabledPayload());
    const lead = await getLead(env, reviewMatch[1]);
    if (!lead) return jsonResponse({ error: 'Lead not found.' }, 404);
    const body = await parseBody(request);
    if (lead.reviewRequestedAt && !body.force) {
      return jsonResponse({ error: 'Review request was already sent for this lead.' }, 409);
    }

    const result = await safelyRecordNotification(env, lead, 'review_request', () => sendReviewRequest(env, lead));
    const sent = result?.status === 'sent';
    const updatedLead = sent
      ? await updateLead(env, lead.id, {
          status: lead.status === 'completed' ? lead.status : 'completed',
          reviewRequestedAt: nowIso(),
        })
      : lead;

    return jsonResponse({ lead: updatedLead, result });
  }

  if (path === '/api/webhooks/missed-call' && request.method === 'POST') {
    if (!hasTwilioConfig(env)) return jsonResponse(smsDisabledPayload());
    const body = await parseBody(request);
    const phone = cleanString(body.From || body.from || body.caller || body.phone);
    if (!phone) return jsonResponse({ error: 'Caller phone is required.' }, 400);

    let lead = await findRecentMissedCallLead(env, phone, Number(env.MISSED_CALL_COOLDOWN_HOURS || 24));
    if (!lead) {
      const estimate = calculateEstimate({
        serviceType: 'custom_outdoor_jobs',
        propertySize: 'small',
        condition: 'normal',
        urgency: 'flexible',
        addons: [],
      });
      lead = await createLead(env, {
        name: 'Missed call',
        phone,
        email: '',
        serviceType: 'custom_outdoor_jobs',
        propertySize: 'small',
        condition: 'normal',
        urgency: 'flexible',
        addons: [],
        estimateLow: estimate.low,
        estimateHigh: estimate.high,
        notes: 'Created from missed-call webhook.',
        source: 'missed_call',
      });
    }

    await addEvent(env, { type: 'missed_call', leadId: lead.id, phone, payload: body });

    const cooldownHours = Number(env.MISSED_CALL_COOLDOWN_HOURS || 24);
    let smsResult = { status: 'skipped', reason: 'Recent missed-call auto text already sent.' };
    if (!(await hasRecentEvent(env, 'missed_call_auto_text', phone, cooldownHours))) {
      smsResult = await safelyRecordNotification(env, lead, 'missed_call_auto_text', () => sendMissedCallReply(env, phone));
      await addMessage(env, {
        leadId: lead.id,
        direction: 'outbound',
        channel: 'sms',
        fromPhone: env.TWILIO_FROM_NUMBER || '',
        toPhone: phone,
        body: missedCallReplyText(env),
        providerMessageId: smsResult.providerMessageId,
      });
    }

    return jsonResponse({ lead, smsResult });
  }

  if (path === '/api/webhooks/sms' && request.method === 'POST') {
    if (!hasTwilioConfig(env)) return jsonResponse(smsDisabledPayload());
    const body = await parseBody(request);
    const fromPhone = cleanString(body.From || body.from || body.phone);
    const messageBody = cleanString(body.Body || body.body || body.message);
    if (!fromPhone || !messageBody) return jsonResponse({ error: 'From phone and message body are required.' }, 400);

    let lead = await findLatestLeadByPhone(env, fromPhone);
    if (!lead) {
      const estimate = calculateEstimate({
        serviceType: 'custom_outdoor_jobs',
        propertySize: 'small',
        condition: 'normal',
        urgency: 'flexible',
        addons: [],
      });
      lead = await createLead(env, {
        name: 'SMS conversation',
        phone: fromPhone,
        email: '',
        serviceType: 'custom_outdoor_jobs',
        propertySize: 'small',
        condition: 'normal',
        urgency: 'flexible',
        addons: [],
        estimateLow: estimate.low,
        estimateHigh: estimate.high,
        notes: messageBody,
        source: 'sms_reply',
      });
    }

    const message = await addMessage(env, {
      leadId: lead.id,
      direction: 'inbound',
      channel: 'sms',
      fromPhone,
      toPhone: env.TWILIO_FROM_NUMBER || '',
      body: messageBody,
      providerMessageId: cleanString(body.MessageSid || body.messageSid),
    });

    await addEvent(env, { type: 'sms_reply', leadId: lead.id, phone: fromPhone, payload: body });
    await safelyRecordNotification(env, lead, 'owner_sms_reply_notification', () =>
      notifyOwnerSmsReply(env, { lead, fromPhone, body: messageBody }),
    );

    return jsonResponse({ lead, message });
  }

  return jsonResponse({ error: 'Not found.' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.hostname.startsWith('www.')) {
        url.hostname = url.hostname.replace(/^www\./, '');
        return Response.redirect(url.toString(), 301);
      }

      const staticResponse = staticUtilityResponse(url);
      if (staticResponse) return staticResponse;

      if (url.pathname.startsWith('/api/')) {
        return handleApi(request, env, url);
      }

      const response = await env.ASSETS.fetch(request);
      return applySeoResponse(response, url, { noIndex: url.pathname.startsWith('/dashboard') });
    } catch (error) {
      return jsonResponse({ error: error.message || 'Server error.' }, 500);
    }
  },
};
