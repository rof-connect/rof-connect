"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
