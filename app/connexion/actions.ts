"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionnaire } from "@/lib/i18n/server";

export async function connecter(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const suite = String(formData.get("suite") ?? "/membres");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const { t } = await getDictionnaire();
    redirect("/connexion?erreur=" + encodeURIComponent(t.connexion.erreur));
  }

  redirect(suite || "/membres");
}

export async function deconnecter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
