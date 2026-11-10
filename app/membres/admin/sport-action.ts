"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Choix du sport de gestion (Tous / Softball / Baseball), mémorisé pour toutes les pages de la Direction. */
export async function choisirSportAdmin(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: moi } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (moi?.role !== "admin") return;

  const sport = String(formData.get("sport") ?? "");
  const jar = await cookies();
  if (sport === "softball" || sport === "baseball") jar.set("rof-sport-admin", sport, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  else jar.delete("rof-sport-admin");

  revalidatePath("/membres/admin", "layout");
  const retour = String(formData.get("retour") ?? "/membres/admin");
  redirect(retour.startsWith("/membres/admin") ? retour : "/membres/admin");
}
