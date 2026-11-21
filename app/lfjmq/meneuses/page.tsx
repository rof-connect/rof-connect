import type { Metadata } from "next";
import { Liste } from "@/components/lfjmq/Blocs";
import { MENEUSES_ATTAQUE, MENEUSES_MONTICULE } from "@/lib/lfjmq-saison";

export const metadata: Metadata = { title: { absolute: "Meneuses 2026 | LFJMQ" }, description: "Les meneuses de la saison 2026 de la LFJMQ à l'attaque et au monticule." };

export default function MeneusesPage() {
  return (
    <section className="band">
      <div className="wrap">
        <div className="head">
          <h1>Meneuses 2026</h1>
          <small>Joueuses qualifiées selon GameChanger · saison complète</small>
        </div>
        <div className="split">
          <h2 className="grp">À l&apos;attaque</h2>
          {MENEUSES_ATTAQUE.map((m) => (
            <Liste key={m.titre} m={m} />
          ))}
          <h2 className="grp">Au monticule</h2>
          <div className="callout">
            <b>1,34 · 82 RB · 0,86</b>
            <span>Beatrice Vezina (Golden Crown) termine première de la ligue pour la moyenne de points mérités, les retraits au bâton et le WHIP.</span>
          </div>
          {MENEUSES_MONTICULE.map((m) => (
            <Liste key={m.titre} m={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
