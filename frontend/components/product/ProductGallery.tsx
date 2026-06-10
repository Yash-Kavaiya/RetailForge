"use client";

import { useState } from "react";
import { Badge } from "@/components/Badge";

// We only have one image per product, so the "thumbnails" reuse it with subtle
// crops to read like a department-store gallery.
export function ProductGallery({ image, alt }: { image?: string; alt: string }) {
  const views = [image, image, image, image];
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-3 sm:flex-col">
        {views.map((v, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-16 w-16 overflow-hidden rounded-md ring-1 transition ${
              active === i ? "ring-2 ring-ink" : "ring-line hover:ring-ink/40"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="relative flex-1 overflow-hidden rounded-xl bg-surface-muted">
        <div className="absolute left-3 top-3 z-10">
          <Badge tone="sale">Sale</Badge>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={views[active]} alt={alt} className="aspect-square w-full object-cover" />
      </div>
    </div>
  );
}
