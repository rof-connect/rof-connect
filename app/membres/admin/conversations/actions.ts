"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { envoyerCourriel } from "@/lib/resend";
import { courrielNouveauMessage } from "@/lib/email-templates";

/**
 * Réponse de la Direction dans une conversation privée.
 * Écrite avec le client administrateur : la règle de la messagerie exige d'être membre de l'équipe, ce que la Direction n'est pas toujours.
 */
export async function repondreConversation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: moi } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  if (moi?.role !== "admin") return;

  const teamId = String(formData.get("team_id") ?? "");
  const joueuseId = String(formData.get("joueuse_id") ?? "");
  const texte = String(formData.get("contenu") ?? "").trim().slice(0, 4000);
  if (!teamId || !joueuseId || !texte) return;

  const admin = createAdminClient();
  const { error } = await admin.from("messages").insert({
    team_id: teamId,
    channel: "private",
    thread_profile_id: joueuseId,
    author_id: user.id,
    content: texte,
  });
  if (error) return;

  const { data: joueuse } = await admin.from("profiles").select("email").eq("id", joueuseId).single();
  if (joueuse?.email && !joueuse.email.endsWith(".test")) {
    await envoyerCourriel([joueuse.email], "Nouveau message privé — ROF Connect", courrielNouveauMessage(moi?.full_name ?? "La Direction", texte.slice(0, 200)));
  }
  revalidatePath("/membres/admin/conversations");
  revalidatePath("/membres/admin");
}
