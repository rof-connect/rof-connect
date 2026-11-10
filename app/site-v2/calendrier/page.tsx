import type { Metadata } from "next";
import Link from "next/link";
import { Cadre } from "@/components/site-v2/Cadre";
import { CalendrierGameChanger } from "@/components/site-v2/CalendrierGameChanger";
import { CONTENU, sportDe } from "@/lib/site-v2/donnees";
import { chargerEquipesPubliques } from "@/lib/site-v2/equipes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calendrier des équipes — Royal On Field" };

/**
 * Calendrier de toutes les équipes. Chaque équipe affiche son calendrier GameChanger intégré.
 * Pour ajouter un calendrier : gestion des équipes (Direction) → « Widget GameChanger » de l'équipe. Aucun code à modifier.
 */
export default async function CalendrierPage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const sport = sportDe((await searchParams).sport);
  const c = CONTENU[sport];
  const { equipes, source } = await chargerEquipesPubliques(sport);
  const avecCalendrier = equipes.filter((e) => e.gamechanger || e.gamechangerLien).length;

  return (
    <Cadre sport={sport} provisoire={source === "provisoire"}>
      <section className="roster-hero">
        <div className="wrap">
          <Link className="retour" href={`/site-v2?sport=${sport}`}>
            ← Accueil {c.mot.toLowerCase()}
          </Link>
          <div className="kicker">Royal {c.mot} On Field · Saison {c.saison.replace("Saison ", "")}</div>
          <h1>Calendrier</h1>
          <p className="lead">Matchs, résultats et horaires de chaque équipe, mis à jour par GameChanger.</p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 40 }}>
        <div className="wrap">
          {c.calendrier.length > 0 && (
            <div className="cal-tournois">
              <h2>Tournois et événements</h2>
              <p className="cal-note-clair">Dates et lieux à confirmer — mis à jour au fur et à mesure.</p>
              <ul>
                {c.calendrier.map((e) => (
                  <li key={e.t}>
                    <span className="d">
                      <b>{e.m}</b> {e.y}
                    </span>
                    <span className="t">{e.t}</span>
                    <span className="l">{e.p || "Lieu à confirmer"}</span>
                    <span className="g">{e.tag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {equipes.length === 0 ? (
            <div className="empty-clair">
              <h3>Les calendriers seront publiés bientôt.</h3>
              <p>Dès que les équipes {c.mot.toLowerCase()} seront confirmées, leur calendrier apparaîtra ici.</p>
            </div>
          ) : (
            <div className="cal-equipes">
              {equipes.map((e) => (
                <article className="cal-equipe" key={e.id} id={`equipe-${e.id}`}>
                  <header>
                    <h2>{e.nom}</h2>
                    {e.categorie && <span className="team-tag">{e.categorie}</span>}
                    {e.gamechangerLien && (
                      <a className="cal-lien" href={e.gamechangerLien} target="_blank" rel="noopener noreferrer">
                        Toute la saison sur GameChanger →
                      </a>
                    )}
                  </header>
                  {e.gamechanger ? (
                    <div className="gc-boite">
                      <CalendrierGameChanger widgetId={e.gamechanger} />
                    </div>
                  ) : (
                    <p className="cal-vide">{e.gamechangerLien ? "Calendrier intégré à venir : voir le lien GameChanger ci-dessus." : "Calendrier à venir."}</p>
                  )}
                </article>
              ))}
            </div>
          )}
          {equipes.length > 0 && avecCalendrier < equipes.length && (
            <p className="roster-note">Les calendriers manquants s&apos;ajoutent équipe par équipe à mesure qu&apos;ils sont créés.</p>
          )}
        </div>
      </section>
    </Cadre>
  );
}
