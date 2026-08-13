import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { creerEquipe, archiverEquipe, desarchiverEquipe } from "./actions";

export default async function GestionEquipesPage({
  searchParams,
}: {
  searchParams: Promise<{ archives?: string }>;
}) {
  const { archives } = await searchParams;
  const voirArchives = archives === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data: org } = await supabase.from("organizations").select("id, name").limit(1).single();
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, sport, season_year, archived")
    .eq("archived", voirArchives)
    .order("name");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10">
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Gestion des équipes</h1>

      {!voirArchives && (
        <form action={creerEquipe} className="mt-6 flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
          <input type="hidden" name="org_id" value={org?.id ?? ""} />
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Nom de l&apos;équipe</p>
            <input
              name="name"
              required
              placeholder="Ex. : Softball 14U — Di Peco"
              className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Sport</p>
              <select name="sport" required className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
                <option value="baseball">Baseball</option>
                <option value="softball">Softball</option>
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Saison</p>
              <input
                name="season_year"
                type="number"
                defaultValue={new Date().getFullYear()}
                className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-1 w-fit rounded-lg bg-rof-or px-4 py-2 text-sm font-bold uppercase tracking-wide text-white"
          >
            Créer l&apos;équipe
          </button>
        </form>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-condensed text-lg font-bold uppercase tracking-wide text-rof-poudre">
          {voirArchives ? "Équipes archivées" : "Équipes actives"}
        </h2>
        <Link href={voirArchives ? "/membres/admin/equipes" : "/membres/admin/equipes?archives=1"} className="text-sm text-rof-poudre underline">
          {voirArchives ? "← Retour aux équipes actives" : "Voir les archives →"}
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {(teams ?? []).map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-rof-ligne bg-rof-blanc p-4"
          >
            <div>
              <p className="font-condensed text-lg font-semibold uppercase text-rof-texte">{t.name}</p>
              <p className="text-sm text-rof-gris">
                {t.sport} · saison {t.season_year}
              </p>
            </div>
            {voirArchives ? (
              <form action={desarchiverEquipe}>
                <input type="hidden" name="team_id" value={t.id} />
                <button type="submit" className="text-sm text-rof-poudre underline">
                  Désarchiver
                </button>
              </form>
            ) : (
              <form action={archiverEquipe}>
                <input type="hidden" name="team_id" value={t.id} />
                <button type="submit" className="text-sm text-rof-gris underline">
                  Archiver
                </button>
              </form>
            )}
          </div>
        ))}
        {(teams ?? []).length === 0 && (
          <p className="text-sm text-rof-gris">
            {voirArchives ? "Aucune équipe archivée." : "Aucune équipe active."}
          </p>
        )}
      </div>
    </main>
  );
}
