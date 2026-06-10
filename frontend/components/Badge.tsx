type Tone = "sale" | "bonus" | "neutral";

const TONES: Record<Tone, string> = {
  sale: "bg-brand-500 text-white",
  bonus: "bg-ink text-white",
  neutral: "bg-white/90 text-ink ring-1 ring-line",
};

export function Badge({
  children,
  tone = "sale",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
