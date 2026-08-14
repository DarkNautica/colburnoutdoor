import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/*
 * Ambient water spray behind the hero copy.
 *
 * Droplets launch from off-frame bottom-left in an oscillating fan — the way a
 * real impact sprinkler sweeps — then arc under gravity and fade. Drawn as short
 * streaks rather than dots, which is what actually reads as water.
 *
 * Deliberately cheap: one canvas, no extra RAF loop (it shares GSAP's ticker),
 * paused whenever the hero is off-screen or the tab is hidden, and skipped
 * entirely for reduced-motion visitors.
 */

const GRAVITY = 620; // px/s²
const DRAG = 0.62;
const SPAWN_PER_SECOND = 120;

function createDroplet(width, height, sweep) {
  // Origin sits just outside the lower-left corner, so the emitter itself is
  // never visible — only the spray it throws.
  const originX = width * -0.04;
  const originY = height * 1.02;

  // Sweep drives the fan back and forth; jitter keeps it from looking mechanical.
  const angle = -1.16 + sweep * 0.42 + (Math.random() - 0.5) * 0.22;
  const speed = (0.52 + Math.random() * 0.42) * Math.hypot(width, height) * 0.92;

  return {
    x: originX + Math.random() * 26,
    y: originY - Math.random() * 20,
    // Positive vx: the fan throws up and to the right, across the copy panel.
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: 1.5 + Math.random() * 1.5,
    size: 0.7 + Math.random() * 1.5,
    tint: Math.random() < 0.26,
  };
}

export function SprinklerSpray() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    let width = 0;
    let height = 0;
    let ratio = 1;
    let droplets = [];
    let spawnDebt = 0;
    let sweep = 0;
    let visible = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();

    // Smaller screens get a thinner spray — it is decoration, not the product.
    const densityScale = () => (width < 700 ? 0.45 : 1);
    const maxDroplets = () => Math.round(260 * densityScale());

    const tick = (_time, deltaMs) => {
      if (!visible || !width) return;
      const dt = Math.min(deltaMs, 48) / 1000;

      sweep = Math.sin(performance.now() / 2600);

      spawnDebt += SPAWN_PER_SECOND * densityScale() * dt;
      while (spawnDebt >= 1) {
        spawnDebt -= 1;
        if (droplets.length < maxDroplets()) droplets.push(createDroplet(width, height, sweep));
      }

      context.clearRect(0, 0, width, height);
      context.lineCap = "round";

      const next = [];
      for (const drop of droplets) {
        drop.life += dt;

        const previousX = drop.x;
        const previousY = drop.y;

        drop.vy += GRAVITY * dt;
        drop.vx -= drop.vx * DRAG * dt;
        drop.x += drop.vx * dt;
        drop.y += drop.vy * dt;

        if (drop.life >= drop.maxLife || drop.y > height + 60 || drop.x > width + 80) continue;

        // Fade in fast, out slowly, so nothing pops in or out of existence.
        const progress = drop.life / drop.maxLife;
        const alpha = Math.min(1, progress * 6) * (1 - progress) ** 1.4;

        context.strokeStyle = drop.tint
          ? `rgba(185, 255, 75, ${alpha * 0.85})`
          : `rgba(226, 245, 236, ${alpha * 0.7})`;
        context.lineWidth = drop.size;
        context.beginPath();
        context.moveTo(previousX, previousY);
        context.lineTo(drop.x, drop.y);
        context.stroke();

        next.push(drop);
      }
      droplets = next;
    };

    gsap.ticker.add(tick);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          droplets = [];
          context.clearRect(0, 0, width, height);
        }
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) droplets = [];
    };
    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas className="hero-spray" ref={canvasRef} aria-hidden="true" />;
}
