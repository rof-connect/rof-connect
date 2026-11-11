"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import { chargerStatutsJoueuses, statutEffectif } from "@/lib/statuts";
import { verifierSportEquipe } from "@/lib/sport-joueuses";

async function verifierAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

const normaliser = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
/** Clé indépendante de l'ordre des mots : « Dupont Alicia » et « Alicia Dupont » donnent la même clé. */
const cleNom = (s: string) => normaliser(s).split(" ").filter(Boolean).sort().join(" ");

/** Ajoute plusieurs joueuses d'un coup à une équipe ou un groupe (celles dont le sport ne correspond pas sont refusées). */
async function ajouter(teamId: string, ids: string[]) {
  const admin = createAdminClient();
  const statuts = await chargerStatutsJoueuses();
  const { data: dejaDedans } = await admin.from("team_members").select("profile_id").eq("team_id", teamId);
  const deja = new Set((dejaDedans ?? []).map((m) => m.profile_id));
  const aAjouter: { team_id: string; profile_id: string; role_in_team: "athlete"; status_id: number }[] = [];
  let refusees = 0;

  for (const pid of [...new Set(ids)]) {
    if (deja.has(pid)) continue;
    if (await verifierSportEquipe(pid, teamId)) {
      refusees++;
      continue;
    }
    const { data: ses } = await admin.from("team_members").select("status_id").eq("profile_id", pid).eq("role_in_team", "athlete");
    aAjouter.push({ team_id: teamId, profile_id: pid, role_in_team: "athlete", status_id: statutEffectif(pid, statuts, (ses ?? []).map((s) => s.status_id)) });
  }
  if (aAjouter.length) await admin.from("team_members").insert(aAjouter);
  return { ajoutees: aAjouter.length, refusees };
}

/** Cases cochées dans la liste filtrée (nom, statut, date de naissance…). */
export async function ajouterEnLot(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const teamId = String(formData.get("team_id") ?? "");
  const ids = formData.getAll("profile_id").map(String).filter((v) => /^[0-9a-f-]{36}$/i.test(v));
  if (!/^[0-9a-f-]{36}$/i.test(teamId) || ids.length === 0) redirect(`/membres/admin/equipes/${teamId}`);

  const r = (await ajouter(teamId, ids)) ?? { ajoutees: 0, refusees: 0 };
  revalidatePath(`/membres/admin/equipes/${teamId}`);
  revalidatePath("/membres/admin/equipes");
  redirect(`/membres/admin/equipes/${teamId}?lot=${r.ajoutees}&refusees=${r.refusees}`);
}

/** Liste de noms collée (un nom par ligne, dans n'importe quel ordre) : les joueuses reconnues sont ajoutées, les autres sont signalées. */
export async function ajouterParNoms(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const teamId = String(formData.get("team_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(teamId)) return;
  const lignes = String(formData.get("noms") ?? "")
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 300);
  if (lignes.length === 0) redirect(`/membres/admin/equipes/${teamId}`);

  const admin = createAdminClient();
  const [{ data: profils }, archivees] = await Promise.all([admin.from("profiles").select("id, full_name").eq("role", "member"), chargerArchivees()]);
  const parCle = new Map<string, string[]>();
  (profils ?? []).filter((p) => !archivees.has(p.id)).forEach((p) => {
    const k = cleNom(p.full_name ?? "");
    if (k) parCle.set(k, [...(parCle.get(k) ?? []), p.id]);
  });

  const trouves: string[] = [];
  const absents: string[] = [];
  for (const ligne of lignes) {
    const ids = parCle.get(cleNom(ligne.replace(/,/g, " ")));
    if (ids && ids.length === 1) trouves.push(ids[0]);
    else absents.push(ids && ids.length > 1 ? `${ligne} (plusieurs comptes)` : ligne);
  }

  const r = (await ajouter(teamId, trouves)) ?? { ajoutees: 0, refusees: 0 };
  revalidatePath(`/membres/admin/equipes/${teamId}`);
  revalidatePath("/membres/admin/equipes");
  const params = new URLSearchParams({ lot: String(r.ajoutees), refusees: String(r.refusees) });
  if (absents.length) params.set("absents", absents.slice(0, 40).join(" | "));
  redirect(`/membres/admin/equipes/${teamId}?${params.toString()}`);
}
