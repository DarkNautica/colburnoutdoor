const phoneDisplay = "(704) 430-5221";
const phoneHref = "tel:+17044305221";

const sprinklerServices = [
  {
    number: "01",
    title: "System diagnosis & repair",
    text: "We trace the problem, explain what failed, and repair the existing system without turning a service call into a sales pitch.",
    tags: ["Broken heads", "Leaks", "Valves", "Controllers"],
  },
  {
    number: "02",
    title: "Coverage & performance",
    text: "Dry spots, overspray, weak zones, and bad timing get corrected so your system waters the property—not the sidewalk.",
    tags: ["Low pressure", "Zone issues", "Adjustments", "Efficiency"],
  },
  {
    number: "03",
    title: "Seasonal system upkeep",
    text: "Michigan seasons are not gentle. We help existing systems start clean, run reliably, and prepare for freezing weather.",
    tags: ["Startups", "Inspections", "Tune-ups", "Winter prep"],
  },
];

const propertyServices = [
  {
    title: "Routine lawn maintenance",
    text: "Scheduled mowing, clean edging, and practical trimming that keeps the property presentable and under control.",
  },
  {
    title: "Overgrowth restoration",
    text: "A focused reset for lawns and exterior areas that have fallen behind, grown out, or need to become manageable again.",
  },
  {
    title: "Seasonal cleanup",
    text: "Leaves, branches, debris, and weather-worn areas cleared so the property can move cleanly into the next season.",
  },
  {
    title: "Exterior property upkeep",
    text: "Straightforward recurring attention for the visible outdoor details that protect curb appeal and reduce bigger cleanup later.",
  },
];

const customerTypes = [
  {
    number: "01",
    label: "Homes",
    title: "Your property, working the way it should.",
    text: "Troubleshooting and maintenance for the sprinkler system you rely on, with practical lawn upkeep when you need it.",
  },
  {
    number: "02",
    label: "Rentals",
    title: "Less chasing. Fewer surprises.",
    text: "Responsive service for landlords and property managers who need existing systems fixed and grounds kept presentable.",
  },
  {
    number: "03",
    label: "Businesses",
    title: "Keep the outside customer-ready.",
    text: "Sprinkler maintenance and dependable property upkeep for small commercial sites and customer-facing grounds.",
  },
];

const faqs = [
  {
    question: "Do you install new sprinkler systems?",
    answer: "No. Colburn Outdoor focuses on diagnosing, repairing, adjusting, maintaining, and restoring existing sprinkler systems.",
  },
  {
    question: "What sprinkler problems can I call about?",
    answer: "Broken or misaligned heads, leaks, zones that will not run or shut off, weak pressure, dry spots, overspray, controller trouble, and systems that need a seasonal check or restart are all good reasons to call.",
  },
  {
    question: "What lawn work do you provide?",
    answer: "We provide physical lawn maintenance, property upkeep, cleanup, and restoration. We are not positioning ourselves as a treatment-program or lawn-installation company.",
  },
  {
    question: "Can you maintain rental and business properties?",
    answer: "Yes. We work with homeowners, rental properties, landlords, property managers, and businesses throughout our North Oakland service area.",
  },
  {
    question: "What areas do you serve?",
    answer: "North Oakland County is the primary focus. We also target Troy, Rochester Hills, Rochester, and properties within roughly 15 miles of those areas. If you are nearby but just outside that range, call anyway—route availability matters more than a rigid line.",
  },
  {
    question: "How do I get a price?",
    answer: `Call ${phoneDisplay}. Pricing depends on the property, the condition of the existing system, and the work required, so we are keeping it direct and accurate by phone for now.`,
  },
];

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.3 3.7 10 7.6 7.8 9.8c1.3 2.5 3.9 5.1 6.4 6.4l2.2-2.2 3.9 1.7c.5.2.8.8.7 1.3l-.5 3c-.1.6-.6 1-1.2 1C10.3 21 3 13.7 3 4.7c0-.6.4-1.1 1-1.2l3-.5c.5-.1 1.1.2 1.3.7Z" />
    </svg>
  );
}

function CallButton({ className = "", label = `Call ${phoneDisplay}` }) {
  return (
    <a className={`call-button ${className}`} href={phoneHref} aria-label={`Call Colburn Outdoor at ${phoneDisplay}`}>
      <span className="call-icon"><PhoneIcon /></span>
      <span>{label}</span>
      <span className="button-arrow" aria-hidden="true">↗</span>
    </a>
  );
}

export default function App() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Colburn Outdoor home">
          <img src="/images/colburn-outdoor-logo-light.png" alt="Colburn Outdoor Maintenance" />
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#sprinklers">Sprinklers</a>
          <a href="#property">Property maintenance</a>
          <a href="#who-we-serve">Who we serve</a>
          <a href="#service-area">Service area</a>
        </nav>
        <a className="header-call" href={phoneHref}>
          <PhoneIcon />
          <span>Call for pricing</span>
        </a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> North Oakland County, Michigan</p>
          <h1 id="hero-title">Sprinklers fixed.<br /><em>Property restored.</em></h1>
          <p className="hero-lede">
            Repair, maintenance, and seasonal service for the sprinkler system you already own—plus practical property upkeep when the lawn needs to be brought back under control.
          </p>
          <div className="hero-actions">
            <CallButton label="Call for pricing" />
            <a className="text-link" href="#sprinklers">See what we service <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-proof" aria-label="Key service details">
            <div><strong>Existing systems</strong><span>Repair & upkeep only</span></div>
            <div><strong>Homes to businesses</strong><span>One reliable call</span></div>
            <div><strong>North Oakland first</strong><span>Smart local routing</span></div>
          </div>
        </div>

        <div className="hero-media" aria-hidden="true">
          <img src="/images/hero-yard.png" alt="" />
          <div className="hero-media-shade" />
          <div className="service-stamp">
            <span className="stamp-ring">Service<br />&amp; repair</span>
            <span className="stamp-line" />
            <span className="stamp-small">No installs</span>
          </div>
          <div className="hero-caption">
            <span>01</span>
            <p><strong>Sprinkler systems come first.</strong><br />Diagnosis, repairs, adjustments, and seasonal maintenance.</p>
          </div>
        </div>
      </section>

      <section className="priority-strip" aria-label="Service priorities">
        <p>Sprinkler repair</p><span>◆</span>
        <p>System maintenance</p><span>◆</span>
        <p>Seasonal service</p><span>◆</span>
        <p>Property restoration</p><span>◆</span>
        <p>Routine upkeep</p>
      </section>

      <section className="sprinkler-section" id="sprinklers" aria-labelledby="sprinklers-title">
        <div className="section-intro">
          <div>
            <p className="eyebrow dark"><span /> Service priority no. 1</p>
            <h2 id="sprinklers-title">Keep the system.<br /><em>Fix the problem.</em></h2>
          </div>
          <div className="intro-copy">
            <p>We work on existing sprinkler systems. No installation packages. No unnecessary rebuild pitch. Just focused troubleshooting, repair, adjustment, and maintenance.</p>
            <CallButton className="call-button-dark" label="Talk through the issue" />
          </div>
        </div>

        <div className="service-grid">
          {sprinklerServices.map((service) => (
            <article className="service-card" key={service.number}>
              <div className="service-number">{service.number}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <ul aria-label={`${service.title} examples`}>
                {service.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="property-section" id="property" aria-labelledby="property-title">
        <div className="property-visual">
          <img src="/images/hero-yard.png" alt="A neat, maintained lawn and home exterior" />
          <div className="property-visual-shade" />
          <div className="image-label"><span>02</span> Property maintenance</div>
          <div className="image-statement">Upkeep that keeps small problems from becoming full-property problems.</div>
        </div>
        <div className="property-copy">
          <p className="eyebrow"><span /> Secondary service</p>
          <h2 id="property-title">Maintain it.<br /><em>Bring it back.</em></h2>
          <p className="property-lede">This is not a vague “we do everything” pitch. It is physical lawn maintenance, exterior upkeep, and restoration work for properties that need consistent attention or a serious reset.</p>
          <div className="property-list">
            {propertyServices.map((service, index) => (
              <article key={service.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{service.title}</h3><p>{service.text}</p></div>
              </article>
            ))}
          </div>
          <p className="scope-note"><strong>Scope note:</strong> Maintenance, cleanup, and restoration only. No lawn or landscape installations.</p>
        </div>
      </section>

      <section className="audience-section" id="who-we-serve" aria-labelledby="audience-title">
        <div className="audience-heading">
          <p className="eyebrow dark"><span /> Built around the property</p>
          <h2 id="audience-title">One standard.<br /><em>Three kinds of client.</em></h2>
        </div>
        <div className="audience-grid">
          {customerTypes.map((customer) => (
            <article key={customer.label}>
              <div className="audience-top"><span>{customer.number}</span><strong>{customer.label}</strong></div>
              <h3>{customer.title}</h3>
              <p>{customer.text}</p>
              <a href={phoneHref}>Call about your property <span aria-hidden="true">↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="process-section" aria-labelledby="process-title">
        <div className="process-copy">
          <p className="eyebrow"><span /> A direct service process</p>
          <h2 id="process-title">Call. Diagnose.<br /><em>Get it handled.</em></h2>
          <p>No calculator pretending every property is identical. Tell us what is happening, and we will determine the right next step.</p>
          <CallButton label="Call Colburn Outdoor" />
        </div>
        <ol className="process-list">
          <li><span>01</span><div><strong>Tell us what you are seeing</strong><p>Share the property type, location, and symptoms. Photos can help once we connect.</p></div></li>
          <li><span>02</span><div><strong>We inspect the actual issue</strong><p>For sprinkler work, that means following the system—not guessing from one wet spot.</p></div></li>
          <li><span>03</span><div><strong>You get a clear path forward</strong><p>Repair, adjustment, seasonal service, restoration, or recurring upkeep based on the real scope.</p></div></li>
          <li><span>04</span><div><strong>We verify the result</strong><p>The system is checked, the work area is left tidy, and you know what was handled.</p></div></li>
        </ol>
      </section>

      <section className="service-area-section" id="service-area" aria-labelledby="service-area-title">
        <div className="map-graphic" aria-hidden="true">
          <span className="map-ring ring-one" />
          <span className="map-ring ring-two" />
          <span className="map-ring ring-three" />
          <span className="map-pin"><i /> North Oakland</span>
          <span className="map-road road-one" />
          <span className="map-road road-two" />
          <span className="map-road road-three" />
        </div>
        <div className="service-area-copy">
          <p className="eyebrow"><span /> Michigan service area</p>
          <h2 id="service-area-title">North Oakland<br /><em>comes first.</em></h2>
          <p>Our main territory is North Oakland County, with targeted service in Troy, Rochester Hills, Rochester, and roughly 15 miles around those areas. Just outside the radius? Call anyway. Route availability matters more than a rigid border, and nearby work may still fit the schedule efficiently.</p>
          <div className="area-facts">
            <div><span>Primary focus</span><strong>North Oakland County</strong></div>
            <div><span>Core cities</span><strong>Troy · Rochester Hills · Rochester</strong></div>
            <div><span>Typical reach</span><strong>About 15 miles around the core</strong></div>
            <div><span>Property types</span><strong>Home · Rental · Business</strong></div>
            <div><span>Pricing</span><strong>By phone</strong></div>
          </div>
          <CallButton label="Confirm your service area" />
        </div>
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <div className="faq-heading">
          <p className="eyebrow dark"><span /> Straight answers</p>
          <h2 id="faq-title">Before<br /><em>you call.</em></h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{faq.question}</strong><i aria-hidden="true">+</i></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta" id="contact" aria-labelledby="contact-title">
        <div className="final-cta-mark"><img src="/images/colburn-outdoor-mark.png" alt="" /></div>
        <p className="eyebrow"><span /> Call for pricing</p>
        <h2 id="contact-title">Your system will not<br /><em>repair itself.</em></h2>
        <p>Call Colburn Outdoor to talk through sprinkler repair, system maintenance, lawn upkeep, or property restoration in North Oakland County and nearby communities.</p>
        <a className="final-phone" href={phoneHref}><span>{phoneDisplay}</span><i aria-hidden="true">↗</i></a>
      </section>

      <footer className="site-footer">
        <div className="footer-brand"><img src="/images/colburn-outdoor-logo-light.png" alt="Colburn Outdoor Maintenance" /></div>
        <div><span>Primary service</span><strong>Sprinkler repair & maintenance</strong></div>
        <div><span>Service area</span><strong>North Oakland County + nearby</strong></div>
        <div><span>Phone</span><a href={phoneHref}>{phoneDisplay}</a></div>
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
