/*
 * Generates sitemap.xml, robots.txt, and llms.txt from the shared service-area
 * data so the URL list can never drift from what the app actually routes.
 *
 * Run with: npm run seo
 */

import { writeFile } from "node:fs/promises";
import { phoneDisplay, serviceAreas, siteUrl } from "../src/data/service-areas.js";

const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${siteUrl}/`, changefreq: "weekly", priority: "1.0" },
  { loc: `${siteUrl}/service-area`, changefreq: "monthly", priority: "0.8" },
  ...serviceAreas.map((area) => ({
    loc: `${siteUrl}/service-area/${area.slug}`,
    changefreq: "monthly",
    priority: "0.7",
  })),
  { loc: `${siteUrl}/privacy`, changefreq: "yearly", priority: "0.2" },
  { loc: `${siteUrl}/terms`, changefreq: "yearly", priority: "0.2" },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard

# Assistant crawlers are allowed — the site is a public local service listing.
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

/* Google has stated llms.txt is not used by its AI surfaces. It is included
   because other answer engines do read it and it costs nothing to serve. */
const llms = `# Colburn Outdoor Maintenance

> Sprinkler system repair, seasonal service, and property care for existing
> systems in North Oakland County, Michigan. New sprinkler installation is not
> offered.

Phone: ${phoneDisplay}
Service area: North Oakland County, Michigan — roughly 15 miles around the core route.

## Services
- Sprinkler repair: broken or misaligned heads, leaks, valves that will not shut off, zones that will not run, weak pressure, controller faults.
- Sprinkler performance: coverage, pressure, zone balancing, and timing correction.
- Seasonal service: spring startup, in-season tuning, fall winterization.
- Property care: routine lawn maintenance, seasonal cleanup, overgrowth restoration.

## Not offered
- New sprinkler system installation
- Landscape construction

## Pages
${serviceAreas.map((a) => `- [Sprinkler repair in ${a.city}, MI](${siteUrl}/service-area/${a.slug})`).join("\n")}
- [Service area overview](${siteUrl}/service-area)
`;

await writeFile("public/sitemap.xml", sitemap);
await writeFile("public/robots.txt", robots);
await writeFile("public/llms.txt", llms);

console.log(`sitemap.xml -> ${urls.length} URLs`);
console.log("robots.txt, llms.txt written");
