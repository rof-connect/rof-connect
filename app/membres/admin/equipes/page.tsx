import { redirect } from "next/navigation";
import { trierEquipes } from "@/lib/equipes";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { creerEquipe, creerGroupe, archiverEquipe, desarchiverEquipe } from "./actions";
import { chargerGroupes } from "@/lib/groupes";
import { sportAdmin } from "@/lib/sport-admin";
import { SelecteurSportAdmin } from "@/components/membres/SelecteurSportAdmin";
import { bouton } from "@/components/ui/boutons";

const LABEL_OPTION: Record<string, string> = {
  ete: "Été",
  automne: "Automne",
  academie: "Académie",
  voyage: "Voyage",
  pses: "PSES",
  cla: "CLA",
};

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
  const { data: teamsBrut } = await supabase
    .from("teams")
    .select("id, name, sport, season_year, option, archived")
    .eq("archived", voirArchives);
  const groupes = await chargerGroupes();
  const tousLesTeams = trierEquipes(teamsBrut);
  const teams = tousLesTeams.filter((t) => !groupes.has(t.id));
  const groupesListe = tousLesTeams.filter((t) => groupes.has(t.id));

  const teamIds = tousLesTeams.map((t) => t.id);
  const { data: joueuses } = await supabase
    .from("team_members")
    .select("team_id, profiles (full_name)")
    .eq("role_in_team", "athlete")
    .in("team_id", teamIds.length ? teamIds : ["00000000-0000-0000-0000-000000000000"]);

  const joueusesParEquipe = new Map<string, string[]>();
  (joueuses ?? []).forEach((j) => {
    const p = Array.isArray(j.profiles) ? j.profiles[0] : j.profiles;
    const liste = joueusesParEquipe.get(j.team_id) ?? [];
    liste.push(p?.full_name ?? "—");
    joueusesParEquipe.set(j.team_id, liste);
  });

  const sportFiltre = await sportAdmin();
  const equipesParSport = {
    baseball: sportFiltre === "softball" ? [] : (teams ?? []).filter((t) => t.sport === "baseball"),
    softball: sportFiltre === "baseball" ? [] : (teams ?? []).filter((t) => t.sport === "softball"),
  };
  const groupesVisibles = groupesListe.filter((g) => !sportFiltre || g.sport === sportFiltre);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10">
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Gestion des équipes</h1>
      <div className="mt-3">
        <SelecteurSportAdmin actif={sportFiltre} retour="/membres/admin/equipes" />
      </div>

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
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Option</p>
            <select name="option" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
              <option value="">— Aucune —</option>
              {Object.entries(LABEL_OPTION).map(([valeur, label]) => (
                <option key={valeur} value={valeur}>{label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className={`${bouton("primaire", "md")} mt-1`}
          >
            Créer l&apos;équipe
          </button>
        </form>
      )}

      {!voirArchives && (
        <details className="mt-4 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
          <summary className="cursor-pointer font-condensed text-sm font-bold uppercase tracking-wide text-rof-poudre">Créer un groupe (non affiché comme équipe)</summary>
          <p className="mt-2 text-xs text-rof-gris">
            Un groupe sert aux entraînements, à la communication ou aux événements spéciaux : il a ses membres, son agenda, ses messages et ses documents, mais il n&apos;apparaît jamais sur le site public ni dans les effectifs.
          </p>
          <form action={creerGroupe} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <input type="hidden" name="org_id" value={org?.id ?? ""} />
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Nom du groupe</p>
              <input name="name" required maxLength={80} placeholder="Ex. : Lanceuses softball, Camp de printemps" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte" />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Sport</p>
              <select name="sport" required defaultValue={sportFiltre || "softball"} className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
                <option value="baseball">Baseball</option>
                <option value="softball">Softball</option>
              </select>
            </div>
            <button type="submit" className={bouton("primaire", "md")}>Créer le groupe</button>
          </form>
        </details>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-condensed text-lg font-bold uppercase tracking-wide text-rof-poudre">
          {voirArchives ? "Équipes archivées" : "Équipes actives"}
        </h2>
        <Link href={voirArchives ? "/membres/admin/equipes" : "/membres/admin/equipes?archives=1"} className={bouton("secondaire")}>
          {voirArchives ? "← Retour aux équipes actives" : "Voir les archives →"}
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-6">
        {([
          ["Baseball", equipesParSport.baseball],
          ["Softball", equipesParSport.softball],
        ] as const).map(([titre, groupe]) =>
          groupe.length > 0 ? (
            <div key={titre}>
              <h3 className="mb-2 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-poudre">{titre}</h3>
              <div className="flex flex-col gap-2">
                {groupe.map((t) => {
                  const liste = joueusesParEquipe.get(t.id) ?? [];
                  return (
                    <div key={t.id} className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link href={`/membres/admin/equipes/${t.id}`} className="font-condensed text-lg font-semibold uppercase text-rof-texte hover:text-rof-or">
                            {t.name}
                          </Link>
                          <p className="text-sm text-rof-gris">
                            saison {t.season_year}
                            {t.option && ` · ${LABEL_OPTION[t.option] ?? t.option}`}
                            {` · ${liste.length} joueuse${liste.length > 1 ? "s" : ""}`}
                          </p>
                        </div>
                        {voirArchives ? (
                          <form action={desarchiverEquipe}>
                            <input type="hidden" name="team_id" value={t.id} />
                            <button type="submit" className={bouton("secondaire")}>
                              Désarchiver
                            </button>
                          </form>
                        ) : (
                          <form action={archiverEquipe}>
                            <input type="hidden" name="team_id" value={t.id} />
                            <button type="submit" className={bouton("neutre")}>
                              Archiver
                            </button>
                          </form>
                        )}
                      </div>
                      {liste.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-rof-ligne pt-3">
                          {liste.sort((a, b) => a.localeCompare(b)).map((nom, i) => (
                            <li
                              key={i}
                              className="rounded-full bg-rof-craie px-2.5 py-1 text-xs text-rof-texte"
                            >
                              {nom}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null,
        )}
        {groupesVisibles.length > 0 && (
          <div>
            <h3 className="mb-2 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-poudre">Groupes (non affichés comme équipes)</h3>
            <div className="flex flex-col gap-2">
              {groupesVisibles.map((t) => {
                const liste = joueusesParEquipe.get(t.id) ?? [];
                return (
                  <div key={t.id} className="rounded-xl border border-dashed border-rof-ligne bg-rof-blanc p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link href={`/membres/admin/equipes/${t.id}`} className="font-condensed text-lg font-semibold uppercase text-rof-texte hover:text-rof-or">
                          {t.name}
                        </Link>
                        <p className="text-sm text-rof-gris">
                          groupe · {t.sport === "baseball" ? "baseball" : "softball"} · {liste.length} joueuse{liste.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      {voirArchives ? (
                        <form action={desarchiverEquipe}>
                          <input type="hidden" name="team_id" value={t.id} />
                          <button type="submit" className={bouton("secondaire")}>Désarchiver</button>
                        </form>
                      ) : (
                        <form action={archiverEquipe}>
                          <input type="hidden" name="team_id" value={t.id} />
                          <button type="submit" className={bouton("neutre")}>Archiver</button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {(teams ?? []).length === 0 && groupesVisibles.length === 0 && (
          <p className="text-sm text-rof-gris">
            {voirArchives ? "Aucune équipe archivée." : "Aucune équipe active."}
          </p>
        )}
      </div>
    </main>
  );
}
