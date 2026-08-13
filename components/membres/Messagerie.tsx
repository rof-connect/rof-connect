"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { envoyerMessage } from "@/app/membres/messages/actions";

type Message = {
  id: string;
  created_at: string;
  channel: "team" | "private";
  thread_profile_id: string | null;
  author_id: string;
  content: string;
};

type Athlete = { id: string; nom: string };

export function Messagerie({
  teamId,
  estStaff,
  monId,
  monNom,
  roster,
}: {
  teamId: string;
  estStaff: boolean;
  monId: string;
  monNom: string;
  roster: Athlete[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [canal, setCanal] = useState<"team" | "private">("team");
  const [cible, setCible] = useState(roster[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [noms, setNoms] = useState<Record<string, string>>({});
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const filRef = useRef<HTMLDivElement>(null);

  const threadProfileId = canal === "private" ? (estStaff ? cible : monId) : null;

  useEffect(() => {
    let annule = false;

    async function charger() {
      let requete = supabase.from("messages").select("*").eq("team_id", teamId).eq("channel", canal).order("created_at");
      if (canal === "private" && threadProfileId) {
        requete = requete.eq("thread_profile_id", threadProfileId);
      }
      const { data } = await requete;
      if (!annule) setMessages((data as Message[]) ?? []);

      const auteurs = Array.from(new Set((data ?? []).map((m) => m.author_id)));
      if (auteurs.length) {
        const { data: profils } = await supabase.from("profiles").select("id, full_name").in("id", auteurs);
        if (!annule) {
          const map: Record<string, string> = {};
          (profils ?? []).forEach((p) => (map[p.id] = p.full_name ?? "—"));
          setNoms((n) => ({ ...n, ...map }));
        }
      }
    }
    charger();

    const canalRealtime = supabase
      .channel(`messages-${teamId}-${canal}-${threadProfileId ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `team_id=eq.${teamId}` },
        (payload) => {
          const m = payload.new as Message;
          if (m.channel !== canal) return;
          if (canal === "private" && m.thread_profile_id !== threadProfileId) return;
          setMessages((prev) => (prev.find((x) => x.id === m.id) ? prev : [...prev, m]));
          if (!noms[m.author_id]) {
            supabase
              .from("profiles")
              .select("id, full_name")
              .eq("id", m.author_id)
              .single()
              .then(({ data }) => {
                if (data) setNoms((n) => ({ ...n, [data.id]: data.full_name ?? "—" }));
              });
          }
        },
      )
      .subscribe();

    return () => {
      annule = true;
      supabase.removeChannel(canalRealtime);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, canal, threadProfileId]);

  useEffect(() => {
    filRef.current?.scrollTo({ top: filRef.current.scrollHeight });
  }, [messages]);

  async function envoyer() {
    const t = texte.trim();
    if (!t) return;
    if (canal === "private" && !threadProfileId) return;
    setEnvoi(true);
    await envoyerMessage({
      teamId,
      channel: canal,
      threadProfileId: canal === "private" ? threadProfileId : null,
      content: t,
    });
    setTexte("");
    setEnvoi(false);
  }

  const heure = (ts: string) =>
    new Date(ts).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) +
    " · " +
    new Date(ts).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCanal("team")}
          className={`rounded-full px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide ${
            canal === "team" ? "bg-rof-or text-rof-noir" : "bg-rof-craie text-rof-gris"
          }`}
        >
          👥 Équipe
        </button>
        <button
          onClick={() => setCanal("private")}
          className={`rounded-full px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide ${
            canal === "private" ? "bg-rof-or text-rof-noir" : "bg-rof-craie text-rof-gris"
          }`}
        >
          🔒 {estStaff ? "Privé (par athlète)" : "Mon coach"}
        </button>
        {canal === "private" && estStaff && (
          <select
            value={cible}
            onChange={(e) => setCible(e.target.value)}
            className="rounded-lg border border-rof-ligne bg-rof-craie px-2 py-2 text-sm text-rof-texte"
          >
            {roster.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nom}
              </option>
            ))}
            {roster.length === 0 && <option value="">Aucun athlète inscrit</option>}
          </select>
        )}
      </div>

      <p className="mb-3 text-xs text-rof-gris">
        {canal === "private"
          ? "Conversation privée entre l'athlète (et ses parents) et le personnel d'entraîneurs."
          : "Canal visible par toute l'équipe — athlètes, parents et coachs."}
      </p>

      <div ref={filRef} className="grid max-h-96 gap-2 overflow-y-auto rounded-xl border border-rof-ligne bg-rof-marine p-3" style={{ minHeight: 260 }}>
        {messages.length === 0 && (
          <div className="py-10 text-center text-sm text-rof-gris">Aucun message pour l&apos;instant. Lance la conversation ! 🥎</div>
        )}
        {messages.map((m) => {
          const mien = m.author_id === monId;
          return (
            <div key={m.id} className={`flex ${mien ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${mien ? "bg-rof-or text-rof-noir" : "bg-rof-marine2 text-rof-texte"}`}>
                {!mien && (
                  <div className="font-condensed text-xs font-bold uppercase tracking-wide text-rof-poudre">
                    {noms[m.author_id] ?? monNom}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-base leading-snug">{m.content}</div>
                <div className="mt-0.5 text-right text-[10px] opacity-70">{heure(m.created_at)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écris ton message…"
          rows={2}
          className="flex-1 rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
        <button
          onClick={envoyer}
          disabled={envoi || !texte.trim() || (canal === "private" && estStaff && !cible)}
          className="rounded-xl bg-rof-or px-5 py-3 font-condensed text-base font-bold uppercase tracking-wide text-rof-noir disabled:opacity-40"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
