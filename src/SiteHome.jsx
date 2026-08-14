import { MotionSystem } from "./motion.jsx";
import "./site-home.css";

const phoneDisplay = "(704) 430-5221";
const phoneHref = "tel:+17044305221";

const services = [
  {
    number: "01",
    eyebrow: "Repair",
    title: "Find the fault. Fix the system.",
    text: "Focused diagnosis and repair for the sprinkler system you already own—from broken heads and leaks to valves and controllers.",
    tags: ["Heads", "Leaks", "Valves", "Controllers"],
  },
  {
    number: "02",
    eyebrow: "Performance",
    title: "Water the lawn, not the sidewalk.",
    text: "We correct weak zones, dry spots, overspray, pressure issues, and poor timing so every zone does its job.",
    tags: ["Coverage", "Pressure", "Zones", "Timing"],
  },
  {
    number: "03",
    eyebrow: "Seasonal",
    title: "Ready for every Michigan season.",
    text: "Spring startup, in-season tuning, and fall winterization keep existing systems reliable through the full year.",
    tags: ["Startups", "Tune-ups", "Winterization"],
  },
  {
    number: "04",
    eyebrow: "Property care",
    title: "Bring the rest of the property back.",
    text: "Practical lawn maintenance, cleanup, and overgrowth restoration when the outdoor work extends beyond the sprinkler system.",
    tags: ["Mowing", "Cleanup", "Restoration"],
  },
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
    title: "Start it clean",
    text: "Activate every zone, catch winter damage, correct spray patterns, and set the controller.",
  },
  {
    number: "02",
    season: "Summer",
    title: "Keep it efficient",
    text: "Resolve leaks, weak zones, dry spots, and timing issues before they waste water.",
  },
  {
    number: "03",
    season: "Fall",
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

const faqs = [
  {
    question: "Do you install new sprinkler systems?",
    answer: "No. Colburn Outdoor focuses on diagnosing, repairing, adjusting, maintaining, and winterizing existing sprinkler systems.",
  },
  {
    question: "What sprinkler problems can I call about?",
    answer: "Broken or misaligned heads, leaks, zones that will not run or shut off, weak pressure, dry spots, overspray, controller trouble, and seasonal startup or winterization.",
  },
  {
    question: "What other property work do you handle?",
    answer: "We provide physical lawn maintenance, exterior cleanup, seasonal upkeep, and overgrowth restoration for homes, rentals, and small business properties.",
  },
  {
    question: "Where do you work and how do I get a price?",
    answer: `North Oakland County is the priority, including Troy, Rochester Hills, Rochester, and roughly 15 miles around the core route. Call ${phoneDisplay} with the address and the issue for pricing.`,
  },
];

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.3 3.7 10 7.6 7.8 9.8c1.3 2.5 3.9 5.1 6.4 6.4l2.2-2.2 3.9 1.7c.5.2.8.8.7 1.3l-.5 3c-.1.6-.6 1-1.2 1C10.3 21 3 13.7 3 4.7c0-.6.4-1.1 1-1.2l3-.5c.5-.1 1.1.2 1.3.7Z" />
    </svg>
  );
}

function CallButton({ className = "", label = "Call for pricing" }) {
  return (
    <a
      className={`call-button js-magnetic ${className}`}
      href={phoneHref}
      aria-label={`Call Colburn Outdoor at ${phoneDisplay}`}
    >
      <span className="call-icon"><PhoneIcon /></span>
      <span>{label}</span>
      <span className="button-arrow" aria-hidden="true">↗</span>
    </a>
  );
}

function BrandLockup({ footer = false }) {
  return (
    <span className={`brand-lockup${footer ? " brand-lockup-footer" : ""}`}>
      <span className="brand-mark"><img src="/images/colburn-outdoor-mark-white.png" alt="" /></span>
      <span className="brand-words">
        <span><strong>Colburn</strong> Outdoor</span>
        <small>Sprinkler + property service</small>
      </span>
    </span>
  );
}

export default function SiteHome() {
  return (
    <main id="site-root">
      <MotionSystem />

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
        </nav>
        <a className="header-call js-magnetic" href={phoneHref}>
          <PhoneIcon />
          <span>Call for pricing</span>
        </a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow hero-kicker"><span /> North Oakland County, Michigan</p>
          <h1 id="hero-title">
            <span className="hero-line-wrap"><span className="hero-line">Sprinklers fixed.</span></span>
            <span className="hero-line-wrap"><span className="hero-line accent">Property restored.</span></span>
          </h1>
          <p className="hero-lede">
            Repair, seasonal service, and practical property care—without the installation pitch or the runaround.
          </p>
          <div className="hero-actions">
            <CallButton />
            <a className="text-link" href="#services">Explore services <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-proof" aria-label="Key service details">
            <div><strong>Existing systems</strong><span>Repair & maintenance</span></div>
            <div><strong>Local route</strong><span>North Oakland first</span></div>
            <div><strong>Clear scope</strong><span>No installs</span></div>
          </div>
        </div>

        <div className="hero-media" aria-hidden="true">
          <img src="/images/sprinkler-hero.png" alt="" />
          <div className="hero-media-shade" />
          <div className="service-stamp">
            <span>Service<br />&amp; repair</span>
            <i />
            <small>No installs</small>
          </div>
          <div className="hero-caption">
            <span>01</span>
            <p><strong>Sprinkler systems come first.</strong> Diagnosis, repair, adjustment, and seasonal maintenance.</p>
          </div>
        </div>
      </section>

      <section className="services-section" id="services" aria-labelledby="services-title" data-motion-group>
        <div className="section-heading">
          <div data-reveal>
            <p className="eyebrow dark"><span /> One clear service lineup</p>
            <h2 id="services-title" data-motion-title>Fix what failed.<br /><em>Maintain what matters.</em></h2>
          </div>
          <p className="section-lede" data-reveal data-motion-copy>
            One local call covers the existing sprinkler system first, then the practical outdoor work that keeps the property in shape.
          </p>
        </div>

        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.number} data-reveal data-motion-card>
              <div className="service-card-top">
                <span>{service.number}</span>
                <strong>{service.eyebrow}</strong>
              </div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <ul aria-label={`${service.eyebrow} examples`}>
                {service.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </article>
          ))}
        </div>

        <div className="symptom-row" data-reveal>
          <div>
            <span>Not sure what failed?</span>
            <strong>These are all good reasons to call.</strong>
          </div>
          <ul>
            {symptoms.map((symptom) => <li key={symptom}>{symptom}</li>)}
          </ul>
        </div>
      </section>

      <section className="seasonal-section" id="seasonal" aria-labelledby="seasonal-title" data-motion-group>
        <div className="seasonal-heading">
          <div data-reveal>
            <p className="eyebrow"><span /> Built for Michigan weather</p>
            <h2 id="seasonal-title" data-motion-title>Three visits.<br /><em>One reliable season.</em></h2>
          </div>
          <p data-reveal data-motion-copy>Group spring, in-season, and fall service on one local route so small issues do not become expensive surprises.</p>
        </div>
        <div className="seasonal-track" aria-hidden="true" />
        <div className="seasonal-grid">
          {seasonalSteps.map((step) => (
            <article key={step.season} data-reveal data-motion-card>
              <div><span>{step.number}</span><strong>{step.season}</strong></div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="property-section" id="property" aria-labelledby="property-title" data-motion-group>
        <div className="property-visual" data-reveal data-motion-visual>
          <img src="/images/hero-yard.png" alt="A neat, maintained lawn and home exterior" />
          <div className="property-visual-shade" />
          <div className="image-label"><span>02</span> Property care</div>
          <p>Homes · Rentals · Small businesses</p>
        </div>
        <div className="property-copy">
          <p className="eyebrow" data-reveal><span /> When the whole property needs attention</p>
          <h2 id="property-title" data-reveal data-motion-title>Maintain it.<br /><em>Bring it back.</em></h2>
          <p className="property-lede" data-reveal data-motion-copy>
            Straightforward maintenance, cleanup, and restoration—without turning the job into landscape construction.
          </p>
          <div className="property-list">
            {propertyServices.map((service, index) => (
              <article key={service.title} data-reveal data-motion-card>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{service.title}</h3><p>{service.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="details-section" id="service-area" aria-labelledby="details-title" data-motion-group>
        <div className="process-panel">
          <p className="eyebrow dark" data-reveal><span /> Simple from the first call</p>
          <h2 id="details-title" data-reveal data-motion-title>Call. Diagnose.<br /><em>Get it handled.</em></h2>
          <ol>
            {processSteps.map((step) => (
              <li key={step.number} data-reveal data-motion-card>
                <span>{step.number}</span>
                <div><strong>{step.title}</strong><p>{step.text}</p></div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="route-panel" aria-label="Service area" data-reveal data-motion-route>
          <div className="route-panel-top"><span>Route 01</span><strong>North Oakland first</strong></div>
          <p>Primary focus</p>
          <h3>North Oakland County</h3>
          <div className="route-cities">
            <span>Troy</span><span>Rochester Hills</span><span>Rochester</span>
          </div>
          <p className="route-copy">Roughly 15 miles around the core can fit. Call with the address and we will confirm the route.</p>
          <CallButton label="Confirm your address" />
        </aside>
      </section>

      <section className="faq-section" aria-labelledby="faq-title" data-motion-group>
        <div className="faq-heading" data-reveal>
          <p className="eyebrow dark"><span /> Straight answers</p>
          <h2 id="faq-title" data-motion-title>Before<br /><em>you call.</em></h2>
        </div>
        <div className="faq-list" data-reveal data-motion-copy>
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{faq.question}</strong><i aria-hidden="true">+</i></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta" id="contact" aria-labelledby="contact-title" data-motion-group>
        <div className="final-cta-mark" data-reveal><img src="/images/colburn-outdoor-mark-white.png" alt="" /></div>
        <p className="eyebrow" data-reveal><span /> Call for pricing</p>
        <div className="cta-orbits" aria-hidden="true"><i /><i /><i /></div>
        <h2 id="contact-title" data-reveal data-motion-title>Your system will not<br /><em>repair itself.</em></h2>
        <p data-reveal data-motion-copy>Tell us what is happening and where the property is. We will take it from there.</p>
        <a className="final-phone js-magnetic" href={phoneHref} data-reveal><span>{phoneDisplay}</span><i aria-hidden="true">↗</i></a>
      </section>

      <footer className="site-footer">
        <div className="footer-brand"><BrandLockup footer /></div>
        <div><span>Primary service</span><strong>Sprinkler repair & maintenance</strong></div>
        <div><span>Service area</span><strong>North Oakland County + nearby</strong></div>
        <div>
          <span>Phone</span>
          <a href={phoneHref}>{phoneDisplay}</a>
          <span className="footer-legal-links"><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></span>
        </div>
        <p>© {new Date().getFullYear()} Colburn Outdoor Maintenance. Existing sprinkler systems, property upkeep, and restoration.</p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HomeAndConstructionBusiness",
            name: "Colburn Outdoor Maintenance",
            url: "https://colburnoutdoor.com",
            telephone: "+1-704-430-5221",
            areaServed: [
              { "@type": "AdministrativeArea", name: "North Oakland County, Michigan" },
              { "@type": "City", name: "Troy, Michigan" },
              { "@type": "City", name: "Rochester Hills, Michigan" },
              { "@type": "City", name: "Rochester, Michigan" },
            ],
            description: "Sprinkler system repair and maintenance, lawn maintenance, property upkeep, and restoration for homes, rentals, and businesses in North Oakland County and nearby Michigan communities.",
          }),
        }}
      />

      <div className="mobile-call-bar">
        <a href={phoneHref}><PhoneIcon /><span>Call for pricing</span><strong>{phoneDisplay}</strong></a>
      </div>
    </main>
  );
}
