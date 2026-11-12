import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Un « 2e courriel » est un accès de plus à la même famille (fusion de deux comptes d'une même joueuse).
 * Ouvert avec ce courriel, on bascule d'office sur le compte principal : la famille y voit l'agenda,
 * les documents, les messages et tout le reste, comme avec le courriel principal.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/connexion", request.url));

  const admin = createAdminClient();
  const { data: moi } = await admin.from("profiles").select("parent_id, full_name, role").eq("id", user.id).single();
  if (!moi?.parent_id || moi.role === "admin" || !(moi.full_name ?? "").endsWith("(2e courriel)")) {
    return NextResponse.redirect(new URL("/membres", request.url));
  }

  const { data: principal } = await admin.auth.admin.getUserById(moi.parent_id);
  const email = principal.user?.email;
  if (!email) return new NextResponse("Compte principal introuvable.", { status: 500 });

  const { data: lien } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = lien?.properties?.hashed_token;
  if (!tokenHash) return new NextResponse("Impossible de basculer sur le compte principal.", { status: 500 });

  const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (error) return new NextResponse("Impossible de basculer sur le compte principal.", { status: 500 });

  return NextResponse.redirect(new URL("/membres", request.url));
}
