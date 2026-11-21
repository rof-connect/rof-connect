import type { Meneuses } from "@/lib/lfjmq-saison";

export function Bouclier({ sigle, champ }: { sigle: string; champ?: boolean }) {
  return (
    <svg viewBox="0 0 52 60" aria-hidden="true">
      <path d="M26 2 L49 9 V30 C49 44 39 53 26 58 C13 53 3 44 3 30 V9 Z" fill={champ ? "#f3d110" : "#11309f"} stroke="#c8102e" strokeWidth="2.5" />
      <text x="26" y="36" textAnchor="middle" fontFamily="Oswald, Impact, sans-serif" fontWeight="700" fontSize="18" fill={champ ? "#14193a" : "#fff"}>
        {sigle}
      </text>
    </svg>
  );
}

export function Liste({ m }: { m: Meneuses }) {
  return (
    <div className="ldr">
      <h3>
        {m.titre}
        {m.sous && <small>{m.sous}</small>}
      </h3>
      <ol>
        {m.lignes.map(([nom, equipe, valeur]) => (
          <li key={nom + valeur}>
            <span className="n">{nom}</span>
            <span className="t">{equipe}</span>
            <span className="v">{valeur}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
