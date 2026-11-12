import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { chargerConversations } from "@/lib/conversations-admin";
import { repondreConversation } from "@/app/membres/admin/conversations/actions";
import { bouton } from "@/components/ui/boutons";

export const dynamic = "force-dynamic";

const quand = (ts: string) =>
  new Date(ts).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) +
  " · " +
  new Date(ts).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });

export default async function ConversationsPage({ searchParams }: { searchParams: Promise<{ tout?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: moi } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (moi?.role !== "admin") redirect("/membres");

  const { tout } = await searchParams;
  const toutes = await chargerConversations();
  const enAttente = toutes.filter((c) => c.enAttente);
  const autres = toutes.filter((c) => !c.enAttente);

  const Fil = ({ c }: { c: (typeof toutes)[number] }) => (
    <li className={`rounded-2xl border bg-rof-blanc p-4 ${c.enAttente ? "border-rof-or" : "border-rof-ligne"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link href={`/membres/admin/joueurs?id=${c.joueuseId}`} className="font-condensed text-xl font-bold uppercase text-rof-texte hover:text-rof-or">
            {c.joueuse}
          </Link>
          <p className="text-xs text-rof-gris">
            {c.equipe} · dernier message {quand(c.dernierDate)}
          </p>
        </div>
        {c.enAttente && <span className="rounded-full bg-rof-or px-3 py-0.5 font-condensed text-xs font-bold uppercase text-black">À répondre</span>}
      </div>

      <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto rounded-xl border border-rof-ligne bg-rof-craie p-3">
        {c.messages.slice(-12).map((m) => (
          <div key={m.id} className={`flex ${m.deStaff ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${m.deStaff ? "bg-rof-or text-black" : "bg-rof-blanc text-rof-texte border border-rof-ligne"}`}>
              <div className="font-condensed text-xs font-bold uppercase tracking-wide opacity-80">{m.auteurNom}</div>
              <div className="whitespace-pre-wrap text-sm leading-snug">{m.contenu}</div>
              <div className="mt-0.5 text-right text-[10px] opacity-70">{quand(m.date)}</div>
            </div>
          </div>
        ))}
      </div>

      <form action={repondreConversation} className="mt-3 flex items-end gap-2">
        <input type="hidden" name="team_id" value={c.teamId} />
        <input type="hidden" name="joueuse_id" value={c.joueuseId} />
        <textarea
          name="contenu"
          required
          rows={2}
          placeholder="Écrire une réponse…"
          className="flex-1 rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
        <button type="submit" className={bouton("primaire", "md")}>
          Répondre
        </button>
      </form>
    </li>
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-8">
      <div>
        <Link href="/membres/admin" className={bouton("secondaire")}>
          ‹ Direction
        </Link>
        <h1 className="mt-2 font-condensed text-3xl font-bold uppercase text-rof-texte">Conversations privées</h1>
        <p className="mt-1 text-sm text-rof-gris">Les messages privés des joueuses et de leur famille. La réponse est envoyée par la Direction, même si tu ne fais pas partie de l&apos;équipe.</p>
      </div>

      <section>
        <h2 className="mb-2 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or">À répondre ({enAttente.length})</h2>
        {enAttente.length ? (
          <ul className="grid gap-3">{enAttente.map((c) => <Fil key={c.cle} c={c} />)}</ul>
        ) : (
          <p className="rounded-2xl border border-rof-gazon/50 bg-rof-blanc p-4 text-sm text-rof-texte">✓ Aucune conversation en attente de réponse.</p>
        )}
      </section>

      {autres.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-gris">Déjà répondues ({autres.length})</h2>
            <Link href={tout ? "/membres/admin/conversations" : "/membres/admin/conversations?tout=1"} className="text-sm text-rof-poudre underline">
              {tout ? "Masquer" : "Afficher"}
            </Link>
          </div>
          {tout && <ul className="grid gap-3">{autres.map((c) => <Fil key={c.cle} c={c} />)}</ul>}
        </section>
      )}
    </main>
  );
}
