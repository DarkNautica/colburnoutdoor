/*
 * Service-area data. Imported by the React app, the Worker's SEO route table,
 * and the sitemap generator so titles, descriptions, and URLs cannot drift.
 *
 * Copy here is deliberately about geography and irrigation conditions. It makes
 * no claims about job history, customer counts, or credentials.
 */

export const siteUrl = "https://colburnoutdoor.com";
export const phoneDisplay = "(704) 430-5221";
export const phoneE164 = "+17044305221";

/* Centre of the stated route, used for the areaServed GeoCircle. Rochester
   Hills city centre; the 15-mile radius comes from the business's own copy. */
export const routeCenter = { lat: 42.6584, lng: -83.1499, radiusMiles: 15 };

export const serviceAreas = [
  {
    slug: "rochester-hills",
    city: "Rochester Hills",
    position: "at the centre of",
    lede: "Rochester Hills sits at the middle of the North Oakland service route, which makes it the easiest area to schedule sprinkler repair and seasonal service in.",
    conditions:
      "Much of Rochester Hills was built out in subdivision waves from the 1970s onward, so a large share of systems are now old enough that heads, valves, and controllers are reaching the end of their service life rather than simply needing adjustment. Rotor and spray heads mixed on the same zone are common in homes where sections were replaced piecemeal over the years.",
    focus: "Zone diagnostics, valve and solenoid work, controller replacement, spring startup, and fall winterization.",
  },
  {
    slug: "rochester",
    city: "Rochester",
    position: "just north-east of the centre of",
    lede: "Rochester is minutes from the centre of the route, covering both in-town properties near downtown and the surrounding residential streets.",
    conditions:
      "Older in-town lots tend to have smaller, tightly zoned systems where a single failed head or a misaligned nozzle is immediately visible on a narrow lawn or a sidewalk strip. Overspray onto walks and drives is a frequent reason to call, and it is usually a nozzle, arc, or pressure correction rather than a rebuild.",
    focus: "Head replacement and alignment, overspray and arc correction, pressure problems, and seasonal service.",
  },
  {
    slug: "troy",
    city: "Troy",
    position: "at the southern end of",
    lede: "Troy anchors the southern end of the North Oakland service route, covering both residential subdivisions and smaller commercial and rental properties.",
    conditions:
      "Troy's mix of long-established subdivisions and business-corridor properties means systems here range from compact residential layouts to larger multi-zone installations. On the bigger properties, a weak or dead zone often traces back to a valve or wiring fault rather than the heads themselves.",
    focus: "Multi-zone diagnostics, valve and wiring faults, dry-spot and coverage correction, and property care for rentals and small business sites.",
  },
  {
    slug: "auburn-hills",
    city: "Auburn Hills",
    position: "west of the centre of",
    lede: "Auburn Hills is a short run west along the route, covering residential neighbourhoods as well as rental and small commercial properties.",
    conditions:
      "Properties here vary widely in age and layout, so the first visit is usually about mapping what is actually installed — how many zones exist, which valves control them, and whether the controller programme still matches the system. Undocumented or partially rebuilt systems are common.",
    focus: "System mapping, zone and valve tracing, controller setup, and seasonal startup or winterization.",
  },
  {
    slug: "lake-orion",
    city: "Lake Orion",
    position: "on the northern half of",
    lede: "Lake Orion sits on the northern half of the route, covering the village and the surrounding Orion Township properties.",
    conditions:
      "Lots in the Lake Orion area are often larger and less uniform than the subdivision grids further south, with irrigation laid out around slopes, tree lines, and waterfront edges. Coverage gaps on sloped ground and heads buried by years of growth are typical starting points.",
    focus: "Coverage correction on irregular lots, buried and damaged head recovery, zone balancing, and winterization.",
  },
  {
    slug: "oxford",
    city: "Oxford",
    position: "at the northern end of",
    lede: "Oxford marks the northern end of the practical service route, covering the village and nearby township properties.",
    conditions:
      "Larger lots north of Lake Orion often mean longer zone runs and more ground to lose pressure across, so weak spray at the far end of a zone is a routine complaint. Systems on bigger properties also tend to have more exposed components to inspect after a Michigan winter.",
    focus: "Pressure and long-run zone problems, winter damage inspection, spring startup, and fall winterization.",
  },
  {
    slug: "clarkston",
    city: "Clarkston",
    position: "at the north-west edge of",
    lede: "Clarkston and the surrounding Independence Township area sit at the north-west edge of the service route.",
    conditions:
      "Wooded and sloped properties are common here, and both work against even irrigation coverage — root growth shifts heads out of alignment and grade changes leave the high side of a zone dry. Seasonal cleanup and overgrowth work often comes up alongside the sprinkler visit.",
    focus: "Head realignment, slope and shade coverage issues, seasonal service, and property cleanup.",
  },
];

export function findServiceArea(slug) {
  return serviceAreas.find((area) => area.slug === slug) || null;
}

export function areaSeo(area) {
  return {
    title: `Sprinkler Repair in ${area.city}, MI | Colburn Outdoor`,
    description: `Sprinkler system repair, seasonal startup, and winterization for existing systems in ${area.city}, Michigan. Call ${phoneDisplay} for pricing. No new installations.`,
    canonical: `${siteUrl}/service-area/${area.slug}`,
  };
}

export const serviceAreaHubSeo = {
  title: "Service Area | Sprinkler Repair Across North Oakland County, MI",
  description:
    "Colburn Outdoor services existing sprinkler systems across North Oakland County, Michigan — Rochester Hills, Rochester, Troy, Auburn Hills, Lake Orion, Oxford, and Clarkston.",
  canonical: `${siteUrl}/service-area`,
};
