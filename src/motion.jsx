"use client";

import { useEffect } from "react";
import { animate, createAnimatable, createScope, createTimeline, onScroll, stagger } from "animejs";

/*
 * Reveal animations are driven by IntersectionObserver rather than anime's
 * onScroll: onScroll reverts an animation once the element leaves its range,
 * which left whole sections invisible after scrolling past and back.
 * Each group animates exactly once and then keeps a .is-revealed class so the
 * final state survives no matter what happens to the inline styles.
 */
export function MotionSystem() {
  useEffect(() => {
    const root = document.querySelector("#site-root");
    if (!root) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealAll = () => {
      root.querySelectorAll("[data-reveal]").forEach((element) => {
        element.classList.add("is-revealed");
        element.style.opacity = "";
        element.style.transform = "";
        element.style.clipPath = "";
      });
    };

    if (reduceMotion) {
      revealAll();
      return undefined;
    }

    root.setAttribute("data-motion-ready", "");

    // Safety net: if setup below throws, the page must not be left with
    // invisible content. It only fires when setup did not finish, so it never
    // pre-empts the scroll choreography on a healthy page.
    let booted = false;
    const failsafe = window.setTimeout(() => {
      if (!booted) revealAll();
    }, 4000);

    const scope = createScope({ root, defaults: { ease: "out(4)" } }).add((self) => {
      const compact = window.matchMedia("(max-width: 820px)").matches;
      const observers = [];
      const cleanup = [];

      /* ---------------------------------------------------------------- hero */

      createTimeline({ defaults: { ease: "out(4)" } })
        .add(".hero-kicker", { opacity: [0, 1], y: [18, 0], duration: 520 }, 80)
        .add(
          ".hero-line",
          { opacity: [0, 1], y: ["112%", "0%"], duration: compact ? 720 : 920 },
          stagger(95, { start: 130 }),
        )
        .add(".hero-lede", { opacity: [0, 1], y: [24, 0], duration: 620 }, 360)
        .add(".hero-actions", { opacity: [0, 1], y: [20, 0], duration: 600 }, 440)
        .add(".hero-proof > div", { opacity: [0, 1], y: [16, 0], duration: 520 }, stagger(80, { start: 540 }))
        .add(
          ".hero-media",
          { opacity: [0, 1], clipPath: ["inset(0 0 0 100%)", "inset(0 0 0 0%)"], duration: 1000 },
          100,
        )
        .add(".service-stamp", { opacity: [0, 1], scale: [0.72, 1], rotate: [-12, 8], duration: 780 }, 640)
        .add(".hero-caption", { opacity: [0, 1], y: [18, 0], duration: 520 }, 720);

      /* ------------------------------------------------- scroll-linked motion */

      animate(".hero-media img", {
        y: ["-2%", "6%"],
        scale: [1.02, 1.1],
        ease: "linear",
        autoplay: onScroll({ target: ".hero", enter: "top top", leave: "bottom top", sync: true }),
      });

      animate(".site-progress", {
        scaleX: [0, 1],
        ease: "linear",
        autoplay: onScroll({ target: root, enter: "top top", leave: "bottom bottom", sync: true }),
      });

      animate(".property-visual img", {
        y: ["-5%", "7%"],
        scale: [1.12, 1.02],
        ease: "linear",
        autoplay: onScroll({ target: ".property-section", enter: "top bottom", leave: "bottom top", sync: true }),
      });

      animate(".service-stamp", {
        rotate: [8, 12],
        scale: [1, 1.04],
        duration: 1900,
        alternate: true,
        loop: true,
        ease: "inOut(2)",
      });

      /* ------------------------------------------------------- reveal groups */

      const play = (targets, params) => {
        if (!targets.length) return;
        animate(targets, {
          ...params,
          onComplete: () => targets.forEach((target) => target.classList.add("is-revealed")),
        });
      };

      const observeOnce = (element, run) => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              observer.unobserve(entry.target);
              run();
            });
          },
          { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
        );
        observer.observe(element);
        observers.push(observer);
      };

      root.querySelectorAll("[data-motion-group]").forEach((group) => {
        const targets = Array.from(group.querySelectorAll("[data-reveal]"));
        if (!targets.length) return;

        const titles = targets.filter((target) => target.matches("[data-motion-title]"));
        const copies = targets.filter((target) => target.matches("[data-motion-copy]"));
        const cards = targets.filter((target) => target.matches("[data-motion-card]"));
        const basics = targets.filter(
          (target) => !titles.includes(target) && !copies.includes(target) && !cards.includes(target),
        );

        observeOnce(group, () => {
          play(basics, {
            opacity: [0, 1],
            y: [compact ? 20 : 30, 0],
            duration: compact ? 560 : 700,
            delay: stagger(compact ? 45 : 70),
          });

          play(titles, {
            opacity: [0, 1],
            y: [compact ? 40 : 72, 0],
            clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
            duration: compact ? 760 : 950,
            delay: stagger(90),
          });

          play(copies, {
            opacity: [0, 1],
            x: [compact ? 16 : 42, 0],
            duration: compact ? 620 : 800,
            delay: stagger(80),
          });

          play(cards, {
            opacity: [0, 1],
            y: [compact ? 30 : 64, 0],
            rotate: compact ? [0, 0] : [-1.4, 0],
            scale: [0.965, 1],
            duration: compact ? 680 : 900,
            delay: stagger(compact ? 70 : 110),
          });
        });
      });

      const seasonal = root.querySelector(".seasonal-section");
      if (seasonal) {
        observeOnce(seasonal, () => {
          animate(".seasonal-track", { scaleX: [0, 1], duration: 1200 });
        });
      }

      const routePanel = root.querySelector(".route-panel");
      if (routePanel) {
        observeOnce(routePanel, () => {
          animate(".route-cities span", {
            opacity: [0, 1],
            scale: [0.55, 1],
            y: [18, 0],
            duration: 620,
            delay: stagger(110),
          });
        });
      }

      const finalCta = root.querySelector(".final-cta");
      if (finalCta) {
        observeOnce(finalCta, () => {
          animate(".cta-orbits i", {
            opacity: [0, 0.34, 0],
            scale: [0.35, 1.15],
            duration: 2400,
            delay: stagger(620),
            loop: true,
            ease: "out(3)",
          });
        });
      }

      /* ------------------------------------------------------- pointer motion */

      root.querySelectorAll(".js-magnetic").forEach((button) => {
        const buttonMotion = createAnimatable(button, { x: 300, y: 300, ease: "out(4)" });

        const onPointerMove = (event) => {
          if (event.pointerType && event.pointerType !== "mouse") return;
          const bounds = button.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 22;
          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 14;
          buttonMotion.x(x).y(y);
        };
        const onPointerLeave = () => buttonMotion.x(0, 450).y(0, 450);

        button.addEventListener("pointermove", onPointerMove);
        button.addEventListener("pointerleave", onPointerLeave);
        cleanup.push(() => {
          button.removeEventListener("pointermove", onPointerMove);
          button.removeEventListener("pointerleave", onPointerLeave);
        });
      });

      if (!compact) {
        root.querySelectorAll(".service-card").forEach((card) => {
          const cardMotion = createAnimatable(card, { rotateX: 420, rotateY: 420, scale: 320, ease: "out(4)" });

          const onPointerMove = (event) => {
            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            cardMotion.rotateX(y * -5).rotateY(x * 6).scale(1.012);
          };
          const onPointerLeave = () => cardMotion.rotateX(0, 650).rotateY(0, 650).scale(1, 650);
          const onPointerEnter = () => {
            animate(card.querySelectorAll("li"), {
              y: [8, 0],
              opacity: [0.35, 1],
              duration: 360,
              delay: stagger(45),
            });
          };

          card.addEventListener("pointermove", onPointerMove);
          card.addEventListener("pointerleave", onPointerLeave);
          card.addEventListener("pointerenter", onPointerEnter);
          cleanup.push(() => {
            card.removeEventListener("pointermove", onPointerMove);
            card.removeEventListener("pointerleave", onPointerLeave);
            card.removeEventListener("pointerenter", onPointerEnter);
          });
        });

        const heroMedia = root.querySelector(".hero-media");
        const heroImage = root.querySelector(".hero-media img");
        if (heroMedia && heroImage) {
          const imageMotion = createAnimatable(heroImage, { x: 500, rotate: 700, ease: "out(4)" });
          const onHeroMove = (event) => {
            const bounds = heroMedia.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            imageMotion.x(x * -18).rotate(x * -0.6);
          };
          const onHeroLeave = () => imageMotion.x(0, 800).rotate(0, 800);
          heroMedia.addEventListener("pointermove", onHeroMove);
          heroMedia.addEventListener("pointerleave", onHeroLeave);
          cleanup.push(() => {
            heroMedia.removeEventListener("pointermove", onHeroMove);
            heroMedia.removeEventListener("pointerleave", onHeroLeave);
          });
        }
      }

      /* ------------------------------------------------------------- FAQ */

      const faqItems = Array.from(root.querySelectorAll(".faq-list details"));
      faqItems.forEach((detail) => {
        const onToggle = () => {
          if (!detail.open) return;
          faqItems.forEach((other) => {
            if (other !== detail) other.open = false;
          });
          const answer = detail.querySelector("p");
          if (answer) animate(answer, { opacity: [0, 1], y: [-8, 0], duration: 320 });
        };
        detail.addEventListener("toggle", onToggle);
        cleanup.push(() => detail.removeEventListener("toggle", onToggle));
      });

      booted = true;

      return () => {
        observers.forEach((observer) => observer.disconnect());
        cleanup.forEach((dispose) => dispose());
      };
    });

    return () => {
      window.clearTimeout(failsafe);
      scope.revert();
      root.removeAttribute("data-motion-ready");
    };
  }, []);

  return null;
}
