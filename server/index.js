import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateEstimate, pricingConfig } from '../src/data/pricing.js';
import {
  addEvent,
  addMessage,
  createLead,
  dbPath,
  findLatestLeadByPhone,
  findRecentMissedCallLead,
  getAnalytics,
  getLead,
  hasRecentEvent,
  leadStatuses,
  listLeads,
  listMessagesForLead,
  normalizePhone,
  updateLead,
} from './storage.js';
import {
  notifyOwnerNewLead,
  notifyOwnerSmsReply,
  providerStatus,
  sendCustomerConfirmation,
  sendMissedCallReply,
  sendReviewRequest,
} from './notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const apiPort = Number(process.env.API_PORT || process.env.PORT || 5190);
const dashboardPassword = process.env.DASHBOARD_PASSWORD || 'colburn-admin';
const submissionRateLimit = new Map();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

function cleanString(value = '') {
  return String(value).trim();
}

function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

function rateLimitLeadSubmissions(req, res, next) {
  const ip = clientIp(req);
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 5;
  const hits = (submissionRateLimit.get(ip) || []).filter((timestamp) => now - timestamp < windowMs);
  hits.push(now);
  submissionRateLimit.set(ip, hits);

  if (hits.length > max) {
    return res.status(429).json({ error: 'Too many quote requests. Please try again shortly.' });
  }

  return next();
}

function requireDashboardAuth(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const password = req.get('x-dashboard-password') || bearer;

  if (password !== dashboardPassword) {
    return res.status(401).json({ error: 'Dashboard password required.' });
  }

  return next();
}

function requiredFields(body, fields) {
  return fields.filter((field) => !cleanString(body[field]));
}

function validatePricingInput(body) {
  const missing = requiredFields(body, ['name', 'phone', 'serviceType']);
  if (missing.length) {
    return `${missing.join(', ')} required.`;
  }
  if (!pricingConfig.services[body.serviceType]) return 'Service required.';
  return '';
}

function utmFrom(req, body) {
  return {
    utmSource: cleanString(body.utmSource || req.query.utm_source),
    utmMedium: cleanString(body.utmMedium || req.query.utm_medium),
    utmCampaign: cleanString(body.utmCampaign || req.query.utm_campaign),
  };
}

function buildLeadPayload(req, body, source = 'quote_form') {
  const estimate = calculateEstimate(body);
  return {
    name: cleanString(body.name),
    phone: cleanString(body.phone),
    email: cleanString(body.email),
    serviceType: body.serviceType,
    propertySize: body.propertySize || 'small',
    condition: body.condition || 'normal',
    urgency: body.urgency || 'flexible',
    addons: Array.isArray(body.addons) ? body.addons : [],
    estimateLow: estimate.low,
    estimateHigh: estimate.high,
    notes: cleanString(body.notes),
    source: cleanString(body.source || source),
    ...utmFrom(req, body),
  };
}

async function safelyRecordNotification(lead, type, run) {
  try {
    const result = await run();
    addEvent({ type, leadId: lead?.id, phone: lead?.phone, payload: { result } });
    return result;
  } catch (error) {
    addEvent({
      type: `${type}_failed`,
      leadId: lead?.id,
      phone: lead?.phone,
      message: error.message,
      payload: { stack: error.stack },
    });
    return { status: 'failed', reason: error.message };
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    database: dbPath,
    providers: providerStatus(),
  });
});

app.get('/api/pricing', (_req, res) => {
  res.json(pricingConfig);
});

app.post('/api/track', (req, res) => {
  addEvent({
    type: cleanString(req.body.type || 'site_event'),
    phone: cleanString(req.body.phone || ''),
    message: cleanString(req.body.message || ''),
    payload: {
      source: cleanString(req.body.source || ''),
      path: cleanString(req.body.path || ''),
      utm: utmFrom(req, req.body),
    },
  });
  res.json({ ok: true });
});

app.post('/api/leads', rateLimitLeadSubmissions, async (req, res) => {
  if (cleanString(req.body.company)) {
    addEvent({ type: 'spam_honeypot', payload: { body: req.body } });
    return res.status(400).json({ error: 'Unable to submit this request.' });
  }

  const error = validatePricingInput(req.body);
  if (error) return res.status(400).json({ error });

  const lead = createLead(buildLeadPayload(req, req.body));
  addEvent({ type: 'lead_created', leadId: lead.id, phone: lead.phone, payload: { source: lead.source } });

  await safelyRecordNotification(lead, 'owner_notification', () => notifyOwnerNewLead(lead));
  await safelyRecordNotification(lead, 'customer_confirmation', () => sendCustomerConfirmation(lead));

  return res.status(201).json({ lead });
});

app.get('/api/dashboard/summary', requireDashboardAuth, (_req, res) => {
  res.json({ analytics: getAnalytics(), providers: providerStatus() });
});

app.get('/api/leads', requireDashboardAuth, (req, res) => {
  const leads = listLeads({
    status: cleanString(req.query.status || 'all'),
    search: cleanString(req.query.search || ''),
  });
  res.json({ leads, analytics: getAnalytics() });
});

app.get('/api/leads/:id', requireDashboardAuth, (req, res) => {
  const lead = getLead(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  res.json({ lead, messages: listMessagesForLead(lead.id) });
});

app.patch('/api/leads/:id', requireDashboardAuth, (req, res) => {
  const existing = getLead(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found.' });

  const updates = {};
  if (req.body.status && leadStatuses.includes(req.body.status)) updates.status = req.body.status;
  if (typeof req.body.internalNotes === 'string') updates.internalNotes = req.body.internalNotes;
  if (req.body.markContacted) updates.lastContactedAt = new Date().toISOString();

  const lead = updateLead(existing.id, updates);
  addEvent({ type: 'lead_updated', leadId: lead.id, phone: lead.phone, payload: updates });
  res.json({ lead });
});

app.post('/api/leads/:id/review-request', requireDashboardAuth, async (req, res) => {
  const lead = getLead(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (lead.reviewRequestedAt && !req.body.force) {
    return res.status(409).json({ error: 'Review request was already sent for this lead.' });
  }

  const result = await safelyRecordNotification(lead, 'review_request', () => sendReviewRequest(lead));
  const sent = result?.status === 'sent';
  const updatedLead = sent
    ? updateLead(lead.id, {
        status: lead.status === 'completed' ? lead.status : 'completed',
        reviewRequestedAt: new Date().toISOString(),
      })
    : lead;
  res.json({ lead: updatedLead, result });
});

app.post('/api/webhooks/missed-call', async (req, res) => {
  const phone = cleanString(req.body.From || req.body.from || req.body.caller || req.body.phone);
  if (!phone) return res.status(400).json({ error: 'Caller phone is required.' });

  let lead = findRecentMissedCallLead(phone, Number(process.env.MISSED_CALL_COOLDOWN_HOURS || 24));
  if (!lead) {
    const estimate = calculateEstimate({
      serviceType: 'custom_outdoor_jobs',
      propertySize: 'small',
      condition: 'normal',
      urgency: 'flexible',
      addons: [],
    });
    lead = createLead({
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

  addEvent({ type: 'missed_call', leadId: lead.id, phone, payload: req.body });

  const cooldownHours = Number(process.env.MISSED_CALL_COOLDOWN_HOURS || 24);
  let smsResult = { status: 'skipped', reason: 'Recent missed-call auto text already sent.' };
  if (!hasRecentEvent('missed_call_auto_text', phone, cooldownHours)) {
    smsResult = await safelyRecordNotification(lead, 'missed_call_auto_text', () => sendMissedCallReply(phone));
    addMessage({
      leadId: lead.id,
      direction: 'outbound',
      channel: 'sms',
      fromPhone: process.env.TWILIO_FROM_NUMBER || '',
      toPhone: phone,
      body:
        process.env.MISSED_CALL_REPLY ||
        'Thanks for calling Colburn Outdoor Maintenance. Sorry we missed you - what outdoor work do you need help with? You can reply here or request a quote at https://colburnoutdoor.com/#contact',
      providerMessageId: smsResult.providerMessageId,
    });
  }

  res.json({ lead, smsResult });
});

app.post('/api/webhooks/sms', async (req, res) => {
  const fromPhone = cleanString(req.body.From || req.body.from || req.body.phone);
  const body = cleanString(req.body.Body || req.body.body || req.body.message);
  if (!fromPhone || !body) return res.status(400).json({ error: 'From phone and message body are required.' });

  let lead = findLatestLeadByPhone(fromPhone);
  if (!lead) {
    const estimate = calculateEstimate({
      serviceType: 'custom_outdoor_jobs',
      propertySize: 'small',
      condition: 'normal',
      urgency: 'flexible',
      addons: [],
    });
    lead = createLead({
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
      notes: body,
      source: 'sms_reply',
    });
  }

  const message = addMessage({
    leadId: lead.id,
    direction: 'inbound',
    channel: 'sms',
    fromPhone,
    toPhone: process.env.TWILIO_FROM_NUMBER || '',
    body,
    providerMessageId: cleanString(req.body.MessageSid || req.body.messageSid),
  });

  addEvent({ type: 'sms_reply', leadId: lead.id, phone: fromPhone, payload: req.body });
  await safelyRecordNotification(lead, 'owner_sms_reply_notification', () =>
    notifyOwnerSmsReply({ lead, fromPhone, body }),
  );

  res.json({ lead, message });
});

if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get(/^\/dashboard(?:\/.*)?$/, (_req, res) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(apiPort, () => {
  console.log(`Colburn API server listening on http://127.0.0.1:${apiPort}`);
  console.log(`Lead database: ${dbPath}`);
  if (!process.env.DASHBOARD_PASSWORD) {
    console.log('DASHBOARD_PASSWORD is not set. Local fallback password: colburn-admin');
  }
});
