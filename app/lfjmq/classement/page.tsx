import type { Metadata } from "next";
import { Classement, jour } from "@/components/lfjmq/Blocs";
import { donneesLfjmq } from "@/lib/lfjmq";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Classement | LFJMQ" } };

export default async function ClassementPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const d = await donneesLfjmq((await searchParams).demo === "1");
  return (
    <>
      <section className="lf-titre-page">
        <div className="lf-wrap">
          <h1>Classement</h1>
          <p>PJ : parties jouées · V : victoires · D : défaites · N : nulles · PTS : points.</p>
        </div>
      </section>
      <section className="lf-bloc lf-bloc-bleu">
        <div className="lf-wrap">
          {d.divisions.length === 0 ? <p className="lf-vide">Le classement sera publié dès les premiers matchs.</p> : <Classement divisions={d.divisions} />}
          {d.maj && d.divisions.length > 0 && <p className="lf-maj">Mis à jour le {jour(d.maj.slice(0, 10))}</p>}
          {d.lienClassement && (
            <p className="lf-lien-externe">
              <a href={d.lienClassement} target="_blank" rel="noopener noreferrer">
                Classement complet sur GameChanger →
              </a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
