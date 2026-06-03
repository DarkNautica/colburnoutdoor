# Colburn Outdoor Maintenance Lead System

React + Tailwind website with a local-service lead system for Colburn Outdoor Maintenance.

## What It Includes

- Live estimate calculator backed by `src/data/pricing.js`
- Quote request form that submits to the API
- Persistent Cloudflare D1 lead storage for production
- Persistent SQLite lead storage for local Node development
- Private owner dashboard at `/dashboard`
- Lead filtering, search, status updates, internal notes, quick call/text links
- Manual copy buttons for follow-up and review request messages
- Owner email notifications through Resend on Cloudflare, with SMTP support for local/Node deployments
- Optional Twilio webhook scaffolding disabled by default
- Privacy Policy and Terms pages
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
- `OWNER_PHONE`: owner phone number for manual call/text links
- `OWNER_EMAIL`: owner email destination for quote notifications
- `RESEND_API_KEY`: recommended Phase 1 email provider on Cloudflare Pages Functions
- `EMAIL_FROM`: verified sender for Resend
- `SMTP_*`: optional email notification settings for local/Node server deployments
- `TWILIO_ENABLED`: defaults to `false`; do not enable until Twilio/A2P 10DLC verification is complete
- `TWILIO_*`: optional future SMS automation settings
- `GOOGLE_REVIEW_LINK`: review request destination
- `SQLITE_PATH`: optional database path

Phase 1 works without Twilio. If email is not configured, the system still stores leads and logs skipped notification attempts gracefully.

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
- `POST /api/webhooks/missed-call`: optional future missed-call text-back endpoint; inactive while `TWILIO_ENABLED=false`
- `POST /api/webhooks/sms`: optional future inbound SMS reply endpoint; inactive while `TWILIO_ENABLED=false`

Private, requires `x-dashboard-password`:

- `GET /api/leads`
- `GET /api/leads/:id`
- `PATCH /api/leads/:id`
- `POST /api/leads/:id/review-request`: optional future SMS review request endpoint; dashboard uses manual copy/text actions for Phase 1
- `GET /api/dashboard/summary`

## Dashboard Actions

The dashboard supports Phase 1 manual lead handling:

- Call lead
- Text lead with a prefilled `sms:` link
- Copy follow-up message
- Copy review request message
- Mark contacted
- Mark booked
- Mark completed
- Mark lost

## SMS Automation Notes

Twilio is intentionally not required for launch.

SMS automation requires A2P 10DLC/Twilio verification before production use. Keep `TWILIO_ENABLED=false` until verification is complete and the production number is ready. While disabled, missed-call, inbound SMS, and SMS review request routes return a clear disabled response and do not crash.

After verification, set `TWILIO_ENABLED=true`, configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`, then point Twilio-style missed calls to:

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

## Cloudflare Pages + Functions + D1

Phase 1 production uses Cloudflare Pages, Pages Functions, and D1:

- React assets: `dist`
- Pages Functions entry: `functions/[[path]].js`
- Shared API handler: `worker/index.js`
- Lead database: Cloudflare D1
- Owner notifications: Resend email first
- SMS automation: optional, disabled by default

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
npx wrangler pages secret put DASHBOARD_PASSWORD --project-name colburnoutdoor
npx wrangler pages secret put RESEND_API_KEY --project-name colburnoutdoor
npx wrangler pages secret put OWNER_EMAIL --project-name colburnoutdoor
npx wrangler pages secret put EMAIL_FROM --project-name colburnoutdoor
```

Optional future SMS secrets after Twilio verification:

```bash
npx wrangler pages secret put TWILIO_ENABLED --project-name colburnoutdoor
npx wrangler pages secret put TWILIO_ACCOUNT_SID --project-name colburnoutdoor
npx wrangler pages secret put TWILIO_AUTH_TOKEN --project-name colburnoutdoor
npx wrangler pages secret put TWILIO_FROM_NUMBER --project-name colburnoutdoor
npx wrangler pages secret put GOOGLE_REVIEW_LINK --project-name colburnoutdoor
npx wrangler pages secret put MISSED_CALL_REPLY --project-name colburnoutdoor
```

Deploy:

```bash
npm run cf:deploy
```

`wrangler.jsonc` is configured for Cloudflare Pages with D1 bindings. The `www` host redirects to the apex domain in `functions/[[path]].js`.
