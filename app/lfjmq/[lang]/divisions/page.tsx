import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { D, adresse, estLang, metaPage } from "@/lib/lfjmq-i18n";
import { DIVISIONS } from "@/lib/lfjmq-saison";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return estLang(lang) ? metaPage(lang, "divisions") : {};
}

export default async function DivisionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!estLang(lang)) notFound();
  const d = D[lang].divisions;

  return (
    <section className="band divs">
      <div className="wrap">
        <div className="head">
          <h1>{d.titre}</h1>
          <small>{d.sous}</small>
        </div>
        <div className="dgrid">
          {DIVISIONS.map((v, i) => (
            <article key={v.cle} className={`dv${i === 0 ? " on" : ""}`}>
              <span className="dn" aria-hidden>
                {i + 1}
              </span>
              <h3>{v.nom[lang]}</h3>
              <p className="lv">{v.niveau[lang]}</p>
              <ul>
                {v.points[lang].map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {v.lien === "classement" ? <Link href={adresse(lang, undefined, "classement")}>{d.voirClassement}</Link> : <Link href={adresse(lang, "inscription")}>{d.inscrire}</Link>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
