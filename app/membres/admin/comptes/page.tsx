import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormInviterEntraineur } from "@/components/membres/FormInviterEntraineur";
import { FormInviterDirection } from "@/components/membres/FormInviterDirection";

export default async function ComptesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data: equipes } = await supabase.from("teams").select("id, name").eq("archived", false).order("name");

  const { data: admins } = await supabase.from("profiles").select("id, full_name, email").eq("role", "admin");
  const { data: coachMembers } = await supabase
    .from("team_members")
    .select("profile_id, team_id, profiles (full_name, email), teams (name)")
    .eq("role_in_team", "coach");

  const coachsParProfil = new Map<string, { nom: string; email: string; equipes: string[] }>();
  (coachMembers ?? []).forEach((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    const existant = coachsParProfil.get(m.profile_id);
    if (existant) {
      existant.equipes.push(team?.name ?? "");
    } else {
      coachsParProfil.set(m.profile_id, { nom: p?.full_name ?? "—", email: p?.email ?? "", equipes: [team?.name ?? ""] });
    }
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Direction</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Comptes entraîneurs &amp; direction</h1>
        <p className="mt-2 text-sm text-rof-gris">
          Aucun mot de passe à créer ici — la personne invitée reçoit un courriel pour choisir le sien.
        </p>
      </div>

      <FormInviterEntraineur equipes={equipes ?? []} />
      <FormInviterDirection />

      <div>
        <h2 className="mb-2 font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">Direction</h2>
        <div className="flex flex-col gap-2">
          {(admins ?? []).map((a) => (
            <div key={a.id} className="rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-3">
              <p className="font-semibold text-rof-texte">{a.full_name || "—"}</p>
              <p className="text-sm text-rof-gris">{a.email}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-condensed text-xl font-bold uppercase tracking-wide text-rof-poudre">Entraîneurs</h2>
        <div className="flex flex-col gap-2">
          {Array.from(coachsParProfil.entries()).map(([id, c]) => (
            <div key={id} className="rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-3">
              <p className="font-semibold text-rof-texte">{c.nom}</p>
              <p className="text-sm text-rof-gris">
                {c.email} · {c.equipes.join(", ")}
              </p>
            </div>
          ))}
          {coachsParProfil.size === 0 && <p className="text-sm text-rof-gris">Aucun entraîneur pour le moment.</p>}
        </div>
      </div>
    </main>
  );
}
