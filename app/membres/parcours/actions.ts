"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Reponses = Record<string, unknown> & { choix?: string; faites?: string[] };

/** Dernier questionnaire de la joueuse connectée (le plan d'action suit celui-ci). */
async function dernier() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("parcours_demandes")
    .select("id, reponses")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { admin, id: data.id as string, reponses: (data.reponses ?? {}) as Reponses };
}

function rafraichir() {
  revalidatePath("/membres/moi");
  revalidatePath("/membres");
}

/** Changer de parcours : le calendrier est recalculé, les étapes déjà faites restent cochées. */
export async function changerChoixParcours(formData: FormData) {
  const k = String(formData.get("k") ?? "");
  if (k !== "" && !["A", "B", "C", "D"].includes(k)) return;
  const d = await dernier();
  if (!d) return;
  await d.admin.from("parcours_demandes").update({ reponses: { ...d.reponses, choix: k } }).eq("id", d.id);
  rafraichir();
}

export async function basculerEtape(formData: FormData) {
  const id = String(formData.get("id") ?? "").slice(0, 40);
  const faite = formData.get("faite") === "1";
  if (!/^[a-z0-9-]+$/.test(id)) return;
  const d = await dernier();
  if (!d) return;
  const actuelles = new Set((d.reponses.faites ?? []).map(String));
  if (faite) actuelles.add(id);
  else actuelles.delete(id);
  await d.admin.from("parcours_demandes").update({ reponses: { ...d.reponses, faites: [...actuelles] } }).eq("id", d.id);
  rafraichir();
}
