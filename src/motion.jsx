import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/*
 * Smooth scrolling. Lenis drives the scroll position and ScrollTrigger reads
 * from it, so both run off a single RAF loop (autoRaf: false) instead of
 * fighting each other.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const lenis = new Lenis({ autoRaf: false, duration: 1.05, smoothWheel: true });
    const onScroll = () => ScrollTrigger.update();
    const tick = (time) => lenis.raf(time * 1000);

    lenis.on("scroll", onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}

/*
 * All page choreography, scoped to the site root. Every scroll reveal plays
 * once and stays put — nothing reverts when it leaves the viewport.
 */
export function useSiteMotion(scope) {
  // If GSAP ever fails to run, nothing may be left invisible behind the CSS
  // reveal start state. Only fires when setup did not complete, so it never
  // pre-empts the scroll choreography on a healthy page.
  const booted = useRef(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!booted.current) document.documentElement.classList.add("motion-failsafe");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 821px)",
        },
        (context) => {
          const { motion, desktop } = context.conditions;

          // Reduced motion: show everything, animate nothing. Inline styles here
          // (not clearProps) so they still beat the CSS reveal start state.
          if (!motion) {
            gsap.set("[data-reveal]", { opacity: 1, y: 0 });
            return;
          }

          /* ---------------------------------------------------------- hero */

          const heroSplit = SplitText.create(".hero h1 .hero-line", {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 115,
                duration: 1,
                stagger: 0.09,
                ease: "power4.out",
              });
            },
          });

          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(".hero-kicker", { autoAlpha: 0, y: 18, duration: 0.5 }, 0.05)
            .from(".hero-lede", { autoAlpha: 0, y: 22, duration: 0.6 }, 0.45)
            .from(".hero-actions", { autoAlpha: 0, y: 20, duration: 0.6 }, 0.55)
            .from(".hero-proof > div", { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.08 }, 0.65)
            .from(".hero-media", { autoAlpha: 0, clipPath: "inset(0 0 0 100%)", duration: 1 }, 0.1)
            .from(".service-stamp", { autoAlpha: 0, scale: 0.7, rotate: -14, duration: 0.8 }, 0.7)
            .from(".hero-caption", { autoAlpha: 0, y: 18, duration: 0.5 }, 0.8);

          /* -------------------------------------------------- scroll-linked */

          gsap.to(".site-progress", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: scope.current, start: "top top", end: "bottom bottom", scrub: true },
          });

          gsap.fromTo(
            ".hero-media img",
            { yPercent: -3, scale: 1.06 },
            {
              yPercent: 6,
              scale: 1.12,
              ease: "none",
              scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
            },
          );

          gsap.fromTo(
            ".property-visual img",
            { yPercent: -5, scale: 1.12 },
            {
              yPercent: 6,
              scale: 1.02,
              ease: "none",
              scrollTrigger: { trigger: ".property-section", start: "top bottom", end: "bottom top", scrub: true },
            },
          );

          /* ------------------------------------------------ section headers */

          gsap.utils.toArray("[data-split]").forEach((heading) => {
            SplitText.create(heading, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                return gsap.from(self.lines, {
                  yPercent: 110,
                  duration: 0.9,
                  stagger: 0.08,
                  ease: "power4.out",
                  scrollTrigger: { trigger: heading, start: "top 88%", once: true },
                });
              },
            });
          });

          /* ------------------------------------------------- reveal batches */

          ScrollTrigger.batch("[data-reveal]", {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 0.75,
                stagger: 0.08,
                ease: "power3.out",
                overwrite: true,
              }),
          });

          gsap.to(".seasonal-track", {
            scaleX: 1,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: { trigger: ".seasonal-section", start: "top 75%", once: true },
          });

          gsap.from(".route-cities span", {
            autoAlpha: 0,
            scale: 0.6,
            y: 16,
            duration: 0.55,
            stagger: 0.09,
            ease: "back.out(1.7)",
            scrollTrigger: { trigger: ".route-panel", start: "top 80%", once: true },
          });

          /* ------------------------------------------------- pointer motion */

          if (desktop) {
            gsap.utils.toArray(".js-magnetic").forEach((el) => {
              const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
              const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

              const move = (event) => {
                const b = el.getBoundingClientRect();
                xTo(((event.clientX - b.left) / b.width - 0.5) * 20);
                yTo(((event.clientY - b.top) / b.height - 0.5) * 12);
              };
              const leave = () => {
                xTo(0);
                yTo(0);
              };

              el.addEventListener("pointermove", move);
              el.addEventListener("pointerleave", leave);
            });
          }

          /* ------------------------------------------------------------ FAQ */

          const items = gsap.utils.toArray(".faq-list details");
          items.forEach((detail) => {
            const answer = detail.querySelector(".faq-answer");

            detail.addEventListener("toggle", () => {
              if (!detail.open) return;
              items.forEach((other) => {
                if (other !== detail) other.open = false;
              });
              gsap.fromTo(
                answer,
                { height: 0, autoAlpha: 0 },
                { height: "auto", autoAlpha: 1, duration: 0.4, ease: "power2.out" },
              );
            });
          });
        },
      );

      booted.current = true;

      return () => media.revert();
    },
    { scope },
  );
}
