import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calculer, resumeTexte } from "@/lib/parcours/calcul";
import { majDemandeParcours } from "./actions";

const STATUTS = [
  ["nouveau", "Nouveau"],
  ["contacté", "Contacté"],
  ["rencontre", "Rencontre"],
  ["client", "Client"],
  ["clos", "Clos"],
];

type Demande = {
  id: string;
  created_at: string;
  reponses: Record<string, unknown>;
  resultat: { repere?: number; candidats?: string[] };
  courriel_envoye_le: string | null;
  erreur: string | null;
  statut: string;
  notes: string | null;
};

export default async function ParcoursAdminPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut = "" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data } = await supabase.from("parcours_demandes").select("*").order("created_at", { ascending: false });
  const toutes = (data ?? []) as Demande[];
  const demandes = statut ? toutes.filter((d) => d.statut === statut) : toutes;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Questionnaires de parcours</h1>
        <p className="mt-2 text-sm text-rof-gris">
          Réponses reçues par la page publique{" "}
          <Link href="/parcours" className="text-rof-poudre underline">
            /parcours
          </Link>
          . Les renseignements sont conservés 12 mois (à confirmer).
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/membres/admin/parcours" className={`rounded-full border px-3 py-1 ${!statut ? "border-rof-or text-rof-or" : "border-rof-ligne text-rof-gris"}`}>
          Tous ({toutes.length})
        </Link>
        {STATUTS.map(([v, l]) => (
          <Link
            key={v}
            href={`/membres/admin/parcours?statut=${encodeURIComponent(v)}`}
            className={`rounded-full border px-3 py-1 ${statut === v ? "border-rof-or text-rof-or" : "border-rof-ligne text-rof-gris"}`}
          >
            {l} ({toutes.filter((d) => d.statut === v).length})
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {demandes.map((d) => {
          const rep = d.reponses as Record<string, string>;
          const r = calculer(rep as never, new Date(d.created_at));
          const resume = r ? resumeTexte(rep as never, r) : "";
          return (
            <div key={d.id} className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-condensed text-lg font-bold uppercase text-rof-texte">
                  {rep.prenom} {rep.nom}
                </p>
                <p className="text-xs text-rof-gris">{new Date(d.created_at).toLocaleDateString("fr-CA")}</p>
              </div>
              <p className="text-sm text-rof-gris">
                Date repère : automne {d.resultat?.repere ?? "—"} · Parcours : {(d.resultat?.candidats ?? []).join(", ") || "—"}
              </p>
              <p className="text-sm text-rof-gris">
                {rep.parent || "Parent"} · <a href={`mailto:${rep.courrielParent}`} className="text-rof-poudre underline">{rep.courrielParent}</a>
                {rep.telephone ? ` · ${rep.telephone}` : ""}
              </p>
              {d.erreur && <p className="mt-1 text-sm text-rof-rouge">Courriel non envoyé : {d.erreur} — renvoyer le bilan à la main.</p>}
              {!d.erreur && !d.courriel_envoye_le && <p className="mt-1 text-sm text-rof-gris">Envoi du bilan en cours ou non confirmé.</p>}

              {resume && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-semibold text-rof-poudre">Voir le détail des réponses</summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-rof-craie p-3 text-xs text-rof-texte">{resume}</pre>
                </details>
              )}

              <form action={majDemandeParcours} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="id" value={d.id} />
                <div className="flex items-center gap-2">
                  <select name="statut" defaultValue={d.statut} className="rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-sm text-rof-texte">
                    {STATUTS.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="text-sm text-rof-poudre underline">
                    Enregistrer
                  </button>
                </div>
                <textarea
                  name="notes"
                  defaultValue={d.notes ?? ""}
                  placeholder="Notes de suivi…"
                  className="min-h-16 w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte placeholder:text-rof-gris/60"
                />
              </form>
            </div>
          );
        })}
        {demandes.length === 0 && <p className="text-sm text-rof-gris">Aucune demande pour le moment.</p>}
      </div>
    </main>
  );
}
