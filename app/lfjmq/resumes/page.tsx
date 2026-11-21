import type { Metadata } from "next";
import { ListeResumes } from "@/components/lfjmq/Blocs";
import { donneesLfjmq } from "@/lib/lfjmq";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Résumés des matchs | LFJMQ" } };

export default async function ResumesPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const d = await donneesLfjmq((await searchParams).demo === "1");
  const resumes = [...d.resumes].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <section className="lf-titre-page">
        <div className="lf-wrap">
          <h1>Résumés des matchs</h1>
          <p>Le récit de chaque rencontre, en français.</p>
        </div>
      </section>
      <section className="lf-bloc">
        <div className="lf-wrap">{resumes.length === 0 ? <p className="lf-vide">Les résumés des matchs seront publiés ici après chaque rencontre.</p> : <ListeResumes resumes={resumes} />}</div>
      </section>
    </>
  );
}
