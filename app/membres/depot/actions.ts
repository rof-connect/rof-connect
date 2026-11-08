"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { chargerDepots, definirDepot } from "@/lib/depots";

/** La joueuse (ou son parent) signale que le dépôt est envoyé ; la Direction le confirme à la réception. */
export async function marquerDepotEnvoye() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const actuel = (await chargerDepots())[user.id];
  if (actuel === "recu") return;
  await definirDepot(user.id, "envoye");
  revalidatePath("/membres");
  revalidatePath("/membres/admin");
}

/** Direction : confirmer la réception (« recu »), ou remettre en attente (« »). */
export async function confirmerDepot(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const etat = String(formData.get("etat") ?? "");
  if (!profileId || !["recu", ""].includes(etat)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return;

  await definirDepot(profileId, etat === "recu" ? "recu" : null);
  revalidatePath("/membres");
  revalidatePath("/membres/admin");
  revalidatePath("/membres/admin/joueurs");
}
