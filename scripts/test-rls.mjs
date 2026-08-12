// Test d'isolation RLS : deux comptes de test dans deux equipes differentes,
// verifie qu'aucun ne voit les donnees de l'autre. Nettoie les donnees a la fin.
// Cahier des charges section 6 : "Ne pas passer a l'etape suivante avant que ces tests passent."

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(URL_, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

let pass = 0;
let fail = 0;
function check(label, ok, detail) {
  if (ok) {
    pass++;
    console.log(`  OK   ${label}`);
  } else {
    fail++;
    console.log(`  FAIL ${label}${detail ? " -- " + detail : ""}`);
  }
}

async function main() {
  console.log("Preparation des donnees de test...");

  let { data: org } = await admin.from("organizations").select("id").eq("slug", "royal-on-field").maybeSingle();
  if (!org) {
    const { data, error } = await admin
      .from("organizations")
      .insert({ name: "Royal On Field", slug: "royal-on-field" })
      .select("id")
      .single();
    if (error) throw error;
    org = data;
  }

  const { data: teamA, error: teamAErr } = await admin
    .from("teams")
    .insert({ org_id: org.id, name: "__test_team_a", sport: "baseball", season_year: 2026 })
    .select("id")
    .single();
  if (teamAErr) throw teamAErr;

  const { data: teamB, error: teamBErr } = await admin
    .from("teams")
    .insert({ org_id: org.id, name: "__test_team_b", sport: "softball", season_year: 2026 })
    .select("id")
    .single();
  if (teamBErr) throw teamBErr;

  const password = "TestRLS-" + Math.random().toString(36).slice(2) + "-9!Aa";

  const { data: userA, error: userAErr } = await admin.auth.admin.createUser({
    email: "test-rls-a@rofconnect.test",
    password,
    email_confirm: true,
  });
  if (userAErr) throw userAErr;

  const { data: userB, error: userBErr } = await admin.auth.admin.createUser({
    email: "test-rls-b@rofconnect.test",
    password,
    email_confirm: true,
  });
  if (userBErr) throw userBErr;

  const profileAId = userA.user.id;
  const profileBId = userB.user.id;

  await admin.from("team_members").insert([
    { team_id: teamA.id, profile_id: profileAId, role_in_team: "athlete", status_id: 2 },
    { team_id: teamB.id, profile_id: profileBId, role_in_team: "athlete", status_id: 2 },
  ]);

  await admin.from("athlete_details").insert([
    { profile_id: profileAId, guardian_name: "Parent A" },
    { profile_id: profileBId, guardian_name: "Parent B" },
  ]);

  const { data: contentA } = await admin
    .from("contents")
    .insert({ team_id: teamA.id, kind: "agenda", min_status: 1, title: "__test event A", created_by: profileAId })
    .select("id")
    .single();
  const { data: contentB } = await admin
    .from("contents")
    .insert({ team_id: teamB.id, kind: "agenda", min_status: 1, title: "__test event B", created_by: profileBId })
    .select("id")
    .single();

  await admin.from("messages").insert([
    { team_id: teamA.id, channel: "private", thread_profile_id: profileAId, author_id: profileAId, content: "__test private A" },
    { team_id: teamB.id, channel: "private", thread_profile_id: profileBId, author_id: profileBId, content: "__test private B" },
  ]);

  console.log("Connexion en tant que test-rls-a...");
  const clientA = createClient(URL_, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error: signInAErr } = await clientA.auth.signInWithPassword({ email: "test-rls-a@rofconnect.test", password });
  if (signInAErr) throw signInAErr;

  console.log("Connexion en tant que test-rls-b...");
  const clientB = createClient(URL_, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error: signInBErr } = await clientB.auth.signInWithPassword({ email: "test-rls-b@rofconnect.test", password });
  if (signInBErr) throw signInBErr;

  console.log("\nTests d'isolation (A ne doit rien voir de B, et vice versa) :");

  // A ne voit pas team_members de B
  {
    const { data } = await clientA.from("team_members").select("id").eq("team_id", teamB.id);
    check("team_members: A ne voit pas l'equipe B", (data ?? []).length === 0, `${data?.length} lignes visibles`);
  }
  // B ne voit pas team_members de A
  {
    const { data } = await clientB.from("team_members").select("id").eq("team_id", teamA.id);
    check("team_members: B ne voit pas l'equipe A", (data ?? []).length === 0, `${data?.length} lignes visibles`);
  }
  // A ne voit pas contents de B
  {
    const { data } = await clientA.from("contents").select("id").eq("team_id", teamB.id);
    check("contents: A ne voit pas l'equipe B", (data ?? []).length === 0, `${data?.length} lignes visibles`);
  }
  // B ne voit pas contents de A
  {
    const { data } = await clientB.from("contents").select("id").eq("team_id", teamA.id);
    check("contents: B ne voit pas l'equipe A", (data ?? []).length === 0, `${data?.length} lignes visibles`);
  }
  // A voit son propre contenu (controle positif)
  {
    const { data } = await clientA.from("contents").select("id").eq("team_id", teamA.id);
    check("contents: A voit son propre contenu (controle positif)", (data ?? []).length === 1, `${data?.length} lignes visibles`);
  }
  // A ne voit pas la fiche athlete_details de B
  {
    const { data } = await clientA.from("athlete_details").select("id").eq("profile_id", profileBId);
    check("athlete_details: A ne voit pas la fiche de B", (data ?? []).length === 0, `${data?.length} lignes visibles`);
  }
  // B ne voit pas la fiche athlete_details de A
  {
    const { data } = await clientB.from("athlete_details").select("id").eq("profile_id", profileAId);
    check("athlete_details: B ne voit pas la fiche de A", (data ?? []).length === 0, `${data?.length} lignes visibles`);
  }
  // A voit sa propre fiche (controle positif)
  {
    const { data } = await clientA.from("athlete_details").select("id").eq("profile_id", profileAId);
    check("athlete_details: A voit sa propre fiche (controle positif)", (data ?? []).length === 1, `${data?.length} lignes visibles`);
  }
  // A ne voit pas le message prive de B
  {
    const { data } = await clientA.from("messages").select("id").eq("team_id", teamB.id);
    check("messages: A ne voit pas le fil prive de B", (data ?? []).length === 0, `${data?.length} lignes visibles`);
  }
  // B ne voit pas le message prive de A
  {
    const { data } = await clientB.from("messages").select("id").eq("team_id", teamA.id);
    check("messages: B ne voit pas le fil prive de A", (data ?? []).length === 0, `${data?.length} lignes visibles`);
  }
  // A voit son propre message prive (controle positif)
  {
    const { data } = await clientA.from("messages").select("id").eq("team_id", teamA.id);
    check("messages: A voit son propre fil prive (controle positif)", (data ?? []).length === 1, `${data?.length} lignes visibles`);
  }
  // A ne peut pas ecrire une reponse de presence au nom de B
  {
    const { error } = await clientA.from("attendance").insert({ content_id: contentA.id, profile_id: profileBId, response: "yes" });
    check("attendance: A ne peut pas repondre au nom de B", !!error, error ? "" : "insertion acceptee a tort");
  }

  console.log(`\n${pass} reussis, ${fail} echoues.`);

  console.log("\nNettoyage des donnees de test...");
  await admin.from("teams").delete().in("id", [teamA.id, teamB.id]);
  await admin.auth.admin.deleteUser(profileAId);
  await admin.auth.admin.deleteUser(profileBId);
  console.log("Nettoyage termine.");

  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Erreur:", err);
  process.exit(1);
});
