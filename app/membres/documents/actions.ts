"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TAILLE_MAX_PDF = 20 * 1024 * 1024; // 20 Mo

export async function ajouterDocument(formData: FormData) {
  const teamId = String(formData.get("team_id") ?? "");
  const titre = String(formData.get("titre") ?? "").trim();
  const minStatus = Number(formData.get("min_status") ?? 1);
  const fichier = formData.get("fichier") as File | null;

  if (!teamId || !titre || !fichier || fichier.size === 0) return;
  if (fichier.size > TAILLE_MAX_PDF) return;
  if (fichier.type && fichier.type !== "application/pdf") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Vérifie que l'utilisateur est bien staff de cette équipe (RLS de team_members).
  const { data: staff } = await supabase
    .from("team_members")
    .select("role_in_team")
    .eq("team_id", teamId)
    .eq("profile_id", user.id)
    .eq("role_in_team", "coach")
    .maybeSingle();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!staff && profile?.role !== "admin") return;

  const admin = createAdminClient();
  const cheminFichier = `docs/${teamId}/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await admin.storage.from("media").upload(cheminFichier, fichier, {
    contentType: "application/pdf",
  });
  if (uploadError) return;

  await admin.from("contents").insert({
    team_id: teamId,
    kind: "document",
    min_status: minStatus,
    title: titre,
    created_by: user.id,
    body: { fichier_path: cheminFichier, fichier_nom: fichier.name },
  });

  revalidatePath("/membres/documents");
}

export async function supprimerDocument(formData: FormData) {
  const contentId = String(formData.get("content_id") ?? "");
  const fichierPath = String(formData.get("fichier_path") ?? "");
  if (!contentId) return;

  const supabase = await createClient();
  const { error } = await supabase.from("contents").delete().eq("id", contentId);
  if (error) return;

  if (fichierPath) {
    const admin = createAdminClient();
    await admin.storage.from("media").remove([fichierPath]);
  }

  revalidatePath("/membres/documents");
}
