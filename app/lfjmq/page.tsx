import Image from "next/image";
import Link from "next/link";
import { CalendrierGameChanger } from "@/components/site-v2/CalendrierGameChanger";
import { Classement, jour, ListeResumes } from "@/components/lfjmq/Blocs";
import { donneesLfjmq } from "@/lib/lfjmq";

export const dynamic = "force-dynamic";

export default async function AccueilLigue({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = (await searchParams).demo === "1";
  const q = demo ? "?demo=1" : "";
  const d = await donneesLfjmq(demo);
  const derniers = [...d.resumes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <>
      <section className="lf-hero">
        <div className="lf-wrap lf-hero-grille">
          <div>
            <p className="lf-kicker">Fastpitch junior · Québec</p>
            <h1>
              Ligue Fastpitch
              <br />
              Junior Majeur
              <br />
              <span>du Québec</span>
            </h1>
            <p className="lf-lead">L&apos;horaire des matchs, le classement et le résumé de chaque rencontre, au même endroit.</p>
            <div className="lf-boutons">
              <Link className="lf-btn lf-btn-jaune" href={`/lfjmq/horaire${q}`}>
                Voir l&apos;horaire
              </Link>
              <Link className="lf-btn lf-btn-contour" href={`/lfjmq/classement${q}`}>
                Le classement
              </Link>
            </div>
          </div>
          <div className="lf-logo-rond">
            <Image src="/partenaires/n-lfjmq.png" alt="Logo de la LFJMQ" width={320} height={320} priority />
          </div>
        </div>
      </section>

      <section className="lf-bloc" aria-labelledby="t-horaire">
        <div className="lf-wrap">
          <div className="lf-tete">
            <h2 id="t-horaire">Prochains matchs</h2>
            <Link href={`/lfjmq/horaire${q}`}>Tout l&apos;horaire →</Link>
          </div>
          {d.widgetId ? <CalendrierGameChanger widgetId={d.widgetId} /> : <p className="lf-vide">L&apos;horaire de la saison sera publié ici bientôt.</p>}
        </div>
      </section>

      <section className="lf-bloc lf-bloc-bleu" aria-labelledby="t-classement">
        <div className="lf-wrap">
          <div className="lf-tete">
            <h2 id="t-classement">Classement</h2>
            <Link href={`/lfjmq/classement${q}`}>Classement complet →</Link>
          </div>
          {d.divisions.length === 0 ? <p className="lf-vide">Le classement sera publié dès les premiers matchs.</p> : <Classement divisions={d.divisions} limite={5} />}
          {d.maj && d.divisions.length > 0 && <p className="lf-maj">Mis à jour le {jour(d.maj.slice(0, 10))}</p>}
        </div>
      </section>

      <section className="lf-bloc" aria-labelledby="t-resumes">
        <div className="lf-wrap">
          <div className="lf-tete">
            <h2 id="t-resumes">Derniers résumés</h2>
            <Link href={`/lfjmq/resumes${q}`}>Tous les résumés →</Link>
          </div>
          {derniers.length === 0 ? <p className="lf-vide">Les résumés des matchs seront publiés ici après chaque rencontre.</p> : <ListeResumes resumes={derniers} />}
        </div>
      </section>
    </>
  );
}
