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
