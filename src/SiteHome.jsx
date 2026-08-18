import { useRef } from "react";
import {
  ArrowUpRight,
  Camera,
  CalendarDays,
  Droplets,
  Gauge,
  Leaf,
  MapPin,
  MessageSquare,
  Phone,
  Settings2,
  Snowflake,
  Sprout,
  Sun,
  Wrench,
} from "lucide-react";
import { phoneDisplay, phoneE164, serviceAreas } from "./data/service-areas.js";
import { useSiteMotion, useSmoothScroll } from "./motion.jsx";
import { SprinklerSpray } from "./SprinklerSpray.jsx";
import "./site-home.css";

const phoneHref = `tel:${phoneE164}`;

/*
 * Call-first site: every phone link reports to /api/track so the owner dashboard
 * can attribute calls to the place on the page that produced them.
 */
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
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking must never block the call */
  }
}

const featured = {
  number: "01",
  eyebrow: "Sprinkler repair",
  icon: Wrench,
  title: "Find the fault. Fix the system.",
  text: "Focused diagnosis and repair for the sprinkler system you already own — broken heads, leaks, valves, controllers, and zones that will not run.",
  tags: ["Heads", "Leaks", "Valves", "Controllers", "Zones"],
};

const services = [
  {
    number: "02",
    eyebrow: "Performance",
    icon: Gauge,
    title: "Water the lawn, not the sidewalk.",
    text: "Weak zones, dry spots, overspray, pressure, and timing corrected so every zone does its job.",
    tags: ["Coverage", "Pressure", "Timing"],
  },
  {
    number: "03",
    eyebrow: "Seasonal",
    icon: CalendarDays,
    title: "Ready for every Michigan season.",
    text: "Spring startup, in-season tuning, and fall winterization keep an existing system reliable all year.",
    tags: ["Startups", "Tune-ups", "Winterization"],
  },
  {
    number: "04",
    eyebrow: "Property care",
    icon: Leaf,
    title: "Bring the rest of the property back.",
    text: "Practical lawn maintenance, cleanup, and overgrowth restoration beyond the sprinkler system.",
    tags: ["Mowing", "Cleanup", "Restoration"],
  },
];

const marqueeItems = [
  "Sprinkler repair",
  "Leak & valve work",
  "Head replacement",
  "Zone diagnostics",
  "Controller setup",
  "Spring startup",
  "Winterization",
  "Lawn maintenance",
  "Seasonal cleanup",
  "Overgrowth restoration",
];

const symptoms = [
  "A zone will not run",
  "Heads spray the driveway",
  "Pressure suddenly dropped",
  "A valve will not shut off",
  "The controller lost its schedule",
  "Dry spots keep spreading",
];

const seasonalSteps = [
  {
    number: "01",
    season: "Spring",
    icon: Sprout,
    title: "Start it clean",
    text: "Activate every zone, catch winter damage, correct spray patterns, and set the controller.",
  },
  {
    number: "02",
    season: "Summer",
    icon: Sun,
    title: "Keep it efficient",
    text: "Resolve leaks, weak zones, dry spots, and timing issues before they waste water.",
  },
  {
    number: "03",
    season: "Fall",
    icon: Snowflake,
    title: "Shut it down right",
    text: "Winterize the system around a practical North Oakland service route.",
  },
];

const propertyServices = [
  {
    title: "Routine lawn maintenance",
    text: "Mowing, clean edging, and practical trimming that keeps the property under control.",
  },
  {
    title: "Overgrowth restoration",
    text: "A focused reset for lawns and exterior areas that have fallen behind.",
  },
  {
    title: "Seasonal cleanup",
    text: "Leaves, branches, debris, and weather-worn areas cleared for the next season.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Tell us what you see",
    text: "Share the property, location, and symptoms. Photos help once we connect.",
  },
  {
    number: "02",
    title: "We trace the real issue",
    text: "The system gets inspected instead of priced from a guess or a single wet spot.",
  },
  {
    number: "03",
    title: "Get a clear fix",
    text: "You know what failed, what the repair involves, and what happens next.",
  },
];

const prepItems = [
  { icon: MapPin, title: "The property address", text: "It confirms the route and how soon the work fits." },
  { icon: Droplets, title: "What you are seeing", text: "A dry patch, a puddle, a dead zone, a head that will not drop." },
  { icon: Settings2, title: "Where the controller is", text: "Garage, basement, or outside wall — and whether it still powers on." },
  { icon: Camera, title: "Photos, if you have them", text: "Send them once we connect. They speed the diagnosis up." },
];

/* These six match the FAQPage structured data in index.html exactly. */
const faqs = [
  {
    question: "What sprinkler problems can I call about?",
    answer:
      "Call about broken or misaligned heads, leaks, zones that will not run or shut off, weak pressure, dry spots, overspray, controller trouble, startup, and winterization.",
  },
  {
    question: "What other property work do you handle?",
    answer:
      "Colburn Outdoor provides physical lawn maintenance, exterior cleanup, seasonal upkeep, and overgrowth restoration.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "Service is focused on North Oakland County, including Troy, Rochester Hills, Rochester, and roughly 15 miles around the core route.",
  },
  {
    question: "Do you work with rentals and small business properties?",
    answer: "Yes. Property care is available for homes, rentals, and small business properties.",
  },
  {
    question: "How do I get a price?",
    answer:
      "Call with the property address and the issue. Photos can help once connected, and pricing is based on the actual system or job scope.",
  },
  {
    question: "Do you install new sprinkler systems?",
    answer:
      "No. Colburn Outdoor focuses on diagnosing, repairing, adjusting, maintaining, and winterizing existing sprinkler systems.",
  },
];

/*
 * Responsive image. AVIF first, WebP second, and a raster fallback that only a
 * browser supporting neither will ever request. Sources are generated by
 * scripts/optimize-images.mjs — the original PNGs were 2.7–3 MB each.
 */
function Picture({ name, widths, sizes, alt, width, height, fallback = "jpg", priority = false }) {
  const srcSet = (ext) => widths.map((w) => `/images/opt/${name}-${w}.${ext} ${w}w`).join(", ");
  const largest = widths[widths.length - 1];

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={`/images/opt/${name}-${largest}.${fallback}`}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}

function BrandMark() {
  return (
    <Picture
      name="colburn-outdoor-mark-white"
      widths={[64, 128, 192]}
      sizes="64px"
      width={192}
      height={144}
      fallback="png"
      alt=""
      priority
    />
  );
}

function CallButton({ className = "", sub = "Call for pricing", source, tone = "lime" }) {
  return (
    <a
      className={`call-button call-button-${tone} js-magnetic ${className}`}
      href={phoneHref}
      onClick={() => trackCall(source)}
      aria-label={`Call Colburn Outdoor at ${phoneDisplay}`}
    >
      <span className="call-icon" aria-hidden="true">
        <Phone strokeWidth={2.2} />
      </span>
      <span className="call-button-text">
        <small>{sub}</small>
        <strong>{phoneDisplay}</strong>
      </span>
      <span className="button-arrow" aria-hidden="true">
        <ArrowUpRight strokeWidth={2.4} />
      </span>
    </a>
  );
}

function BrandLockup({ footer = false }) {
  return (
    <span className={`brand-lockup${footer ? " brand-lockup-footer" : ""}`}>
      <span className="brand-mark">
        <BrandMark />
      </span>
      <span className="brand-words">
        <span>
          <strong>Colburn</strong> Outdoor
        </span>
        <small>Sprinkler + property service</small>
      </span>
    </span>
  );
}

export default function SiteHome() {
  const root = useRef(null);
  useSmoothScroll();
  useSiteMotion(root);

  const FeaturedIcon = featured.icon;

  return (
    <main id="site-root" ref={root}>
      <a className="skip-link" href="#services">
        Skip to services
      </a>

      <header className="site-header">
        <span className="site-progress" aria-hidden="true" />
        <a className="brand" href="#top" aria-label="Colburn Outdoor home">
          <BrandLockup />
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#services">Services</a>
          <a href="#seasonal">Seasonal</a>
          <a href="#property">Property care</a>
          <a href="#service-area">Service area</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a
          className="header-call js-magnetic"
          href={phoneHref}
          onClick={() => trackCall("header")}
          aria-label={`Call Colburn Outdoor at ${phoneDisplay}`}
        >
          <Phone strokeWidth={2.2} aria-hidden="true" />
          <span>{phoneDisplay}</span>
        </a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <SprinklerSpray />
          <p className="eyebrow hero-kicker">
            <span /> North Oakland County, Michigan
          </p>
          <h1 id="hero-title">
            <span className="hero-line">Sprinklers fixed.</span>
            <span className="hero-line accent">Property restored.</span>
          </h1>
          <p className="hero-lede">
            Repair, seasonal service, and practical property care — without the installation pitch or the runaround.
          </p>
          <div className="hero-actions">
            <CallButton source="hero" />
            <a className="text-link" href="#services">
              Explore services <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-proof" aria-label="Key service details">
            <div>
              <strong>Existing systems</strong>
              <span>Repair &amp; maintenance</span>
            </div>
            <div>
              <strong>Local route</strong>
              <span>North Oakland first</span>
            </div>
            <div>
              <strong>Clear scope</strong>
              <span>No installs</span>
            </div>
          </div>
        </div>

        <div className="hero-media" aria-hidden="true">
          <Picture
            name="sprinkler-hero"
            widths={[480, 768, 1024, 1440]}
            sizes="(max-width: 820px) 100vw, 46vw"
            width={1440}
            height={810}
            alt=""
            priority
          />
          <div className="hero-media-shade" />
          <div className="service-stamp">
            <span>
              Service
              <br />
              &amp; repair
            </span>
            <i />
            <small>No installs</small>
          </div>
          <div className="hero-caption">
            <span>01</span>
            <p>
              <strong>Sprinkler systems come first.</strong> Diagnosis, repair, adjustment, and seasonal maintenance.
            </p>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-set" key={copy}>
              {marqueeItems.map((item) => (
                <span key={`${copy}-${item}`}>
                  {item}
                  <i />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="services-section" id="services" aria-labelledby="services-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">
              <span /> What we do
            </p>
            <h2 id="services-title" data-split>
              Fix what failed.
              <br />
              <em>Maintain what matters.</em>
            </h2>
          </div>
          <p className="section-lede" data-reveal>
            One local call covers the existing sprinkler system first, then the practical outdoor work that keeps the
            property in shape.
          </p>
        </div>

        <article className="service-featured" data-reveal>
          <div className="service-featured-copy">
            <div className="card-label">
              <span className="card-icon" aria-hidden="true">
                <FeaturedIcon strokeWidth={1.8} />
              </span>
              <span className="card-num">{featured.number}</span>
              <strong>{featured.eyebrow}</strong>
              <em>Most called for</em>
            </div>
            <h3>{featured.title}</h3>
            <p>{featured.text}</p>
            <ul aria-label="Sprinkler repair examples">
              {featured.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <CallButton source="service_featured" sub="Describe the problem" />
          </div>
          <div className="service-featured-media">
            <Picture
              name="sprinkler-hero"
              widths={[480, 768, 1024, 1440]}
              sizes="(max-width: 1180px) 100vw, 45vw"
              width={1440}
              height={810}
              alt="A working sprinkler head watering a maintained lawn in North Oakland County"
            />
          </div>
        </article>

        <div className="service-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className="service-card" key={service.number} data-reveal>
                <div className="card-label">
                  <span className="card-icon" aria-hidden="true">
                    <Icon strokeWidth={1.8} />
                  </span>
                  <span className="card-num">{service.number}</span>
                  <strong>{service.eyebrow}</strong>
                </div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <ul aria-label={`${service.eyebrow} examples`}>
                  {service.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="symptom-row" data-reveal>
          <div className="symptom-copy">
            <span>Not sure what failed?</span>
            <strong>Any of these is a good reason to call.</strong>
            <ul>
              {symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </div>
          <div className="symptom-action">
            <CallButton source="symptoms" sub="Just describe it" />
          </div>
        </div>
      </section>

      <section className="seasonal-section" id="seasonal" aria-labelledby="seasonal-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span /> Built for Michigan weather
            </p>
            <h2 id="seasonal-title" data-split>
              Three visits.
              <br />
              <em>One reliable season.</em>
            </h2>
          </div>
          <p className="section-lede" data-reveal>
            Group spring, in-season, and fall service on one local route so small issues do not become expensive
            surprises.
          </p>
        </div>
        <div className="seasonal-track" aria-hidden="true" />
        <div className="seasonal-grid">
          {seasonalSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.season} data-reveal>
                <div className="card-label">
                  <span className="card-icon" aria-hidden="true">
                    <Icon strokeWidth={1.8} />
                  </span>
                  <span className="card-num">{step.number}</span>
                  <strong>{step.season}</strong>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="property-section" id="property" aria-labelledby="property-title">
        <div className="property-visual">
          <Picture
            name="hero-yard"
            widths={[480, 768, 1024, 1440]}
            sizes="(max-width: 820px) 100vw, 46vw"
            width={1440}
            height={768}
            alt="A neat, maintained lawn and home exterior after Colburn Outdoor property care"
          />
          <div className="property-visual-shade" />
          <div className="image-label">
            <span>02</span> Property care
          </div>
          <p>Homes · Rentals · Small businesses</p>
        </div>
        <div className="property-copy">
          <p className="eyebrow">
            <span /> Beyond the sprinkler system
          </p>
          <h2 id="property-title" data-split>
            Maintain it.
            <br />
            <em>Bring it back.</em>
          </h2>
          <p className="section-lede" data-reveal>
            Straightforward maintenance, cleanup, and restoration — without turning the job into landscape construction.
          </p>
          <div className="property-list">
            {propertyServices.map((service, index) => (
              <article key={service.title} data-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="property-cta" data-reveal>
            <CallButton source="property" sub="Ask about the whole property" />
          </div>
        </div>
      </section>

      <section className="details-section" id="service-area" aria-labelledby="details-title">
        <div className="process-panel">
          <p className="eyebrow dark">
            <span /> How it goes
          </p>
          <h2 id="details-title" data-split>
            Call. Diagnose.
            <br />
            <em>Get it handled.</em>
          </h2>
          <ol>
            {processSteps.map((step) => (
              <li key={step.number} data-reveal>
                <span>{step.number}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="route-panel" aria-label="Service area" data-reveal>
          <div className="route-panel-top">
            <span>Route 01</span>
            <strong>North Oakland first</strong>
          </div>
          <p className="route-kicker">Primary focus</p>
          <h3>North Oakland County</h3>
          <div className="route-cities">
            {serviceAreas.map((area) => (
              <a href={`/service-area/${area.slug}`} key={area.slug}>
                {area.city}
              </a>
            ))}
          </div>
          <p className="route-copy">
            Roughly 15 miles around the core can fit. Call with the address and we will confirm the route, or{" "}
            <a className="route-inline-link" href="/service-area">
              see every area we cover
            </a>
            .
          </p>
          <CallButton sub="Confirm your address" source="route" />
        </aside>
      </section>

      <section className="prep-section" aria-labelledby="prep-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span /> Make the call count
            </p>
            <h2 id="prep-title" data-split>
              Have this ready
              <br />
              <em>when you call.</em>
            </h2>
          </div>
          <p className="section-lede" data-reveal>
            None of it is required — it just gets you to a real answer faster.
          </p>
        </div>
        <div className="prep-grid">
          {prepItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} data-reveal>
                <span className="card-icon" aria-hidden="true">
                  <Icon strokeWidth={1.8} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
        <div className="prep-cta" data-reveal>
          <MessageSquare aria-hidden="true" strokeWidth={1.8} />
          <p>
            Not sure it is worth a call? It is. A two-minute conversation usually tells us whether it is a five-minute
            fix or a real repair.
          </p>
          <CallButton source="prep" />
        </div>
      </section>

      <section className="faq-section" id="faq" aria-labelledby="faq-title">
        <div className="faq-heading">
          <p className="eyebrow dark">
            <span /> Straight answers
          </p>
          <h2 id="faq-title" data-split>
            Before
            <br />
            <em>you call.</em>
          </h2>
          <p className="faq-heading-copy">Still unsure? The phone is faster than any form.</p>
          <CallButton className="faq-call" source="faq" />
        </div>
        <div className="faq-list" data-reveal>
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{faq.question}</strong>
                <i aria-hidden="true">+</i>
              </summary>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta" id="contact" aria-labelledby="contact-title">
        <div className="final-cta-inner">
          <div className="final-cta-mark" data-reveal>
            <BrandMark />
          </div>
          <p className="eyebrow">
            <span /> Call for pricing
          </p>
          <h2 id="contact-title" data-split>
            Your system will not
            <br />
            <em>repair itself.</em>
          </h2>
          <p className="final-cta-lede" data-reveal>
            Tell us what is happening and where the property is. We will take it from there.
          </p>
          <a
            className="final-phone js-magnetic"
            href={phoneHref}
            onClick={() => trackCall("final_cta")}
            data-reveal
            aria-label={`Call Colburn Outdoor at ${phoneDisplay}`}
          >
            <Phone strokeWidth={2.2} aria-hidden="true" />
            <span>{phoneDisplay}</span>
            <i aria-hidden="true">
              <ArrowUpRight strokeWidth={2.4} />
            </i>
          </a>
          <p className="final-cta-note" data-reveal>
            North Oakland County · Troy · Rochester Hills · Rochester
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <BrandLockup footer />
        </div>
        <div>
          <span>Primary service</span>
          <strong>Sprinkler repair &amp; maintenance</strong>
        </div>
        <div>
          <span>Service area</span>
          <strong>North Oakland County + nearby</strong>
          <span className="footer-area-links">
            {serviceAreas.slice(0, 4).map((area) => (
              <a href={`/service-area/${area.slug}`} key={area.slug}>
                {area.city}
              </a>
            ))}
            <a href="/service-area">All areas</a>
          </span>
        </div>
        <div>
          <span>Phone</span>
          <a href={phoneHref} onClick={() => trackCall("footer")}>
            {phoneDisplay}
          </a>
          <span className="footer-legal-links">
            <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
          </span>
        </div>
        <p>© {new Date().getFullYear()} Colburn Outdoor Maintenance. Existing sprinkler systems, property upkeep, and restoration.</p>
      </footer>

      <div className="mobile-call-bar">
        <a href={phoneHref} onClick={() => trackCall("mobile_bar")}>
          <Phone strokeWidth={2.3} aria-hidden="true" />
          <span>Call for pricing</span>
          <strong>{phoneDisplay}</strong>
        </a>
      </div>
    </main>
  );
}
