import Link from "next/link";

export function DealStrip() {
  return (
    <section className="overflow-hidden rounded-xl bg-brand-500 text-white">
      <div className="flex flex-col items-center justify-between gap-4 px-6 py-6 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-display text-2xl font-bold">Extra 20% off select styles</p>
          <p className="text-sm text-white/85">
            Use code <span className="font-bold tracking-wider">FORGE20</span> at checkout · ends Sunday
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full bg-white px-7 py-2.5 text-sm font-semibold uppercase tracking-wide text-brand-600 hover:bg-white/90"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
