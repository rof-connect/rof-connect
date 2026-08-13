import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deconnecter } from "@/app/connexion/actions";
import { LogoR } from "@/components/LogoR";

export default async function MembresLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  return (
    <div className="flex min-h-screen flex-col bg-rof-noir">
      <header className="sticky top-0 z-30 border-b border-rof-ligne bg-rof-noir/92 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Link href="/membres" className="flex items-center gap-2">
            <LogoR h={28} />
            <span className="font-condensed text-lg font-bold uppercase tracking-[0.04em] text-white">ROF Connect</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/membres" className="font-condensed text-sm font-semibold uppercase tracking-wide text-rof-gris">
              Accueil
            </Link>
            <Link href="/membres/agenda" className="font-condensed text-sm font-semibold uppercase tracking-wide text-rof-gris">
              Agenda
            </Link>
            <Link href="/membres/nouvelles" className="font-condensed text-sm font-semibold uppercase tracking-wide text-rof-gris">
              Nouvelles
            </Link>
            <Link href="/membres/messages" className="font-condensed text-sm font-semibold uppercase tracking-wide text-rof-gris">
              Messages
            </Link>
            {profile?.role === "admin" && (
              <Link
                href="/membres/admin/equipes"
                className="font-condensed text-sm font-semibold uppercase tracking-wide text-rof-poudre"
              >
                Direction
              </Link>
            )}
            <form action={deconnecter}>
              <button type="submit" className="text-sm text-rof-gris underline">
                Quitter
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
