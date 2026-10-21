"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const STATUTS = ["nouveau", "contacté", "rencontre", "client", "clos"];

export async function majDemandeParcours(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const statut = String(formData.get("statut") ?? "");
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 2000) || null;
  if (!id || !STATUTS.includes(statut)) return;

  // La politique de sécurité de la table limite la mise à jour aux administrateurs.
  const supabase = await createClient();
  await supabase.from("parcours_demandes").update({ statut, notes }).eq("id", id);
  revalidatePath("/membres/admin/parcours");
}
