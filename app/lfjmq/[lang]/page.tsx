import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { D, MAIL, adresse, estLang, metaPage } from "@/lib/lfjmq-i18n";
import { CHIFFRES, CLASSEMENT_D1, dec } from "@/lib/lfjmq-saison";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return estLang(lang) ? metaPage(lang) : {};
}

export default async function AccueilLigue({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!estLang(lang)) notFound();
  const d = D[lang].accueil;
  void MAIL;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <figure>
            <Image src="/lfjmq/championnes.jpg" alt={d.imgAlt} fill priority sizes="(min-width: 820px) 55vw, 100vw" />
          </figure>
          <div className="txt">
            <span className="tag">{d.tag}</span>
            <h1>{d.h1}</h1>
            <p>{d.resume}</p>
            <div className="score" role="group" aria-label={d.scoreAria}>
              <table>
                <tbody>
                  <tr>
                    {d.scoreCols.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                  <tr className="win">
                    <td>Golden Crown</td>
                    <td>4</td>
                    <td>9</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>Force</td>
                    <td>0</td>
                    <td>3</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="btns">
              <Link className="btn gold" href={adresse(lang, "finale")}>
                {d.btnFinale}
              </Link>
              <a className="btn line" href="#classement">
                {d.btnClassement}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="nums" aria-label={d.chiffresAria}>
        <div className="wrap">
          {CHIFFRES.map(([n, texte]) => (
            <div key={n}>
              <b>{n}</b>
              <span>{texte[lang]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="band" id="classement">
        <div className="wrap">
          <div className="head">
            <h2>{d.classementTitre}</h2>
            <small>{d.classementSous}</small>
          </div>
          <table className="std">
            <thead>
              <tr>
                <th>#</th>
                <th>{d.cols.equipe}</th>
                <th>{d.cols.v}</th>
                <th>{d.cols.d}</th>
                <th>{d.cols.n}</th>
                <th>{d.cols.pct}</th>
                <th>{d.cols.ecart}</th>
                <th className="hide">{d.cols.pm}</th>
              </tr>
            </thead>
            <tbody>
              {CLASSEMENT_D1.map((t, i) => (
                <tr key={t.nom} className={t.champ ? "champ" : undefined}>
                  <td>{i + 1}</td>
                  <td data-champ={d.champions}>{t.nom}</td>
                  <td>{t.v}</td>
                  <td>{t.d}</td>
                  <td>{t.n}</td>
                  <td className="pct">
                    {t.pct}
                    <span className="bar">
                      <i style={{ width: `${parseFloat(t.pct) * 100}%` }} />
                    </span>
                  </td>
                  <td>{dec(lang, t.ecart)}</td>
                  <td className="hide">{t.pm}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note">{d.legende}</p>
        </div>
      </section>

      <section className="band explorer" aria-labelledby="t-explorer">
        <div className="wrap">
          <div className="head">
            <h2 id="t-explorer">{d.explorerTitre}</h2>
          </div>
          <ul className="exp">
            {d.explorer.map((s) => (
              <li key={s.page}>
                <Link href={adresse(lang, s.page)}>
                  <b>{s.titre}</b>
                  <span>{s.texte}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
