import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const dataDir = path.resolve(process.cwd(), 'data');
mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.SQLITE_PATH
  ? path.resolve(process.env.SQLITE_PATH)
  : path.join(dataDir, 'colburn-leads.sqlite');

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_normalized TEXT NOT NULL,
    email TEXT,
    service_type TEXT NOT NULL,
    property_size TEXT NOT NULL,
    condition TEXT NOT NULL,
    urgency TEXT NOT NULL,
    addons_json TEXT NOT NULL DEFAULT '[]',
    estimate_low INTEGER NOT NULL,
    estimate_high INTEGER NOT NULL,
    notes TEXT,
    source TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    internal_notes TEXT,
    last_contacted_at TEXT,
    review_requested_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone_normalized);
  CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    lead_id TEXT,
    direction TEXT NOT NULL,
    channel TEXT NOT NULL,
    from_phone TEXT,
    to_phone TEXT,
    body TEXT NOT NULL,
    provider_message_id TEXT,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    type TEXT NOT NULL,
    lead_id TEXT,
    phone_normalized TEXT,
    message TEXT,
    payload_json TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_events_type_phone_created ON events(type, phone_normalized, created_at);
  CREATE INDEX IF NOT EXISTS idx_events_lead_id ON events(lead_id);
`);

export const leadStatuses = ['new', 'contacted', 'quoted', 'booked', 'completed', 'lost'];

export function normalizePhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits;
}

function nowIso() {
  return new Date().toISOString();
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
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

export function createLead(input) {
  const id = input.id ?? randomUUID();
  const createdAt = input.createdAt ?? nowIso();
  const updatedAt = createdAt;
  const phoneNormalized = normalizePhone(input.phone);

  db.prepare(`
    INSERT INTO leads (
      id, created_at, updated_at, name, phone, phone_normalized, email, service_type,
      property_size, condition, urgency, addons_json, estimate_low, estimate_high,
      notes, source, utm_source, utm_medium, utm_campaign, status, internal_notes,
      last_contacted_at, review_requested_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  );

  return getLead(id);
}

export function getLead(id) {
  return mapLead(db.prepare('SELECT * FROM leads WHERE id = ?').get(id));
}

export function listLeads({ status = 'all', search = '' } = {}) {
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
  return db.prepare(`SELECT * FROM leads ${where} ORDER BY created_at DESC`).all(...params).map(mapLead);
}

export function updateLead(id, updates) {
  const allowed = {
    status: 'status',
    internalNotes: 'internal_notes',
    lastContactedAt: 'last_contacted_at',
    reviewRequestedAt: 'review_requested_at',
  };
  const entries = Object.entries(updates).filter(([key]) => key in allowed);
  if (!entries.length) return getLead(id);

  const values = entries.map(([key, value]) => [allowed[key], value]);
  values.push(['updated_at', nowIso()]);

  const setSql = values.map(([column]) => `${column} = ?`).join(', ');
  db.prepare(`UPDATE leads SET ${setSql} WHERE id = ?`).run(...values.map(([, value]) => value), id);
  return getLead(id);
}

export function findLatestLeadByPhone(phone) {
  return mapLead(
    db.prepare('SELECT * FROM leads WHERE phone_normalized = ? ORDER BY created_at DESC LIMIT 1').get(normalizePhone(phone)),
  );
}

export function findRecentMissedCallLead(phone, hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  return mapLead(
    db
      .prepare(
        "SELECT * FROM leads WHERE phone_normalized = ? AND source = 'missed_call' AND created_at >= ? ORDER BY created_at DESC LIMIT 1",
      )
      .get(normalizePhone(phone), cutoff),
  );
}

export function hasRecentEvent(type, phone, hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const row = db
    .prepare('SELECT id FROM events WHERE type = ? AND phone_normalized = ? AND created_at >= ? LIMIT 1')
    .get(type, normalizePhone(phone), cutoff);
  return Boolean(row);
}

export function addMessage(input) {
  const id = input.id ?? randomUUID();
  db.prepare(`
    INSERT INTO messages (
      id, created_at, lead_id, direction, channel, from_phone, to_phone, body, provider_message_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.createdAt ?? nowIso(),
    input.leadId ?? null,
    input.direction,
    input.channel,
    input.fromPhone ?? '',
    input.toPhone ?? '',
    input.body,
    input.providerMessageId ?? '',
  );
  return mapMessage(db.prepare('SELECT * FROM messages WHERE id = ?').get(id));
}

export function listMessagesForLead(leadId) {
  return db
    .prepare('SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC')
    .all(leadId)
    .map(mapMessage);
}

export function addEvent(input) {
  const id = input.id ?? randomUUID();
  db.prepare(`
    INSERT INTO events (id, created_at, type, lead_id, phone_normalized, message, payload_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.createdAt ?? nowIso(),
    input.type,
    input.leadId ?? null,
    input.phone ? normalizePhone(input.phone) : input.phoneNormalized ?? null,
    input.message ?? '',
    JSON.stringify(input.payload ?? {}),
  );
  return id;
}

export function getAnalytics() {
  const total = db.prepare('SELECT COUNT(*) AS count FROM leads').get().count;
  const byStatus = Object.fromEntries(
    db.prepare('SELECT status, COUNT(*) AS count FROM leads GROUP BY status').all().map((row) => [row.status, row.count]),
  );
  const bySource = Object.fromEntries(
    db.prepare('SELECT source, COUNT(*) AS count FROM leads GROUP BY source').all().map((row) => [row.source, row.count]),
  );

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

export { dbPath };
