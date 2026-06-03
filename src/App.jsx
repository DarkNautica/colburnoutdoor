import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Building2,
  ChevronDown,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  Home,
  Leaf,
  Lock,
  Menu,
  MessageSquare,
  Phone,
  RotateCcw,
  Scissors,
  Search,
  Send,
  Shovel,
  Store,
  Wrench,
  X,
} from 'lucide-react';
import { calculateEstimate, pricingConfig } from './data/pricing.js';

const phoneDisplay = '(704) 430-5221';
const phoneHref = 'tel:+17044305221';
const dashboardPasswordKey = 'colburn-dashboard-password';
const reviewMessage =
  'Thanks for choosing Colburn Outdoor Maintenance. If you were happy with the work, would you mind leaving us a quick Google review?';

const statusOptions = ['new', 'contacted', 'quoted', 'booked', 'completed', 'lost'];
const statusSelectOptions = statusOptions.map((option) => ({
  value: option,
  label: option.charAt(0).toUpperCase() + option.slice(1),
}));
const dashboardStatusSelectOptions = [{ value: 'all', label: 'All statuses' }, ...statusSelectOptions];

const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'Estimate', href: '#estimate' },
  { label: 'Work Types', href: '#work-types' },
  { label: 'Contact', href: '#contact' },
];

const publicSectionIds = ['top', 'services', 'estimate', 'work-types', 'contact'];

function smsHref(phone, body = '') {
  return `sms:${phone}${body ? `?&body=${encodeURIComponent(body)}` : ''}`;
}

const services = [
  {
    title: 'Lawn Care',
    text: 'Routine mowing and basic lawn maintenance for homes, rentals, and small properties.',
    icon: Leaf,
    image: '/images/hero-yard.png',
  },
  {
    title: 'Trimming',
    text: 'Clean trimming around edges, fences, beds, and overgrown spots.',
    icon: Scissors,
    image: '/images/trimming-hedges.png',
  },
  {
    title: 'Cleanup',
    text: 'One-time cleanup for leaves, branches, debris, and neglected outdoor areas.',
    icon: Shovel,
    image: '/images/mulch-bed.png',
  },
  {
    title: 'Property Upkeep',
    text: 'Practical exterior upkeep that helps the property stay neat and manageable.',
    icon: Wrench,
    image: '/images/hero-yard.png',
  },
];

const workTypes = [
  {
    title: 'Homes and yards',
    text: 'Keep the outside of your home clean and easier to enjoy.',
    icon: Home,
    image: '/images/hero-yard.png',
  },
  {
    title: 'Rental properties',
    text: 'Reliable upkeep that helps protect the property.',
    icon: Building2,
    image: '/images/trimming-hedges.png',
  },
  {
    title: 'Small business grounds',
    text: 'Straightforward maintenance for customer-facing grounds.',
    icon: Store,
    image: '/images/hero-yard.png',
  },
  {
    title: 'One-time cleanup',
    text: 'A practical reset for overgrowth, leaves, or storm debris.',
    icon: Shovel,
    image: '/images/mulch-bed.png',
  },
  {
    title: 'Recurring maintenance',
    text: 'Consistent visits so the property stays under control.',
    icon: RotateCcw,
    image: '/images/trimming-hedges.png',
  },
];

const initialQuoteForm = {
  name: '',
  phone: '',
  email: '',
  serviceType: 'lawn_maintenance',
  propertySize: 'small',
  condition: 'normal',
  urgency: 'flexible',
  addons: [],
  notes: '',
  company: '',
};

function scrollToSection(href) {
  const target = document.querySelector(href);
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
  };
}

function trackEvent(type, source) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, source, path: window.location.pathname, phone: phoneDisplay }),
  }).catch(() => {});
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

function handlePointerMotion(event) {
  if (event.pointerType && event.pointerType !== 'mouse') return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  event.currentTarget.style.setProperty('--pointer-x', `${Math.round(x * 100)}%`);
  event.currentTarget.style.setProperty('--pointer-y', `${Math.round(y * 100)}%`);
  event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 3.8}deg`);
  event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 3.8}deg`);
}

function resetPointerMotion(event) {
  event.currentTarget.style.setProperty('--pointer-x', '50%');
  event.currentTarget.style.setProperty('--pointer-y', '50%');
  event.currentTarget.style.setProperty('--tilt-x', '0deg');
  event.currentTarget.style.setProperty('--tilt-y', '0deg');
}

function handleHeroPointer(event) {
  if (event.pointerType && event.pointerType !== 'mouse') return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * -16;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * -12;
  event.currentTarget.style.setProperty('--hero-pan-x', `${x.toFixed(1)}px`);
  event.currentTarget.style.setProperty('--hero-pan-y', `${y.toFixed(1)}px`);
}

function resetHeroPointer(event) {
  event.currentTarget.style.setProperty('--hero-pan-x', '0px');
  event.currentTarget.style.setProperty('--hero-pan-y', '0px');
}

function useRevealMotion(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const targets = [...document.querySelectorAll('[data-reveal]')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.16 },
    );
    targets.forEach((target, index) => {
      target.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 70}ms`);
      observer.observe(target);
    });
    const fallback = window.setTimeout(() => {
      targets.forEach((target) => target.classList.add('is-visible'));
    }, 900);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [enabled]);
}

function usePageMotion(enabled = true) {
  const [state, setState] = useState({ activeSection: 'top', isScrolled: false });

  useEffect(() => {
    if (!enabled) return undefined;
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollTop / scrollMax));
      let activeSection = 'top';

      publicSectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 170) activeSection = id;
      });

      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
      document.documentElement.style.setProperty('--hero-scroll', `${Math.round(scrollTop * 0.035)}px`);

      setState((current) => {
        const isScrolled = scrollTop > 24;
        if (current.activeSection === activeSection && current.isScrolled === isScrolled) return current;
        return { activeSection, isScrolled };
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [enabled]);

  return state;
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

function CallLink({ className = '', children = `Call ${phoneDisplay}`, variant = 'primary', source = 'call_button' }) {
  const variants = {
    primary:
      'bg-[#245b2f] text-white shadow-[0_18px_40px_rgba(20,69,36,0.28)] hover:bg-[#1b4725]',
    tan: 'bg-[#d2a75f] text-[#143420] shadow-[0_18px_40px_rgba(96,66,29,0.24)] hover:bg-[#c49445]',
    outline: 'border border-white/70 bg-white/5 text-white hover:border-white hover:bg-white hover:text-[#143420]',
  };
  return (
    <a
      className={`group inline-flex items-center justify-center gap-3 rounded-md px-6 py-4 text-[15px] font-bold transition duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#d2a75f] ${variants[variant]} ${className}`}
      href={phoneHref}
      onClick={() => trackEvent('direct_contact_click', source)}
      aria-label={`Call Colburn Outdoor Maintenance at ${phoneDisplay}`}
    >
      <Phone className="h-5 w-5 transition duration-300 group-hover:rotate-6" strokeWidth={2.4} />
      <span>{children}</span>
    </a>
  );
}

function BrandLockup({ compact = false, footer = false }) {
  if (footer) {
    return (
      <div className="grid h-24 w-24 place-items-center rounded-full border border-[#d2a75f]/45 bg-[#fbf5e9] p-3">
        <img className="h-full w-full object-contain" src="/images/colburn-outdoor-logo-light.png" alt="" loading="lazy" decoding="async" />
      </div>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className={`grid shrink-0 place-items-center transition-all duration-300 ${compact ? 'h-11 w-[58px]' : 'h-14 w-[72px]'}`}>
        <img className="h-full w-full object-contain" src="/images/colburn-outdoor-mark.png" alt="" decoding="async" />
      </span>
      <span className={`font-serif font-bold leading-[0.96] text-[#143420] transition-all duration-300 ${compact ? 'max-w-[185px] text-lg sm:max-w-none sm:text-xl' : 'max-w-[210px] text-xl sm:max-w-none sm:text-2xl'}`}>
        Colburn Outdoor Maintenance
      </span>
    </span>
  );
}

function Header({ activeSection, isScrolled }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleNavClick = (href) => {
    setIsOpen(false);
    scrollToSection(href);
  };
  return (
    <header className={`sticky top-0 z-50 border-b border-[#2d2419]/10 bg-[#fbf5e9]/[0.94] shadow-[0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl transition-shadow duration-300 ${isScrolled ? 'shadow-[0_18px_45px_rgba(49,35,18,0.1)]' : ''}`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-[#eadcc4]">
        <div className="scroll-progress h-full bg-[#245b2f]" />
      </div>
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:px-6 lg:px-8 ${isScrolled ? 'h-16 lg:h-20' : 'h-20 lg:h-24'}`}>
        <a className="min-w-0" href="#top" aria-label="Colburn Outdoor Maintenance home">
          <BrandLockup compact={isScrolled} />
        </a>
        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              className={`relative text-[15px] font-bold transition duration-200 after:absolute after:-bottom-3 after:left-0 after:h-0.5 after:w-full after:origin-right after:bg-[#245b2f] after:transition hover:text-[#245b2f] hover:after:origin-left hover:after:scale-x-100 ${activeSection === item.href.slice(1) ? 'text-[#245b2f] after:scale-x-100' : 'text-[#1e241f] after:scale-x-0'}`}
              key={item.href}
              type="button"
              onClick={() => handleNavClick(item.href)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="hidden lg:block">
          <CallLink className="px-6 py-3" source="header" />
        </div>
        <button
          className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-[#2d2419]/15 bg-white text-[#143420] transition hover:border-[#245b2f]/45 hover:bg-[#edf4e7] lg:hidden"
          type="button"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div className={`grid overflow-hidden border-t border-[#2d2419]/10 bg-[#fbf5e9] transition-[grid-template-rows] duration-300 lg:hidden ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="min-h-0">
          <nav className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:px-6" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button className="rounded-md px-3 py-3 text-left text-base font-bold text-[#1e241f] transition hover:bg-[#efe1c9]" key={item.href} type="button" onClick={() => handleNavClick(item.href)}>
                {item.label}
              </button>
            ))}
            <CallLink className="mt-2 w-full" source="mobile_menu" />
          </nav>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative isolate min-h-[700px] overflow-hidden bg-[#143420] text-white sm:min-h-[760px] lg:min-h-[calc(100vh-160px)]" onPointerMove={handleHeroPointer} onPointerLeave={resetHeroPointer}>
      <img className="hero-media absolute inset-0 h-full w-full object-cover" src="/images/hero-yard.png" alt="Clean lawn and maintained outdoor property" />
      <div className="absolute inset-0 bg-[linear-gradient(102deg,rgba(13,45,25,0.96)_0%,rgba(13,45,25,0.9)_38%,rgba(13,45,25,0.4)_54%,rgba(13,45,25,0.08)_100%)]" />
      <div className="hero-logo-watermark pointer-events-none absolute left-[7%] top-[21%] hidden h-48 w-48 place-items-center rounded-full border border-[#d2a75f]/45 bg-[#0d2115]/32 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] 2xl:grid">
        <img className="h-full w-full object-contain opacity-95 drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]" src="/images/colburn-outdoor-logo-light.png" alt="" decoding="async" />
      </div>
      <div className="pointer-events-none absolute bottom-[18%] right-[9%] hidden h-28 w-px rotate-12 bg-[#d2a75f]/35 lg:block" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(0deg,#fbf5e9_0%,rgba(251,245,233,0)_100%)]" />
      <div className="pointer-events-none absolute -bottom-12 left-0 h-28 w-[62vw] rounded-tr-[100%] bg-[#fbf5e9]" />
      <div className="pointer-events-none absolute -bottom-16 right-0 h-36 w-[55vw] rounded-tl-[100%] bg-[#fbf5e9]" />
      <div className="relative mx-auto flex min-h-[700px] max-w-7xl items-center px-4 pb-28 pt-16 sm:min-h-[760px] sm:px-6 lg:min-h-[calc(100vh-160px)] lg:px-8">
        <div className="max-w-3xl" data-reveal>
          <h1 className="max-w-3xl font-serif text-[44px] font-bold leading-[0.98] tracking-normal text-[#fff7ea] sm:text-[64px] lg:text-[78px] xl:text-[88px]">
            Reliable outdoor maintenance for homes and small businesses.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#fff2df]/92 sm:text-xl sm:leading-9">
            Lawn care, trimming, cleanup, and basic outdoor property upkeep. Call to talk through the job and get on the schedule.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <div className="hidden sm:block">
              <CallLink variant="tan" source="hero_call" />
            </div>
            <button className="group inline-flex items-center justify-center gap-3 rounded-md border border-white/70 bg-white/5 px-6 py-4 text-[15px] font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#143420]" type="button" onClick={() => scrollToSection('#estimate')}>
              <span>Get Estimate</span>
              <ArrowRight className="h-5 w-5 transition duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const [activeService, setActiveService] = useState(services[0].title);

  return (
    <section id="services" className="section-depth section-depth-services scroll-mt-24 bg-[#fbf5e9] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div data-reveal>
            <p className="text-sm font-black uppercase tracking-normal text-[#245b2f]">Services</p>
            <h2 className="mt-4 max-w-4xl font-serif text-[38px] font-bold leading-[1.03] text-[#102418] sm:text-[56px] lg:text-[70px]">
              Simple, dependable services that keep your property looking its best.
            </h2>
          </div>
          <div className="border-t border-[#b98b45]/50 pt-6" data-reveal>
            <p className="text-lg leading-8 text-[#3f382f]">We handle the outside work so you can keep a clean, well-kept property year-round.</p>
            <CallLink className="mt-5 px-5 py-3" source="services_call" />
          </div>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isActive = activeService === service.title;
            return (
              <button
                className={`motion-card group relative flex h-full min-h-[470px] flex-col overflow-hidden rounded-md border bg-[#fffaf0] text-left shadow-[0_18px_36px_rgba(49,35,18,0.08)] transition duration-300 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#d2a75f] ${isActive ? 'border-[#245b2f] shadow-[0_26px_56px_rgba(49,35,18,0.15)]' : 'border-[#d7c2a0] hover:border-[#b98b45] hover:shadow-[0_26px_56px_rgba(49,35,18,0.14)]'}`}
                key={service.title}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveService(service.title)}
                onFocus={() => setActiveService(service.title)}
                onPointerMove={handlePointerMotion}
                onPointerLeave={resetPointerMotion}
                data-reveal
                style={{ '--reveal-delay': `${index * 80}ms` }}
              >
                <div className="relative z-10 flex flex-1 flex-col p-7">
                  <span className={`grid h-14 w-14 place-items-center rounded-full transition duration-300 ${isActive ? 'bg-[#245b2f] text-[#fbf5e9]' : 'bg-[#edf4e7] text-[#143420] group-hover:bg-[#245b2f] group-hover:text-[#fbf5e9]'}`}>
                    <Icon className="h-7 w-7" strokeWidth={1.65} />
                  </span>
                  <div className={`mt-5 h-px transition-all duration-300 ${isActive ? 'w-28 bg-[#245b2f]' : 'w-20 bg-[#b98b45]'}`} />
                  <h3 className="mt-6 font-serif text-3xl font-bold text-[#102418]">{service.title}</h3>
                  <p className="mt-4 text-base leading-7 text-[#4d4439]">{service.text}</p>
                </div>
                <div className="relative z-10 aspect-[4/3] w-full overflow-hidden border-t border-[#d7c2a0]">
                  <img className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={service.image} alt="" loading="lazy" decoding="async" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#143420]/75 to-transparent" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
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
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  function changeValue(option) {
    onChange?.({
      target: { name, value: option.value },
      currentTarget: { name, value: option.value },
    });
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    if (!options.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.min(current + 1, options.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen) {
        changeValue(options[activeIndex]);
      } else {
        setIsOpen(true);
      }
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className={`relative grid gap-2 ${isOpen ? 'z-[90]' : 'z-0'} ${className}`} ref={rootRef}>
      {label && <span className="text-sm font-bold text-[#143420]" id={`${fieldId}-label`}>{label}</span>}
      <input type="hidden" name={name} value={selectedOption.value} />
      <div className="group relative">
        <button
          id={fieldId}
          className={`w-full rounded-md border border-[#c9ad7f] bg-[linear-gradient(180deg,#fffef9_0%,#f7ecd9_100%)] text-left font-semibold text-[#1e241f] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_12px_24px_rgba(49,35,18,0.07)] outline-none transition duration-200 hover:-translate-y-px hover:border-[#b98b45] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_16px_30px_rgba(49,35,18,0.1)] focus-visible:border-[#245b2f] focus-visible:ring-4 focus-visible:ring-[#245b2f]/12 ${isOpen ? 'border-[#245b2f] bg-white ring-4 ring-[#245b2f]/12' : ''} ${sizeClasses}`}
          type="button"
          aria-controls={listId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${fieldId}-label ${fieldId}` : undefined}
          onClick={() => setIsOpen((current) => !current)}
          onKeyDown={handleKeyDown}
        >
          {selectedOption.label}
        </button>
        <span className={`pointer-events-none absolute right-2 top-1/2 grid -translate-y-1/2 place-items-center rounded-md border border-[#d7c2a0] bg-[#fbf5e9] text-[#245b2f] shadow-sm transition duration-200 group-hover:border-[#b98b45] ${isOpen ? 'border-[#245b2f] bg-[#edf4e7]' : ''} ${chevronClasses}`}>
          <ChevronDown className={`transition duration-200 ${isOpen ? 'rotate-180' : ''} ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} strokeWidth={2.2} />
        </span>
        <span className={`pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-[#245b2f] to-transparent transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        {isOpen && (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-[#b98b45]/80 bg-[#fffaf0] p-1.5 shadow-[0_22px_50px_rgba(49,35,18,0.2)] ring-1 ring-white/80 animate-[dropdownIn_160ms_cubic-bezier(0.16,1,0.3,1)]"
            id={listId}
            role="listbox"
            aria-labelledby={label ? `${fieldId}-label` : undefined}
          >
            <div className={`${listHeightClasses} overflow-auto rounded-[4px]`}>
              {options.map((option, index) => {
                const isSelected = option.value === selectedOption.value;
                const isActive = index === activeIndex;
                return (
                  <button
                    className={`group/option relative flex w-full items-center justify-between gap-3 rounded-[4px] px-3 py-3 text-left font-bold transition duration-150 ${compact ? 'text-sm' : 'text-[15px]'} ${isSelected ? 'bg-[#245b2f] text-[#fffaf0] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]' : isActive ? 'bg-[#edf4e7] text-[#143420]' : 'text-[#2f352d] hover:bg-[#f1e4cd] hover:text-[#143420]'}`}
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => changeValue(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span>{option.label}</span>
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition ${isSelected ? 'bg-[#fffaf0] text-[#245b2f]' : isActive ? 'bg-white text-[#245b2f]' : 'bg-transparent text-transparent group-hover/option:bg-white group-hover/option:text-[#245b2f]'}`}>
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionSelect({ label, name, value, options, onChange }) {
  const optionList = Object.entries(options).map(([optionValue, option]) => ({
    value: optionValue,
    label: option.label,
  }));

  return (
    <StyledSelect label={label} name={name} value={value} options={optionList} onChange={onChange} />
  );
}

function EstimateSection() {
  const [form, setForm] = useState(initialQuoteForm);
  const [state, setState] = useState({ status: 'idle', message: '', leadId: '' });
  const [estimatePulse, setEstimatePulse] = useState(false);
  const estimate = useMemo(() => calculateEstimate(form), [form]);
  const quoteCompleteness = useMemo(() => {
    const completed = [
      form.serviceType,
      form.propertySize,
      form.condition,
      form.urgency,
      form.name.trim(),
      form.phone.trim(),
    ].filter(Boolean).length;
    return Math.round((completed / 6) * 100);
  }, [form]);

  useEffect(() => {
    setEstimatePulse(true);
    const timer = window.setTimeout(() => setEstimatePulse(false), 360);
    return () => window.clearTimeout(timer);
  }, [estimate.low, estimate.high]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleAddon(addonKey) {
    setForm((current) => ({
      ...current,
      addons: current.addons.includes(addonKey)
        ? current.addons.filter((key) => key !== addonKey)
        : [...current.addons, addonKey],
    }));
  }

  async function submitLead(event) {
    event.preventDefault();
    setState({ status: 'submitting', message: '', leadId: '' });
    try {
      const payload = {
        ...form,
        source: 'quote_form',
        ...getUtmParams(),
      };
      const result = await apiRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setState({
        status: 'success',
        message: 'Request received. Colburn Outdoor Maintenance can follow up from here.',
        leadId: result.lead.id,
      });
      setForm((current) => ({ ...initialQuoteForm, serviceType: current.serviceType }));
    } catch (error) {
      setState({ status: 'error', message: error.message, leadId: '' });
    }
  }

  return (
    <section id="estimate" className="section-depth section-depth-estimate scroll-mt-24 bg-[#fffaf0] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <div data-reveal>
          <p className="text-sm font-black uppercase tracking-normal text-[#245b2f]">Instant Estimate</p>
          <h2 className="mt-4 font-serif text-[40px] font-bold leading-[1.04] text-[#102418] sm:text-[58px]">
            Get a starting range, then send the job details.
          </h2>
          <div className="motion-card relative mt-8 overflow-hidden rounded-md border border-[#d7c2a0] bg-[#fbf5e9] p-7 shadow-[0_18px_36px_rgba(49,35,18,0.08)]" onPointerMove={handlePointerMotion} onPointerLeave={resetPointerMotion}>
            <p className="text-sm font-bold uppercase text-[#245b2f]">Estimated starting range</p>
            <p className={`relative z-10 mt-3 font-serif text-5xl font-bold text-[#143420] transition-transform duration-300 ${estimatePulse ? 'scale-[1.035]' : 'scale-100'}`}>
              {currency(estimate.low)}-{currency(estimate.high)}
            </p>
            <p className="mt-4 text-base leading-7 text-[#4d4439]">
              Final pricing depends on photos, property access, terrain, and the actual job scope.
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#eadcc4]" aria-hidden="true">
              <div className="h-full rounded-full bg-[#245b2f] transition-[width] duration-500 ease-out" style={{ width: `${quoteCompleteness}%` }} />
            </div>
            <ul className="mt-5 grid gap-2 text-sm text-[#4d4439]">
              <li>{estimate.serviceLabel}</li>
              <li>{estimate.propertySizeLabel}</li>
              <li>{estimate.conditionLabel}</li>
              <li>{estimate.urgencyLabel}</li>
            </ul>
          </div>
        </div>

        <form className="rounded-md border border-[#d7c2a0] bg-[#fbf5e9] p-5 shadow-[0_24px_70px_rgba(49,35,18,0.14)] sm:p-7" onSubmit={submitLead} data-reveal>
          <input className="hidden" name="company" tabIndex="-1" autoComplete="off" value={form.company} onChange={updateField} />
          <div className="grid gap-4 md:grid-cols-2">
            <OptionSelect label="Service" name="serviceType" value={form.serviceType} options={pricingConfig.services} onChange={updateField} />
            <OptionSelect label="Property size" name="propertySize" value={form.propertySize} options={pricingConfig.propertySizes} onChange={updateField} />
            <OptionSelect label="Condition" name="condition" value={form.condition} options={pricingConfig.conditions} onChange={updateField} />
            <OptionSelect label="Timeline" name="urgency" value={form.urgency} options={pricingConfig.urgency} onChange={updateField} />
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-bold text-[#143420]">Optional add-ons</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {Object.entries(pricingConfig.addons).map(([key, addon]) => (
                <label className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition duration-200 ${form.addons.includes(key) ? 'border-[#245b2f] bg-[#eef5e8] text-[#143420] shadow-[inset_0_0_0_1px_rgba(36,91,47,0.16)]' : 'border-[#d7c2a0] bg-white text-[#3f382f] hover:border-[#b98b45]'}`} key={key}>
                  <input className="mt-1 accent-[#245b2f]" type="checkbox" name={key} checked={form.addons.includes(key)} onChange={() => toggleAddon(key)} />
                  <span>{addon.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[#143420]">Name</span>
              <input className="h-12 rounded-md border border-[#d7c2a0] bg-white px-3 outline-none transition focus:border-[#245b2f] focus:ring-4 focus:ring-[#245b2f]/10" name="name" value={form.name} onChange={updateField} required />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[#143420]">Phone</span>
              <input className="h-12 rounded-md border border-[#d7c2a0] bg-white px-3 outline-none transition focus:border-[#245b2f] focus:ring-4 focus:ring-[#245b2f]/10" name="phone" value={form.phone} onChange={updateField} inputMode="tel" required />
            </label>
          </div>
          <label className="mt-4 grid gap-2">
            <span className="text-sm font-bold text-[#143420]">Email optional</span>
            <input className="h-12 rounded-md border border-[#d7c2a0] bg-white px-3 outline-none transition focus:border-[#245b2f] focus:ring-4 focus:ring-[#245b2f]/10" name="email" type="email" value={form.email} onChange={updateField} />
          </label>
          <label className="mt-4 grid gap-2">
            <span className="text-sm font-bold text-[#143420]">Notes</span>
            <textarea className="min-h-28 rounded-md border border-[#d7c2a0] bg-white p-3 outline-none transition focus:border-[#245b2f] focus:ring-4 focus:ring-[#245b2f]/10" name="notes" value={form.notes} onChange={updateField} placeholder="Gate notes, problem areas, timing, or anything that helps explain the work." />
          </label>
          <button className="group mt-6 inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#245b2f] px-6 py-4 font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#1b4725] disabled:translate-y-0 disabled:opacity-75" type="submit" disabled={state.status === 'submitting'}>
            <Send className="h-5 w-5 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            {state.status === 'submitting' ? 'Sending request...' : 'Send quote request'}
          </button>
          {state.message && (
            <p className={`mt-4 rounded-md p-4 text-sm font-bold ${state.status === 'error' ? 'bg-red-50 text-red-800' : 'bg-[#e4f1da] text-[#143420]'}`} role="status">
              {state.message}
              {state.leadId ? ` Lead ID: ${state.leadId.slice(0, 8)}.` : ''}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

function WorkTypes() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeType = workTypes[activeIndex];

  return (
    <section id="work-types" className="section-depth section-depth-work scroll-mt-24 bg-[#fbf5e9] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8">
        <div data-reveal>
          <p className="text-sm font-black uppercase tracking-normal text-[#245b2f]">Work Types</p>
          <h2 className="mt-4 max-w-2xl font-serif text-[40px] font-bold leading-[1.04] text-[#102418] sm:text-[58px]">
            Maintenance for the properties people actually use.
          </h2>
          <div className="mt-8 space-y-2">
            {workTypes.map((type, index) => {
              const Icon = type.icon;
              const isActive = index === activeIndex;
              return (
                <button
                  className={`group grid w-full grid-cols-[52px_1fr] gap-5 rounded-md border px-3 py-4 text-left transition duration-300 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#d2a75f] ${isActive ? 'border-[#245b2f] bg-[#eef5e8] shadow-[0_12px_30px_rgba(49,35,18,0.08)]' : 'border-transparent hover:border-[#d9c7aa] hover:bg-[#fffaf0]'}`}
                  key={type.title}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className={`grid h-12 w-12 place-items-center rounded-full transition duration-300 ${isActive ? 'bg-[#245b2f] text-[#fbf5e9]' : 'bg-[#fffaf0] text-[#245b2f] group-hover:bg-[#245b2f] group-hover:text-[#fbf5e9]'}`}>
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-[#161d18]">{type.title}</h3>
                    <p className="mt-1 text-base leading-7 text-[#4d4439]">{type.text}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="motion-card relative overflow-hidden rounded-tr-[72px] border border-[#d7c2a0] bg-[#e7d5ba] shadow-[0_24px_70px_rgba(49,35,18,0.18)]" data-reveal onPointerMove={handlePointerMotion} onPointerLeave={resetPointerMotion}>
          <img key={activeType.title} className="media-swap h-[440px] w-full object-cover sm:h-[560px]" src={activeType.image} alt={`${activeType.title} outdoor maintenance`} loading="lazy" decoding="async" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#112c1b]/94 via-[#112c1b]/70 to-transparent p-6 pt-24 text-white sm:p-8">
            <h3 className="font-serif text-3xl font-bold text-[#fff7ea]">{activeType.title}</h3>
            <p className="mt-3 max-w-xl text-xl font-bold leading-8">{activeType.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CallFirst() {
  return (
    <section id="contact" className="dark-section-graphics scroll-mt-24 bg-[#143420] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.5fr_1.55fr_0.74fr] lg:items-center lg:px-8">
        <div className="flex items-center gap-5" data-reveal>
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-[#d2a75f] bg-[#d2a75f]/14 p-3 sm:h-32 sm:w-32">
            <img className="h-full w-full object-contain" src="/images/colburn-outdoor-logo-light.png" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="h-24 w-px bg-white/[0.22]" />
        </div>
        <div data-reveal>
          <h2 className="max-w-4xl font-serif text-[36px] font-bold leading-[1.04] text-[#fff7ea] sm:text-[50px] xl:text-[56px]">
            Call, explain what needs maintained, and get the work scheduled.
          </h2>
          <CallLink className="mt-8 w-full max-w-xl text-lg sm:text-2xl" variant="tan" source="contact_section">
            Call {phoneDisplay}
          </CallLink>
        </div>
        <div className="rounded-md border border-white/[0.16] bg-white/[0.07] p-6" data-reveal>
          <Phone className="h-8 w-8 text-[#d2a75f]" strokeWidth={1.8} />
          <h3 className="mt-5 text-xl font-bold text-white">No online booking.</h3>
          <p className="mt-3 text-base leading-7 text-[#efe1c9]">Every property is different. A quick call helps understand the job and get it scheduled.</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0d2115] pb-24 pt-12 text-[#efe1c9] sm:pb-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.85fr_0.85fr] lg:px-8">
        <div>
          <BrandLockup footer />
          <h2 className="mt-5 font-serif text-3xl font-bold text-white">Colburn Outdoor Maintenance</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#d9c7aa]">Local outdoor maintenance for homes, rental properties, and small business grounds.</p>
          <a className="mt-4 inline-block text-sm font-bold text-[#d2a75f]" href="/dashboard">Owner dashboard</a>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[#d9c7aa]">
            <a className="transition hover:text-[#d2a75f]" href="/privacy">Privacy Policy</a>
            <a className="transition hover:text-[#d2a75f]" href="/terms">Terms</a>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-normal text-[#d2a75f]">Contact</h2>
          <ul className="mt-5 space-y-3 text-base">
            <li>colburnoutdoor.com</li>
            <li><a className="font-bold text-white transition hover:text-[#d2a75f]" href={phoneHref}>{phoneDisplay}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-normal text-[#d2a75f]">Services</h2>
          <ul className="mt-5 grid gap-3">
            {['Lawn care', 'Trimming', 'Cleanup', 'Outdoor property upkeep'].map((service) => (
              <li className="flex items-center gap-3" key={service}>
                <CheckCircle2 className="h-5 w-5 text-[#d2a75f]" strokeWidth={1.8} />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function MobileCallButton() {
  return (
    <a className="mobile-call fixed inset-x-4 bottom-4 z-50 flex items-center justify-center gap-3 rounded-md bg-[#d2a75f] px-5 py-4 text-base font-black text-[#143420] shadow-[0_18px_45px_rgba(32,27,18,0.32)] transition active:scale-[0.98] sm:hidden" href={phoneHref} onClick={() => trackEvent('direct_contact_click', 'mobile_fixed')}>
      <Phone className="h-5 w-5" strokeWidth={2.5} />
      <span>Call {phoneDisplay}</span>
    </a>
  );
}

function LegalPage({ type }) {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Use';
  const updated = 'June 3, 2026';
  const sections = isPrivacy
    ? [
        {
          title: 'Information We Collect',
          body:
            'When you submit a quote request, we collect the contact details and job information you provide, including name, phone number, optional email, service needs, estimate selections, notes, and basic source information.',
        },
        {
          title: 'How We Use Information',
          body:
            'We use submitted information to respond to quote requests, schedule outdoor maintenance work, maintain lead records, and improve the business website. Owner dashboard access is password protected.',
        },
        {
          title: 'Email and SMS',
          body:
            'Phase 1 uses email notifications for new lead alerts. Manual call and text links are available in the dashboard. Automated SMS is disabled by default and may be enabled later only after Twilio/A2P verification is complete.',
        },
        {
          title: 'Service Providers',
          body:
            'The site is hosted on Cloudflare Pages with Cloudflare D1 lead storage. Email notifications may be sent through Resend or configured SMTP. We do not sell submitted lead information.',
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
            'This website provides general information, a starting estimate calculator, and a quote request form for Colburn Outdoor Maintenance. Use of the website does not create a service agreement by itself.',
        },
        {
          title: 'Estimates',
          body:
            'Online estimate ranges are starting points only. Final pricing depends on photos, property access, terrain, current property condition, and the agreed job scope.',
        },
        {
          title: 'Scheduling',
          body:
            'Work is scheduled by direct communication. The site does not provide automatic booking or guaranteed appointment times.',
        },
        {
          title: 'Dashboard and Messages',
          body:
            'The owner dashboard is for internal lead management. Call, text, follow-up, and review request actions are manual unless optional SMS automation is enabled later after required verification.',
        },
        {
          title: 'Contact',
          body: `For questions about these terms, call Colburn Outdoor Maintenance at ${phoneDisplay}.`,
        },
      ];

  return (
    <main className="min-h-screen bg-[#fbf5e9] text-[#1e241f]">
      <header className="border-b border-[#d7c2a0] bg-[#fbf5e9]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" aria-label="Colburn Outdoor Maintenance home">
            <BrandLockup compact />
          </a>
          <a className="rounded-md bg-[#245b2f] px-4 py-2 font-bold text-white" href={phoneHref}>
            Call {phoneDisplay}
          </a>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-black uppercase text-[#245b2f]">Colburn Outdoor Maintenance</p>
        <h1 className="mt-3 font-serif text-5xl font-bold text-[#102418]">{title}</h1>
        <p className="mt-3 text-sm font-bold text-[#6f6253]">Last updated: {updated}</p>
        <div className="mt-10 grid gap-5">
          {sections.map((section) => (
            <section className="rounded-md border border-[#d7c2a0] bg-white p-6 shadow-sm" key={section.title}>
              <h2 className="font-serif text-2xl font-bold text-[#143420]">{section.title}</h2>
              <p className="mt-3 text-base leading-7 text-[#4d4439]">{section.body}</p>
            </section>
          ))}
        </div>
        <a className="mt-8 inline-flex items-center gap-2 rounded-md border border-[#d7c2a0] bg-white px-4 py-3 font-bold text-[#143420]" href="/">
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to site
        </a>
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
    <main className="min-h-screen bg-[#fbf5e9] px-4 py-16">
      <form className="mx-auto max-w-md rounded-md border border-[#d7c2a0] bg-white p-7 shadow-xl" onSubmit={login}>
        <Lock className="h-9 w-9 text-[#245b2f]" />
        <h1 className="mt-5 font-serif text-4xl font-bold text-[#143420]">Owner dashboard</h1>
        <p className="mt-3 text-[#4d4439]">Enter the dashboard password to view leads.</p>
        <input className="mt-6 h-12 w-full rounded-md border border-[#d7c2a0] px-3 outline-none focus:border-[#245b2f] focus:ring-4 focus:ring-[#245b2f]/10" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Dashboard password" />
        <button className="mt-4 w-full rounded-md bg-[#245b2f] px-5 py-4 font-bold text-white" type="submit">Log in</button>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p>}
        <p className="mt-4 text-xs text-[#6f6253]">Local fallback password is documented in the README if no environment password is set.</p>
      </form>
    </main>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-md border border-[#d7c2a0] bg-white p-5 shadow-sm">
      <Icon className="h-6 w-6 text-[#245b2f]" />
      <p className="mt-4 text-3xl font-black text-[#143420]">{value ?? 0}</p>
      <p className="text-sm font-bold text-[#6f6253]">{label}</p>
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

  return (
    <main className="min-h-screen bg-[#fbf5e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#245b2f]">Private dashboard</p>
            <h1 className="font-serif text-4xl font-bold text-[#143420]">Colburn leads</h1>
          </div>
          <a className="rounded-md border border-[#d7c2a0] bg-white px-4 py-3 font-bold text-[#143420]" href="/">Back to site</a>
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
          <section className="rounded-md border border-[#d7c2a0] bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-[#6f6253]" />
                <input className="h-12 w-full rounded-md border border-[#d7c2a0] pl-10 pr-3 outline-none" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && loadLeads().catch((loadError) => setError(loadError.message))} placeholder="Search leads" />
              </label>
              <StyledSelect id="dashboard-status-filter" name="dashboardStatus" value={status} options={dashboardStatusSelectOptions} onChange={(event) => setStatus(event.target.value)} compact />
            </div>
            <button className="mt-3 rounded-md bg-[#245b2f] px-4 py-2 font-bold text-white" type="button" onClick={() => loadLeads().catch((loadError) => setError(loadError.message))}>Search</button>
            <div className="mt-4 grid max-h-[680px] gap-3 overflow-auto pr-1">
              {leads.map((lead) => (
                <button className={`rounded-md border p-4 text-left transition ${selectedLead?.id === lead.id ? 'border-[#245b2f] bg-[#eef5e8]' : 'border-[#d7c2a0] hover:border-[#245b2f]/50'}`} key={lead.id} type="button" onClick={() => selectLead(lead.id).catch((selectError) => setError(selectError.message))}>
                  <div className="flex items-center justify-between gap-4">
                    <strong className="text-[#143420]">{lead.name}</strong>
                    <span className="rounded-full bg-[#143420] px-3 py-1 text-xs font-bold text-white">{lead.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#4d4439]">{lead.phone} - {labelFrom('services', lead.serviceType)}</p>
                  <p className="mt-2 text-sm font-bold text-[#245b2f]">{currency(lead.estimateLow)}-{currency(lead.estimateHigh)} - {lead.source}</p>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-md border border-[#d7c2a0] bg-white p-5">
            {selectedLead ? (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-serif text-4xl font-bold text-[#143420]">{selectedLead.name}</h2>
                    <p className="mt-2 text-[#4d4439]">{selectedLead.phone} {selectedLead.email ? `- ${selectedLead.email}` : ''}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a className="rounded-md bg-[#245b2f] px-4 py-2 font-bold text-white" href={`tel:${selectedLead.phone}`}>Call</a>
                    <a className="rounded-md border border-[#d7c2a0] px-4 py-2 font-bold text-[#143420]" href={smsHref(selectedLead.phone, followUpMessage)}>Text</a>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Detail label="Estimate" value={`${currency(selectedLead.estimateLow)}-${currency(selectedLead.estimateHigh)}`} />
                  <Detail label="Source" value={selectedLead.source} />
                  <Detail label="Service" value={labelFrom('services', selectedLead.serviceType)} />
                  <Detail label="Timeline" value={labelFrom('urgency', selectedLead.urgency)} />
                  <Detail label="Property size" value={labelFrom('propertySizes', selectedLead.propertySize)} />
                  <Detail label="Condition" value={labelFrom('conditions', selectedLead.condition)} />
                </div>
                <p className="mt-5 rounded-md bg-[#fbf5e9] p-4 text-[#3f382f]">{selectedLead.notes || 'No notes provided.'}</p>
                {notice && (
                  <p className="mt-4 rounded-md border border-[#b8d2a7] bg-[#eef5e8] p-3 text-sm font-bold text-[#143420]" role="status">
                    {notice}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <StyledSelect id="lead-status-select" name="leadStatus" value={selectedLead.status} options={statusSelectOptions} onChange={(event) => updateSelected({ status: event.target.value })} compact className="min-w-[132px]" />
                  <a className="inline-flex items-center gap-2 rounded-md bg-[#245b2f] px-4 py-2 font-bold text-white" href={`tel:${selectedLead.phone}`}><Phone className="h-4 w-4" /> Call lead</a>
                  <a className="inline-flex items-center gap-2 rounded-md border border-[#d7c2a0] px-4 py-2 font-bold text-[#143420]" href={smsHref(selectedLead.phone, followUpMessage)}><MessageSquare className="h-4 w-4" /> Text lead</a>
                  <button className="inline-flex items-center gap-2 rounded-md border border-[#d7c2a0] px-4 py-2 font-bold text-[#143420]" type="button" onClick={() => copyDashboardMessage(followUpMessage, 'Follow-up message')}><Copy className="h-4 w-4" /> Copy follow-up</button>
                  <button className="inline-flex items-center gap-2 rounded-md border border-[#d7c2a0] px-4 py-2 font-bold text-[#143420]" type="button" onClick={() => copyDashboardMessage(reviewMessage, 'Review request')}><Copy className="h-4 w-4" /> Copy review request</button>
                  <button className="rounded-md border border-[#d7c2a0] px-4 py-2 font-bold text-[#143420]" type="button" onClick={() => updateSelected({ markContacted: true, status: 'contacted' })}>Mark contacted</button>
                  <button className="rounded-md border border-[#d7c2a0] px-4 py-2 font-bold text-[#143420]" type="button" onClick={() => updateSelected({ status: 'booked' })}>Mark booked</button>
                  <button className="rounded-md border border-[#d7c2a0] px-4 py-2 font-bold text-[#143420]" type="button" onClick={() => updateSelected({ status: 'completed' })}>Mark completed</button>
                  <button className="rounded-md border border-[#d7c2a0] px-4 py-2 font-bold text-[#143420]" type="button" onClick={() => updateSelected({ status: 'lost' })}>Mark lost</button>
                </div>
                <label className="mt-6 grid gap-2">
                  <span className="font-bold text-[#143420]">Internal notes</span>
                  <textarea className="min-h-28 rounded-md border border-[#d7c2a0] p-3" value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} />
                </label>
                <button className="mt-3 rounded-md bg-[#245b2f] px-4 py-2 font-bold text-white" type="button" onClick={() => updateSelected({ internalNotes })}>Save notes</button>
                <div className="mt-7">
                  <h3 className="flex items-center gap-2 font-bold text-[#143420]"><MessageSquare className="h-5 w-5" /> Messages</h3>
                  <div className="mt-3 grid gap-2">
                    {messages.length ? messages.map((message) => (
                      <div className="rounded-md bg-[#fbf5e9] p-3 text-sm" key={message.id}>
                        <strong>{message.direction}</strong> - {message.body}
                      </div>
                    )) : <p className="text-sm text-[#6f6253]">No messages logged yet.</p>}
                  </div>
                </div>
              </>
            ) : (
              <p>Select a lead to view details.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-md border border-[#d7c2a0] bg-[#fbf5e9] p-4">
      <p className="text-xs font-black uppercase text-[#6f6253]">{label}</p>
      <p className="mt-1 font-bold text-[#143420]">{value || 'Not provided'}</p>
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;
  const isDashboard = path.startsWith('/dashboard');
  const legalType = path.startsWith('/privacy') ? 'privacy' : path.startsWith('/terms') ? 'terms' : '';
  useRevealMotion(!isDashboard && !legalType);
  const pageMotion = usePageMotion(!isDashboard && !legalType);

  if (isDashboard) return <Dashboard />;
  if (legalType) return <LegalPage type={legalType} />;

  return (
    <>
      <Header activeSection={pageMotion.activeSection} isScrolled={pageMotion.isScrolled} />
      <main>
        <Hero />
        <Services />
        <EstimateSection />
        <WorkTypes />
        <CallFirst />
      </main>
      <Footer />
      <MobileCallButton />
    </>
  );
}
