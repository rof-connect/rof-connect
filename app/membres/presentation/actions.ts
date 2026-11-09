"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { majPresentation, presentationDe, regenererLien } from "@/lib/presentation";
import { profilDuFormulaire } from "@/lib/presentation-format";

async function moi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Chaque joueuse ne gère que sa propre page. */
export async function majMaPresentation(formData: FormData) {
  const uid = await moi();
  if (!uid) return;
  // Publier exige une autorisation explicite (donnée une fois, conservée avec sa date).
  const existant = await presentationDe(uid);
  const autorise = Boolean(existant?.consentement_le) || formData.get("consentement") === "on";
  const veutActiver = formData.get("actif") === "on";
  await majPresentation(uid, {
    actif: veutActiver && autorise,
    ...(autorise && !existant?.consentement_le ? { consentement_le: new Date().toISOString() } : {}),
    profil: profilDuFormulaire(formData),
    photo: formData.get("photo") === "on",
    contact: formData.get("contact") === "on",
    apropos: String(formData.get("apropos") ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, 600),
  });
  revalidatePath("/membres/moi");
}

export async function regenererMonLien() {
  const uid = await moi();
  if (!uid) return;
  await regenererLien(uid);
  revalidatePath("/membres/moi");
}
