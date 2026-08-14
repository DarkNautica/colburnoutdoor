# Colburn Outdoor Maintenance Lead System

React + Tailwind website for Colburn Outdoor Maintenance, with an Anime.js-powered public site and an existing local-service lead system retained for owner operations.

## What It Includes

- Call-first public site for sprinkler repair, seasonal service, and practical property care
- No public quote form: every conversion path on the site is a phone call
- Click-to-call tracking on every phone link, posted to `/api/track` with the on-page source
- Anime.js timelines, scroll choreography, parallax, and interactive motion
- Existing estimate logic backed by `src/data/pricing.js` for retained lead-system workflows
- Persistent Cloudflare D1 lead storage for production
- Persistent SQLite lead storage for local Node development
- Private owner dashboard at `/dashboard`
- Lead filtering, search, status updates, internal notes, quick call/text links
- Manual copy buttons for follow-up and review request messages
- Owner email notifications through Resend on Cloudflare, with SMTP support for local/Node deployments
- Optional Twilio webhook scaffolding disabled by default
- Privacy Policy and Terms pages
- Lead analytics and source tracking
- Google Search Console verification file at `/googlee11bb7f9d7b29aad.html`

## Service Area

The public site and structured data describe the service area as North Oakland County, Michigan, including Troy, Rochester Hills, Rochester, and roughly 15 miles around the core route. Keep this wording accurate and update it if the business narrows or expands where it works.

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
- `GOOGLE_REVIEW_LINK`: review request destination, currently `https://g.page/r/CVwXiW6gh7xaEAI/review`
- `SQLITE_PATH`: optional database path

Phase 1 works without Twilio. If email is not configured, the system still stores leads and logs skipped notification attempts gracefully.

## Pricing Rules

Edit `src/data/pricing.js`.

The public site does not show an estimate calculator — pricing is quoted on the phone. This config still backs the
`/api/leads` estimate fields and the dashboard's service, size, condition, and timeline labels, so it is kept in sync
with how jobs are actually priced.

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

- `POST /api/leads`: create a lead; retained for future intake, not called by the public site
- `POST /api/track`: log direct contact/source events, including every click-to-call on the site
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

## Google Business Profile

The site links to the live Google review destination at `https://g.page/r/CVwXiW6gh7xaEAI/review`. The public schema includes the Google profile identity URL through `sameAs`, but it intentionally does not include `aggregateRating` or fake review markup. Keep reviews handled through the real Google Business Profile.

## Search Console

Use the URL-prefix property `https://colburnoutdoor.com/` in Google Search Console. The HTML verification file is served at:

```text
https://colburnoutdoor.com/googlee11bb7f9d7b29aad.html
```

After verification, submit this sitemap:

```text
https://colburnoutdoor.com/sitemap.xml
```

Do not use the sitemap URL as the Search Console property itself.

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

## Cloudflare Worker + D1 (production)

`colburnoutdoor.com` and `www.colburnoutdoor.com` are served by the **Worker**, not by the Pages project. The Worker
holds routes for both hostnames, so a Pages deploy alone will never change what the live domain serves — deploying the
Worker is what publishes the site.

- Config: `wrangler.jsonc` (Worker; `main: worker/index.js`, static assets from `dist`)
- Entry / API handler: `worker/index.js`
- React assets: `dist`, served through the `ASSETS` binding with SPA fallback
- Lead database: Cloudflare D1
- Owner notifications: Resend email first
- SMS automation: optional, disabled by default

Builds run automatically from the Git integration on this repo: push to `main` and Workers Builds runs
`npm run build` then `npx wrangler deploy`. `wrangler.jsonc` must stay the Worker config for that command to work.

A legacy Pages project also exists and still answers on `colburnoutdoor.pages.dev`. Its config lives in
`wrangler.pages.jsonc` and it deploys with `npm run cf:pages:deploy`. It is not what the public domain serves.

```bash
npm install
npm run build
npm run cf:d1:create
```

Copy the returned D1 `database_id` into `wrangler.jsonc` (and `wrangler.pages.jsonc` if you still use Pages), then apply the schema:

```bash
npm run cf:d1:migrate:remote
```

Set required production secrets in Cloudflare:

```bash
npx wrangler secret put DASHBOARD_PASSWORD
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OWNER_EMAIL
npx wrangler secret put EMAIL_FROM
```

Optional future SMS secrets after Twilio verification:

```bash
npx wrangler secret put TWILIO_ENABLED
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_FROM_NUMBER
npx wrangler secret put GOOGLE_REVIEW_LINK
npx wrangler secret put MISSED_CALL_REPLY
```

Deploy:

```bash
npm run cf:deploy
```

`wrangler.jsonc` is the Worker config: D1 binding, static assets, and routes for the apex and `www`. The `www` host redirects to the apex in `worker/index.js`.
