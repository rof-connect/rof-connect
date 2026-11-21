import type { Metadata } from "next";
import { Bouclier } from "@/components/lfjmq/Blocs";
import { EQUIPES_D1 } from "@/lib/lfjmq-saison";

export const metadata: Metadata = { title: { absolute: "Équipes | LFJMQ" }, description: "Les cinq équipes de la Division 1 de la LFJMQ : fiche 2026, meneuses au bâton et au monticule." };

export default function EquipesPage() {
  return (
    <section className="band">
      <div className="wrap">
        <div className="head">
          <h1>Équipes</h1>
          <small>Division 1 · fiche 2026</small>
        </div>
        <div className="tgrid">
          {EQUIPES_D1.map((t) => (
            <article key={t.nom} className={`tm${t.champ ? " champ" : ""}`}>
              {t.champ && <span className="badge">Championnes 2026</span>}
              <header>
                <Bouclier sigle={t.sigle} champ={t.champ} />
                <div>
                  <h3>{t.nom}</h3>
                  <span className="rk">
                    {t.rang}
                    <sup>{t.rang === 1 ? "re" : "e"}</sup> au classement
                  </span>
                </div>
              </header>
              <div className="rec">
                <div>
                  <b>
                    {t.v}-{t.d}-{t.n}
                  </b>
                  <span>V-D-N</span>
                </div>
                <div>
                  <b>{t.pct}</b>
                  <span>PCT</span>
                </div>
              </div>
              <dl>
                <div>
                  <dt>Points marqués</dt>
                  <dd>{t.pm}</dd>
                </div>
                <div>
                  <dt>Au bâton</dt>
                  <dd>
                    {t.bat[0]} · <span style={{ fontWeight: 400 }}>{t.bat[1]}</span>
                  </dd>
                </div>
                <div>
                  <dt>Au monticule</dt>
                  <dd>
                    {t.pit[0]} · <span style={{ fontWeight: 400 }}>{t.pit[1]}</span>
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
