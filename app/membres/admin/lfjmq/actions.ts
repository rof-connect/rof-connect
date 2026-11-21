"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CLES_DIVISION, chargerLfjmq, sauverLfjmq } from "@/lib/lfjmq";
import { idGameChanger, lienGameChanger } from "@/lib/site-v2/donnees";

async function verifierAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

/** Widget GameChanger de chaque division : alimente la bande de résultats du haut du site de la ligue. */
export async function majWidgetsLfjmq(formData: FormData) {
  if (!(await verifierAdmin())) return;
  const d = await chargerLfjmq();
  for (const k of CLES_DIVISION) {
    d.widgets[k] = { widgetId: idGameChanger(formData.get(`widget_${k}`)), url: lienGameChanger(formData.get(`url_${k}`)) };
  }
  await sauverLfjmq(d);
  revalidatePath("/membres/admin/lfjmq");
  revalidatePath("/lfjmq", "layout");
}
