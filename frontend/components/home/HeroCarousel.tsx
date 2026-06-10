"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Slide {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  from: string;
  to: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "The Big Outdoor Event",
    title: "Up to 40% off the gear you love",
    sub: "Jackets, boots, tents & more — limited time only.",
    cta: "Shop the Sale",
    href: "/?category=Outerwear",
    from: "#a00c1d",
    to: "#e11b30",
  },
  {
    eyebrow: "New Season, New Trails",
    title: "Fresh arrivals for every adventure",
    sub: "Discover this season's best in footwear & packs.",
    cta: "Shop New Arrivals",
    href: "/?category=Footwear",
    from: "#0a0a0a",
    to: "#2b2b2b",
  },
  {
    eyebrow: "Your Personal Shopper",
    title: "Let our concierge build your kit",
    sub: "Chat for instant recommendations, bundles & deals.",
    cta: "Ask the Concierge",
    href: "/?category=Camping",
    from: "#5f0911",
    to: "#c20f23",
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const s = SLIDES[i];

  return (
    <section className="relative overflow-hidden rounded-2xl">
      <div
        className="flex min-h-[340px] flex-col justify-center px-8 py-12 text-white transition-all duration-700 sm:px-16 sm:py-20"
        style={{ backgroundImage: `linear-gradient(120deg, ${s.from}, ${s.to})` }}
      >
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
          {s.eyebrow}
        </span>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-[1.05] text-balance sm:text-6xl">
          {s.title}
        </h1>
        <p className="mt-4 max-w-md text-base text-white/85">{s.sub}</p>
        <div>
          <Link
            href={s.href}
            className="mt-7 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-white/90"
          >
            {s.cta}
          </Link>
        </div>
      </div>

      <button
        aria-label="Previous"
        onClick={() => setI((n) => (n - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 sm:block"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button
        aria-label="Next"
        onClick={() => setI((n) => (n + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 sm:block"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, n) => (
          <button
            key={n}
            aria-label={`Slide ${n + 1}`}
            onClick={() => setI(n)}
            className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
