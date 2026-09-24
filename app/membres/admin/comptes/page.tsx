import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormInviterEntraineur } from "@/components/membres/FormInviterEntraineur";
import { FormInviterDirection } from "@/components/membres/FormInviterDirection";
import { assignerEquipeCoach } from "./actions";

export default async function ComptesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/membres");

  const { data: equipes } = await supabase.from("teams").select("id, name").eq("archived", false).order("name");

  const { data: admins } = await supabase.from("profiles").select("id, full_name, email").eq("role", "admin");

  const { data: coachProfiles } = await supabase.from("profiles").select("id, full_name, email").eq("role", "coach");
  const { data: coachMembers } = await supabase
    .from("team_members")
    .select("profile_id, team_id, teams!inner (name)")
    .eq("role_in_team", "coach")
    .eq("teams.archived", false);

  const equipesParProfil = new Map<string, { id: string; nom: string }[]>();
  (coachMembers ?? []).forEach((m) => {
    const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    const liste = equipesParProfil.get(m.profile_id) ?? [];
    liste.push({ id: m.team_id, nom: team?.name ?? "—" });
    equipesParProfil.set(m.profile_id, liste);
  });

  const coachs = (coachProfiles ?? []).map((c) => ({
    id: c.id,
    nom: c.full_name || "—",
    email: c.email || "",
    equipes: equipesParProfil.get(c.id) ?? [],
  }));

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
          {coachs.map((c) => {
            const equipesAssignees = new Set(c.equipes.map((e) => e.id));
            const equipesDisponibles = (equipes ?? []).filter((eq) => !equipesAssignees.has(eq.id));
            return (
              <div key={c.id} className="rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-3">
                <p className="font-semibold text-rof-texte">{c.nom}</p>
                <p className="text-sm text-rof-gris">
                  {c.email}
                  {c.equipes.length > 0 ? ` · ${c.equipes.map((e) => e.nom).join(", ")}` : ""}
                </p>
                {c.equipes.length === 0 && (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-rof-rouge">
                    En attente d&apos;assignation à une équipe
                  </p>
                )}
                {equipesDisponibles.length > 0 && (
                  <form action={assignerEquipeCoach} className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="profile_id" value={c.id} />
                    <select
                      name="team_id"
                      className="rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-xs text-rof-texte"
                    >
                      {equipesDisponibles.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="text-xs text-rof-poudre underline">
                      Assigner à cette équipe
                    </button>
                  </form>
                )}
              </div>
            );
          })}
          {coachs.length === 0 && <p className="text-sm text-rof-gris">Aucun entraîneur pour le moment.</p>}
        </div>
      </div>
    </main>
  );
}
