import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  CheckCircle2,
  ClipboardList,
  Copy,
  Lock,
  MessageSquare,
  Phone,
  Search,
  Send,
} from 'lucide-react';
import { pricingConfig } from './data/pricing.js';
import SiteHome from './SiteHome.jsx';

const phoneDisplay = '(704) 430-5221';
const phoneHref = 'tel:+17044305221';
const siteUrl = 'https://colburnoutdoor.com';
const googleProfileUrl = 'https://g.page/r/CVwXiW6gh7xaEAI';
const googleReviewUrl = `${googleProfileUrl}/review`;
const dashboardPasswordKey = 'colburn-dashboard-password';
const reviewMessage =
  `Thanks for choosing Colburn Outdoor Maintenance. If you were happy with the work, would you mind leaving us a quick Google review? ${googleReviewUrl}`;

const statusOptions = ['new', 'contacted', 'quoted', 'booked', 'completed', 'lost'];
const statusSelectOptions = statusOptions.map((option) => ({
  value: option,
  label: option.charAt(0).toUpperCase() + option.slice(1),
}));
const dashboardStatusSelectOptions = [{ value: 'all', label: 'All statuses' }, ...statusSelectOptions];

const seoPages = {
  home: {
    title: 'Sprinkler Repair in North Oakland County | Colburn Outdoor',
    description:
      'Sprinkler repair, seasonal system service, and practical property care for North Oakland County, Troy, Rochester Hills, Rochester, and nearby Michigan communities.',
    canonical: `${siteUrl}/`,
  },
  privacy: {
    title: 'Privacy Policy | Colburn Outdoor Maintenance',
    description:
      'Privacy Policy for Colburn Outdoor Maintenance, including what the call-first website records, how lead records are kept, and how owner notifications work.',
    canonical: `${siteUrl}/privacy`,
  },
  terms: {
    title: 'Terms of Use | Colburn Outdoor Maintenance',
    description:
      'Terms of Use for Colburn Outdoor Maintenance, including service information, pricing, scheduling, and website use.',
    canonical: `${siteUrl}/terms`,
  },
};

function smsHref(phone, body = '') {
  return `sms:${phone}${body ? `?&body=${encodeURIComponent(body)}` : ''}`;
}

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function labelFrom(group, value) {
  return pricingConfig[group]?.[value]?.label ?? value;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

function useNoIndex(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [enabled]);
}

function upsertMeta(selector, createAttrs, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(createAttrs).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function useDocumentMetadata(metadata, enabled = true) {
  useEffect(() => {
    if (!enabled || !metadata) return undefined;

    document.title = metadata.title;
    upsertMeta('meta[name="description"]', { name: 'description' }, metadata.description);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, metadata.title);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, metadata.description);
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, metadata.canonical);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, metadata.title);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, metadata.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', metadata.canonical);

    return undefined;
  }, [enabled, metadata]);
}

function StyledSelect({ id, label, name, value, options = [], onChange, className = '', compact = false }) {
  const fieldId = id || `select-${name}`;
  const listId = `${fieldId}-listbox`;
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selectedOption = options[selectedIndex] || options[0] || { label: 'Select an option', value: '' };
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef(null);
  const sizeClasses = compact
    ? 'min-h-11 px-3 py-2 pr-10 text-sm'
    : 'min-h-[54px] px-4 py-3 pr-12 text-base';
  const chevronClasses = compact ? 'h-7 w-7' : 'h-9 w-9';
  const listHeightClasses = compact ? 'max-h-52' : 'max-h-64';

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (isOpen) setActiveIndex(selectedIndex);
  }, [isOpen, selectedIndex]);

  function commit(index) {
    const option = options[index];
    if (!option) return;
    onChange?.({ target: { name, value: option.value } });
    setIsOpen(false);
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((current) => {
        const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
        return Math.min(options.length - 1, Math.max(0, next));
      });
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen) commit(activeIndex);
      else setIsOpen(true);
      return;
    }
    if (event.key === 'Escape') setIsOpen(false);
  }

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      {label && (
        <label className="mb-2 block text-sm font-bold text-[#0a2b21]" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <button
        className={`flex w-full items-center justify-between gap-3 rounded-md border border-[#ddd5c6] bg-white text-left font-medium text-[#0a2b21] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f3b2d] ${sizeClasses}`}
        id={fieldId}
        type="button"
        role="combobox"
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={onKeyDown}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`shrink-0 text-[#6b7770] transition ${chevronClasses} ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul
          className={`absolute z-30 mt-2 w-full overflow-auto rounded-md border border-[#ddd5c6] bg-white py-1 shadow-xl ${listHeightClasses}`}
          id={listId}
          role="listbox"
        >
          {options.map((option, index) => (
            <li key={option.value}>
              <button
                className={`w-full px-4 py-2 text-left text-sm transition ${
                  index === activeIndex ? 'bg-[#eaf2e4] text-[#0a2b21]' : 'text-[#465049] hover:bg-[#f4f0e7]'
                }`}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => commit(index)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LegalPage({ type }) {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Use';
  const updated = 'August 13, 2026';
  const sections = isPrivacy
    ? [
        {
          title: 'Information We Collect',
          body:
            'This website is call-first and does not ask you to submit a form. When you call, we keep the job details you share with us — name, phone number, property address, and what the system or property needs — so we can schedule and complete the work.',
        },
        {
          title: 'Website Activity',
          body:
            'The site records basic, non-identifying interaction events, such as which page or button led to a call. This is used to understand which parts of the site are useful. It is not tied to advertising profiles and is not sold.',
        },
        {
          title: 'How We Use Information',
          body:
            'Information is used to respond to service requests, schedule sprinkler and property work, maintain job records, and improve the business website. Owner dashboard access is password protected.',
        },
        {
          title: 'Email and SMS',
          body:
            'Owner notifications are sent by email. Any call or text to you is placed manually by Colburn Outdoor. Automated SMS is disabled and would only be enabled after the required carrier verification is complete.',
        },
        {
          title: 'Service Providers',
          body:
            'The site is hosted on Cloudflare Pages with Cloudflare D1 storage. Owner notification email may be sent through Resend or configured SMTP. We do not sell customer information.',
        },
        {
          title: 'Contact',
          body: `Questions about this policy can be handled by calling Colburn Outdoor Maintenance at ${phoneDisplay}.`,
        },
      ]
    : [
        {
          title: 'Website Use',
          body:
            'This website provides general service information and direct call links for Colburn Outdoor Maintenance. Use of the website or placing a call does not create a service agreement by itself.',
        },
        {
          title: 'Scope of Work',
          body:
            'Colburn Outdoor services existing sprinkler systems — diagnosis, repair, adjustment, seasonal startup, and winterization — along with lawn maintenance, cleanup, and overgrowth restoration. New sprinkler system installation is not offered.',
        },
        {
          title: 'Pricing',
          body:
            'Pricing is confirmed through direct communication and depends on the sprinkler issue or property-care scope, photos, property access, terrain, and current conditions. Nothing on this site is a quoted price.',
        },
        {
          title: 'Scheduling',
          body:
            'Work is scheduled by direct communication. The site does not provide automatic booking or guaranteed appointment times, and service area coverage is confirmed by phone.',
        },
        {
          title: 'Contact',
          body: `For questions about these terms, call Colburn Outdoor Maintenance at ${phoneDisplay}.`,
        },
      ];

  return (
    <main className="min-h-screen bg-[#f4f0e7] font-sans text-[#071612]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071612]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <a className="flex items-center gap-3" href="/" aria-label="Colburn Outdoor Maintenance home">
            <img className="h-11 w-11 object-contain" src="/images/colburn-outdoor-mark-white.png" alt="" />
            <span className="font-display text-lg font-extrabold uppercase leading-none tracking-tight text-white">
              <span className="text-[#b9ff4b]">Colburn</span> Outdoor
            </span>
          </a>
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#b9ff4b] px-5 font-display text-[15px] font-extrabold text-[#071612] transition hover:bg-white"
            href={phoneHref}
          >
            <Phone className="h-4 w-4" strokeWidth={2.3} />
            {phoneDisplay}
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-[#1d7a43]">
          Colburn Outdoor Maintenance
        </p>
        <h1 className="mt-4 font-display text-[clamp(42px,7vw,76px)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#071612]">
          {title}
        </h1>
        <p className="mt-4 text-sm font-semibold text-[#6b7770]">Last updated: {updated}</p>

        <div className="mt-12 border-t border-[#ddd5c6]">
          {sections.map((section, index) => (
            <section className="grid gap-3 border-b border-[#ddd5c6] py-8 sm:grid-cols-[64px_1fr] sm:gap-8" key={section.title}>
              <span className="font-mono text-xs text-[#6b7770]">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-[-0.03em] text-[#0a2b21]">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#465049]">{section.body}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            className="inline-flex items-center gap-2 rounded-full border border-[#ddd5c6] bg-white px-5 py-3 text-sm font-bold text-[#0a2b21] transition hover:border-[#0f3b2d]"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-full bg-[#0a2b21] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f3b2d]"
            href={phoneHref}
          >
            <Phone className="h-4 w-4" strokeWidth={2.3} /> Call {phoneDisplay}
          </a>
        </div>
      </section>
    </main>
  );
}

function DashboardLogin({ onLogin }) {
  const [password, setPassword] = useState(sessionStorage.getItem(dashboardPasswordKey) || '');
  const [error, setError] = useState('');

  async function login(event) {
    event.preventDefault();
    setError('');
    try {
      await apiRequest('/api/dashboard/summary', { headers: { 'x-dashboard-password': password } });
      sessionStorage.setItem(dashboardPasswordKey, password);
      onLogin(password);
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0a2b21] px-4 py-16 font-sans">
      <form className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f3b2d] p-8 shadow-2xl" onSubmit={login}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#b9ff4b] text-[#071612]">
          <Lock className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <h1 className="mt-6 font-display text-[34px] font-black uppercase leading-none tracking-[-0.04em] text-white">
          Owner dashboard
        </h1>
        <p className="mt-3 text-sm text-white/65">Enter the dashboard password to view leads and call activity.</p>
        <input
          className="mt-6 h-12 w-full rounded-md border border-white/15 bg-[#071612] px-3 text-white outline-none transition focus:border-[#b9ff4b]"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Dashboard password"
        />
        <button
          className="mt-4 w-full rounded-md bg-[#b9ff4b] px-5 py-4 font-display font-extrabold uppercase tracking-tight text-[#071612] transition hover:bg-white"
          type="submit"
        >
          Log in
        </button>
        {error && <p className="mt-4 rounded-md bg-red-950/60 p-3 text-sm font-bold text-red-200">{error}</p>}
        <p className="mt-4 text-xs text-white/45">
          The local fallback password is documented in the README if no environment password is set.
        </p>
      </form>
    </main>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#ddd5c6] bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-[#1d7a43]" />
      <p className="mt-4 font-display text-3xl font-black tracking-tight text-[#0a2b21]">{value ?? 0}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b7770]">{label}</p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-md border border-[#ddd5c6] bg-[#f4f0e7] p-4">
      <p className="text-xs font-black uppercase tracking-wide text-[#6b7770]">{label}</p>
      <p className="mt-1 font-bold text-[#0a2b21]">{value || 'Not provided'}</p>
    </div>
  );
}

function Dashboard() {
  useNoIndex(true);
  const [password, setPassword] = useState(sessionStorage.getItem(dashboardPasswordKey) || '');
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [notice, setNotice] = useState('');

  const followUpMessage = selectedLead
    ? `Hi ${selectedLead.name}, this is Colburn Outdoor Maintenance. Thanks for reaching out about ${labelFrom('services', selectedLead.serviceType).toLowerCase()}. We can talk through the job and scheduling when you have a minute.`
    : '';

  async function loadLeads(activePassword = password) {
    const params = new URLSearchParams({ status, search });
    const result = await apiRequest(`/api/leads?${params}`, { headers: { 'x-dashboard-password': activePassword } });
    setLeads(result.leads);
    setAnalytics(result.analytics);
    if (!selectedLead && result.leads[0]) selectLead(result.leads[0].id, activePassword);
  }

  async function selectLead(id, activePassword = password) {
    const result = await apiRequest(`/api/leads/${id}`, { headers: { 'x-dashboard-password': activePassword } });
    setSelectedLead(result.lead);
    setInternalNotes(result.lead.internalNotes || '');
    setMessages(result.messages || []);
  }

  async function updateSelected(updates) {
    if (!selectedLead) return;
    const result = await apiRequest(`/api/leads/${selectedLead.id}`, {
      method: 'PATCH',
      headers: { 'x-dashboard-password': password },
      body: JSON.stringify(updates),
    });
    setSelectedLead(result.lead);
    await loadLeads();
  }

  async function copyDashboardMessage(text, label) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`${label} copied.`);
    } catch {
      setNotice(`${label}: ${text}`);
    }
    window.setTimeout(() => setNotice(''), 3200);
  }

  useEffect(() => {
    if (!password) return;
    loadLeads().catch((loadError) => setError(loadError.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, status]);

  if (!password) return <DashboardLogin onLogin={setPassword} />;

  const actionButton =
    'inline-flex items-center gap-2 rounded-md border border-[#ddd5c6] bg-white px-4 py-2 text-sm font-bold text-[#0a2b21] transition hover:border-[#0f3b2d]';
  const primaryButton =
    'inline-flex items-center gap-2 rounded-md bg-[#0a2b21] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f3b2d]';

  return (
    <main className="min-h-screen bg-[#f4f0e7] px-4 py-8 font-sans sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1d7a43]">Private dashboard</p>
            <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-[-0.04em] text-[#0a2b21]">
              Colburn leads
            </h1>
          </div>
          <a className={actionButton} href="/">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </a>
        </div>

        {error && <p className="mt-4 rounded-md bg-red-50 p-3 font-bold text-red-800">{error}</p>}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total leads" value={analytics?.total} icon={BarChart3} />
          <StatCard label="New" value={analytics?.new} icon={ClipboardList} />
          <StatCard label="Booked" value={analytics?.booked} icon={CheckCircle2} />
          <StatCard label="Missed calls" value={analytics?.missedCall} icon={Phone} />
          <StatCard label="Quote forms" value={analytics?.quoteForm} icon={Send} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="rounded-xl border border-[#ddd5c6] bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-[#6b7770]" />
                <input
                  className="h-12 w-full rounded-md border border-[#ddd5c6] pl-10 pr-3 outline-none transition focus:border-[#0f3b2d]"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && loadLeads().catch((loadError) => setError(loadError.message))}
                  placeholder="Search leads"
                />
              </label>
              <StyledSelect
                id="dashboard-status-filter"
                name="dashboardStatus"
                value={status}
                options={dashboardStatusSelectOptions}
                onChange={(event) => setStatus(event.target.value)}
                compact
              />
            </div>
            <button
              className={`mt-3 ${primaryButton}`}
              type="button"
              onClick={() => loadLeads().catch((loadError) => setError(loadError.message))}
            >
              Search
            </button>
            <div className="mt-4 grid max-h-[680px] gap-3 overflow-auto pr-1">
              {leads.length ? (
                leads.map((lead) => (
                  <button
                    className={`rounded-md border p-4 text-left transition ${
                      selectedLead?.id === lead.id ? 'border-[#0f3b2d] bg-[#eaf2e4]' : 'border-[#ddd5c6] hover:border-[#0f3b2d]/50'
                    }`}
                    key={lead.id}
                    type="button"
                    onClick={() => selectLead(lead.id).catch((selectError) => setError(selectError.message))}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <strong className="text-[#0a2b21]">{lead.name}</strong>
                      <span className="rounded-full bg-[#0a2b21] px-3 py-1 text-xs font-bold text-white">{lead.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#465049]">
                      {lead.phone} — {labelFrom('services', lead.serviceType)}
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#1d7a43]">
                      {currency(lead.estimateLow)}–{currency(lead.estimateHigh)} — {lead.source}
                    </p>
                  </button>
                ))
              ) : (
                <p className="px-1 py-6 text-sm text-[#6b7770]">
                  No leads yet. The public site is call-first, so call activity appears in the analytics above.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#ddd5c6] bg-white p-5">
            {selectedLead ? (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-display text-4xl font-black uppercase tracking-[-0.04em] text-[#0a2b21]">
                      {selectedLead.name}
                    </h2>
                    <p className="mt-2 text-[#465049]">
                      {selectedLead.phone} {selectedLead.email ? `— ${selectedLead.email}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a className={primaryButton} href={`tel:${selectedLead.phone}`}>
                      <Phone className="h-4 w-4" /> Call
                    </a>
                    <a className={actionButton} href={smsHref(selectedLead.phone, followUpMessage)}>
                      <MessageSquare className="h-4 w-4" /> Text
                    </a>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Detail label="Estimate" value={`${currency(selectedLead.estimateLow)}–${currency(selectedLead.estimateHigh)}`} />
                  <Detail label="Source" value={selectedLead.source} />
                  <Detail label="Service" value={labelFrom('services', selectedLead.serviceType)} />
                  <Detail label="Timeline" value={labelFrom('urgency', selectedLead.urgency)} />
                  <Detail label="Property size" value={labelFrom('propertySizes', selectedLead.propertySize)} />
                  <Detail label="Condition" value={labelFrom('conditions', selectedLead.condition)} />
                </div>

                <p className="mt-5 rounded-md bg-[#f4f0e7] p-4 text-[#465049]">{selectedLead.notes || 'No notes provided.'}</p>

                {notice && (
                  <p className="mt-4 rounded-md border border-[#b8d2a7] bg-[#eaf2e4] p-3 text-sm font-bold text-[#0a2b21]" role="status">
                    {notice}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <StyledSelect
                    id="lead-status-select"
                    name="leadStatus"
                    value={selectedLead.status}
                    options={statusSelectOptions}
                    onChange={(event) => updateSelected({ status: event.target.value })}
                    compact
                    className="min-w-[132px]"
                  />
                  <button className={actionButton} type="button" onClick={() => copyDashboardMessage(followUpMessage, 'Follow-up message')}>
                    <Copy className="h-4 w-4" /> Copy follow-up
                  </button>
                  <button className={actionButton} type="button" onClick={() => copyDashboardMessage(reviewMessage, 'Review request')}>
                    <Copy className="h-4 w-4" /> Copy review request
                  </button>
                  <button className={actionButton} type="button" onClick={() => updateSelected({ markContacted: true, status: 'contacted' })}>
                    Mark contacted
                  </button>
                  <button className={actionButton} type="button" onClick={() => updateSelected({ status: 'booked' })}>
                    Mark booked
                  </button>
                  <button className={actionButton} type="button" onClick={() => updateSelected({ status: 'completed' })}>
                    Mark completed
                  </button>
                  <button className={actionButton} type="button" onClick={() => updateSelected({ status: 'lost' })}>
                    Mark lost
                  </button>
                </div>

                <label className="mt-6 grid gap-2">
                  <span className="font-bold text-[#0a2b21]">Internal notes</span>
                  <textarea
                    className="min-h-28 rounded-md border border-[#ddd5c6] p-3 outline-none transition focus:border-[#0f3b2d]"
                    value={internalNotes}
                    onChange={(event) => setInternalNotes(event.target.value)}
                  />
                </label>
                <button className={`mt-3 ${primaryButton}`} type="button" onClick={() => updateSelected({ internalNotes })}>
                  Save notes
                </button>

                <div className="mt-7">
                  <h3 className="flex items-center gap-2 font-bold text-[#0a2b21]">
                    <MessageSquare className="h-5 w-5" /> Messages
                  </h3>
                  <div className="mt-3 grid gap-2">
                    {messages.length ? (
                      messages.map((message) => (
                        <div className="rounded-md bg-[#f4f0e7] p-3 text-sm" key={message.id}>
                          <strong>{message.direction}</strong> — {message.body}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#6b7770]">No messages logged yet.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[#465049]">Select a lead to view details.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const path = window.location.pathname;
  const isDashboard = path.startsWith('/dashboard');
  const legalType = path.startsWith('/privacy') ? 'privacy' : path.startsWith('/terms') ? 'terms' : '';
  const metadata = legalType ? seoPages[legalType] : seoPages.home;
  useDocumentMetadata(metadata, !isDashboard);

  if (isDashboard) return <Dashboard />;
  if (legalType) return <LegalPage type={legalType} />;

  return <SiteHome />;
}
