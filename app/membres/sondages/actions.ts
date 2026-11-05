"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargerSondages } from "@/lib/sondages";

export async function voter(formData: FormData) {
  const pollId = String(formData.get("poll_id") ?? "");
  const optionId = String(formData.get("option_id") ?? "");
  const dateReponse = String(formData.get("reponse_date") ?? "");
  if (!pollId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  // Le sondage doit être visible pour cet utilisateur et ouvert.
  const visibles = await chargerSondages(user.id, profile?.role === "admin");
  const sondage = visibles.find((s) => s.id === pollId);
  if (!sondage || sondage.closed) return;

  if (sondage.kind === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateReponse) || Number.isNaN(Date.parse(dateReponse))) return;
    await createAdminClient()
      .from("poll_votes")
      .upsert({ poll_id: pollId, option_id: null, reponse_date: dateReponse, profile_id: user.id }, { onConflict: "poll_id,profile_id" });
  } else {
    if (!optionId || !sondage.options.some((o) => o.id === optionId)) return;
    await createAdminClient()
      .from("poll_votes")
      .upsert({ poll_id: pollId, option_id: optionId, profile_id: user.id }, { onConflict: "poll_id,profile_id" });
  }

  revalidatePath("/membres/sondages");
}
