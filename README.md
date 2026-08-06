# Colburn Outdoor Maintenance

Sprinkler-first local service website for Colburn Outdoor Maintenance.

## Public positioning

- Primary service: repair, diagnosis, adjustment, seasonal service, and maintenance for existing sprinkler systems
- No sprinkler or lawn installations
- Secondary services: routine lawn maintenance, exterior property upkeep, seasonal cleanup, and overgrowth restoration
- Customers: homeowners, rental properties, landlords, property managers, and businesses
- Pricing: call-only; the public calculator and quote form are intentionally removed
- Territory: North Oakland County first, with targeted service in Troy, Rochester Hills, Rochester, and roughly 15 miles around those areas

The territory language is intentionally flexible. Nearby properties may still be accepted when they fit the route efficiently.

The complete brand, market, conversion, route, and deployment review is in [`COLBURN_BRAND_MARKET_AUDIT.md`](./COLBURN_BRAND_MARKET_AUDIT.md).

## Run locally

```bash
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5188/`
Backend API: `http://127.0.0.1:5190/`

## Existing backend

The Cloudflare D1 lead APIs, owner dashboard routes, notification code, and migration remain in the repository for future use. The refreshed public homepage does not collect leads or display online pricing; every primary conversion points to the business phone number.

## Production

If the Cloudflare Pages project is connected to this GitHub repository, merging the approved pull request into `main` should trigger the production deployment. If Git deployment is not connected, deploy from a trusted checkout:

```bash
npm install
npm run build
npm run cf:deploy
```

The existing Cloudflare Pages, Functions, and D1 configuration remains intact. The Google Search Console verification file remains available at `/googlee11bb7f9d7b29aad.html`.
