"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cheminPhotoProfil } from "@/lib/photo-profil";

const txt = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export async function modifierMaFiche(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  let fieldlevel = txt(formData.get("fieldlevel_url"), 300);
  if (fieldlevel && !/^https:\/\//i.test(fieldlevel)) fieldlevel = "https://" + fieldlevel.replace(/^http:\/\//i, "");

  const donnees = {
    position: txt(formData.get("position"), 40) || null,
    throws: txt(formData.get("throws"), 10) || null,
    bats: txt(formData.get("bats"), 10) || null,
    fieldlevel_url: fieldlevel || null,
  };

  // RLS : la joueuse ne peut écrire que sa propre fiche.
  await supabase.from("athlete_details").upsert({ profile_id: user.id, ...donnees }, { onConflict: "profile_id" });
  revalidatePath("/membres/moi");
}

const TAILLE_MAX_PHOTO = 5 * 1024 * 1024;

/** Photo de profil : chacune ne peut changer que la sienne. Le fichier est écrasé à chaque envoi. */
export async function changerMaPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const photo = formData.get("photo") as File | null;
  if (!photo || photo.size === 0 || photo.size > TAILLE_MAX_PHOTO || !photo.type.startsWith("image/")) return;

  await createAdminClient().storage.from("media").upload(cheminPhotoProfil(user.id), photo, {
    contentType: "image/jpeg",
    upsert: true,
  });
  revalidatePath("/membres/moi");
}

export async function retirerMaPhoto() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await createAdminClient().storage.from("media").remove([cheminPhotoProfil(user.id)]);
  revalidatePath("/membres/moi");
}
