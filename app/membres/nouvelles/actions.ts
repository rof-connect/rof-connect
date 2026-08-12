"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TAILLE_MAX_PHOTO = 10 * 1024 * 1024; // 10 Mo, section 7.2a

export async function ajouterNouvelle(formData: FormData) {
  const teamId = String(formData.get("team_id") ?? "");
  const titre = String(formData.get("titre") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const texte = String(formData.get("texte") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const minStatus = Number(formData.get("min_status") ?? 1);
  const photo = formData.get("photo") as File | null;

  if (!teamId || !titre) return;
  if (photo && photo.size > TAILLE_MAX_PHOTO) return;

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
  let photoPath: string | null = null;

  if (photo && photo.size > 0) {
    photoPath = `news/${teamId}/${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await admin.storage.from("media").upload(photoPath, photo, {
      contentType: photo.type || "image/jpeg",
    });
    if (uploadError) return;
  }

  await admin.from("contents").insert({
    team_id: teamId,
    kind: "news",
    min_status: minStatus,
    title: titre,
    created_by: user.id,
    body: {
      date: date || null,
      texte: texte || null,
      photo_url: photoPath,
      video_url: videoUrl || null,
    },
  });

  revalidatePath("/membres/nouvelles");
}

export async function supprimerNouvelle(formData: FormData) {
  const contentId = String(formData.get("content_id") ?? "");
  const photoPath = String(formData.get("photo_path") ?? "");
  if (!contentId) return;

  const supabase = await createClient();
  const { error } = await supabase.from("contents").delete().eq("id", contentId);
  if (error) return;

  if (photoPath) {
    const admin = createAdminClient();
    await admin.storage.from("media").remove([photoPath]);
  }

  revalidatePath("/membres/nouvelles");
}
