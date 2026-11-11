import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { chargerConnexions, ilYa } from "@/lib/dernieres-connexions";
import { bouton } from "@/components/ui/boutons";

export const dynamic = "force-dynamic";

const ROLES: Record<string, string> = { admin: "Direction", coach: "Entraîneur", member: "Membre" };

export default async function ConnexionsPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role: filtre } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: moi } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (moi?.role !== "admin") redirect("/membres");

  const toutes = await chargerConnexions();
  const lignes = toutes.filter((l) => !filtre || l.role === filtre);

  const jamais = lignes.filter((l) => !l.vue).length;
  const chip = (valeur: string | undefined, label: string) => (
    <Link
      href={valeur ? `/membres/admin/connexions?role=${valeur}` : "/membres/admin/connexions"}
      className={`rounded-full border px-3 py-1 text-xs ${filtre === valeur || (!filtre && !valeur) ? "border-rof-or text-rof-or" : "border-rof-ligne text-rof-gris"}`}
    >
      {label}
    </Link>
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-10">
      <div>
        <Link href="/membres/admin" className={bouton("secondaire")}>
          ← Direction
        </Link>
        <h1 className="mt-3 font-condensed text-3xl font-bold uppercase text-rof-texte">Dernières connexions</h1>
        <p className="text-sm text-rof-gris">
          {lignes.length} compte{lignes.length > 1 ? "s" : ""} · {jamais} jamais connecté{jamais > 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {chip(undefined, "Tous")}
        {chip("member", "Membres")}
        {chip("coach", "Entraîneurs")}
        {chip("admin", "Direction")}
      </div>

      <ul className="flex flex-col gap-2">
        {lignes.map((l) => {
          const d = l.vue ? new Date(l.vue) : null;
          return (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-3">
              <div className="min-w-0">
                <Link href={`/membres/admin/joueurs?id=${l.id}`} className="font-semibold text-rof-texte hover:text-rof-or">
                  {l.nom || l.courriel || "—"}
                </Link>
                <span className="ml-2 rounded-md bg-rof-craie px-1.5 py-0.5 text-xs text-rof-gris">{ROLES[l.role] ?? l.role}</span>
              </div>
              <div className="text-right text-sm">
                {d ? (
                  <>
                    <span className="text-rof-texte">{ilYa(l.vue!)}</span>
                    <span className="block text-xs text-rof-gris">
                      {d.toLocaleString("fr-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" })}
                    </span>
                  </>
                ) : (
                  <span className="text-rof-rouge">Jamais connecté</span>
                )}
              </div>
            </li>
          );
        })}
        {lignes.length === 0 && <li className="text-sm text-rof-gris">Aucun compte.</li>}
      </ul>
    </main>
  );
}
