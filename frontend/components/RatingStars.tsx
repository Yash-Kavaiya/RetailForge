interface Props {
  rating?: number | null;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

function Star({ fill }: { fill: number }) {
  // fill: 0..1 fraction of the star that is colored. Deterministic id (same fill
  // -> identical gradient) keeps SSR and client markup in sync.
  const id = `rs-${Math.round(fill * 1000)}`;
  return (
    <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#f5a623" />
          <stop offset={`${fill * 100}%`} stopColor="#d8d8d8" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85z"
      />
    </svg>
  );
}

export function RatingStars({ rating, count, size = "sm", showCount = true }: Props) {
  const value = rating ?? 0;
  const px = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={px}>
            <Star fill={Math.max(0, Math.min(1, value - i))} />
          </span>
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-ink/50">
          {count ? `(${count})` : rating ? rating.toFixed(1) : "No reviews"}
        </span>
      )}
    </div>
  );
}
