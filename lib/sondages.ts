import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type OptionSondage = { id: string; label: string; imageUrl: string | null; votes: number };
export type Sondage = {
  id: string;
  title: string;
  description: string | null;
  closed: boolean;
  teamId: string | null;
  teamName: string | null;
  options: OptionSondage[];
  total: number;
  monVote: string | null;
  votants: { optionId: string; nom: string }[];
};

/** Sondages visibles par l'utilisateur : « tous » ou ceux de ses équipes (la direction voit tout). */
export async function chargerSondages(userId: string, estAdmin: boolean): Promise<Sondage[]> {
  const admin = createAdminClient();
  const { data: polls } = await admin
    .from("polls")
    .select("id, title, description, closed, team_id, teams (name)")
    .order("created_at", { ascending: false });

  let mesEquipes = new Set<string>();
  if (!estAdmin) {
    const { data: m } = await admin.from("team_members").select("team_id").eq("profile_id", userId);
    mesEquipes = new Set((m ?? []).map((x) => x.team_id));
  }
  const visibles = (polls ?? []).filter((p) => estAdmin || !p.team_id || mesEquipes.has(p.team_id));
  if (visibles.length === 0) return [];
  const ids = visibles.map((p) => p.id);

  const { data: options } = await admin
    .from("poll_options")
    .select("id, poll_id, label, image_path, position")
    .in("poll_id", ids)
    .order("position");
  const { data: votes } = await admin
    .from("poll_votes")
    .select("poll_id, option_id, profile_id, profiles (full_name)")
    .in("poll_id", ids);

  const urls = new Map<string, string>();
  await Promise.all(
    (options ?? [])
      .filter((o) => o.image_path)
      .map(async (o) => {
        const { data } = await admin.storage.from("media").createSignedUrl(o.image_path!, 60 * 60);
        if (data?.signedUrl) urls.set(o.id, data.signedUrl);
      }),
  );

  return visibles.map((p) => {
    const vp = (votes ?? []).filter((v) => v.poll_id === p.id);
    const team = Array.isArray(p.teams) ? p.teams[0] : p.teams;
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      closed: p.closed,
      teamId: p.team_id,
      teamName: team?.name ?? null,
      options: (options ?? [])
        .filter((o) => o.poll_id === p.id)
        .map((o) => ({
          id: o.id,
          label: o.label,
          imageUrl: urls.get(o.id) ?? null,
          votes: vp.filter((v) => v.option_id === o.id).length,
        })),
      total: vp.length,
      monVote: vp.find((v) => v.profile_id === userId)?.option_id ?? null,
      votants: estAdmin
        ? vp.map((v) => {
            const pr = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles;
            return { optionId: v.option_id, nom: pr?.full_name ?? "—" };
          })
        : [],
    };
  });
}
