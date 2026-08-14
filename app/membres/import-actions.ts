"use server";

import { createClient } from "@/lib/supabase/server";

type Kind = "agenda" | "news" | "plan" | "relay" | "video" | "gamechanger" | "signal";

export async function importerLot(
  teamId: string,
  kind: Kind,
  minStatus: number,
  titreChamp: string,
  lignes: Record<string, string>[],
) {
  if (!teamId || !lignes.length) return { ok: false, count: 0 };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, count: 0 };

  const dateChamp = kind === "agenda" ? "date" : null;

  const rangees = lignes.map((body) => ({
    team_id: teamId,
    kind,
    min_status: minStatus,
    title: body[titreChamp] || "Sans titre",
    event_date: dateChamp ? body[dateChamp] || null : null,
    created_by: user.id,
    body,
  }));

  const { error } = await supabase.from("contents").insert(rangees);
  if (error) return { ok: false, count: 0 };

  return { ok: true, count: rangees.length };
}
