"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function connecter(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const suite = String(formData.get("suite") ?? "/membres");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/connexion?erreur=" + encodeURIComponent("Courriel ou mot de passe incorrect."));
  }

  redirect(suite || "/membres");
}

export async function deconnecter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
