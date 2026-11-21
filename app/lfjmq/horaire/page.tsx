import type { Metadata } from "next";
import { CalendrierGameChanger } from "@/components/site-v2/CalendrierGameChanger";
import { donneesLfjmq } from "@/lib/lfjmq";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Horaire | LFJMQ" } };

export default async function HorairePage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const d = await donneesLfjmq((await searchParams).demo === "1");
  return (
    <>
      <section className="lf-titre-page">
        <div className="lf-wrap">
          <h1>Horaire</h1>
          <p>Les matchs de la saison, mis à jour automatiquement par GameChanger.</p>
        </div>
      </section>
      <section className="lf-bloc">
        <div className="lf-wrap">
          {d.widgetId ? <CalendrierGameChanger widgetId={d.widgetId} /> : <p className="lf-vide">L&apos;horaire de la saison sera publié ici bientôt.</p>}
          {d.lienHoraire && (
            <p className="lf-lien-externe">
              <a href={d.lienHoraire} target="_blank" rel="noopener noreferrer">
                Voir l&apos;horaire complet sur GameChanger →
              </a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
