import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export function normaliserNom(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
}

type Resultat = { ok: true; profileId: string; nouveau: boolean } | { ok: false; erreur: string };

/**
 * Crée un profil « enfant » : une joueuse de plus rattachée au courriel d'un compte
 * existant. Techniquement c'est un compte Supabase avec un courriel interne (jamais
 * utilisé pour se connecter) — le parent bascule vers lui depuis son propre compte.
 * Le courriel affiché / utilisé pour les notifications reste celui de la famille.
 */
export async function creerEnfant(
  admin: SupabaseClient,
  parent: { id: string; email: string | null },
  nom: string,
): Promise<Resultat> {
  const { data, error } = await admin.auth.admin.createUser({
    email: `joueuse-${randomUUID()}@famille.rofconnect.test`,
    password: randomUUID() + randomUUID(),
    email_confirm: true,
    user_metadata: { full_name: nom },
  });
  if (error || !data.user) return { ok: false, erreur: error?.message ?? "Création du profil impossible." };

  await admin
    .from("profiles")
    .update({ full_name: nom, email: parent.email, parent_id: parent.id })
    .eq("id", data.user.id);
  return { ok: true, profileId: data.user.id, nouveau: true };
}

/**
 * Trouve la joueuse (même courriel + même nom) ou la crée :
 *  - courriel déjà associé à un compte → nouvelle joueuse rattachée à ce compte (famille)
 *  - courriel inconnu → nouveau compte (invitation par courriel si demandé)
 *  - pas de courriel → profil autonome sans courriel
 */
export async function trouverOuCreerJoueuse(
  admin: SupabaseClient,
  opts: { nom: string; email: string; envoyerInvitation: boolean },
): Promise<Resultat> {
  const nom = opts.nom.trim();
  const email = opts.email.trim().toLowerCase();

  if (!email) {
    const { data, error } = await admin.auth.admin.createUser({
      email: `joueuse-${randomUUID()}@famille.rofconnect.test`,
      password: randomUUID() + randomUUID(),
      email_confirm: true,
      user_metadata: { full_name: nom },
    });
    if (error || !data.user) return { ok: false, erreur: error?.message ?? "Création du profil impossible." };
    await admin.from("profiles").update({ full_name: nom, email: null }).eq("id", data.user.id);
    return { ok: true, profileId: data.user.id, nouveau: true };
  }

  const { data: compte } = await admin
    .from("profiles")
    .select("id, email, full_name")
    .eq("email", email)
    .is("parent_id", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (compte) {
    if (normaliserNom(compte.full_name ?? "") === normaliserNom(nom)) {
      return { ok: true, profileId: compte.id, nouveau: false };
    }
    const { data: enfants } = await admin.from("profiles").select("id, full_name").eq("parent_id", compte.id);
    const existant = (enfants ?? []).find((e) => normaliserNom(e.full_name ?? "") === normaliserNom(nom));
    if (existant) return { ok: true, profileId: existant.id, nouveau: false };
    return creerEnfant(admin, { id: compte.id, email: compte.email }, nom);
  }

  if (opts.envoyerInvitation) {
    const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: nom } });
    if (error || !invite.user) return { ok: false, erreur: "Impossible de créer le compte : " + (error?.message ?? "erreur inconnue") };
    await admin.from("profiles").update({ full_name: nom }).eq("id", invite.user.id);
    return { ok: true, profileId: invite.user.id, nouveau: true };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: randomUUID() + randomUUID(),
    email_confirm: true,
    user_metadata: { full_name: nom },
  });
  if (error || !data.user) return { ok: false, erreur: "Impossible de créer le compte : " + (error?.message ?? "erreur inconnue") };
  await admin.from("profiles").update({ full_name: nom }).eq("id", data.user.id);
  return { ok: true, profileId: data.user.id, nouveau: true };
}

/** Racine de la famille (le compte principal) + toutes les joueuses rattachées. */
export async function famille(admin: SupabaseClient, profileId: string) {
  const { data: moi } = await admin.from("profiles").select("id, parent_id").eq("id", profileId).single();
  const racineId = moi?.parent_id ?? profileId;
  const { data: membres } = await admin
    .from("profiles")
    .select("id, full_name, parent_id")
    .or(`id.eq.${racineId},parent_id.eq.${racineId}`)
    .order("created_at", { ascending: true });
  return { racineId, membres: membres ?? [] };
}
