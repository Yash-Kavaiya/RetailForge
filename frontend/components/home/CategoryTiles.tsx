import Link from "next/link";

// Each department gets a distinct gradient chip so the row reads like a
// department-store "shop by category" strip.
const GRADIENTS = [
  "from-rose-200 to-rose-100",
  "from-amber-200 to-amber-100",
  "from-emerald-200 to-emerald-100",
  "from-sky-200 to-sky-100",
  "from-violet-200 to-violet-100",
  "from-stone-300 to-stone-200",
];

export function CategoryTiles({ categories }: { categories: string[] }) {
  return (
    <section>
      <h2 className="mb-4 text-center font-display text-2xl font-bold text-ink">
        Shop by Department
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {categories.map((c, i) => (
          <Link
            key={c}
            href={`/?category=${encodeURIComponent(c)}`}
            className="group flex flex-col items-center gap-2"
          >
            <span
              className={`grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} font-display text-2xl font-bold text-ink/70 ring-1 ring-line transition group-hover:scale-105`}
            >
              {c.slice(0, 1)}
            </span>
            <span className="text-sm font-medium text-ink/80 group-hover:text-brand-600">{c}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
