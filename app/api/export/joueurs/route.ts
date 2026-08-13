import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATUTS: Record<number, string> = {
  1: "Prospect",
  2: "Mineur",
  3: "Majeur",
  4: "Intermédiaire",
  5: "Junior",
  6: "Senior",
  7: "JV",
  8: "Varsity",
};

function ligneCsv(champs: (string | null | undefined)[]): string {
  return champs
    .map((c) => (c ?? "").toString().replace(/;/g, ","))
    .join(";");
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const { searchParams } = new URL(request.url);
  const teamIdFiltre = searchParams.get("team_id");

  let equipeIds: string[];
  if (profile?.role === "admin") {
    const { data: toutes } = await supabase.from("teams").select("id");
    equipeIds = (toutes ?? []).map((t) => t.id);
  } else {
    const { data: mesEquipes } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("profile_id", user.id)
      .eq("role_in_team", "coach");
    equipeIds = (mesEquipes ?? []).map((t) => t.team_id);
  }

  if (teamIdFiltre) equipeIds = equipeIds.filter((id) => id === teamIdFiltre);
  if (equipeIds.length === 0) return NextResponse.json({ error: "Aucune équipe" }, { status: 403 });

  const { data: membres } = await supabase
    .from("team_members")
    .select("status_id, team_id, profile_id, teams (name, sport), profiles (full_name, created_at)")
    .in("team_id", equipeIds)
    .eq("role_in_team", "athlete");

  const profileIds = (membres ?? []).map((m) => m.profile_id);
  const { data: fiches } = await supabase
    .from("athlete_details")
    .select("profile_id, birth_date, position, throws, bats, guardian_name, guardian_phone, guardian_email, medical_notes, photo_consent")
    .in("profile_id", profileIds.length ? profileIds : ["00000000-0000-0000-0000-000000000000"]);
  const ficheParProfil = new Map((fiches ?? []).map((f) => [f.profile_id, f]));

  const entetes = ligneCsv([
    "Nom", "Équipe", "Sport", "Statut", "Naissance", "Position", "Lance", "Frappe",
    "Parent/Tuteur", "Téléphone", "Courriel", "Médical", "Consentement photo", "Inscrit le",
  ]);

  const lignes = (membres ?? []).map((m) => {
    const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    const profil = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    const fiche = ficheParProfil.get(m.profile_id);
    const inscrit = profil?.created_at ? new Date(profil.created_at).toLocaleDateString("fr-CA") : "";
    return ligneCsv([
      profil?.full_name,
      team?.name,
      team?.sport,
      STATUTS[m.status_id] ?? "",
      fiche?.birth_date,
      fiche?.position,
      fiche?.throws,
      fiche?.bats,
      fiche?.guardian_name,
      fiche?.guardian_phone,
      fiche?.guardian_email,
      fiche?.medical_notes,
      fiche?.photo_consent === undefined ? "" : fiche.photo_consent ? "Oui" : "Non",
      inscrit,
    ]);
  });

  const csv = "﻿" + [entetes, ...lignes].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rof-joueurs.csv"`,
    },
  });
}
