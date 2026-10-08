"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { creerEnfant, famille, normaliserNom } from "@/lib/joueuses";

export async function changerDeJoueuse(formData: FormData) {
  const cibleId = String(formData.get("profile_id") ?? "");
  if (!cibleId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const admin = createAdminClient();
  const { membres } = await famille(admin, user.id);
  if (!membres.some((m) => m.id === cibleId)) return;
  if (cibleId === user.id) redirect("/membres");

  const { data: cible } = await admin.auth.admin.getUserById(cibleId);
  const email = cible.user?.email;
  if (!email) return;

  const { data: lien } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = lien?.properties?.hashed_token;
  if (!tokenHash) return;

  const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (error) return;

  redirect("/membres");
}

export async function ajouterJoueuse(_prev: { ok: boolean; erreur: string | null }, formData: FormData) {
  const nom = String(formData.get("full_name") ?? "").trim();
  if (!nom) return { ok: false, erreur: "Entre le nom de la joueuse." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, erreur: "Non connecté." };

  const admin = createAdminClient();
  const { racineId, membres } = await famille(admin, user.id);
  if (membres.some((m) => normaliserNom(m.full_name ?? "") === normaliserNom(nom))) {
    return { ok: false, erreur: "Cette joueuse existe déjà dans ta famille." };
  }

  const { data: racine } = await admin.from("profiles").select("id, email").eq("id", racineId).single();
  if (!racine) return { ok: false, erreur: "Compte introuvable." };

  const res = await creerEnfant(admin, { id: racine.id, email: racine.email }, nom);
  if (!res.ok) return { ok: false, erreur: res.erreur };

  const naissance = String(formData.get("birth_date") ?? "").trim();
  if (naissance) await admin.from("athlete_details").upsert({ profile_id: res.profileId, birth_date: naissance }, { onConflict: "profile_id" });

  revalidatePath("/membres", "layout");
  return { ok: true, erreur: null };
}
