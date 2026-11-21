import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { D, MAIL, adresse, estLang, metaPage } from "@/lib/lfjmq-i18n";
import { DIVISIONS } from "@/lib/lfjmq-saison";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return estLang(lang) ? metaPage(lang, "inscription") : {};
}

export default async function InscriptionPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!estLang(lang)) notFound();
  const d = D[lang].inscription;
  const mailto = `mailto:${MAIL}?subject=${encodeURIComponent(lang === "fr" ? "Inscription LFJMQ 2027" : "LFJMQ 2027 registration")}`;

  return (
    <>
      <section className="reg-hero">
        <div className="wrap">
          <p className="chip">{d.chip}</p>
          <h1>{d.titre}</h1>
          <p className="reg-lead">{d.lead}</p>
          <div className="btns">
            <a className="btn gold" href={mailto}>
              {d.demander}
            </a>
            <Link className="btn line" href={adresse(lang, "divisions")}>
              {d.voirDivisions}
            </Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="head">
            <h2>{d.regionsTitre}</h2>
            <small>{d.regionsSous}</small>
          </div>
          <ul className="regions">
            {d.regions.map((r) => (
              <li key={r.nom}>
                <b>{r.nom}</b>
                <span>{r.texte}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band divs">
        <div className="wrap">
          <div className="head">
            <h2>{d.divisionsTitre}</h2>
            <small>{d.divisionsSous}</small>
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
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="head">
            <h2>{d.formulesTitre}</h2>
          </div>
          <div className="formules">
            {d.formules.map((f, i) => (
              <article key={f.nom}>
                <span className="n" aria-hidden>
                  {i + 1}
                </span>
                <h3>{f.nom}</h3>
                <p>{f.texte}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band join">
        <div className="wrap grid">
          <div>
            <h2>{d.calendrierTitre}</h2>
            <ul className="cal">
              {d.calendrier.map((c) => (
                <li key={c.quand}>
                  <b>{c.quand}</b>
                  {c.quoi}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{d.etapesTitre}</h2>
            <ol className="etapes">
              {d.etapes.map((e) => (
                <li key={e.titre}>
                  <b>{e.titre}</b>
                  <span>{e.texte}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="reg-final">
        <div className="wrap">
          <h2>{d.finalTitre}</h2>
          <p>{d.finalTexte}</p>
          <div className="btns">
            <a className="btn gold" href={mailto}>
              {d.demander}
            </a>
          </div>
          <p className="reg-mail">{MAIL}</p>
        </div>
      </section>
    </>
  );
}
