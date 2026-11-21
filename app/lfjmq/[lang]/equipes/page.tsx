import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bouclier } from "@/components/lfjmq/Blocs";
import { D, estLang, metaPage } from "@/lib/lfjmq-i18n";
import { EQUIPES_D1 } from "@/lib/lfjmq-saison";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return estLang(lang) ? metaPage(lang, "equipes") : {};
}

export default async function EquipesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!estLang(lang)) notFound();
  const d = D[lang].equipes;

  return (
    <section className="band">
      <div className="wrap">
        <div className="head">
          <h1>{d.titre}</h1>
          <small>{d.sous}</small>
        </div>
        <div className="tgrid">
          {EQUIPES_D1.map((t) => (
            <article key={t.nom} className={`tm${t.champ ? " champ" : ""}`}>
              {t.champ && <span className="badge">{d.champ}</span>}
              <header>
                <Bouclier sigle={t.sigle} champ={t.champ} />
                <div>
                  <h3>{t.nom}</h3>
                  <span className="rk">{d.rang(t.rang)}</span>
                </div>
              </header>
              <div className="rec">
                <div>
                  <b>
                    {t.v}-{t.d}-{t.n}
                  </b>
                  <span>{d.vdn}</span>
                </div>
                <div>
                  <b>{t.pct}</b>
                  <span>PCT</span>
                </div>
              </div>
              <dl>
                <div>
                  <dt>{d.pm}</dt>
                  <dd>{t.pm}</dd>
                </div>
                <div>
                  <dt>{d.bat}</dt>
                  <dd>
                    {t.bat[0]} · <span style={{ fontWeight: 400 }}>{t.bat[1][lang]}</span>
                  </dd>
                </div>
                <div>
                  <dt>{d.pit}</dt>
                  <dd>
                    {t.pit[0]} · <span style={{ fontWeight: 400 }}>{t.pit[1][lang]}</span>
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
