"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rof-connect.vercel.app";

export async function demanderReinitialisation(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (email) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/reinitialiser-mot-de-passe`,
    });
  }

  // Toujours rediriger vers la confirmation, que le courriel existe ou non
  // (évite de révéler si une adresse est enregistrée dans le système).
  redirect("/mot-de-passe-oublie/envoye");
}
