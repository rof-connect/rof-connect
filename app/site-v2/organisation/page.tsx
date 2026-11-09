import Link from "next/link";
import { Cadre } from "@/components/site-v2/Cadre";
import { Organisation } from "@/components/site-v2/Organisation";
import { CONTENU, sportDe } from "@/lib/site-v2/donnees";
import { chargerEntraineurs } from "@/lib/site-v2/personnel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Organisation — Royal On Field" };

export default async function OrganisationPage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const sport = sportDe((await searchParams).sport);
  const entraineurs = await chargerEntraineurs(sport);
  const c = CONTENU[sport];

  return (
    <Cadre sport={sport}>
      <section className="roster-hero">
        <div className="wrap">
          <Link className="retour" href={`/site-v2?sport=${sport}`}>
            ← Accueil {c.mot.toLowerCase()}
          </Link>
          <div className="kicker">Royal {c.mot} On Field · Repentigny, QC</div>
          <h1>Organisation</h1>
        </div>
      </section>
      <Organisation sport={sport} entraineurs={entraineurs} />
    </Cadre>
  );
}
