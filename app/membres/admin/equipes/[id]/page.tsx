import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { archiverEquipe, desarchiverEquipe, modifierEquipe } from "../actions";
import { ajouterAEquipe, changerStatut, retirerDeEquipe } from "../../joueurs/actions";
import { chargerArchivees } from "@/lib/joueuses-archivees";

const LABEL_OPTION: Record<string, string> = {
  ete: "Été",
  automne: "Automne",
  academie: "Académie",
  voyage: "Voyage",
  pses: "PSES",
  cla: "CLA",
};

const STATUTS = [
  { id: 1, nom: "Prospect" },
  { id: 2, nom: "9U" },
  { id: 3, nom: "10U" },
  { id: 4, nom: "11U" },
  { id: 5, nom: "12U" },
  { id: 6, nom: "13U" },
  { id: 7, nom: "14U" },
  { id: 8, nom: "15U" },
  { id: 9, nom: "16U" },
  { id: 10, nom: "17U" },
  { id: 11, nom: "18U" },
];

const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte";
const etiquette = "mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris";

export default async function EquipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  type EquipeFiche = {
    id: string;
    name: string;
    sport: string;
    season_year: number;
    option: string | null;
    archived: boolean;
    visible_public?: boolean;
    roster_public?: boolean | null;
    gamechanger_widget_id?: string | null;
    gamechanger_url?: string | null;
    niveau_competition?: string | null;
    ordre_affichage?: number | null;
    nom_public?: string | null;
    description_publique?: string | null;
  };
  // Avec les champs du site public (migration 0009) ; sinon sans eux (la migration n'est pas encore appliquée).
  const complet = await supabase
    .from("teams")
    .select("id, name, sport, season_year, option, archived, visible_public, roster_public, gamechanger_widget_id, gamechanger_url, niveau_competition, ordre_affichage, nom_public, description_publique")
    .eq("id", id)
    .maybeSingle();
  const migre = !complet.error;
  const equipe: EquipeFiche | null = migre
    ? (complet.data as EquipeFiche | null)
    : ((await supabase.from("teams").select("id, name, sport, season_year, option, archived").eq("id", id).maybeSingle()).data as EquipeFiche | null);
  if (!equipe) notFound();

  const { data: membres } = await supabase
    .from("team_members")
    .select("id, profile_id, role_in_team, status_id, profiles (full_name)")
    .eq("team_id", id);
  const archivees = await chargerArchivees();

  const nomDe = (m: NonNullable<typeof membres>[number]) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return p?.full_name ?? "—";
  };
  const joueuses = (membres ?? []).filter((m) => m.role_in_team === "athlete").sort((a, b) => nomDe(a).localeCompare(nomDe(b)));
  const entraineurs = (membres ?? []).filter((m) => m.role_in_team === "coach").sort((a, b) => nomDe(a).localeCompare(nomDe(b)));

  // Joueuses qu'on peut ajouter : membres inscrits pas encore dans cette équipe.
  const dejaDedans = new Set((membres ?? []).map((m) => m.profile_id));
  const { data: tous } = await supabase.from("profiles").select("id, full_name").eq("role", "member");
  const disponibles = (tous ?? [])
    .filter((p) => !dejaDedans.has(p.id) && !archivees.has(p.id))
    .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-10">
      <div>
        <Link href="/membres/admin" className="text-sm text-rof-poudre underline">
          ← Direction
        </Link>
        <p className="mt-3 font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Équipe</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">{equipe.name}</h1>
        <p className="text-sm text-rof-gris">
          {equipe.sport} · saison {equipe.season_year}
          {equipe.option ? ` · ${LABEL_OPTION[equipe.option] ?? equipe.option}` : ""}
          {equipe.archived ? " · archivée" : ""}
        </p>
      </div>

      <form action={modifierEquipe} className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <input type="hidden" name="team_id" value={equipe.id} />
        <p className="font-condensed text-sm font-bold uppercase tracking-wide text-rof-gris">Modifier l&apos;équipe</p>
        <div>
          <p className={etiquette}>Nom</p>
          <input name="name" required defaultValue={equipe.name} className={champ} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={etiquette}>Saison</p>
            <input name="season_year" type="number" defaultValue={equipe.season_year} className={champ} />
          </div>
          <div>
            <p className={etiquette}>Option</p>
            <select name="option" defaultValue={equipe.option ?? ""} className={champ}>
              <option value="">— Aucune —</option>
              {Object.entries(LABEL_OPTION).map(([valeur, label]) => (
                <option key={valeur} value={valeur}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {migre ? (
          <fieldset className="flex flex-col gap-3 rounded-lg border border-rof-ligne p-3">
            <legend className="px-1 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-or">Site public</legend>
            <input type="hidden" name="champs_publics" value="1" />
            <label className="flex items-center gap-2 text-sm text-rof-texte">
              <input type="checkbox" name="visible_public" defaultChecked={equipe.visible_public ?? false} className="h-4 w-4" />
              Visible sur le site public
            </label>
            <label className="flex items-center gap-2 text-sm text-rof-texte">
              <input type="checkbox" name="roster_public" defaultChecked={equipe.roster_public === true} className="h-4 w-4" />
              Afficher le roster (liste des joueuses) sur la page de l&apos;équipe
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className={etiquette}>Nom affiché (ex. 14U)</p>
                <input name="nom_public" maxLength={40} defaultValue={equipe.nom_public ?? ""} placeholder="Déduit du nom si vide" className={champ} />
              </div>
              <div>
                <p className={etiquette}>Ordre (petit = en premier)</p>
                <input name="ordre_affichage" type="number" defaultValue={equipe.ordre_affichage ?? ""} className={champ} />
              </div>
            </div>
            <div>
              <p className={etiquette}>Widget GameChanger (identifiant du calendrier, facultatif)</p>
              <input name="gamechanger_widget_id" defaultValue={equipe.gamechanger_widget_id ?? ""} placeholder="ex. 7995b8d4-b175-40db-9190-7719a306837c" className={champ} />
            </div>
            <div>
              <p className={etiquette}>Lien de l&apos;équipe sur GameChanger (bouton, facultatif)</p>
              <input name="gamechanger_url" defaultValue={equipe.gamechanger_url ?? ""} placeholder="https://web.gc.com/teams/…" className={champ} />
            </div>
            <div>
              <p className={etiquette}>Niveau de compétition (étiquette sur la carte de l'équipe ; facultatif)</p>
              <select name="niveau_competition" defaultValue={["NATIONAL", "SCOUT TEAM"].includes(equipe.niveau_competition ?? "") ? (equipe.niveau_competition ?? "") : ""} className={champ}>
                <option value="">Aucune étiquette</option>
                <option value="NATIONAL">NATIONAL</option>
                <option value="SCOUT TEAM">SCOUT TEAM</option>
              </select>
            </div>
            <div>
              <p className={etiquette}>Description courte (facultatif)</p>
              <textarea name="description_publique" maxLength={240} rows={2} defaultValue={equipe.description_publique ?? ""} className={champ} />
            </div>
          </fieldset>
        ) : (
          <p className="rounded-lg border border-dashed border-rof-ligne p-3 text-xs text-rof-gris">
            Site public : appliquer la migration 0009 dans Supabase pour choisir les équipes visibles.
          </p>
        )}
        <div className="flex items-center gap-4">
          <button type="submit" className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white">
            Enregistrer
          </button>
        </div>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-texte">Joueuses ({joueuses.length})</h2>
        {joueuses.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-3">
            <Link href={`/membres/admin/joueurs?id=${m.profile_id}`} className="font-semibold text-rof-texte underline decoration-rof-or">
              {nomDe(m)}
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <form action={changerStatut} className="flex items-center gap-1">
                <input type="hidden" name="team_member_id" value={m.id} />
                <select name="status_id" defaultValue={m.status_id} className="rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-xs text-rof-texte">
                  {STATUTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
                <button type="submit" className="text-xs text-rof-poudre underline">
                  Statut
                </button>
              </form>
              <form action={retirerDeEquipe}>
                <input type="hidden" name="team_member_id" value={m.id} />
                <button type="submit" className="text-xs text-rof-rouge underline">
                  Retirer
                </button>
              </form>
            </div>
          </div>
        ))}
        {joueuses.length === 0 && <p className="text-sm text-rof-gris">Aucune joueuse dans cette équipe.</p>}

        {disponibles.length > 0 && (
          <form action={ajouterAEquipe} className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-rof-or p-3">
            <input type="hidden" name="team_id" value={equipe.id} />
            <select name="profile_id" className={`${champ} min-w-0 flex-1`}>
              {disponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? "—"}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white">
              + Ajouter
            </button>
          </form>
        )}
      </section>

      {entraineurs.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-texte">Entraîneurs ({entraineurs.length})</h2>
          <div className="flex flex-wrap gap-1.5">
            {entraineurs.map((m) => (
              <span key={m.id} className="rounded-full bg-rof-craie px-2.5 py-1 text-xs text-rof-texte">
                {nomDe(m)}
              </span>
            ))}
          </div>
        </section>
      )}

      <form action={equipe.archived ? desarchiverEquipe : archiverEquipe}>
        <input type="hidden" name="team_id" value={equipe.id} />
        <button type="submit" className="text-sm text-rof-gris underline">
          {equipe.archived ? "Désarchiver l'équipe" : "Archiver l'équipe"}
        </button>
      </form>
    </main>
  );
}
