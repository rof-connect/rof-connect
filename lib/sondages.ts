import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type OptionSondage = { id: string; label: string; imageUrl: string | null; votes: number };
export type Sondage = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  kind: string;
  maxDates: number;
  closed: boolean;
  teamId: string | null;
  teamName: string | null;
  options: OptionSondage[];
  total: number;
  monVote: string | null;
  maDates: string[];
  votants: { optionId: string; nom: string }[];
  dates: { nom: string; date: string }[];
};

type Vote = { reponse_date: string | null; reponse_dates: string[] | null };
function datesDe(v?: Vote): string[] {
  if (!v) return [];
  if (v.reponse_dates && v.reponse_dates.length) return v.reponse_dates;
  return v.reponse_date ? [v.reponse_date] : [];
}

/** Sondages visibles par l'utilisateur : « tous » ou ceux de ses équipes (la direction voit tout). */
export async function chargerSondages(userId: string, estAdmin: boolean): Promise<Sondage[]> {
  const admin = createAdminClient();
  const { data: polls } = await admin
    .from("polls")
    .select("id, title, description, image_path, kind, max_dates, closed, team_id, teams (name)")
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
    .select("poll_id, option_id, reponse_date, reponse_dates, profile_id, profiles (full_name)")
    .in("poll_id", ids);

  const urls = new Map<string, string>();
  const urlsSondages = new Map<string, string>();
  await Promise.all(
    visibles
      .filter((p) => p.image_path)
      .map(async (p) => {
        const { data } = await admin.storage.from("media").createSignedUrl(p.image_path!, 60 * 60);
        if (data?.signedUrl) urlsSondages.set(p.id, data.signedUrl);
      }),
  );
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
      imageUrl: urlsSondages.get(p.id) ?? null,
      kind: p.kind,
      maxDates: p.max_dates ?? 1,
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
      maDates: datesDe(vp.find((v) => v.profile_id === userId)),
      votants: estAdmin
        ? vp.filter((v) => v.option_id).map((v) => {
            const pr = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles;
            return { optionId: v.option_id as string, nom: pr?.full_name ?? "—" };
          })
        : [],
      dates: estAdmin
        ? vp
            .flatMap((v) => {
              const pr = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles;
              return datesDe(v).map((date) => ({ nom: pr?.full_name ?? "—", date }));
            })
            .sort((a, b) => a.date.localeCompare(b.date))
        : [],
    };
  });
}
