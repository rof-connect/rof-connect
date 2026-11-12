import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type MessagePrive = { id: string; auteur: string; auteurNom: string; contenu: string; date: string; deStaff: boolean };
export type Conversation = {
  cle: string;
  teamId: string;
  equipe: string;
  joueuseId: string;
  joueuse: string;
  enAttente: boolean; // le dernier message vient de la joueuse ou de sa famille : la Direction doit répondre
  dernierDate: string;
  messages: MessagePrive[];
};

/**
 * Toutes les conversations privées (une par joueuse et par équipe), la plus récente en premier.
 * Lues avec le client administrateur : la Direction les voit même si elle ne fait pas partie de l'équipe.
 * Une conversation attend une réponse quand son dernier message n'a pas été écrit par le personnel (admin ou entraîneur).
 */
export async function chargerConversations(): Promise<Conversation[]> {
  const admin = createAdminClient();
  const { data: msgs } = await admin
    .from("messages")
    .select("id, team_id, thread_profile_id, author_id, content, created_at")
    .eq("channel", "private")
    .not("thread_profile_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(5000);
  if (!msgs?.length) return [];

  const profilIds = [...new Set(msgs.flatMap((m) => [m.author_id, m.thread_profile_id as string]))];
  const teamIds = [...new Set(msgs.map((m) => m.team_id))];
  const [{ data: profils }, { data: equipes }, { data: coachs }] = await Promise.all([
    admin.from("profiles").select("id, full_name, email, role").in("id", profilIds),
    admin.from("teams").select("id, name").in("id", teamIds),
    admin.from("team_members").select("team_id, profile_id").eq("role_in_team", "coach").in("team_id", teamIds),
  ]);
  const profilDe = new Map((profils ?? []).map((p) => [p.id, p]));
  const equipeDe = new Map((equipes ?? []).map((t) => [t.id, t.name as string]));
  const coachsDe = new Set((coachs ?? []).map((c) => `${c.team_id}:${c.profile_id}`));
  const nom = (id: string) => profilDe.get(id)?.full_name || profilDe.get(id)?.email || "—";

  const fils = new Map<string, Conversation>();
  for (const m of msgs) {
    const cle = `${m.team_id}:${m.thread_profile_id}`;
    const deStaff = profilDe.get(m.author_id)?.role === "admin" || coachsDe.has(`${m.team_id}:${m.author_id}`);
    let c = fils.get(cle);
    if (!c) {
      c = {
        cle,
        teamId: m.team_id,
        equipe: equipeDe.get(m.team_id) ?? "—",
        joueuseId: m.thread_profile_id as string,
        joueuse: nom(m.thread_profile_id as string),
        enAttente: false,
        dernierDate: m.created_at,
        messages: [],
      };
      fils.set(cle, c);
    }
    c.messages.push({ id: m.id, auteur: m.author_id, auteurNom: nom(m.author_id), contenu: m.content, date: m.created_at, deStaff });
    c.dernierDate = m.created_at;
    c.enAttente = !deStaff;
  }
  return [...fils.values()].sort((a, b) => b.dernierDate.localeCompare(a.dernierDate));
}

export async function nbConversationsEnAttente(): Promise<number> {
  return (await chargerConversations()).filter((c) => c.enAttente).length;
}
