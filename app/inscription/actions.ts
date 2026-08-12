"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function inscrireAthlete(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const teamId = String(formData.get("team_id") ?? "");
  const birthDate = String(formData.get("birth_date") ?? "");
  const position = String(formData.get("position") ?? "").trim();
  const throwsHand = String(formData.get("throws") ?? "").trim();
  const bats = String(formData.get("bats") ?? "").trim();
  const guardianName = String(formData.get("guardian_name") ?? "").trim();
  const guardianPhone = String(formData.get("guardian_phone") ?? "").trim();
  const guardianEmail = String(formData.get("guardian_email") ?? "").trim();
  const medicalNotes = String(formData.get("medical_notes") ?? "").trim();
  const photoConsent = formData.get("photo_consent") === "on";

  if (!fullName || !email || !password || !teamId) {
    redirect("/inscription?erreur=" + encodeURIComponent("Complète au minimum le nom, le courriel, le mot de passe et l'équipe."));
  }

  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUpError || !signUpData.user) {
    redirect("/inscription?erreur=" + encodeURIComponent(signUpError?.message ?? "Impossible de créer le compte."));
  }

  const admin = createAdminClient();
  const profileId = signUpData.user!.id;

  const { error: teamMemberError } = await admin.from("team_members").insert({
    team_id: teamId,
    profile_id: profileId,
    role_in_team: "athlete",
    status_id: 1,
  });

  const { error: athleteDetailsError } = await admin.from("athlete_details").insert({
    profile_id: profileId,
    birth_date: birthDate || null,
    position: position || null,
    throws: throwsHand || null,
    bats: bats || null,
    guardian_name: guardianName || null,
    guardian_phone: guardianPhone || null,
    guardian_email: guardianEmail || null,
    medical_notes: medicalNotes || null,
    photo_consent: photoConsent,
  });

  if (teamMemberError || athleteDetailsError) {
    redirect("/inscription?erreur=" + encodeURIComponent("Compte créé, mais la fiche n'a pas pu être complétée. Contacte un entraîneur."));
  }

  redirect("/inscription/confirmation");
}
