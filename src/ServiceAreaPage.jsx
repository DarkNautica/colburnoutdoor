import { ArrowLeft, ArrowUpRight, MapPin, Phone, Snowflake, Sprout, Wrench } from "lucide-react";
import { phoneDisplay, phoneE164, serviceAreas, siteUrl } from "./data/service-areas.js";
import "./service-area.css";

const phoneHref = `tel:${phoneE164}`;

function trackCall(source) {
  const payload = JSON.stringify({
    type: "direct_contact_click",
    source,
    path: window.location.pathname,
    phone: phoneDisplay,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      return;
    }
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(
      () => {},
    );
  } catch {
    /* tracking must never block the call */
  }
}

function CallButton({ source, sub = "Call for pricing" }) {
  return (
    <a className="sa-call" href={phoneHref} onClick={() => trackCall(source)} aria-label={`Call Colburn Outdoor at ${phoneDisplay}`}>
      <span className="sa-call-icon" aria-hidden="true">
        <Phone strokeWidth={2.2} />
      </span>
      <span className="sa-call-text">
        <small>{sub}</small>
        <strong>{phoneDisplay}</strong>
      </span>
      <span className="sa-call-arrow" aria-hidden="true">
        <ArrowUpRight strokeWidth={2.4} />
      </span>
    </a>
  );
}

function Shell({ children, breadcrumb }) {
  return (
    <main className="sa-root">
      <header className="sa-header">
        <a className="sa-brand" href="/" aria-label="Colburn Outdoor home">
          <img src="/images/opt/colburn-outdoor-mark-white-128.webp" alt="" width="128" height="96" />
          <span>
            <strong>Colburn</strong> Outdoor
          </span>
        </a>
        <a className="sa-header-call" href={phoneHref} onClick={() => trackCall("area_header")}>
          <Phone strokeWidth={2.2} aria-hidden="true" />
          <span>{phoneDisplay}</span>
        </a>
      </header>

      <nav className="sa-crumbs" aria-label="Breadcrumb">
        {breadcrumb.map((crumb, index) =>
          crumb.href ? (
            <span key={crumb.href}>
              <a href={crumb.href}>{crumb.name}</a>
              <i aria-hidden="true">/</i>
            </span>
          ) : (
            <span key={crumb.name} aria-current="page">
              {crumb.name}
            </span>
          ),
        )}
      </nav>

      {children}

      <footer className="sa-footer">
        <a className="sa-back" href="/">
          <ArrowLeft className="sa-back-icon" aria-hidden="true" /> Back to Colburn Outdoor
        </a>
        <p>
          © {new Date().getFullYear()} Colburn Outdoor Maintenance · Existing sprinkler systems, property upkeep, and
          restoration across North Oakland County, Michigan.
        </p>
      </footer>
    </main>
  );
}

function StructuredData({ json }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export function ServiceAreaHub() {
  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Service area", item: `${siteUrl}/service-area` },
    ],
  };

  return (
    <Shell breadcrumb={[{ name: "Home", href: "/" }, { name: "Service area" }]}>
      <StructuredData json={breadcrumbJson} />

      <section className="sa-hero">
        <p className="sa-eyebrow">
          <span /> North Oakland County, Michigan
        </p>
        <h1>Where we work</h1>
        <p className="sa-lede">
          Colburn Outdoor runs one practical service route through North Oakland County. Sprinkler repair and seasonal
          service come first, with property care available on the same visit. Roughly 15 miles around the core route can
          fit — call with the address and we will confirm it.
        </p>
        <CallButton source="area_hub_hero" />
      </section>

      <section className="sa-grid-section" aria-labelledby="cities-title">
        <h2 id="cities-title">Cities on the route</h2>
        <div className="sa-grid">
          {serviceAreas.map((area) => (
            <a className="sa-card" href={`/service-area/${area.slug}`} key={area.slug}>
              <span className="sa-card-icon" aria-hidden="true">
                <MapPin strokeWidth={1.8} />
              </span>
              <h3>{area.city}, MI</h3>
              <p>{area.focus}</p>
              <span className="sa-card-link">
                Sprinkler repair in {area.city} <ArrowUpRight strokeWidth={2.2} aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="sa-cta">
        <h2>Not on the list?</h2>
        <p>
          The route covers roughly 15 miles around North Oakland County. If the property is nearby, call with the address
          and we will tell you straight away whether it fits.
        </p>
        <CallButton source="area_hub_cta" sub="Confirm your address" />
      </section>
    </Shell>
  );
}

export function ServiceAreaCity({ area }) {
  const neighbours = serviceAreas.filter((other) => other.slug !== area.slug).slice(0, 4);
  const url = `${siteUrl}/service-area/${area.slug}`;

  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Service area", item: `${siteUrl}/service-area` },
          { "@type": "ListItem", position: 3, name: `${area.city}, MI`, item: url },
        ],
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `Sprinkler System Repair in ${area.city}, Michigan`,
        serviceType: "Sprinkler system repair and maintenance",
        description: `Diagnosis and repair for existing sprinkler systems in ${area.city}, Michigan, including heads, leaks, valves, controllers, pressure, spring startup, and fall winterization.`,
        provider: { "@id": `${siteUrl}/#business` },
        areaServed: { "@type": "City", name: `${area.city}, Michigan` },
        offers: {
          "@type": "Offer",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "USD",
            description: "Pricing is quoted by phone based on the actual system and job scope.",
          },
        },
      },
    ],
  };

  return (
    <Shell
      breadcrumb={[{ name: "Home", href: "/" }, { name: "Service area", href: "/service-area" }, { name: area.city }]}
    >
      <StructuredData json={json} />

      <section className="sa-hero">
        <p className="sa-eyebrow">
          <span /> {area.city}, Michigan
        </p>
        <h1>
          Sprinkler repair in
          <br />
          <em>{area.city}, MI</em>
        </h1>
        <p className="sa-lede">{area.lede}</p>
        <CallButton source={`area_${area.slug}_hero`} />
        <p className="sa-note">Existing systems only — Colburn Outdoor does not install new sprinkler systems.</p>
      </section>

      <section className="sa-body" aria-labelledby="conditions-title">
        <div>
          <h2 id="conditions-title">What matters on {area.city} properties</h2>
          <p>{area.conditions}</p>
          <p>
            {area.city} sits {area.position} the North Oakland service route, so scheduling is straightforward and
            seasonal visits can be grouped with nearby work.
          </p>
        </div>
        <aside className="sa-focus">
          <h3>Most common work here</h3>
          <p>{area.focus}</p>
          <CallButton source={`area_${area.slug}_focus`} sub="Describe the problem" />
        </aside>
      </section>

      <section className="sa-services" aria-labelledby="services-title">
        <h2 id="services-title">What we handle in {area.city}</h2>
        <div className="sa-services-grid">
          <article>
            <span aria-hidden="true">
              <Wrench strokeWidth={1.8} />
            </span>
            <h3>Repair and diagnosis</h3>
            <p>
              Broken and misaligned heads, leaks, valves that will not shut off, zones that will not run, weak pressure,
              and controllers that have lost their schedule.
            </p>
          </article>
          <article>
            <span aria-hidden="true">
              <Sprout strokeWidth={1.8} />
            </span>
            <h3>Spring startup</h3>
            <p>
              Every zone activated and checked, winter damage found, spray patterns corrected, and the controller set for
              the season ahead.
            </p>
          </article>
          <article>
            <span aria-hidden="true">
              <Snowflake strokeWidth={1.8} />
            </span>
            <h3>Fall winterization</h3>
            <p>
              The system shut down properly before a Michigan freeze, scheduled around a practical {area.city} service
              route.
            </p>
          </article>
        </div>
      </section>

      <section className="sa-neighbours" aria-labelledby="nearby-title">
        <h2 id="nearby-title">Nearby areas we cover</h2>
        <ul>
          {neighbours.map((other) => (
            <li key={other.slug}>
              <a href={`/service-area/${other.slug}`}>Sprinkler repair in {other.city}, MI</a>
            </li>
          ))}
          <li>
            <a href="/service-area">All service areas</a>
          </li>
        </ul>
      </section>

      <section className="sa-cta">
        <h2>Call about your {area.city} system</h2>
        <p>Tell us the property address and what the system is doing. Pricing is based on the actual job, not a guess.</p>
        <CallButton source={`area_${area.slug}_cta`} />
      </section>
    </Shell>
  );
}
