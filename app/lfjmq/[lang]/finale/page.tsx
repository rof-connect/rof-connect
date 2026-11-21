import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { D, estLang, metaPage } from "@/lib/lfjmq-i18n";
import { LIGNES_FINALE } from "@/lib/lfjmq-saison";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return estLang(lang) ? metaPage(lang, "finale") : {};
}

export default async function FinalePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!estLang(lang)) notFound();
  const d = D[lang].finale;

  return (
    <section className="band final">
      <div className="wrap grid">
        <div>
          <div className="head">
            <h1>{d.titre}</h1>
            <small>{d.sous}</small>
          </div>
          <h3>{d.h3}</h3>
          <p className="lead">{d.lead}</p>
          {d.p.map((texte) => (
            <p key={texte.slice(0, 24)}>{texte}</p>
          ))}
          <div className="lines">
            {LIGNES_FINALE.map(([nom, ligne]) => (
              <div key={nom}>
                <b>{nom}</b>
                <span>{ligne[lang]}</span>
              </div>
            ))}
          </div>
        </div>
        <figure>
          <Image src="/lfjmq/finalistes.jpg" alt={d.imgAlt} width={1400} height={1050} sizes="(min-width: 820px) 50vw, 100vw" priority />
          <figcaption>{d.legende}</figcaption>
        </figure>
      </div>
    </section>
  );
}
