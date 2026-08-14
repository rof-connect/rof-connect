"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifierAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

export async function inviterEntraineur(formData: FormData) {
  const moi = await verifierAdmin();
  if (!moi) return { ok: false, erreur: "Non autorisé." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const teamIds = formData.getAll("team_ids").map(String).filter(Boolean);

  if (!email || !fullName || teamIds.length === 0) {
    return { ok: false, erreur: "Complète le nom, le courriel et sélectionne au moins une équipe." };
  }

  const admin = createAdminClient();
  const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });
  if (error || !invite.user) {
    return { ok: false, erreur: "Impossible de créer le compte : " + (error?.message ?? "erreur inconnue") };
  }

  await admin.from("profiles").update({ role: "coach", full_name: fullName }).eq("id", invite.user.id);

  await admin.from("team_members").insert(
    teamIds.map((teamId) => ({
      team_id: teamId,
      profile_id: invite.user!.id,
      role_in_team: "coach" as const,
      status_id: 8,
    })),
  );

  revalidatePath("/membres/admin/comptes");
  return { ok: true, erreur: null };
}

export async function inviterDirection(formData: FormData) {
  const moi = await verifierAdmin();
  if (!moi) return { ok: false, erreur: "Non autorisé." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !fullName) {
    return { ok: false, erreur: "Complète le nom et le courriel." };
  }

  const admin = createAdminClient();
  const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });
  if (error || !invite.user) {
    return { ok: false, erreur: "Impossible de créer le compte : " + (error?.message ?? "erreur inconnue") };
  }

  await admin.from("profiles").update({ role: "admin", full_name: fullName }).eq("id", invite.user.id);

  revalidatePath("/membres/admin/comptes");
  return { ok: true, erreur: null };
}
