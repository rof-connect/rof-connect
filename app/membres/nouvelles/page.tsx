import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CarteNouvelle } from "@/components/membres/CarteNouvelle";
import { FormAjoutNouvelle } from "@/components/membres/FormAjoutNouvelle";

type NouvelleBody = {
  date?: string | null;
  texte?: string | null;
  photo_url?: string | null;
  video_url?: string | null;
};

export default async function NouvellesPage() {
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
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Nouvelles &amp; photos</h1>
      </div>

      {(memberships ?? []).length === 0 && (
        <p className="text-sm text-rof-gris">Aucune équipe assignée pour le moment.</p>
      )}

      {(memberships ?? []).map((m) => {
        const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
        const peutEditer = estAdmin || m.role_in_team === "coach";
        return (
          <EquipeNouvelles key={m.team_id} teamId={m.team_id} teamName={team?.name ?? ""} peutEditer={peutEditer} />
        );
      })}
    </main>
  );
}

async function EquipeNouvelles({
  teamId,
  teamName,
  peutEditer,
}: {
  teamId: string;
  teamName: string;
  peutEditer: boolean;
}) {
  const supabase = await createClient();

  const { data: nouvelles } = await supabase
    .from("contents")
    .select("id, title, body, created_at")
    .eq("team_id", teamId)
    .eq("kind", "news")
    .order("created_at", { ascending: false });

  const admin = createAdminClient();
  const items = await Promise.all(
    (nouvelles ?? []).map(async (n) => {
      const body = (n.body ?? {}) as NouvelleBody;
      let photoSignedUrl: string | null = null;
      if (body.photo_url) {
        const { data } = await admin.storage.from("media").createSignedUrl(body.photo_url, 60 * 60);
        photoSignedUrl = data?.signedUrl ?? null;
      }
      return { ...n, body, photoSignedUrl };
    }),
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-white">{teamName}</h2>

      {peutEditer && <FormAjoutNouvelle teamId={teamId} />}

      <div className="flex flex-col gap-4">
        {items.map((n) => (
          <CarteNouvelle
            key={n.id}
            id={n.id}
            titre={n.title}
            date={n.body.date ?? null}
            texte={n.body.texte ?? null}
            photoSignedUrl={n.photoSignedUrl}
            photoPath={n.body.photo_url ?? null}
            videoUrl={n.body.video_url ?? null}
            peutEditer={peutEditer}
          />
        ))}
        {items.length === 0 && <p className="text-sm text-rof-gris">Aucune nouvelle pour le moment.</p>}
      </div>
    </section>
  );
}
