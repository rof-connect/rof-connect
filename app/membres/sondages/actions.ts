"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargerSondages } from "@/lib/sondages";
import { notifierReponseSondage } from "@/lib/sondages-notif";
import type { ActionVote } from "@/lib/sondages-courriel";

export async function voter(formData: FormData) {
  const pollId = String(formData.get("poll_id") ?? "");
  const optionId = String(formData.get("option_id") ?? "");
  const datesDemandees = formData.getAll("reponse_date").map((d) => String(d).trim()).filter(Boolean);
  if (!pollId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();

  // Le sondage doit être visible pour cet utilisateur et ouvert.
  const visibles = await chargerSondages(user.id, profile?.role === "admin");
  const sondage = visibles.find((s) => s.id === pollId);
  if (!sondage || sondage.closed) return;

  let action: ActionVote;
  if (sondage.kind === "date") {
    const valides = [...new Set(datesDemandees)]
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)))
      .sort()
      .slice(0, sondage.maxDates);
    const admin = createAdminClient();
    if (valides.length === 0) {
      // Réponse facultative : aucune date = on retire la réponse.
      await admin.from("poll_votes").delete().eq("poll_id", pollId).eq("profile_id", user.id);
      action = { type: "retrait" };
    } else {
      await admin
        .from("poll_votes")
        .upsert(
          { poll_id: pollId, option_id: null, reponse_date: valides[0], reponse_dates: valides, profile_id: user.id },
          { onConflict: "poll_id,profile_id" },
        );
      action = { type: "dates", dates: valides };
    }
  } else {
    if (!optionId || !sondage.options.some((o) => o.id === optionId)) return;
    await createAdminClient()
      .from("poll_votes")
      .upsert({ poll_id: pollId, option_id: optionId, profile_id: user.id }, { onConflict: "poll_id,profile_id" });
    action = { type: "choix", option: sondage.options.find((o) => o.id === optionId)!.label };
  }

  await notifierReponseSondage(pollId, profile?.full_name || user.email || "Un membre", action);

  revalidatePath("/membres/sondages");
}
