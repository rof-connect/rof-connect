import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Liste } from "@/components/lfjmq/Blocs";
import { D, estLang, metaPage } from "@/lib/lfjmq-i18n";
import { MENEUSES_ATTAQUE, MENEUSES_MONTICULE } from "@/lib/lfjmq-saison";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return estLang(lang) ? metaPage(lang, "meneuses") : {};
}

export default async function MeneusesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!estLang(lang)) notFound();
  const d = D[lang].meneuses;

  return (
    <section className="band">
      <div className="wrap">
        <div className="head">
          <h1>{d.titre}</h1>
          <small>{d.sous}</small>
        </div>
        <div className="split">
          <h2 className="grp">{d.attaque}</h2>
          {MENEUSES_ATTAQUE.map((m) => (
            <Liste key={m.titre.fr} m={m} lang={lang} />
          ))}
          <h2 className="grp">{d.monticule}</h2>
          <div className="callout">
            <b>{d.callout}</b>
            <span>{d.calloutTexte}</span>
          </div>
          {MENEUSES_MONTICULE.map((m) => (
            <Liste key={m.titre.fr} m={m} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}
