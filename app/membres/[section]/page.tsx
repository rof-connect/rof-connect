import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SECTIONS } from "@/lib/section-config";
import { CarteContenu } from "@/components/membres/CarteContenu";
import { FormAjoutContenu } from "@/components/membres/FormAjoutContenu";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const config = SECTIONS[section];
  if (!config) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const estAdmin = profile?.role === "admin";

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role_in_team, teams (id, name)")
    .eq("profile_id", user!.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">{config.titre}</h1>
      </div>

      {(memberships ?? []).length === 0 && (
        <p className="text-sm text-rof-gris">Aucune équipe assignée pour le moment.</p>
      )}

      {(memberships ?? []).map((m) => {
        const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
        const peutEditer = estAdmin || m.role_in_team === "coach";
        return (
          <EquipeSection
            key={m.team_id}
            slug={section}
            teamId={m.team_id}
            teamName={team?.name ?? ""}
            peutEditer={peutEditer}
          />
        );
      })}
    </main>
  );
}

async function EquipeSection({
  slug,
  teamId,
  teamName,
  peutEditer,
}: {
  slug: string;
  teamId: string;
  teamName: string;
  peutEditer: boolean;
}) {
  const config = SECTIONS[slug];
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("contents")
    .select("id, title, body, created_at")
    .eq("team_id", teamId)
    .eq("kind", config.kind)
    .order("created_at", { ascending: true });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-white">{teamName}</h2>

      {peutEditer && <FormAjoutContenu slug={slug} config={config} teamId={teamId} />}

      <div className="flex flex-col gap-3">
        {(items ?? []).map((item, index) => (
          <CarteContenu
            key={item.id}
            slug={slug}
            kind={config.kind}
            id={item.id}
            index={index}
            titre={item.title}
            body={(item.body ?? {}) as Record<string, string>}
            peutEditer={peutEditer}
          />
        ))}
        {(items ?? []).length === 0 && <p className="text-sm text-rof-gris">Rien pour le moment.</p>}
      </div>
    </section>
  );
}
