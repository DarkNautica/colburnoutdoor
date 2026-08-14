"use client";

import { useEffect } from "react";
import {
  animate,
  createAnimatable,
  createScope,
  createTimeline,
  onScroll,
  stagger,
} from "animejs";

export function MotionSystem() {
  useEffect(() => {
    const root = document.querySelector("#site-root");
    if (!root) return;

    const scope = createScope({
      root,
      defaults: { ease: "out(4)" },
      mediaQueries: {
        compact: "(max-width: 820px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
    }).add((self) => {
      const compact = self?.matches.compact ?? false;
      const reduceMotion = self?.matches.reduceMotion ?? false;
      if (reduceMotion) return;

      createTimeline({ defaults: { ease: "out(4)" } })
        .add(".hero-kicker", { opacity: [0, 1], y: [18, 0], duration: 520 }, 80)
        .add(
          ".hero-line",
          { opacity: [0, 1], y: ["112%", "0%"], duration: compact ? 720 : 920 },
          stagger(95, { start: 130 }),
        )
        .add(".hero-lede", { opacity: [0, 1], y: [24, 0], duration: 620 }, 360)
        .add(".hero-actions", { opacity: [0, 1], y: [20, 0], duration: 600 }, 440)
        .add(
          ".hero-proof > div",
          { opacity: [0, 1], y: [16, 0], duration: 520 },
          stagger(80, { start: 540 }),
        )
        .add(".hero-media", { opacity: [0, 1], clipPath: ["inset(0 0 0 100%)", "inset(0 0 0 0%)"], duration: 1000 }, 100)
        .add(".service-stamp", { opacity: [0, 1], scale: [0.72, 1], rotate: [-12, 8], duration: 780 }, 640)
        .add(".hero-caption", { opacity: [0, 1], y: [18, 0], duration: 520 }, 720);

      animate(".hero-media img", {
        y: ["-2%", "6%"],
        scale: [1.02, 1.1],
        ease: "linear",
        autoplay: onScroll({
          target: ".hero",
          enter: "top top",
          leave: "bottom top",
          sync: true,
        }),
      });

      animate(".site-progress", {
        scaleX: [0, 1],
        ease: "linear",
        autoplay: onScroll({
          target: root,
          enter: "top top",
          leave: "bottom bottom",
          sync: true,
        }),
      });

      animate(".service-stamp", {
        rotate: [8, 12],
        scale: [1, 1.04],
        duration: 1900,
        alternate: true,
        loop: true,
        ease: "inOut(2)",
      });

      root.querySelectorAll("[data-motion-group]").forEach((group) => {
        const targets = Array.from(group.querySelectorAll("[data-reveal]"));
        if (!targets.length) return;

        const titles = Array.from(group.querySelectorAll("[data-motion-title]"));
        const copies = Array.from(group.querySelectorAll("[data-motion-copy]"));
        const cards = Array.from(group.querySelectorAll("[data-motion-card]"));
        const basics = targets.filter(
          (target) => !titles.includes(target) && !copies.includes(target) && !cards.includes(target),
        );

        if (basics.length) {
          animate(basics, {
            opacity: [0, 1],
            y: [compact ? 22 : 34, 0],
            duration: compact ? 560 : 720,
            delay: stagger(compact ? 45 : 70),
            autoplay: onScroll({
              target: group,
              enter: "bottom-=10% top",
              leave: "top+=8% bottom",
              repeat: false,
            }),
          });
        }

        if (titles.length) animate(titles, {
          opacity: [0, 1],
          y: [compact ? 42 : 78, 0],
          clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
          duration: compact ? 760 : 980,
          delay: stagger(90),
          autoplay: onScroll({
            target: group,
            enter: "bottom-=14% top",
            leave: "top+=8% bottom",
            repeat: false,
          }),
        });

        if (copies.length) animate(copies, {
          opacity: [0, 1],
          x: [compact ? 18 : 46, 0],
          duration: compact ? 620 : 820,
          delay: stagger(80),
          autoplay: onScroll({
            target: group,
            enter: "bottom-=14% top",
            leave: "top+=8% bottom",
            repeat: false,
          }),
        });

        if (cards.length) animate(cards, {
          opacity: [0, 1],
          y: [compact ? 34 : 72, 0],
          rotate: compact ? [0, 0] : [-1.6, 0],
          scale: [0.96, 1],
          duration: compact ? 680 : 920,
          delay: stagger(compact ? 70 : 115),
          autoplay: onScroll({
            target: group,
            enter: "bottom-=10% top",
            leave: "top+=8% bottom",
            repeat: false,
          }),
        });
      });

      animate(".seasonal-track", {
        scaleX: [0, 1],
        duration: 1200,
        autoplay: onScroll({
          target: ".seasonal-section",
          enter: "bottom-=18% top",
          leave: "top bottom",
          repeat: false,
        }),
      });

      animate(".property-visual img", {
        y: ["-5%", "7%"],
        scale: [1.12, 1.02],
        ease: "linear",
        autoplay: onScroll({
          target: ".property-section",
          enter: "top bottom",
          leave: "bottom top",
          sync: true,
        }),
      });

      animate(".route-cities span", {
        opacity: [0, 1],
        scale: [0.55, 1],
        y: [18, 0],
        duration: 620,
        delay: stagger(110),
        autoplay: onScroll({
          target: ".route-panel",
          enter: "bottom-=15% top",
          leave: "top bottom",
          repeat: false,
        }),
      });

      animate(".cta-orbits i", {
        opacity: [0, 0.34, 0],
        scale: [0.35, 1.15],
        duration: 2400,
        delay: stagger(620),
        loop: true,
        ease: "out(3)",
        autoplay: onScroll({
          target: ".final-cta",
          enter: "bottom top",
          leave: "top bottom",
        }),
      });

      const cleanup = [];

      root.querySelectorAll(".js-magnetic").forEach((button) => {
        const buttonMotion = createAnimatable(button, {
          x: 300,
          y: 300,
          ease: "out(4)",
        });

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
          const cardMotion = createAnimatable(card, {
            rotateX: 420,
            rotateY: 420,
            scale: 320,
            ease: "out(4)",
          });

          const onPointerMove = (event) => {
            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            cardMotion.rotateX(y * -5).rotateY(x * 6).scale(1.012);
          };
          const onPointerLeave = () => {
            cardMotion.rotateX(0, 650).rotateY(0, 650).scale(1, 650);
          };
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

      return () => cleanup.forEach((dispose) => dispose());
    });

    return () => scope.revert();
  }, []);

  return null;
}
