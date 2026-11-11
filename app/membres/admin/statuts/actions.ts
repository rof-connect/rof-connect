"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculerRecalcul } from "@/lib/statuts-recalcul";
import { definirStatutsJoueuses } from "@/lib/statuts";

/** Applique la charte d'âge de leur sport (Little League ou USA Softball) aux joueuses déjà placées dont le statut ne correspond pas. Les prospects ne sont pas touchés. */
export async function appliquerRecalcul(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return;

  // Seulement les joueuses cochées, et seulement si le recalcul serveur confirme encore la correction.
  const cochees = new Set(formData.getAll("profile_id").map(String));
  const { corrections } = await calculerRecalcul();
  const changements: Record<string, number> = {};
  for (const c of corrections) if (cochees.has(c.profileId)) changements[c.profileId] = c.nouveau;

  await definirStatutsJoueuses(changements);
  revalidatePath("/membres/admin/statuts");
  revalidatePath("/membres/admin/joueurs");
  revalidatePath("/membres/admin");
  revalidatePath("/membres");
}
