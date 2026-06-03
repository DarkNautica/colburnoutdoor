# Colburn Outdoor Maintenance Lead System

React + Tailwind website with a local-service lead system for Colburn Outdoor Maintenance.

## What It Includes

- Live estimate calculator backed by `src/data/pricing.js`
- Quote request form that submits to the backend
- Persistent SQLite lead storage
- Private owner dashboard at `/dashboard`
- Lead filtering, search, status updates, internal notes, quick call/text links
- Owner notification hooks for email and SMS
- Missed-call text-back webhook
- Inbound SMS reply webhook
- Review request button for completed jobs
- Lead analytics and source tracking

## Run Locally

```bash
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5188/`  
Backend API: `http://127.0.0.1:5190/`

If `DASHBOARD_PASSWORD` is not set, the local fallback password is:

```text
colburn-admin
```

## Environment Setup

Copy `.env.example` to `.env` and fill in production values.

Important variables:

- `DASHBOARD_PASSWORD`: protects `/dashboard` and lead APIs
- `OWNER_PHONE`: owner SMS destination
- `OWNER_EMAIL`: owner email destination
- `SMTP_*`: email notification settings
- `TWILIO_*`: SMS, missed-call text-back, inbound SMS, and review request settings
- `GOOGLE_REVIEW_LINK`: review request destination
- `SQLITE_PATH`: optional database path

If SMTP or Twilio is not configured, the system still stores leads and logs skipped notification attempts gracefully.

## Pricing Rules

Edit `src/data/pricing.js`.

The current starting-price logic:

- Lawn maintenance base: 95
- Mulch / bed refresh base: 260
- Property cleanup base: 180
- Trimming / brush work base: 145
- Small yard: +0
- Medium yard: +55
- Large yard: +120
- Extra large / heavy: +240
- Normal condition: +0
- Overgrown: +75
- Heavy cleanup: +175
- Flexible timeline: +0
- This week: +45
- ASAP / urgent: +95
- High range: low estimate + max(45, 35% of low estimate)

## API Overview

Public:

- `POST /api/leads`: create a quote-form lead
- `POST /api/track`: log direct contact/source events
- `POST /api/webhooks/missed-call`: missed-call text-back endpoint
- `POST /api/webhooks/sms`: inbound SMS reply endpoint

Private, requires `x-dashboard-password`:

- `GET /api/leads`
- `GET /api/leads/:id`
- `PATCH /api/leads/:id`
- `POST /api/leads/:id/review-request`
- `GET /api/dashboard/summary`

## Webhook Notes

For Twilio-style missed calls, point the provider webhook to:

```text
https://colburnoutdoor.com/api/webhooks/missed-call
```

For inbound SMS replies:

```text
https://colburnoutdoor.com/api/webhooks/sms
```

The missed-call endpoint prevents repeated auto-texts to the same caller within `MISSED_CALL_COOLDOWN_HOURS`.

## Production

Build and run:

```bash
npm run build
npm start
```

The production server serves the built React app and the API from the same Express process. The dashboard route sends a `noindex, nofollow` robots header and all lead data APIs require the dashboard password.

## Cloudflare Workers + D1

This project also includes a Cloudflare Worker API in `worker/index.js` for deploying the React site and lead system on Cloudflare with D1.

```bash
npm install
npm run build
npm run cf:d1:create
```

Copy the returned D1 `database_id` into `wrangler.jsonc`, replacing `REPLACE_WITH_D1_DATABASE_ID`, then apply the schema:

```bash
npm run cf:d1:migrate:remote
```

Set required production secrets in Cloudflare:

```bash
npx wrangler secret put DASHBOARD_PASSWORD
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_FROM_NUMBER
```

Optional secrets/vars:

```bash
npx wrangler secret put GOOGLE_REVIEW_LINK
npx wrangler secret put MISSED_CALL_REPLY
```

Deploy:

```bash
npm run cf:deploy
```

`wrangler.jsonc` is configured for `colburnoutdoor.com/*` and `www.colburnoutdoor.com/*`. The `www` host redirects to the apex domain.
