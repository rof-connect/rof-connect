export function Kicker({ texte }: { texte: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-8 bg-rof-or-fonce" />
      <div className="font-condensed text-xs font-bold uppercase tracking-[0.25em] text-rof-poudre">{texte}</div>
      <div className="h-px w-8 bg-rof-or-fonce" />
    </div>
  );
}

function Couture() {
  return (
    <svg width="46" height="14" viewBox="0 0 46 14" fill="none" aria-hidden="true">
      <path d="M2 7 Q 23 -6 44 7" stroke="#E0524A" strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M2 7 Q 23 20 44 7" stroke="#E0524A" strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" />
    </svg>
  );
}

export function Section({
  id,
  titre,
  kicker,
  fond,
  children,
}: {
  id: string;
  titre: string;
  kicker?: string;
  fond: "noir" | "marine";
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`px-5 py-16 ${fond === "noir" ? "bg-rof-noir" : "bg-rof-marine"}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          {kicker ? (
            <Kicker texte={kicker} />
          ) : (
            <div className="flex justify-center">
              <Couture />
            </div>
          )}
          <h2 className="mt-3 font-condensed text-4xl font-bold uppercase tracking-[0.03em] text-white sm:text-5xl">{titre}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
